
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/api/axios';

export interface Activity {
  date: string;
  type: 'pratica' | 'falha';
}

export const useActivity = () => {
    const { isAuthenticated } = useAuth();
    const [activities, setActivities] = useState<Activity[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchActivityData = useCallback(async () => {
        if (!isAuthenticated) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        try {
            const response = await apiClient.get('/activity-log/');
            setActivities(response.data);
        } catch (error) {
            console.error("Failed to fetch activity data", error);
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        fetchActivityData();
    }, [fetchActivityData]);

    return { activities, isLoading, refetchActivityData: fetchActivityData };
};

