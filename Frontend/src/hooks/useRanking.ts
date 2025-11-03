import { useState, useEffect } from 'react';
import apiClient from '@/api/axios';

export interface RankedUser {
  id: number;
  name: string;
  username: string;
  avatar: string | null;
  xp: number;
  level: number;
  rank: number;
  streak?: number;
  correct_answers?: number;
  incorrect_answers?: number;
  total_xp?: number;
}

export interface RankingResponse {
  category: string;
  ranking: RankedUser[];
  total_users: number;
}

export const useRanking = (category: string = 'global') => {
  const [ranking, setRanking] = useState<RankedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalUsers, setTotalUsers] = useState(0);

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await apiClient.get<RankingResponse>('/ranking/', {
          params: { category, limit: 100 }
        });
        
        setRanking(response.data.ranking);
        setTotalUsers(response.data.total_users);
      } catch (err) {
        console.error('Error fetching ranking:', err);
        const errorMessage = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Erro ao carregar ranking';
        setError(errorMessage);
        setRanking([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRanking();
  }, [category]);

  return { ranking, loading, error, totalUsers };
};
