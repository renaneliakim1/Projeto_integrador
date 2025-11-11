import {useState, useEffect, useCallback, createContext, useContext, ReactNode} from 'react';
import {useAuth} from '@contexts/AuthContext';
import apiClient from '@services/api';
import {Alert} from 'react-native';

// Interfaces
export interface UserGamificationStats {
  level: number;
  xp: number;
  streak: number;
}

export interface UserAchievement {
  achievement: {id: string; name: string; description: string; icon: string};
  unlocked_at: string;
}

export interface Quest {
  quest: {id: string; description: string; xp_reward: number};
  quest_date: string;
  is_completed: boolean;
}

// Context Type
interface GamificationContextType {
  level: number;
  xp: number;
  streak: number;
  unlockedAchievements: string[];
  dailyQuests: Quest[];
  blocosCompletos: string[];
  isLoading: boolean;
  xpForNextLevel: number;
  progressPercentage: number;
  hearts: number;
  nextRefillInSeconds: number | null;
  userFocus: string;
  addXp: (
    amount: number,
  ) => Promise<{new_level?: number; new_xp?: number; level_up?: boolean} | void>;
  completeQuest: (questId: string) => Promise<void>;
  completeBlock: (blockId: string) => Promise<void>;
  isBlockCompleted: (blockId: string) => boolean;
  loseHeart: () => Promise<void>;
  resetHearts: () => Promise<void>;
  refillHearts: () => Promise<void>;
  refetchGamificationData: () => void;
}

const GamificationContext = createContext<GamificationContextType | undefined>(
  undefined,
);

