import { GameCard } from "@/components/ui/game-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Trophy, Medal, Award, Crown, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import React, { useState, useEffect } from 'react';

const initialGlobalRanking = [
  { id: 1, name: "Ana Costa", score: 15450, games: 89, accuracy: 92, avatar: "", position: 1 },
  { id: 2, name: "Carlos Silva", score: 14200, games: 75, accuracy: 89, avatar: "", position: 2 },
  { id: 3, name: "Maria Santos", score: 13800, games: 82, accuracy: 87, avatar: "", position: 3 },
  { id: 4, name: "João Oliveira", score: 12950, games: 68, accuracy: 85, avatar: "", position: 4 },
  { id: 5, name: "Pedro Lima", score: 12400, games: 71, accuracy: 83, avatar: "", position: 5 },
  { id: 6, name: "Julia Ferreira", score: 11800, games: 65, accuracy: 88, avatar: "", position: 6 },
  { id: 7, name: "Lucas Rocha", score: 11200, games: 59, accuracy: 81, avatar: "", position: 7 },
  { id: 8, name: "Beatriz Alves", score: 10900, games: 63, accuracy: 84, avatar: "", position: 8 },
  { id: 9, name: "Rafael Souza", score: 10500, games: 55, accuracy: 79, avatar: "", position: 9 },
  { id: 10, name: "Camila Dias", score: 10200, games: 52, accuracy: 86, avatar: "", position: 10 },
];

const weeklyRanking = [
  { id: 1, name: "Pedro Lima", score: 2850, games: 12, accuracy: 94, avatar: "", position: 1 },
  { id: 2, name: "Ana Costa", score: 2650, games: 11, accuracy: 91, avatar: "", position: 2 },
  { id: 3, name: "Julia Ferreira", score: 2400, games: 10, accuracy: 89, avatar: "", position: 3 },
  { id: 4, name: "Carlos Silva", score: 2200, games: 9, accuracy: 87, avatar: "", position: 4 },
  { id: 5, name: "Maria Santos", score: 2100, games: 8, accuracy: 92, avatar: "", position: 5 },
];

const subjectRankings = {
  matematica: [
    { id: 1, name: "Carlos Silva", score: 3200, position: 1 },
    { id: 2, name: "Ana Costa", score: 2950, position: 2 },
    { id: 3, name: "João Oliveira", score: 2750, position: 3 },
  ],
  portugues: [
    { id: 1, name: "Maria Santos", score: 2850, position: 1 },
    { id: 2, name: "Julia Ferreira", score: 2650, position: 2 },
    { id: 3, name: "Ana Costa", score: 2400, position: 3 },
  ],
  ciencias: [
    { id: 1, name: "Pedro Lima", score: 3450, position: 1 },
    { id: 2, name: "Carlos Silva", score: 3200, position: 2 },
    { id: 3, name: "Rafael Souza", score: 2980, position: 3 },
  ]
};

const getPositionIcon = (position: number) => {
  switch (position) {
    case 1: return <Crown className="h-6 w-6 text-yellow-500" />;
    case 2: return <Medal className="h-6 w-6 text-gray-400" />;
    case 3: return <Award className="h-6 w-6 text-amber-600" />;
    default: return <span className="text-xl font-bold text-muted-foreground">#{position}</span>;
  }
};

const getPositionColor = (position: number) => {
  switch (position) {
    case 1: return "bg-gradient-warning";
    case 2: return "bg-gradient-secondary";  
    case 3: return "bg-gradient-primary";
    default: return "bg-muted";
  }
};

