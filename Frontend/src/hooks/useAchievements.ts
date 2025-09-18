/**
 * @file useAchievements.ts
 * @description Este é um hook customizado do React para gerenciar todo o sistema de conquistas.
 * Ele encapsula a lógica de:
 * - Carregar as conquistas já desbloqueadas pelo usuário a partir do `localStorage`.
 * - Fornecer uma função para verificar se novas conquistas foram desbloqueadas com base nas estatísticas atuais do usuário.
 * - Salvar as novas conquistas no `localStorage`.
 * - Notificar o usuário sobre novas conquistas usando o sistema de `toast`.
 */

import { useState, useCallback } from 'react';
import { useToast } from './use-toast';
import { allAchievements, Achievement } from '@/data/achievements';

// Interface para as estatísticas do usuário que serão usadas para verificar os critérios das conquistas.
interface UserStats {
  xp: number;
  level: number;
  quizzesCompleted: number;
}

export const useAchievements = () => {
  const { toast } = useToast();

  // Estado que armazena os IDs das conquistas que o usuário já desbloqueou.
  // A função passada para o useState é executada apenas na montagem inicial do componente,
  // lendo os dados do localStorage para inicializar o estado.
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>(() => {
    const saved = localStorage.getItem('unlockedAchievements');
    return saved ? JSON.parse(saved) : [];
  });

  // Função para verificar e desbloquear novas conquistas.
  // Envolta em `useCallback` para otimização, evitando recriações desnecessárias.
  const checkAndUnlockAchievements = useCallback(() => {
    // 1. Pega as estatísticas mais recentes do usuário diretamente do localStorage.
    const userStats: UserStats = {
      xp: parseInt(localStorage.getItem('userXP') || '0', 10),
      level: parseInt(localStorage.getItem('userLevel') || '1', 10),
      quizzesCompleted: parseInt(localStorage.getItem('quizzesCompleted') || '0', 10),
    };

    const newlyUnlocked: Achievement[] = [];

    // 2. Itera sobre todas as conquistas existentes no jogo.
    allAchievements.forEach((achievement) => {
      const isAlreadyUnlocked = unlockedAchievements.includes(achievement.id);
      // 3. Se a conquista ainda não foi desbloqueada E o critério dela for atendido...
      if (!isAlreadyUnlocked && achievement.criteria(userStats)) {
        // ...adiciona à lista de novas conquistas a serem desbloqueadas.
        newlyUnlocked.push(achievement);
      }
    });

    // 4. Se houver novas conquistas...
    if (newlyUnlocked.length > 0) {
      const newUnlockedIds = [...unlockedAchievements, ...newlyUnlocked.map(a => a.id)];
      // 5. Atualiza o estado do React e o localStorage com os novos IDs.
      setUnlockedAchievements(newUnlockedIds);
      localStorage.setItem('unlockedAchievements', JSON.stringify(newUnlockedIds));

      // 6. Notifica o usuário para cada nova conquista desbloqueada.
      newlyUnlocked.forEach(achievement => {
        toast({
          title: "Conquista Desbloqueada!",
          description: `Você ganhou a medalha: "${achievement.name}"`,
        });
      });
    }
  }, [unlockedAchievements, toast]);

  // O hook retorna a lista de todas as conquistas, os IDs das que foram desbloqueadas,
  // e a função para verificar os desbloqueios. Isso permite que qualquer componente
  // use e exiba essas informações.
  return { allAchievements, unlockedAchievements, checkAndUnlockAchievements };
};