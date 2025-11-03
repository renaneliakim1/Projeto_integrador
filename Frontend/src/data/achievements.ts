/**
 * @file achievements.ts
 * @description Catálogo central para todas as conquistas (achievements) disponíveis.
 */

// A interface UserStats precisa ser consistente com a definida em useGamification.ts
interface UserStatsForAchievements {
  xp: number;
  level: number;
  blocosCompletos: string[];
  streak: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  criteria: (stats: UserStatsForAchievements) => boolean;
}

export const allAchievements: Achievement[] = [
  // Conquistas de Blocos Completos
  {
    id: 'bloco_1',
    name: 'Primeiro Passo',
    description: 'Complete seu primeiro bloco de perguntas.',
    icon: 'Footprints',
    criteria: (stats) => stats.blocosCompletos.length >= 1,
  },
  {
    id: 'blocos_10',
    name: 'Pegando o Ritmo',
    description: 'Complete 10 blocos.',
    icon: 'TrendingUp',
    criteria: (stats) => stats.blocosCompletos.length >= 10,
  },
  {
    id: 'blocos_50',
    name: 'Maratonista do Saber',
    description: 'Complete 50 blocos.',
    icon: 'Award',
    criteria: (stats) => stats.blocosCompletos.length >= 50,
  },
  {
    id: 'blocos_100',
    name: 'Centurião do Conhecimento',
    description: 'Complete 100 blocos.',
    icon: 'Shield',
    criteria: (stats) => stats.blocosCompletos.length >= 100,
  },

  // Conquistas de Nível
  {
    id: 'nivel_5',
    name: 'Aprendiz Dedicado',
    description: 'Alcance o Nível 5.',
    icon: 'Star',
    criteria: (stats) => stats.level >= 5,
  },
  {
    id: 'nivel_10',
    name: 'Estudante Experiente',
    description: 'Alcance o Nível 10.',
    icon: 'Medal',
    criteria: (stats) => stats.level >= 10,
  },
  {
    id: 'nivel_20',
    name: 'Mestre do Nivelamento',
    description: 'Alcance o Nível 20.',
    icon: 'Trophy',
    criteria: (stats) => stats.level >= 20,
  },

  // Conquistas de Sequência (Streak)
  {
    id: 'streak_3',
    name: 'Consistência é a Chave',
    description: 'Mantenha uma sequência de 3 dias.',
    icon: 'Flame',
    criteria: (stats) => stats.streak >= 3,
  },
  {
    id: 'streak_7',
    name: 'Hábito Formado',
    description: 'Mantenha uma sequência de 7 dias.',
    icon: 'CalendarCheck',
    criteria: (stats) => stats.streak >= 7,
  },
  {
    id: 'streak_30',
    name: 'Lenda Viva',
    description: 'Mantenha uma sequência de 30 dias.',
    icon: 'Crown',
    criteria: (stats) => stats.streak >= 30,
  },

  // Conquistas de XP
  {
    id: 'xp_1000',
    name: 'Acumulador de XP',
    description: 'Acumule 1000 XP.',
    icon: 'Zap',
    criteria: (stats) => stats.xp >= 1000,
  },
  {
    id: 'xp_5000',
    name: 'Força do Conhecimento',
    description: 'Acumule 5000 XP.',
    icon: 'Gem',
    criteria: (stats) => stats.xp >= 5000,
  },
];