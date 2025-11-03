import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/api/axios';

// Interfaces based on existing hooks
export interface Quest {
    quest: { id: string; description: string; xp_reward: number; };
    quest_date: string;
    is_completed: boolean;
}
export interface AreaPerformance {
    area_name: string;
    subjects: { subject_name: string; correct_answers: number; incorrect_answers: number; }[];
}
export interface Activity {
  date: string;
  type: 'pratica' | 'falha';
}
export interface UserData {
  first_name: string;
  profile: {
    foto: string | null;
  };
}

export interface DashboardData {
  userData: UserData | null;
  performanceData: AreaPerformance[] | null;
  activities: Activity[] | null;
}

// Cache simples com timestamp
let cachedData: DashboardData | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 30000; // 30 segundos

export const useDashboardData = () => {
    const { isAuthenticated } = useAuth();
    const [data, setData] = useState<DashboardData>({
        userData: null,
        performanceData: null,
        activities: null,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const isMountedRef = useRef(true);


    const fetchData = useCallback(async (forceRefresh = false) => {
        if (!isAuthenticated) {
            setIsLoading(false);
            return;
        }
        
        // Verifica cache
        const now = Date.now();
        if (!forceRefresh && cachedData && (now - cacheTimestamp) < CACHE_DURATION) {
            console.log('⏱️ useDashboardData: Usando cache');
            setData(cachedData);
            setIsLoading(false);
            return;
        }
        
        const startTime = performance.now();
        console.log('⏱️ useDashboardData: Iniciando fetch...');
        
        setIsLoading(true);
        setError(null);
        try {
            // Faz as duas requisições em PARALELO para otimizar performance
            console.log('⏱️ useDashboardData: Fazendo requisições paralelas...');
            const requestStart = performance.now();
            
            const [userResponse, activityResponse] = await Promise.all([
                apiClient.get('/users/me/'),
                apiClient.get('/activity-log/')
            ]);
            
            console.log(`⏱️ useDashboardData: Requisições completadas em ${(performance.now() - requestStart).toFixed(0)}ms`);
            
            if (!isMountedRef.current) return; // Componente desmontado
            
            const userData = userResponse.data;
            const activityData = activityResponse.data;
            
            console.log('⏱️ useDashboardData: Processando dados...');
            const processStart = performance.now();
            
            // Normalize possible string fields (server may return JSON as string fallback)
            const profile = userData.profile || {};
            try {
                if (profile.blocos_completos && typeof profile.blocos_completos === 'string') {
                    profile.blocos_completos = JSON.parse(profile.blocos_completos);
                }
            } catch (e) {
                profile.blocos_completos = [];
            }
            try {
                if (profile.study_plan && typeof profile.study_plan === 'string') {
                    profile.study_plan = JSON.parse(profile.study_plan);
                }
            } catch (e) {
                profile.study_plan = null;
            }

            const newData = {
                userData: {
                    first_name: userData.first_name,
                    profile,
                },
                performanceData: userData.performance || [],
                activities: activityData || [],
            };
            
            // Atualiza cache
            cachedData = newData;
            cacheTimestamp = Date.now();
            
            setData(newData);
            
            console.log(`⏱️ useDashboardData: Processamento completado em ${(performance.now() - processStart).toFixed(0)}ms`);
            console.log(`⏱️ useDashboardData: TOTAL: ${(performance.now() - startTime).toFixed(0)}ms`);

        } catch (err) {
            console.error("Failed to fetch dashboard data", err);
            if (isMountedRef.current) {
                setError(err as Error);
            }
        } finally {
            if (isMountedRef.current) {
                setIsLoading(false);
            }
        }
    }, [isAuthenticated]);

    useEffect(() => {
        isMountedRef.current = true;
        fetchData();
        
        return () => {
            isMountedRef.current = false;
        };
    }, [fetchData]);

    return { ...data, isLoading, error, refetchData: () => fetchData(true) };
};
