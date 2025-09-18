/**
 * @file achievements.ts
 * @description Este arquivo funciona como um catálogo central para todas as conquistas (achievements) disponíveis no jogo.
 * Ele define a estrutura de uma conquista e lista todas elas com seus respectivos critérios de desbloqueio.
 * Manter isso em um arquivo separado facilita a adição, remoção ou edição de conquistas sem alterar a lógica do jogo.
 */

// Define a estrutura de dados para cada conquista.
export interface Achievement {
  id: string; // Identificador único para a conquista.
  name: string; // Nome da conquista, exibido ao usuário.
  description: string; // Breve descrição do que é necessário para desbloqueá-la.
  icon: string; // Nome do ícone (do Lucide React) a ser exibido.
  // A função 'criteria' é o coração da conquista. Ela recebe as estatísticas do usuário
  // e retorna 'true' se o usuário atende aos requisitos para desbloquear, ou 'false' caso contrário.
  criteria: (userData: { xp: number; level: number; quizzesCompleted: number }) => boolean;
}

// Array com todas as conquistas do jogo.
export const allAchievements: Achievement[] = [
  {
    id: 'primeiro_quiz',
    name: 'Iniciante Curioso',
    description: 'Complete seu primeiro quiz.',
    icon: 'BookOpen',
    criteria: ({ quizzesCompleted }) => quizzesCompleted >= 1,
  },
  {
    id: 'nivel_5',
    name: 'Aprendiz Dedicado',
    description: 'Alcance o Nível 5.',
    icon: 'Star',
    criteria: ({ level }) => level >= 5,
  },
  {
    id: 'xp_500',
    name: 'Acumulador de Conhecimento',
    description: 'Acumule 500 XP.',
    icon: 'Zap',
    criteria: ({ xp }) => xp >= 500,
  },
  {
    id: 'tres_quizzes',
    name: 'Maratonista de Quizzes',
    description: 'Complete 3 quizzes.',
    icon: 'Target',
    criteria: ({ quizzesCompleted }) => quizzesCompleted >= 3,
  },
];
