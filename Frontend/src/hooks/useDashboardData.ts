import { useState, useEffect, useCallback } from 'react';
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

export const useDashboardData = () => {
    const { isAuthenticated } = useAuth();
    const [data, setData] = useState<DashboardData>({
        userData: null,
        performanceData: null,
        activities: null,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);


    const fetchData = useCallback(async () => {
        if (!isAuthenticated) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            // Faz apenas UMA requisição para /users/me/ que já retorna tudo
            const userResponse = await apiClient.get('/users/me/');
            const userData = userResponse.data;
            
            // Busca activity log separadamente (menor e mais rápido)
            const activityResponse = await apiClient.get('/activity-log/');
            const activityData = activityResponse.data;
            
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

            setData({
                userData: {
                    first_name: userData.first_name,
                    profile,
                },
                performanceData: userData.performance || [],
                activities: activityData || [],
            });

        } catch (err) {
            console.error("Failed to fetch dashboard data", err);
            setError(err as Error);
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { ...data, isLoading, error, refetchData: fetchData };
};
