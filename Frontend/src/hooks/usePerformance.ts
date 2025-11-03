import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/api/axios';

export interface SubjectPerformance {
    subject_name: string;
    correct_answers: number;
    incorrect_answers: number;
}

export interface AreaPerformance {
    area_name: string;
    subjects: SubjectPerformance[];
}

export const usePerformance = () => {
    const { isAuthenticated } = useAuth();
    const [performanceData, setPerformanceData] = useState<AreaPerformance[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchPerformanceData = useCallback(async () => {
        if (!isAuthenticated) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        try {
            const response = await apiClient.get('/users/me/');
            if (response.data.performance) {
                setPerformanceData(response.data.performance);
            }
        } catch (error) {
            console.error("Failed to fetch performance data", error);
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        fetchPerformanceData();
    }, [fetchPerformanceData]);

    const updatePerformance = useCallback(async (results: { subject: string; correct: number; incorrect: number }[]) => {
        try {
            await apiClient.post('/performance/update/', { results });
            // Refetch the performance data to get the updated stats and wait for it to complete
            await fetchPerformanceData();
        } catch (error) {
            console.error("Failed to update performance data", error);
        }
    }, [fetchPerformanceData]);

    return { performanceData, isLoading, updatePerformance, refetchPerformanceData: fetchPerformanceData };
};