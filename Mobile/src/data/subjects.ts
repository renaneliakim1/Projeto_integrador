// Ícones do @expo/vector-icons (Ionicons)
// Mapeamento de ícones do Lucide (web) para Ionicons (mobile)

export interface Subject {
  id: string;
  name: string;
  iconName: string; // Nome do ícone do Ionicons
  questions: number;
  variant: 'knowledge' | 'growth' | 'intellect' | 'wisdom' | 'purity';
  description: string;
}

export const subjects: Subject[] = [
  {
    id: 'matematica',
    name: 'Matemática',
    iconName: 'calculator',
    questions: 250,
    variant: 'knowledge',
    description: 'Números, equações e geometria',
  },
  {
    id: 'portugues',
    name: 'Português',
    iconName: 'book',
    questions: 200,
    variant: 'growth',
    description: 'Gramática, literatura e redação',
  },
  {
    id: 'ingles',
    name: 'Inglês',
    iconName: 'language',
    questions: 180,
    variant: 'knowledge',
    description: 'Vocabulário, gramática e conversação',
  },
  {
    id: 'espanhol',
    name: 'Espanhol',
    iconName: 'language',
    questions: 160,
    variant: 'intellect',
    description: 'Vocabulário e cultura hispânica',
  },
  {
    id: 'fisica',
    name: 'Física',
    iconName: 'flash',
    questions: 200,
    variant: 'knowledge',
    description: 'Movimento, energia e universo',
  },
  {
    id: 'quimica',
    name: 'Química',
    iconName: 'beaker',
    questions: 190,
    variant: 'wisdom',
    description: 'Elementos, reações e moléculas',
  },
  {
    id: 'biologia',
    name: 'Biologia',
    iconName: 'leaf',
    questions: 185,
    variant: 'growth',
    description: 'Vida, células e ecossistemas',
  },
  {
    id: 'historia',
    name: 'História',
    iconName: 'time',
    questions: 175,
    variant: 'intellect',
    description: 'Eventos e civilizações',
  },
  {
    id: 'geografia',
    name: 'Geografia',
    iconName: 'globe',
    questions: 165,
    variant: 'growth',
    description: 'Países, capitais e relevos',
  },
  {
    id: 'filosofia',
    name: 'Filosofia',
    iconName: 'bulb',
    questions: 150,
    variant: 'wisdom',
    description: 'Pensamento crítico e reflexão',
  },
  {
    id: 'informatica',
    name: 'Informática',
    iconName: 'code-slash',
    questions: 200,
    variant: 'knowledge',
    description: 'Programação, algoritmos e tecnologia',
  },
  {
    id: 'logica',
    name: 'Lógica',
    iconName: 'stats-chart',
    questions: 200,
    variant: 'knowledge',
    description: 'Raciocínio, análise e pensamento',
  },
];

// Cores das variantes (mesmas do web)
export const variantColors = {
  knowledge: '#3b82f6', // azul
  growth: '#22c55e', // verde
  intellect: '#a855f7', // roxo
  wisdom: '#f59e0b', // laranja
  purity: '#22d3ee', // ciano
};
