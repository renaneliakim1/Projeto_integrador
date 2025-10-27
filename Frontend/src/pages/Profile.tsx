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
}

// Componente dinâmico para ícones
const Icon = ({ name, ...props }: { name: string } & LucideIcons.LucideProps) => {
  const LucideIcon = LucideIcons[name as keyof typeof LucideIcons];
  if (!LucideIcon) return <LucideIcons.HelpCircle {...props} />; // Ícone padrão
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
    allAchievements,
    unlockedAchievements,
    addXp,
    isLoading: isGamificationLoading, // Renomeia para evitar conflito
  } = useGamification();

  const { toast } = useToast();
  const { logout } = useAuth();

  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    focus: '',
    photo: null as string | null,
    joinDate: 'Setembro 2025'
  });

  // Fetch inicial dos dados do usuário
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await apiClient.get<UserData>('/users/me/');
        const { data } = response;

        setUserInfo({
          name: data.first_name,
          email: data.email,
          focus: data.profile.focus,
          photo: data.profile.foto,
          joinDate: 'Setembro 2025'
        });
      } catch (error) {
        console.error("Erro ao buscar dados do usuário:", error);
      }
    };

    fetchUserData();
  }, []);

  // Event listener para atualizar APENAS após editar perfil
  useEffect(() => {
    const handleDataUpdate = async (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.type === 'profile') {
        try {
          const response = await apiClient.get<UserData>('/users/me/');
          const { data } = response;
          setUserInfo({
            name: data.first_name,
            email: data.email,
            focus: data.profile.focus,
            photo: data.profile.foto,
            joinDate: 'Setembro 2025'
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link to="/trilha">
            <Button variant="ghost" className="mb-6"><LucideIcons.ArrowLeft className="h-4 w-4 mr-2" />Voltar para a Trilha</Button>
          </Link>
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Meu{" "}<span className="bg-gradient-primary bg-clip-text text-transparent">Perfil</span>
            </h1>
          </div>
        </div>

        <div className="max-w-7xl mx-auto space-y-8">
          <GameCard variant="subject" className="p-6 text-center w-full">
            <Avatar className="w-24 h-24 mx-auto mb-4">
              <AvatarImage src={userInfo.photo || undefined} />
              <AvatarFallback className="text-2xl">{userInfo.name ? userInfo.name.split(' ').map(n => n[0]).join('') : 'U'}</AvatarFallback>
            </Avatar>
            <h2 className="text-2xl font-bold mb-2">{userInfo.name ? userInfo.name.charAt(0).toUpperCase() + userInfo.name.slice(1) : 'Usuário'}</h2>
            <p className="text-white mb-2">{userInfo.email}</p>
            
            <div className="text-left space-y-2 mb-4 w-full">
              <p className="text-sm text-white">Foco de Estudo: <span className="font-semibold text-foreground">{userInfo.focus || 'Não informado'}</span></p>
            </div>

            <div className="flex justify-center items-center space-x-2 mb-4">
              <LucideIcons.Star className="h-5 w-5 text-yellow-400" />
              <span className="text-lg font-bold text-white">Nível {level}</span>
            </div>
            
            <div className="space-y-2 w-full">
              <div className="flex justify-between text-sm font-mono text-white">
                <span>{xp.toFixed(0)} XP</span>
                <span>{xpForNextLevel} XP</span>
              </div>
              <Progress value={progressPercentage} className="h-3 bg-primary/20" />
            </div>
            
            <Badge variant="secondary" className="mt-4 text-white">
              <LucideIcons.Calendar className="h-3 w-3 mr-1" />Membro desde {userInfo.joinDate}
            </Badge>

            <div className="flex gap-2 mt-4 w-full">
                <Button variant="outline" className="w-full" onClick={() => navigate('/edit-profile')}> 
                  <LucideIcons.Edit className="h-4 w-4 mr-2" /> Editar Perfil
                </Button>
                <Button variant="outline" className="w-full" onClick={handleShare}>
                  <LucideIcons.Share2 className="h-4 w-4 mr-2" /> Compartilhar
                </Button>
            </div>

            
          </GameCard>

          <div>
            <h2 className="text-2xl font-bold mb-6 text-white">Conquistas</h2>

          
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allAchievements && allAchievements.map((achievement) => {
                const isEarned = unlockedAchievements?.includes(achievement.id);
                return (
                  <GameCard key={achievement.id} className={`p-4 transition-all ${isEarned ? 'border-green-500/50' : 'opacity-50'}`}>
                    <div className="flex items-center space-x-4">
                      <div className={`h-12 w-12 flex items-center justify-center rounded-lg ${isEarned ? 'bg-green-500/20 text-green-400' : 'bg-muted'}`}>
                        <Icon name={achievement.icon} className="h-8 w-8" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white">{achievement.name}</h3>
                        <p className="text-sm text-white">{achievement.description}</p>
                      </div>
                    </div>
                  </GameCard>
                );
              })}
            </div>
          </div>
          
          <GameCard className="p-6 w-full">
            <h3 className="text-lg font-bold mb-4 text-white">Estatísticas Gerais</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-white">Blocos Completos</span>
                <span className="font-bold text-white">{blocosCompletos?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white">Conquistas</span>
                <span className="font-bold text-white">{unlockedAchievements?.length || 0} / {allAchievements?.length || 0}</span>
              </div>
            </div>
          </GameCard>

          <GameCard className="p-6 w-full">
            <h3 className="text-lg font-bold mb-4 text-white">Ações de Teste</h3>
            <div className="flex flex-col gap-2">
               <Button onClick={() => addXp(50)} variant="outline">
                <LucideIcons.PlusCircle className="h-4 w-4 mr-2" /> Adicionar 50 XP
              </Button>
            </div>
          </GameCard>

        </div>
      </div>
    </div>
  );
};

export default Profile;