import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/api/axios';
import { allAchievements } from '../data/achievements';

// Interfaces
export interface UserGamificationStats {
    level: number;
    xp: number;
    streak: number;
}

export interface UserAchievement {
    achievement: { id: string; name: string; description: string; icon: string; };
    unlocked_at: string;
}

export interface Quest {
    quest: { id: string; description: string; xp_reward: number; };
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
    addXp: (amount: number) => Promise<{ new_level?: number; new_xp?: number; level_up?: boolean } | void>;
    completeQuest: (questId: string) => Promise<void>;
    completeBlock: (blockId: string) => Promise<void>;
    isBlockCompleted: (blockId: string) => boolean;
    loseHeart: () => void;
    resetHearts: () => void;
    refillHearts: () => void;
    refetchGamificationData: () => void;
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

// Provider Component
export const GamificationProvider = ({ children }: { children: ReactNode }) => {
    const { toast } = useToast();
    const { isAuthenticated } = useAuth();

    const [stats, setStats] = useState<UserGamificationStats>({ level: 1, xp: 0, streak: 0 });
    const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);
    const [dailyQuests, setDailyQuests] = useState<Quest[]>([]);
    const [blocosCompletos, setBlocosCompletos] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hearts, setHearts] = useState<number>(5);
    const [nextRefillInSeconds, setNextRefillInSeconds] = useState<number | null>(null);
    const [userFocus, setUserFocus] = useState<string>('Conhecimentos Gerais');

    const fetchGamificationData = useCallback(async () => {
        if (!isAuthenticated) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        try {
            const response = await apiClient.get('/users/me/');
            const { data } = response;
            if (data.profile) {
                setStats(data.profile.gamification || { level: 1, xp: 0, streak: 0 });
                setUnlockedAchievements((data.profile.achievements || []).map((ua: UserAchievement) => ua.achievement.id));
                setDailyQuests(data.profile.daily_quests || []);
                setBlocosCompletos(data.profile.blocos_completos || []);
                // Extrai hearts e o timestamp retornados pelo backend
                const gam = data.profile.gamification || {};
                const serverHearts = typeof gam.hearts === 'number' ? gam.hearts : 5;
                setHearts(serverHearts);
                // user focus vindo do profile (o tópico que o usuário escolheu durante registro)
                if (data.profile.focus) {
                    console.log('🎯 DEBUG useGamification - Focus carregado do perfil:', data.profile.focus);
                    setUserFocus(data.profile.focus);
                } else {
                    console.log('⚠️ DEBUG useGamification - Profile.focus está vazio, usando default');
                }

                // Cálculo local do tempo até a próxima vida com base no timestamp do servidor
                if (gam.hearts_last_refill && serverHearts < 5) {
                    try {
                        const lastRefill = new Date(gam.hearts_last_refill);
                        const now = new Date();
                        const elapsedSeconds = Math.floor((now.getTime() - lastRefill.getTime()) / 1000);
                        const REFILL_SECONDS = 3 * 60; // 3 minutos por vida
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
            console.error("Failed to fetch gamification data", error);
            toast({ title: "Erro de Gamificação", description: "Não foi possível buscar seus dados de progresso.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated, toast]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchGamificationData();
        } else {
            setIsLoading(false);
            setStats({ level: 1, xp: 0, streak: 0 });
            setUnlockedAchievements([]);
            setDailyQuests([]);
            setBlocosCompletos([]);
        }
    }, [isAuthenticated, fetchGamificationData]);

    // Cálculo de nível baseado em blocos completados: a cada 15 blocos, sobe 1 nível
    const calculatedLevel = Math.floor(blocosCompletos.length / 15) + 1;
    const currentLevel = Math.max(stats.level, calculatedLevel);
    const blocksInCurrentLevel = blocosCompletos.length % 15;
    const progressPercentage = (blocksInCurrentLevel / 15) * 100;
    // XP para próximo nível é apenas visual (não afeta o level real)
    const xpForNextLevel = Math.floor(100 * Math.pow(currentLevel, 1.5));

    const addXp = useCallback(async (amount: number) => {
        if (!isAuthenticated) return;
        try {
            console.log(`useGamification.addXp: Chamando backend com ${amount} XP`);
            const response = await apiClient.post('/study/gamification/add-xp/', { amount });
            console.log(`useGamification.addXp: Resposta do backend:`, response.data);
            const { level_up, new_level, new_xp } = response.data;
            
            // Atualiza o estado local imediatamente com os dados retornados (mais rápido)
            setStats(prev => ({ ...prev, level: new_level, xp: new_xp }));
            
            if (level_up) {
                toast({ title: `🚀 Level Up!`, description: `Você alcançou o Nível ${new_level}!`, className: 'bg-gradient-growth text-white border-none' });
            }
            
            // Notify other hooks/pages (Dashboard) that gamification data changed
            try {
                window.dispatchEvent(new CustomEvent('app:data:updated', { detail: { type: 'gamification' } }));
            } catch (e) {
                // ignore
            }
            return { level_up, new_level, new_xp };
        } catch (error) {
            console.error("useGamification.addXp: ERRO ao adicionar XP:", error);
            // Repropaga o erro para que chamadores (Game, Quiz) possam reagir/exibir erro e evitar marcar como concluído
            throw error;
        }
    }, [isAuthenticated, toast]);

    const completeQuest = async (questId: string) => {
        if (!isAuthenticated) return;
        const quest = dailyQuests.find(q => q.quest.id === questId);
        if (quest && !quest.is_completed) {
            try {
                await apiClient.post(`/study/my-daily-quests/${questId}/complete/`);
                toast({ title: "Missão Cumprida!", description: `+${quest.quest.xp_reward} XP`, className: 'bg-blue-500 text-white border-none' });
                fetchGamificationData();
            } catch (error) {
                console.error("Failed to complete quest", error);
            }
        }
    };

    const loseHeart = useCallback(async () => {
        if (!isAuthenticated) return;
        try {
            const resp = await apiClient.post('/study/gamification/lose-heart/');
            setHearts(resp.data.hearts);
            // Notifica outros componentes que as vidas mudaram
            // Despacha o evento após um pequeno delay para garantir que o estado foi atualizado
            setTimeout(() => {
                try {
                    window.dispatchEvent(new CustomEvent('app:data:updated', { detail: { type: 'hearts', hearts: resp.data.hearts } }));
                } catch (e) {
                    console.error('Failed to dispatch hearts event', e);
                }
            }, 50);
            // Se ficou em 0, iniciamos verificação de recarga
            if (resp.data.hearts === 0) {
                // Após perder a última vida, tenta buscar o tempo de recarga
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

    const isBlockCompleted = useCallback((blockId: string) => {
        return blocosCompletos.includes(blockId);
    }, [blocosCompletos]);

    const completeBlock = useCallback(async (blockId: string) => {
        // Atualiza localmente imediatamente para boa UX
        if (!blocosCompletos.includes(blockId)) {
            setBlocosCompletos(prev => [...prev, blockId]);
        }
        // Notifica o backend para persistir; se retornar a lista atualizada, usamos ela para sincronizar
        try {
            const resp = await apiClient.post(`/study/gamification/complete-block/`, { block_id: blockId });
            if (resp && resp.data && resp.data.blocos_completos) {
                const serverList = resp.data.blocos_completos;
                // Normalize possible JSON-string responses
                if (typeof serverList === 'string') {
                    try {
                        const parsed = JSON.parse(serverList);
                        setBlocosCompletos(parsed);
                    } catch (e) {
                        // fallback: ignore
                    }
                } else if (Array.isArray(serverList)) {
                    setBlocosCompletos(serverList);
                }
                // Notify other parts of the app that gamification/block state changed
                try {
                    window.dispatchEvent(new CustomEvent('app:data:updated', { detail: { type: 'blocos_completos' } }));
                } catch (e) {
                    // ignore
                }
            }
        } catch (e) {
            // Não bloquear a UX por conta de falha na rede / endpoint ausente
            console.warn('Failed to persist block completion to backend', e);
        }
    }, [blocosCompletos]);

    // Agendar recarga local baseada em nextRefillInSeconds para reduzir polling
    useEffect(() => {
        let timeoutId: number | undefined;
        if (isAuthenticated && nextRefillInSeconds && nextRefillInSeconds > 0) {
            // agenda para chamar o refill exatamente quando a próxima vida estiver disponível
            timeoutId = window.setTimeout(() => {
                refillHearts();
            }, nextRefillInSeconds * 1000);
        }
        // Se o usuário estiver sem vidas (hearts === 0) e não houver nextRefill informado, fazemos um fallback de polling leve
        let intervalId: number | undefined;
        if (isAuthenticated && hearts <= 0 && !nextRefillInSeconds) {
            // fallback polling a cada 30s
            intervalId = window.setInterval(() => {
                refillHearts();
            }, 30000);
        }
        return () => {
            if (timeoutId) window.clearTimeout(timeoutId);
            if (intervalId) window.clearInterval(intervalId);
        };
    }, [isAuthenticated, nextRefillInSeconds, hearts, refillHearts]);

    const value = {
        level: currentLevel,
        xp: stats.xp,
        streak: stats.streak,
        userFocus,
        allAchievements,
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