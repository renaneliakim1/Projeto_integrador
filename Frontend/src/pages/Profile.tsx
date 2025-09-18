import { GameCard } from "@/components/ui/game-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ArrowLeft, 
  Trophy, 
  Calendar,
  Star,
  BookOpen,
  Calculator,
  Atom,
  Globe,
  Palette,
  Zap,
  Target
} from "lucide-react";
import { Link } from "react-router-dom";
import React, { useState, useEffect } from 'react';
import { useAchievements } from '@/hooks/useAchievements';

// The hardcoded subjectStats and recentGames can stay for now as placeholders
const subjectStats = [
  {
    id: "matematica",
    name: "Matemática",
    icon: Calculator,
    bestScore: 2450,
    gamesPlayed: 35,
    accuracy: 82,
    avgTime: 45,
    level: 3,
    color: "text-blue-600"
  },
  {
    id: "portugues",
    name: "Português", 
    icon: BookOpen,
    bestScore: 1890,
    gamesPlayed: 28,
    accuracy: 75,
    avgTime: 38,
    level: 2,
    color: "text-green-600"
  },
  {
    id: "ciencias",
    name: "Ciências",
    icon: Atom,
    bestScore: 3200,
    gamesPlayed: 22,
    accuracy: 68,
    avgTime: 52,
    level: 4,
    color: "text-purple-600"
  },
  {
    id: "geografia",
    name: "Geografia",
    icon: Globe,
    bestScore: 1750,
    gamesPlayed: 18,
    accuracy: 85,
    avgTime: 35,
    level: 2,
    color: "text-teal-600"
  },
  {
    id: "artes",
    name: "Artes",
    icon: Palette,
    bestScore: 1950,
    gamesPlayed: 24,
    accuracy: 72,
    avgTime: 41,
    level: 2,
    color: "text-pink-600"
  }
];

const recentGames = [
  { subject: "Matemática", score: 1250, date: "Hoje", accuracy: 80 },
  { subject: "Português", score: 980, date: "Ontem", accuracy: 75 },
  { subject: "Ciências", score: 1450, date: "2 dias", accuracy: 85 },
  { subject: "Geografia", score: 890, date: "3 dias", accuracy: 70 },
];

const iconMap: { [key: string]: React.ReactNode } = {
  BookOpen: <BookOpen className="h-10 w-10" />,
  Star: <Star className="h-10 w-10" />,
  Zap: <Zap className="h-10 w-10" />,
  Target: <Target className="h-10 w-10" />,
};