const RankingCard = ({ player, showStats = true, isCurrentUser = false }: { player: any, showStats?: boolean, isCurrentUser?: boolean }) => (
  <GameCard className={`p-4 ${isCurrentUser ? 'border-2 border-primary shadow-lg' : ''} ${player.position <= 3 ? getPositionColor(player.position) : ''} ${player.position <= 3 ? 'text-primary-foreground' : ''}`}>
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="flex items-center justify-center w-12 h-12">
          {getPositionIcon(player.position)}
        </div>
        
        <Avatar className="w-10 h-10">
          <AvatarImage src={player.avatar} />
          <AvatarFallback>
            {player.name.split(' ').map((n: string) => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        
        <div>
          <h3 className="font-bold">{player.name}</h3>
          {showStats && (
            <p className={`text-sm ${player.position <= 3 ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
              {player.games} jogos • {player.accuracy}% precisão
            </p>
          )}
        </div>
      </div>
      
      <div className="text-right">
        <div className="text-2xl font-bold">
          {player.score.toLocaleString()}
        </div>
        <div className={`text-sm ${player.position <= 3 ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
          pontos
        </div>
      </div>
    </div>
  </GameCard>
);

const Ranking = () => {
  const [dynamicGlobalRanking, setDynamicGlobalRanking] = useState(initialGlobalRanking);
  const [currentUserName, setCurrentUserName] = useState<string | null>(null);

  useEffect(() => {
    const userName = localStorage.getItem('userName');
    const userXP = parseInt(localStorage.getItem('userXP') || '0', 10);

    if (userName) {
      setCurrentUserName(userName);
      const userForRanking = {
        id: 999, // Static ID for current user to avoid key conflicts
        name: userName,
        score: userXP,
        games: 1, // Placeholder, this could be stored in localStorage too
        accuracy: 80, // Placeholder
        avatar: '',
        position: 0, // Will be calculated
      };

      let rankingWithUser = [...initialGlobalRanking];
      const userIndex = rankingWithUser.findIndex(p => p.name === userName);

      if (userIndex !== -1) {
        rankingWithUser[userIndex] = { ...rankingWithUser[userIndex], score: userXP };
      } else {
        rankingWithUser.push(userForRanking);
      }

      rankingWithUser.sort((a, b) => b.score - a.score);
      const finalRanking = rankingWithUser.map((player, index) => ({
        ...player,
        position: index + 1,
      }));

      setDynamicGlobalRanking(finalRanking);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Início
            </Button>
          </Link>
          
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-warning bg-clip-text text-transparent">
                Ranking
              </span>{" "}
              Global
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Veja os melhores jogadores e compare seu desempenho com outros estudantes!
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="global" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="global" className="flex items-center space-x-2">
                <Trophy className="h-4 w-4" />
                <span>Global</span>
              </TabsTrigger>
              <TabsTrigger value="weekly" className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4" />
                <span>Semanal</span>
              </TabsTrigger>
              <TabsTrigger value="subjects" className="flex items-center space-x-2">
                <Medal className="h-4 w-4" />
                <span>Disciplinas</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="global" className="space-y-4">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">Ranking Geral</h2>
                <p className="text-muted-foreground">Baseado na pontuação total de todos os jogos</p>
              </div>
              
              {/* Pódium */}
              <div className="grid md:grid-cols-3 gap-4 mb-8">
                {dynamicGlobalRanking.slice(0, 3).map((player) => (
                  <GameCard
                    key={player.id}
                    variant={player.position === 1 ? "warning" : player.position === 2 ? "game" : "subject"}
                    className="p-6 text-center"
                  >
                    <div className="mb-4">
                      {getPositionIcon(player.position)}
                    </div>
                    <Avatar className="w-16 h-16 mx-auto mb-4">
                      <AvatarImage src={player.avatar} />
                      <AvatarFallback className="text-xl">
                        {player.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="font-bold text-lg mb-2">{player.name}</h3>
                    <div className="text-2xl font-bold mb-2">
                      {player.score.toLocaleString()}
                    </div>
                    <p className="text-sm opacity-80">
                      {player.games} jogos • {player.accuracy}%
                    </p>
                  </GameCard>
                ))}
              </div>
              
              {/* Restante do ranking */}
              <div className="space-y-3">
                {dynamicGlobalRanking.slice(3).map((player) => (
                  <RankingCard key={player.id} player={player} isCurrentUser={currentUserName === player.name} />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="weekly" className="space-y-4">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">Ranking Semanal</h2>
                <p className="text-muted-foreground">
                  Baseado nos pontos conquistados nos últimos 7 dias
                </p>
                <Badge variant="secondary" className="mt-2">
                  Atualizado há 2 horas
                </Badge>
              </div>
              
              <div className="space-y-3">
                {weeklyRanking.map((player) => (
                  <RankingCard key={player.id} player={player} />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="subjects" className="space-y-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">Ranking por Disciplina</h2>
                <p className="text-muted-foreground">
                  Os melhores jogadores em cada matéria
                </p>
              </div>
              
              {Object.entries(subjectRankings).map(([subject, ranking]) => (
                <div key={subject}>
                  <h3 className="text-xl font-bold mb-4 capitalize">
                    {subject === 'matematica' ? 'Matemática' : 
                     subject === 'portugues' ? 'Português' : 
                     subject === 'ciencias' ? 'Ciências' : subject}
                  </h3>
                  <div className="grid gap-3">
                    {ranking.map((player) => (
                      <RankingCard key={player.id} player={player} showStats={false} />
                    ))}
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Ranking;