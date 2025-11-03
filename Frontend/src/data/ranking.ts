export interface RankedUser {
  id: number;
  name: string;
  avatar: string;
  level: number;
  xp: number;
}

// Helper to generate random avatars from DiceBear
const getAvatar = (name: string) => `https://api.dicebear.com/8.x/adventurer/tsx?seed=${name.replace(/\s/g, '')}`;

export const globalRankingData: RankedUser[] = [
  { id: 1, name: 'Helena', avatar: getAvatar('Helena'), level: 15, xp: 14500 },
  { id: 2, name: 'Miguel', avatar: getAvatar('Miguel'), level: 14, xp: 13200 },
  { id: 3, name: 'Alice', avatar: getAvatar('Alice'), level: 14, xp: 12950 },
  { id: 4, name: 'Arthur', avatar: getAvatar('Arthur'), level: 12, xp: 11200 },
  { id: 5, name: 'Laura', avatar: getAvatar('Laura'), level: 11, xp: 10500 },
  { id: 6, name: 'Heitor', avatar: getAvatar('Heitor'), level: 10, xp: 9800 },
  { id: 7, name: 'Manuela', avatar: getAvatar('Manuela'), level: 9, xp: 8750 },
  { id: 8, name: 'Bernardo', avatar: getAvatar('Bernardo'), level: 8, xp: 7600 },
  { id: 9, name: 'Valentina', avatar: getAvatar('Valentina'), level: 7, xp: 6500 },
  { id: 10, name: 'Davi', avatar: getAvatar('Davi'), level: 6, xp: 5400 },
].sort((a, b) => b.xp - a.xp);

export const matematicaRankingData: RankedUser[] = [
  { id: 4, name: 'Arthur', avatar: getAvatar('Arthur'), level: 12, xp: 8200 },
  { id: 7, name: 'Manuela', avatar: getAvatar('Manuela'), level: 9, xp: 7100 },
  { id: 1, name: 'Helena', avatar: getAvatar('Helena'), level: 15, xp: 6500 },
  { id: 10, name: 'Davi', avatar: getAvatar('Davi'), level: 6, xp: 5400 },
  { id: 2, name: 'Miguel', avatar: getAvatar('Miguel'), level: 14, xp: 4800 },
].sort((a, b) => b.xp - a.xp);

export const programacaoRankingData: RankedUser[] = [
  { id: 3, name: 'Alice', avatar: getAvatar('Alice'), level: 14, xp: 9800 },
  { id: 8, name: 'Bernardo', avatar: getAvatar('Bernardo'), level: 8, xp: 7600 },
  { id: 5, name: 'Laura', avatar: getAvatar('Laura'), level: 11, xp: 6800 },
  { id: 9, name: 'Valentina', avatar: getAvatar('Valentina'), level: 7, xp: 6500 },
  { id: 6, name: 'Heitor', avatar: getAvatar('Heitor'), level: 10, xp: 5200 },
].sort((a, b) => b.xp - a.xp);

export const portuguesRankingData: RankedUser[] = [
    { id: 1, name: 'Helena', avatar: getAvatar('Helena'), level: 15, xp: 7000 },
    { id: 2, name: 'Miguel', avatar: getAvatar('Miguel'), level: 14, xp: 6400 },
    { id: 6, name: 'Heitor', avatar: getAvatar('Heitor'), level: 10, xp: 4600 },
    { id: 9, name: 'Valentina', avatar: getAvatar('Valentina'), level: 7, xp: 3200 },
].sort((a, b) => b.xp - a.xp);

export const historiaRankingData: RankedUser[] = [
    { id: 5, name: 'Laura', avatar: getAvatar('Laura'), level: 11, xp: 9200 },
    { id: 7, name: 'Manuela', avatar: getAvatar('Manuela'), level: 9, xp: 8100 },
    { id: 8, name: 'Bernardo', avatar: getAvatar('Bernardo'), level: 8, xp: 7300 },
    { id: 10, name: 'Davi', avatar: getAvatar('Davi'), level: 6, xp: 6000 },
].sort((a, b) => b.xp - a.xp);

export const semanalRankingData: RankedUser[] = [
  { id: 2, name: 'Miguel', avatar: getAvatar('Miguel'), level: 14, xp: 1500 },
  { id: 1, name: 'Helena', avatar: getAvatar('Helena'), level: 15, xp: 1350 },
  { id: 4, name: 'Arthur', avatar: getAvatar('Arthur'), level: 12, xp: 1100 },
  { id: 3, name: 'Alice', avatar: getAvatar('Alice'), level: 14, xp: 950 },
  { id: 7, name: 'Manuela', avatar: getAvatar('Manuela'), level: 9, xp: 800 },
  { id: 5, name: 'Laura', avatar: getAvatar('Laura'), level: 11, xp: 720 },
  { id: 6, name: 'Heitor', avatar: getAvatar('Heitor'), level: 10, xp: 600 },
].sort((a, b) => b.xp - a.xp);

export const geografiaRankingData: RankedUser[] = [
    { id: 1, name: 'Helena', avatar: getAvatar('Helena'), level: 15, xp: 6800 },
    { id: 8, name: 'Bernardo', avatar: getAvatar('Bernardo'), level: 8, xp: 6100 },
    { id: 10, name: 'Davi', avatar: getAvatar('Davi'), level: 6, xp: 5200 },
].sort((a, b) => b.xp - a.xp);

export const cienciasRankingData: RankedUser[] = [
    { id: 4, name: 'Arthur', avatar: getAvatar('Arthur'), level: 12, xp: 7500 },
    { id: 3, name: 'Alice', avatar: getAvatar('Alice'), level: 14, xp: 7100 },
    { id: 9, name: 'Valentina', avatar: getAvatar('Valentina'), level: 7, xp: 6300 },
].sort((a, b) => b.xp - a.xp);

export const artesRankingData: RankedUser[] = [
    { id: 5, name: 'Laura', avatar: getAvatar('Laura'), level: 11, xp: 5500 },
    { id: 6, name: 'Heitor', avatar: getAvatar('Heitor'), level: 10, xp: 5100 },
].sort((a, b) => b.xp - a.xp);

export const inglesRankingData: RankedUser[] = [
    { id: 7, name: 'Manuela', avatar: getAvatar('Manuela'), level: 9, xp: 8800 },
    { id: 2, name: 'Miguel', avatar: getAvatar('Miguel'), level: 14, xp: 8500 },
].sort((a, b) => b.xp - a.xp);

export const filosofiaRankingData: RankedUser[] = [
    { id: 9, name: 'Valentina', avatar: getAvatar('Valentina'), level: 7, xp: 4300 },
    { id: 10, name: 'Davi', avatar: getAvatar('Davi'), level: 6, xp: 4100 },
].sort((a, b) => b.xp - a.xp);

// Helper function to add the current user to a ranking list for demonstration
export const getRankingWithCurrentUser = (ranking: RankedUser[]): RankedUser[] => {
  const currentUser = localStorage.getItem('userName') || 'Jogador';
  const userExists = ranking.find(u => u.name === currentUser);

  if (userExists) {
    return ranking;
  }

  const newUser: RankedUser = {
    id: 99, // Static ID for mock user
    name: currentUser,
    avatar: getAvatar(currentUser),
    level: parseInt(localStorage.getItem('userLevel') || '1', 10),
    xp: parseInt(localStorage.getItem('userXp') || '0', 10),
  };

  // Create a new array, add the user, and sort it
  const newRanking = [...ranking, newUser];
  newRanking.sort((a, b) => b.xp - a.xp);
  return newRanking;
};