const Profile = () => {
  const [userStats, setUserStats] = useState({
    name: "",
    email: "",
    avatar: "",
    joinDate: "...",
    totalGames: 0,
    totalScore: 0,
    avgAccuracy: 0, // Placeholder
    streak: 0, // Placeholder
    level: 1,
    xp: 0,
    nextLevelXp: 100,
  });

  const { allAchievements, unlockedAchievements } = useAchievements();

  useEffect(() => {
    const name = localStorage.getItem('userName') || 'Usuário';
    const email = localStorage.getItem('userEmail') || '';
    const level = parseInt(localStorage.getItem('userLevel') || '1', 10);
    const xp = parseInt(localStorage.getItem('userXP') || '0', 10);
    const quizzesCompleted = parseInt(localStorage.getItem('quizzesCompleted') || '0', 10);
    
    const nextLevelXp = level * 100;

    setUserStats(prevStats => ({
      ...prevStats,
      name,
      email,
      level,
      xp,
      nextLevelXp,
      totalGames: quizzesCompleted,
      totalScore: xp, // Using XP as total score for now
    }));
  }, []);

  const xpForCurrentLevel = userStats.xp - ((userStats.level - 1) * 100);
  const xpToNextLevel = userStats.nextLevelXp - ((userStats.level - 1) * 100);
  const xpPercentage = xpToNextLevel > 0 ? (xpForCurrentLevel / xpToNextLevel) * 100 : 0;

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
              Meu{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Perfil
              </span>
            </h1>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Profile Info */}
          <div className="lg:col-span-1 space-y-6">
            <GameCard variant="subject" className="p-6 text-center">
              <Avatar className="w-24 h-24 mx-auto mb-4">
                <AvatarImage src={userStats.avatar} />
                <AvatarFallback className="text-2xl">
                  {userStats.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <h2 className="text-2xl font-bold mb-2">{userStats.name}</h2>
              <p style={{ color: "white" }}  className="text-muted-foreground mb-4">{userStats.email}</p>
              
              <div className="flex justify-center items-center space-x-2 mb-4">
                <Star className="h-5 w-5 text-warning" />
                <span className="text-lg font-bold">Nível {userStats.level}</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>XP: {userStats.xp}</span>
                  <span>{userStats.nextLevelXp}</span>
                </div>
                <Progress value={xpPercentage} className="h-2" />
              </div>
              
              <Badge variant="secondary" className="mt-4">
                <Calendar className="h-3 w-3 mr-1" />
                Membro desde {userStats.joinDate}
              </Badge>
            </GameCard>

            {/* Quick Stats */}
            <GameCard className="p-6">
              <h3 className="text-lg font-bold mb-4">Estatísticas Gerais</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total de Jogos</span>
                  <span className="font-bold">{userStats.totalGames}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pontuação Total</span>
                  <span className="font-bold">{userStats.totalScore.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Precisão Média</span>
                  <span className="font-bold">{userStats.avgAccuracy}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sequência Atual</span>
                  <span className="font-bold text-success">{userStats.streak} dias</span>
                </div>
              </div>
            </GameCard>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Subject Performance */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Desempenho por Disciplina</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {subjectStats.map((subject) => {
                  const Icon = subject.icon;
                  return (
                    <GameCard key={subject.id} className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                            <Icon className="h-5 w-5 text-primary-foreground" />
                          </div>
                          <div>
                            <h3 className="font-bold">{subject.name}</h3>
                            <p className="text-xs text-muted-foreground">Nível {subject.level}</p>
                          </div>
                        </div>
                        <Trophy className="h-5 w-5 text-warning" />
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span>Melhor Pontuação</span>
                          <span className="font-bold text-primary">{subject.bestScore}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Jogos</span>
                          <span>{subject.gamesPlayed}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Precisão</span>
                          <span>{subject.accuracy}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Tempo Médio</span>
                          <span>{subject.avgTime}s</span>
                        </div>
                      </div>
                      
                      <Link to={`/game/${subject.id}`}>
                        <Button variant="game" size="sm" className="w-full mt-4">
                          Jogar Novamente
                        </Button>
                      </Link>
                    </GameCard>
                  );
                })}
              </div>
            </div>

            {/* Achievements */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Conquistas</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {allAchievements.map((achievement) => {
                  const isEarned = unlockedAchievements.includes(achievement.id);
                  const iconNode = iconMap[achievement.icon];
                  return (
                    <GameCard 
                      key={achievement.id} 
                      className={`p-4 ${isEarned ? 'border-green-500' : 'opacity-50'}`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`h-10 w-10 ${isEarned ? 'text-green-500' : 'text-muted-foreground'}`}>
                          {iconNode}
                        </div>
                        <div>
                          <h3 className="font-bold">{achievement.name}</h3>
                          <p className="text-sm text-muted-foreground">{achievement.description}</p>
                        </div>
                        {isEarned && (
                          <Badge variant="secondary" className="ml-auto bg-green-500/20 text-green-500">
                            Conquistado
                          </Badge>
                        )}
                      </div>
                    </GameCard>
                  );
                })}
              </div>
            </div>

            {/* Recent Games */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Jogos Recentes</h2>
              <GameCard className="p-6">
                <div className="space-y-4">
                  {recentGames.map((game, index) => (
                    <div key={index} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                      <div>
                        <h3 className="font-semibold">{game.subject}</h3>
                        <p className="text-sm text-muted-foreground">{game.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">{game.score} pts</p>
                        <p className="text-sm text-muted-foreground">{game.accuracy}% precisão</p>
                      </div>
                    </div>
                  ))}
                </div>
              </GameCard>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
