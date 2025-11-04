import { GameCard } from "@/components/ui/game-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import * as LucideIcons from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from 'react';
import { useGamification } from '@/hooks/useGamification';
import { useToast } from "@/hooks/use-toast";
import apiClient from "@/api/axios";
import { useAuth } from "@/contexts/AuthContext";
import { allAchievements } from "@/data/achievements";

// Tipagem para os dados que esperamos do backend
interface UserProfileData {
  birth_date: string;
  educational_level: string;
  profession: string;
  focus: string;
  foto: string | null;
}
interface UserData {
  id: number;
  username: string;
  email: string;
  first_name: string;
  profile: UserProfileData;
  date_joined: string; // Data de criação da conta
}

// Componente dinâmico para ícones
const Icon = ({ name, ...props }: { name: string } & React.ComponentProps<typeof LucideIcons.HelpCircle>) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const LucideIcon = (LucideIcons as any)[name as keyof typeof LucideIcons] as typeof LucideIcons.HelpCircle;
  if (!LucideIcon) return <LucideIcons.HelpCircle {...props} />;
  return <LucideIcon {...props} />;
};

const Profile = () => {
  const navigate = useNavigate();
  const {
    level,
    xp,
    blocosCompletos,
    xpForNextLevel,
    progressPercentage,
    unlockedAchievements,
    addXp,
    isLoading: isGamificationLoading,
  } = useGamification();

  const { toast } = useToast();
  const { logout } = useAuth();

  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    focus: '',
    photo: null as string | null,
    joinDate: ''
  });

  // OTIMIZADO: Usa cache do useGamification ao invés de fetch separado
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  // Função para formatar a data de entrada
  const formatJoinDate = (dateString: string) => {
    if (!dateString) return 'Data desconhecida';
    
    const date = new Date(dateString);
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  // OTIMIZADO: Fetch inicial dos dados do usuário APENAS dados básicos (sem performance)
  useEffect(() => {
    if (initialLoadDone) return;

    const fetchUserData = async () => {
      try {
        // OTIMIZAÇÃO: Usa endpoint LEVE /users/me/basic/ ao invés de /users/me/
        // Endpoint básico não retorna performance de todas as matérias (muito mais rápido!)
        const response = await apiClient.get<UserData>('/users/me/basic/');
        const { data } = response;

        setUserInfo({
          name: data.first_name,
          email: data.email,
          focus: data.profile.focus,
          photo: data.profile.foto,
          joinDate: formatJoinDate(data.date_joined)
        });
        setInitialLoadDone(true);
      } catch (error) {
        console.error("Erro ao buscar dados do usuário:", error);
      }
    };

    // OTIMIZAÇÃO: Só faz fetch se gamification não estiver carregando
    // (evita 2 requests simultâneos)
    if (!isGamificationLoading) {
      fetchUserData();
    }
  }, [isGamificationLoading, initialLoadDone]);

  // Event listener para atualizar APENAS após editar perfil
  useEffect(() => {
    const handleDataUpdate = async (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.type === 'profile') {
        try {
          // OTIMIZAÇÃO: Usa endpoint leve ao invés do completo
          const response = await apiClient.get<UserData>('/users/me/basic/');
          const { data } = response;
          setUserInfo({
            name: data.first_name,
            email: data.email,
            focus: data.profile.focus,
            photo: data.profile.foto,
            joinDate: formatJoinDate(data.date_joined)
          });
        } catch (error) {
          console.error("Erro ao atualizar dados do perfil:", error);
        }
      }
    };
    window.addEventListener('app:data:updated', handleDataUpdate);
    return () => window.removeEventListener('app:data:updated', handleDataUpdate);
  }, []);

  const handleShare = async () => {
    const profileText = `Meu Perfil Skillio:\nNome: ${userInfo.name}\nNível: ${level}\nXP: ${xp}\nBlocos Completos: ${blocosCompletos?.length || 0}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: 'Meu Perfil Skillio', text: profileText, url: window.location.href });
        toast({ title: "Perfil compartilhado!" });
      } catch (error) {
        toast({ title: "Falha ao compartilhar", variant: "destructive" });
      }
    } else {
      navigator.clipboard.writeText(profileText).then(() => {
        toast({ title: "Perfil copiado para a área de transferência!" });
      }).catch(() => {
        toast({ title: "Falha ao copiar perfil", variant: "destructive" });
      });
    }
  };

  if (isGamificationLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LucideIcons.Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header com botão voltar */}
        <div className="mb-8">
          <Link to="/trilha">
            <Button variant="ghost" className="mb-6 hover:bg-primary/10">
              <LucideIcons.ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para a Trilha
            </Button>
          </Link>
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-2">
              Meu{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Perfil
              </span>
            </h1>
            <p className="text-muted-foreground">Veja seu progresso e conquistas</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto space-y-6">
          {/* Card Principal do Perfil */}
          <GameCard className="p-8 relative overflow-hidden">
            {/* Decoração de fundo */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl -z-10" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-secondary/10 to-transparent rounded-full blur-3xl -z-10" />
            
            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
              {/* Avatar e Info Básica */}
              <div className="flex flex-col items-center space-y-4">
                <div className="relative group">
                  <Avatar className="w-32 h-32 border-4 border-primary/20 shadow-xl transition-transform group-hover:scale-105">
                    <AvatarImage src={userInfo.photo || undefined} />
                    <AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-primary to-secondary">
                      {userInfo.name ? userInfo.name.split(' ').map(n => n[0]).join('') : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground rounded-full p-2 shadow-lg">
                    <LucideIcons.Star className="h-5 w-5" />
                  </div>
                </div>
                
                <Badge variant="secondary" className="text-sm">
                  <LucideIcons.Calendar className="h-3 w-3 mr-1" />
                  Membro desde {userInfo.joinDate}
                </Badge>
              </div>

              {/* Informações Detalhadas */}
              <div className="flex-1 space-y-6 w-full">
                <div className="text-center md:text-left">
                  <h2 className="text-3xl font-bold mb-1">
                    {userInfo.name ? userInfo.name.charAt(0).toUpperCase() + userInfo.name.slice(1) : 'Usuário'}
                  </h2>
                  <p className="text-muted-foreground flex items-center justify-center md:justify-start gap-2">
                    <LucideIcons.Mail className="h-4 w-4" />
                    {userInfo.email}
                  </p>
                </div>

                {/* Foco de Estudo */}
                <div className="bg-primary/5 rounded-lg p-4 border border-primary/10">
                  <div className="flex items-center gap-2 mb-2">
                    <LucideIcons.Target className="h-5 w-5 text-primary" />
                    <span className="font-semibold">Foco de Estudo</span>
                  </div>
                  <p className="text-lg font-bold text-primary">
                    {userInfo.focus || 'Não informado'}
                  </p>
                </div>

                {/* Nível e Progresso */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full p-2">
                        <LucideIcons.Zap className="h-5 w-5 text-white" />
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

                {/* Botões de Ação */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button 
                    className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70" 
                    onClick={() => navigate('/edit-profile')}
                  > 
                    <LucideIcons.Edit className="h-4 w-4 mr-2" /> 
                    Editar Perfil
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1 hover:bg-primary/10" 
                    onClick={handleShare}
                  >
                    <LucideIcons.Share2 className="h-4 w-4 mr-2" /> 
                    Compartilhar
                  </Button>
                </div>
              </div>
            </div>
          </GameCard>

          {/* Estatísticas em Grid */}
          <div className="grid md:grid-cols-3 gap-4">
            <GameCard className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-4">
                <div className="bg-blue-500/10 rounded-full p-3">
                  <LucideIcons.BookOpen className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Blocos Completos</p>
                  <p className="text-2xl font-bold">{blocosCompletos?.length || 0}</p>
                </div>
              </div>
            </GameCard>

            <GameCard className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-4">
                <div className="bg-green-500/10 rounded-full p-3">
                  <LucideIcons.Trophy className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Conquistas</p>
                  <p className="text-2xl font-bold">
                    {unlockedAchievements?.length || 0} / {allAchievements?.length || 0}
                  </p>
                </div>
              </div>
            </GameCard>

            <GameCard className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-4">
                <div className="bg-purple-500/10 rounded-full p-3">
                  <LucideIcons.Flame className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Sequência</p>
                  <p className="text-2xl font-bold">0 dias</p>
                </div>
              </div>
            </GameCard>
          </div>

          {/* Seção de Conquistas */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <LucideIcons.Award className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">Conquistas</h2>
              </div>
              <Badge variant="outline">
                {unlockedAchievements?.length || 0} / {allAchievements?.length || 0}
              </Badge>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {allAchievements && allAchievements.map((achievement) => {
                const isEarned = unlockedAchievements?.includes(achievement.id);
                return (
                  <GameCard 
                    key={achievement.id} 
                    className={`p-4 transition-all hover:scale-105 ${
                      isEarned 
                        ? 'border-green-500/50 bg-green-500/5 shadow-lg shadow-green-500/10' 
                        : 'opacity-50 hover:opacity-75'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`h-14 w-14 flex-shrink-0 flex items-center justify-center rounded-xl transition-all ${
                        isEarned 
                          ? 'bg-gradient-to-br from-green-500/20 to-green-600/20 text-green-400' 
                          : 'bg-muted/50'
                      }`}>
                        <Icon name={achievement.icon} className="h-7 w-7" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold mb-1 truncate">{achievement.name}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {achievement.description}
                        </p>
                        {isEarned && (
                          <Badge variant="secondary" className="mt-2 bg-green-500/20 text-green-400 border-green-500/30">
                            <LucideIcons.Check className="h-3 w-3 mr-1" />
                            Conquistado
                          </Badge>
                        )}
                      </div>
                    </div>
                  </GameCard>
                );
              })}
            </div>
          </div>

          {/* Ações de Teste (apenas em dev) */}
          {process.env.NODE_ENV === 'development' && (
            <GameCard className="p-6 border-dashed border-yellow-500/50 bg-yellow-500/5">
              <div className="flex items-center gap-2 mb-4">
                <LucideIcons.Bug className="h-5 w-5 text-yellow-500" />
                <h3 className="text-lg font-bold">Modo Desenvolvedor</h3>
              </div>
              <Button 
                onClick={() => addXp(50)} 
                variant="outline"
                className="w-full sm:w-auto border-yellow-500/50 hover:bg-yellow-500/10"
              >
                <LucideIcons.PlusCircle className="h-4 w-4 mr-2" /> 
                Adicionar 50 XP (Teste)
              </Button>
            </GameCard>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;