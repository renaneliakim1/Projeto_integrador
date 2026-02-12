import { useState, useEffect, useCallback, createContext, useContext, ReactNode, useRef } from 'react';
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

    // Inicializa com valores do cache se existirem (carregamento instantâneo)
    const getCachedValue = (key: string, defaultValue: any) => {
        try {
            const cached = localStorage.getItem(`gamification_${key}`);
            return cached ? JSON.parse(cached) : defaultValue;
        } catch {
            return defaultValue;
        }
    };

    const [stats, setStats] = useState<UserGamificationStats>(() => 
        getCachedValue('stats', { level: 1, xp: 0, streak: 0 })
    );
    const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>(() => 
        getCachedValue('achievements', [])
    );
    const [dailyQuests, setDailyQuests] = useState<Quest[]>(() => 
        getCachedValue('quests', [])
    );
    const [blocosCompletos, setBlocosCompletos] = useState<string[]>(() => 
        getCachedValue('blocos', [])
    );
    const [isLoading, setIsLoading] = useState(true);
    const [hearts, setHearts] = useState<number>(() => 
        getCachedValue('hearts', 0)
    );
    const [nextRefillInSeconds, setNextRefillInSeconds] = useState<number | null>(null);
    const [userFocus, setUserFocus] = useState<string>(() => 
        getCachedValue('focus', 'Conhecimentos Gerais')
    );
    const hasInitialized = useRef(false);

    const fetchGamificationData = useCallback(async (skipLoadingState = false) => {
        if (!isAuthenticated) {
            setIsLoading(false);
            return;
        }
        if (!skipLoadingState) {
            setIsLoading(true);
        }
        try {
            const response = await apiClient.get('/users/me/');
            const { data } = response;
            if (data.profile) {
                const newStats = data.profile.gamification || { level: 1, xp: 0, streak: 0 };
                const newAchievements = (data.profile.achievements || []).map((ua: UserAchievement) => ua.achievement.id);
                const newQuests = data.profile.daily_quests || [];
                const newBlocos = data.profile.blocos_completos || [];
                const gam = data.profile.gamification || {};
                const serverHearts = typeof gam.hearts === 'number' ? gam.hearts : 5;
                const newFocus = data.profile.focus || 'Conhecimentos Gerais';

                // Atualiza estados
                setStats(newStats);
                setUnlockedAchievements(newAchievements);
                setDailyQuests(newQuests);
                setBlocosCompletos(newBlocos);
                setHearts(serverHearts);
                setUserFocus(newFocus);

                // Salva no cache para próxima inicialização
                try {
                    localStorage.setItem('gamification_stats', JSON.stringify(newStats));
                    localStorage.setItem('gamification_achievements', JSON.stringify(newAchievements));
                    localStorage.setItem('gamification_quests', JSON.stringify(newQuests));
                    localStorage.setItem('gamification_blocos', JSON.stringify(newBlocos));
                    localStorage.setItem('gamification_hearts', JSON.stringify(serverHearts));
                    localStorage.setItem('gamification_focus', JSON.stringify(newFocus));
                } catch (e) {
                    console.warn('Failed to cache gamification data', e);
                }

                console.log('✅ useGamification: Dados carregados e em cache - Hearts:', serverHearts);
                
                if (data.profile.focus) {
                    console.log('🎯 DEBUG useGamification - Focus carregado do perfil:', data.profile.focus);
                } else {
                    console.log('⚠️ DEBUG useGamification - Profile.focus está vazio, usando default');
                }

                // Cálculo local do tempo até a próxima vida com base no timestamp do servidor
                if (serverHearts < 5) {
                    if (gam.hearts_last_refill) {
                        try {
                            const lastRefill = new Date(gam.hearts_last_refill);
                            const now = new Date();
                            const elapsedSeconds = Math.floor((now.getTime() - lastRefill.getTime()) / 1000);
                            const REFILL_SECONDS = 3 * 60; // 3 minutos por vida
                            const secondsSinceLastTick = elapsedSeconds % REFILL_SECONDS;
                            const secondsToNext = REFILL_SECONDS - secondsSinceLastTick;
                            setNextRefillInSeconds(secondsToNext);
                        } catch (e) {
                            // Se parsing falhar, tenta obter do endpoint de refill que é a fonte de verdade
                            try {
                                const refillResp = await apiClient.post('/study/gamification/refill/');
                                setNextRefillInSeconds(refillResp.data.next_in_seconds ?? null);
                            } catch (e2) {
                                setNextRefillInSeconds(null);
                            }
                        }
                    } else {
                        // Se não houver timestamp mas o usuário tem menos que o máximo, consulta o endpoint de refill
                        try {
                            const refillResp = await apiClient.post('/study/gamification/refill/');
                            setNextRefillInSeconds(refillResp.data.next_in_seconds ?? null);
                        } catch (e) {
                            setNextRefillInSeconds(null);
                        }
                    }
                } else {
                    setNextRefillInSeconds(null);
                }
            }
        } catch (error) {
            console.error("Failed to fetch gamification data", error);
            toast({ title: "Erro de Gamificação", description: "Não foi possível buscar seus dados de progresso.", variant: "destructive" });
        } finally {
            if (!skipLoadingState) {
                setIsLoading(false);
            }
        }
    }, [isAuthenticated, toast]);

    useEffect(() => {
        // Evita múltiplas chamadas iniciais
        if (hasInitialized.current) return;
        
        if (isAuthenticated) {
            hasInitialized.current = true;
            // Se já tem cache, marca como não-loading imediatamente para UX rápida
            const hasCache = localStorage.getItem('gamification_hearts') !== null;
            if (hasCache) {
                setIsLoading(false);
                // Fetch em background sem bloquear UI
                fetchGamificationData(true); // skipLoadingState = true
            } else {
                // Sem cache, mostra loading normal
                fetchGamificationData(false);
            }
        } else {
            setIsLoading(false);
            setStats({ level: 1, xp: 0, streak: 0 });
            setUnlockedAchievements([]);
            setDailyQuests([]);
            setBlocosCompletos([]);
            setHearts(0);
            hasInitialized.current = false; // Reset para permitir nova inicialização
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated]); // Removido fetchGamificationData das dependências

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
            // Atualiza cache
            try {
                localStorage.setItem('gamification_hearts', JSON.stringify(resp.data.hearts));
            } catch (e) {
                console.warn('Failed to cache hearts', e);
            }
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
            
            // Dispara evento IMEDIATAMENTE após atualizar estado local (UX instantânea)
            setTimeout(() => {
                try {
                    window.dispatchEvent(new CustomEvent('app:data:updated', { detail: { type: 'blocos_completos' } }));
                    console.log('✅ completeBlock: Evento disparado imediatamente após atualização local');
                } catch (e) {
                    console.error('Failed to dispatch immediate event', e);
                }
            }, 0);
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
                // Notify other parts of the app that gamification/block state changed (confirmação do servidor)
                try {
                    window.dispatchEvent(new CustomEvent('app:data:updated', { detail: { type: 'blocos_completos' } }));
                    console.log('✅ completeBlock: Evento disparado após confirmação do servidor');
                } catch (e) {
                    // ignore
                }
            }
        } catch (e) {
            // Não bloquear a UX por conta de falha na rede / endpoint ausente
            console.warn('Failed to persist block completion to backend', e);
        }
    }, [blocosCompletos]);

    // Agendar recarga automática de vidas baseada em timestamp do servidor
    useEffect(() => {
        if (!isAuthenticated || hearts >= 5) return; // Não precisa verificar se já tem 5 vidas

        let intervalId: number | undefined;
        
        // Verifica a cada 10 segundos se é hora de adicionar uma vida
        intervalId = window.setInterval(async () => {
            console.log('🔄 Verificando recarga de vidas...', { hearts, nextRefillInSeconds });
            
            // Busca dados atualizados do servidor para verificar se ganhou vidas
            try {
                const response = await apiClient.get('/users/me/');
                const gam = response.data?.profile?.gamification || {};
                const serverHearts = typeof gam.hearts === 'number' ? gam.hearts : hearts;
                
                if (serverHearts !== hearts) {
                    console.log('✅ Vidas atualizadas automaticamente:', hearts, '→', serverHearts);
                    setHearts(serverHearts);
                    
                    // Atualiza cache
                    try {
                        localStorage.setItem('gamification_hearts', JSON.stringify(serverHearts));
                    } catch (e) {
                        console.warn('Failed to cache hearts', e);
                    }
                    
                    // Notifica componentes
                    window.dispatchEvent(new CustomEvent('app:data:updated', { 
                        detail: { type: 'hearts', hearts: serverHearts } 
                    }));
                    
                    // Toast amigável quando ganhar vidas
                    if (serverHearts > hearts) {
                        toast({ 
                            title: '❤️ Vida Recuperada!', 
                            description: `Você agora tem ${serverHearts} ${serverHearts === 1 ? 'vida' : 'vidas'}!`, 
                            className: 'bg-red-500/10 border-red-500/50'
                        });
                    }
                    
                    // Recalcula próximo refill. Se não houver timestamp, consulta o endpoint de refill
                    if (serverHearts < 5) {
                        if (gam.hearts_last_refill) {
                            try {
                                const lastRefill = new Date(gam.hearts_last_refill);
                                const now = new Date();
                                const elapsedSeconds = Math.floor((now.getTime() - lastRefill.getTime()) / 1000);
                                const REFILL_SECONDS = 3 * 60;
                                const secondsSinceLastTick = elapsedSeconds % REFILL_SECONDS;
                                const secondsToNext = REFILL_SECONDS - secondsSinceLastTick;
                                setNextRefillInSeconds(secondsToNext);
                            } catch (e) {
                                try {
                                    const refillResp = await apiClient.post('/study/gamification/refill/');
                                    setNextRefillInSeconds(refillResp.data.next_in_seconds ?? null);
                                } catch (e2) {
                                    setNextRefillInSeconds(null);
                                }
                            }
                        } else {
                            try {
                                const refillResp = await apiClient.post('/study/gamification/refill/');
                                setNextRefillInSeconds(refillResp.data.next_in_seconds ?? null);
                            } catch (e) {
                                setNextRefillInSeconds(null);
                            }
                        }
                    } else {
                        setNextRefillInSeconds(null);
                    }
                }
            } catch (e) {
                console.error('Falha ao verificar recarga de vidas', e);
            }
        }, 10000); // Verifica a cada 10 segundos

        return () => {
            if (intervalId) window.clearInterval(intervalId);
        };
    }, [isAuthenticated, hearts]);

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