// Provider Component
export const GamificationProvider = ({children}: {children: ReactNode}) => {
  const {isAuthenticated} = useAuth();

  const [stats, setStats] = useState<UserGamificationStats>({
    level: 1,
    xp: 0,
    streak: 0,
  });
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>(
    [],
  );
  const [dailyQuests, setDailyQuests] = useState<Quest[]>([]);
  const [blocosCompletos, setBlocosCompletos] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hearts, setHearts] = useState<number>(5);
  const [nextRefillInSeconds, setNextRefillInSeconds] = useState<number | null>(
    null,
  );
  const [userFocus, setUserFocus] = useState<string>('Conhecimentos Gerais');

  const fetchGamificationData = useCallback(async () => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const response = await apiClient.get('/users/me/');
      const {data} = response;
      if (data.profile) {
        setStats(data.profile.gamification || {level: 1, xp: 0, streak: 0});
        setUnlockedAchievements(
          (data.profile.achievements || []).map(
            (ua: UserAchievement) => ua.achievement.id,
          ),
        );
        setDailyQuests(data.profile.daily_quests || []);
        setBlocosCompletos(data.profile.blocos_completos || []);

        const gam = data.profile.gamification || {};
        const serverHearts = typeof gam.hearts === 'number' ? gam.hearts : 5;
        setHearts(serverHearts);

        if (data.profile.focus) {
          console.log(
            '🎯 useGamification - Focus carregado:',
            data.profile.focus,
          );
          setUserFocus(data.profile.focus);
        }

        if (gam.hearts_last_refill && serverHearts < 5) {
          try {
            const lastRefill = new Date(gam.hearts_last_refill);
            const now = new Date();
            const elapsedSeconds = Math.floor(
              (now.getTime() - lastRefill.getTime()) / 1000,
            );
            const REFILL_SECONDS = 3 * 60;
            const secondsSinceLastTick = elapsedSeconds % REFILL_SECONDS;
            const secondsToNext = REFILL_SECONDS - secondsSinceLastTick;
            setNextRefillInSeconds(secondsToNext);
          } catch (e) {
            setNextRefillInSeconds(null);
          }
        } else {
          setNextRefillInSeconds(null);
        }
      }
    } catch (error) {
      console.error('Failed to fetch gamification data', error);
      Alert.alert(
        'Erro de Gamificação',
        'Não foi possível buscar seus dados de progresso.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchGamificationData();
    } else {
      setIsLoading(false);
      setStats({level: 1, xp: 0, streak: 0});
      setUnlockedAchievements([]);
      setDailyQuests([]);
      setBlocosCompletos([]);
    }
  }, [isAuthenticated, fetchGamificationData]);

  // Cálculo de nível baseado em blocos completados
  const calculatedLevel = Math.floor(blocosCompletos.length / 15) + 1;
  const currentLevel = Math.max(stats.level, calculatedLevel);
  const blocksInCurrentLevel = blocosCompletos.length % 15;
  const progressPercentage = (blocksInCurrentLevel / 15) * 100;
  const xpForNextLevel = Math.floor(100 * Math.pow(currentLevel, 1.5));

  const addXp = useCallback(
    async (amount: number) => {
      if (!isAuthenticated) return;
      try {
        console.log(`useGamification.addXp: Chamando backend com ${amount} XP`);
        const response = await apiClient.post('/study/gamification/add-xp/', {
          amount,
        });
        console.log('useGamification.addXp: Resposta:', response.data);
        const {level_up, new_level, new_xp} = response.data;

        setStats(prev => ({...prev, level: new_level, xp: new_xp}));

        if (level_up) {
          Alert.alert(
            '🚀 Level Up!',
            `Você alcançou o Nível ${new_level}!`,
            [{text: 'OK'}],
          );
        }

        return {level_up, new_level, new_xp};
      } catch (error) {
        console.error('useGamification.addXp: ERRO:', error);
        throw error;
      }
    },
    [isAuthenticated],
  );

  const completeQuest = async (questId: string) => {
    if (!isAuthenticated) return;
    const quest = dailyQuests.find(q => q.quest.id === questId);
    if (quest && !quest.is_completed) {
      try {
        await apiClient.post(`/study/my-daily-quests/${questId}/complete/`);
        Alert.alert(
          'Missão Cumprida!',
          `+${quest.quest.xp_reward} XP`,
          [{text: 'OK'}],
        );
        fetchGamificationData();
      } catch (error) {
        console.error('Failed to complete quest', error);
      }
    }
  };

  const loseHeart = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const resp = await apiClient.post('/study/gamification/lose-heart/');
      setHearts(resp.data.hearts);

      if (resp.data.hearts === 0) {
        setTimeout(() => {
          fetchGamificationData();
        }, 500);
      }
    } catch (e) {
      console.error('Failed to lose heart', e);
    }
  }, [isAuthenticated, fetchGamificationData]);

  const resetHearts = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const resp = await apiClient.post('/study/gamification/reset-hearts/');
      setHearts(resp.data.hearts);
      setNextRefillInSeconds(null);
    } catch (e) {
      console.error('Failed to reset hearts', e);
    }
  }, [isAuthenticated]);

  const refillHearts = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const resp = await apiClient.post('/study/gamification/refill/');
      setHearts(resp.data.hearts);
      setNextRefillInSeconds(resp.data.next_in_seconds ?? null);
    } catch (e) {
      console.error('Failed to refill hearts', e);
    }
  }, [isAuthenticated]);

  const isBlockCompleted = useCallback(
    (blockId: string) => {
      return blocosCompletos.includes(blockId);
    },
    [blocosCompletos],
  );

  const completeBlock = useCallback(
    async (blockId: string) => {
      if (!blocosCompletos.includes(blockId)) {
        setBlocosCompletos(prev => [...prev, blockId]);
      }
      try {
        const resp = await apiClient.post('/study/gamification/complete-block/', {
          block_id: blockId,
        });
        if (resp?.data?.blocos_completos) {
          const serverList = resp.data.blocos_completos;
          if (typeof serverList === 'string') {
            try {
              const parsed = JSON.parse(serverList);
              setBlocosCompletos(parsed);
            } catch (e) {
              // ignore
            }
          } else if (Array.isArray(serverList)) {
            setBlocosCompletos(serverList);
          }
        }
      } catch (e) {
        console.warn('Failed to persist block completion', e);
      }
    },
    [blocosCompletos],
  );

  // Timer para recarga de vidas
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | undefined;
    if (isAuthenticated && nextRefillInSeconds && nextRefillInSeconds > 0) {
      timeoutId = setTimeout(() => {
        refillHearts();
      }, nextRefillInSeconds * 1000);
    }

    let intervalId: NodeJS.Timeout | undefined;
    if (isAuthenticated && hearts <= 0 && !nextRefillInSeconds) {
      intervalId = setInterval(() => {
        refillHearts();
      }, 30000);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [isAuthenticated, nextRefillInSeconds, hearts, refillHearts]);

  const value = {
    level: currentLevel,
    xp: stats.xp,
    streak: stats.streak,
    userFocus,
    unlockedAchievements,
    dailyQuests,
    blocosCompletos,
    isLoading,
    xpForNextLevel,
    progressPercentage,
    hearts,
    nextRefillInSeconds,
    addXp,
    completeBlock,
    isBlockCompleted,
    completeQuest,
    loseHeart,
    resetHearts,
    refillHearts,
    refetchGamificationData: fetchGamificationData,
  };

  return (
    <GamificationContext.Provider value={value}>
      {children}
    </GamificationContext.Provider>
  );
};

// Hook
export const useGamification = () => {
  const context = useContext(GamificationContext);
  if (context === undefined) {
    throw new Error('useGamification must be used within a GamificationProvider');
  }
  return context;
};
