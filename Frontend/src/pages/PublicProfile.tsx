import { GameCard } from "@/components/ui/game-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import * as LucideIcons from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useState, useEffect } from 'react';
import { Loader2, ArrowLeft } from "lucide-react";
import apiClient from "@/api/axios";

interface PublicUserData {
  id: number;
  username: string;
  email?: string;
  first_name: string;
  profile: {
    foto: string | null;
    focus: string;
  };
  gamification: {
    level: number;
    xp: number;
  };
  achievements: Array<{
    achievement: {
      id: number;
      name: string;
      description: string;
      icon: string;
    };
  }>;
}

// Componente dinâmico para ícones
const Icon = ({ name, ...props }: { name: string } & LucideIcons.LucideProps) => {
  const LucideIcon = LucideIcons[name as keyof typeof LucideIcons] as React.ComponentType<LucideIcons.LucideProps>;
  if (!LucideIcon) return <LucideIcons.HelpCircle {...props} />;
  return <LucideIcon {...props} />;
};

const PublicProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const [userData, setUserData] = useState<PublicUserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get<PublicUserData>(`/users/${userId}/`);
        setUserData(response.data);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Erro ao carregar perfil do usuário');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container mx-auto px-4 py-8">
          <Link to="/ranking">
            <Button variant="ghost" className="mb-6 hover:bg-primary/10">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para o Ranking
            </Button>
          </Link>
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{error || 'Usuário não encontrado'}</p>
            <Link to="/ranking">
              <Button>Voltar para o Ranking</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const level = userData.gamification.level;
  const xp = userData.gamification.xp;
  const xpForNextLevel = level * 100;
  const progressPercentage = (xp / xpForNextLevel) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header com botão voltar */}
        <div className="mb-8">
          <Link to="/ranking">
            <Button variant="ghost" className="mb-6 hover:bg-primary/10">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para o Ranking
            </Button>
          </Link>
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-2">
              Perfil de{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {userData.first_name || userData.username}
              </span>
            </h1>
            <p className="text-muted-foreground">Veja as conquistas e progresso deste jogador</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto space-y-6">
          {/* Card Principal do Perfil */}
          <GameCard className="p-8 relative overflow-hidden">
            {/* Decoração de fundo */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl -z-10" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-secondary/15 to-primary/5 rounded-full blur-3xl -z-10" />
            
            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
              {/* Avatar e Info Básica */}
              <div className="flex flex-col items-center space-y-4">
                <div className="relative group">
                  <Avatar className="w-32 h-32 border-4 border-primary/20 shadow-xl">
                    <AvatarImage src={userData.profile.foto || undefined} />
                    <AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-primary to-secondary text-white">
                      {userData.first_name ? userData.first_name.split(' ').map(n => n[0]).join('') : userData.username.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground rounded-full p-2 shadow-lg">
                    <LucideIcons.Star className="h-5 w-5" />
                  </div>
                </div>
              </div>

              {/* Informações Detalhadas */}
              <div className="flex-1 space-y-6 w-full text-center md:text-left">
                <div>
                  <h2 className="text-3xl font-bold mb-1">
                    {userData.first_name || userData.username}
                  </h2>
                  <p className="text-muted-foreground">@{userData.username}</p>
                </div>

                {/* Foco de Estudo */}
                {userData.profile.focus && (
                  <div className="bg-primary/5 rounded-lg p-4 border border-primary/10">
                    <div className="flex items-center gap-2 mb-2 justify-center md:justify-start">
                      <LucideIcons.Target className="h-5 w-5 text-primary" />
                      <span className="font-semibold">Foco de Estudo</span>
                    </div>
                    <p className="text-lg font-bold text-primary">
                      {userData.profile.focus}
                    </p>
                  </div>
                )}

                {/* Nível e Progresso */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="bg-gradient-warning rounded-full p-2">
                        <LucideIcons.Zap className="h-5 w-5 text-warning-foreground" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Nível Atual</p>
                        <p className="text-2xl font-bold">{level}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">XP Total</p>
                      <p className="text-2xl font-bold text-primary">{xp.toFixed(0)}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Nível {level} → Nível {level + 1}</span>
                      <span className="font-mono font-bold">{progressPercentage.toFixed(0)}%</span>
                    </div>
                    <Progress value={progressPercentage} className="h-3" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{xp.toFixed(0)} XP</span>
                      <span>{xpForNextLevel} XP</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </GameCard>

          {/* Seção de Conquistas */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <LucideIcons.Award className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">Conquistas</h2>
              </div>
              <Badge variant="outline">
                {userData.achievements.length} Conquistadas
              </Badge>
            </div>

            {userData.achievements.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Este jogador ainda não tem conquistas.</p>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {userData.achievements.map((userAchievement) => {
                  const achievement = userAchievement.achievement;
                  return (
                    <GameCard 
                      key={achievement.id} 
                      className="p-4 transition-all hover:scale-105 border-secondary/50 bg-secondary/5 shadow-lg shadow-secondary/10"
                    >
                      <div className="flex items-start gap-4">
                        <div className="h-14 w-14 flex-shrink-0 flex items-center justify-center rounded-xl bg-gradient-to-br from-secondary/20 to-secondary/30 text-secondary">
                          <Icon name={achievement.icon} className="h-7 w-7" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold mb-1 truncate">{achievement.name}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {achievement.description}
                          </p>
                          <Badge variant="secondary" className="mt-2">
                            <LucideIcons.Check className="h-3 w-3 mr-1" />
                            Conquistado
                          </Badge>
                        </div>
                      </div>
                    </GameCard>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;
