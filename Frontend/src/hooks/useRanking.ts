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
        
        console.log(`Fetching ranking for category: ${category}`);
        
        const response = await apiClient.get<RankingResponse>('/ranking/', {
          params: { category, limit: 100 }
        });
        
        console.log('Ranking response:', response.data);
        
        setRanking(response.data.ranking);
        setTotalUsers(response.data.total_users);
      } catch (err) {
        console.error('Error fetching ranking:', err);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const error = err as any;
        console.error('Error response:', error.response);
        console.error('Error message:', error.message);
        
        let errorMessage = 'Erro ao carregar ranking';
        
        if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
          errorMessage = 'Erro de conexão: Servidor backend não está respondendo. Verifique se o servidor está rodando em http://127.0.0.1:8000';
        } else if (error.response) {
          errorMessage = error.response?.data?.detail || `Erro ${error.response.status}: ${error.response.statusText}`;
        }
        
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
