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
  Target,
  PlusCircle,
  Share2,
  Edit
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import React, { useState, useEffect } from 'react';
import { useGamification } from '@/hooks/useGamification';
import { useToast } from "@/hooks/use-toast";

// Mock data, can be removed later
const subjectStats = [
  { id: "matematica", name: "Matemática", icon: Calculator, bestScore: 2450, gamesPlayed: 35, accuracy: 82, level: 3 },
  { id: "portugues", name: "Português", icon: BookOpen, bestScore: 1890, gamesPlayed: 28, accuracy: 75, level: 2 },
  { id: "ciencias", name: "Ciências", icon: Atom, bestScore: 3200, gamesPlayed: 22, accuracy: 68, level: 4 },
];
const recentGames = [
  { subject: "Matemática", score: 1250, date: "Hoje", accuracy: 80 },
  { subject: "Português", score: 980, date: "Ontem", accuracy: 75 },
];

const iconMap: { [key: string]: React.ReactNode } = {
  BookOpen: <BookOpen className="h-10 w-10" />,
  Star: <Star className="h-10 w-10" />,
  Zap: <Zap className="h-10 w-10" />,
  Target: <Target className="h-10 w-10" />,
};

const Profile = () => {
  const {
    level,
    xp,
    quizzesCompleted,
    xpForNextLevel,
    progressPercentage,
    allAchievements,
    unlockedAchievements,
    addXp,
    completeQuiz,
  } = useGamification();

  const navigate = useNavigate();
  const { toast } = useToast();

  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    educationalLevel: '',
    birthDate: '',
    profession: '',
    focus: '',
    photo: null as string | null,
    joinDate: '...'
  });

  useEffect(() => {
    const name = localStorage.getItem('userName') || 'Usuário';
    const email = localStorage.getItem('userEmail') || '';
    const educationalLevel = localStorage.getItem('userEducationalLevel') || '';
    const birthDateISO = localStorage.getItem('userBirthDate');
    const profession = localStorage.getItem('userProfession') || '';
    const focus = localStorage.getItem('userFocus') || '';
    const photo = localStorage.getItem('userPhoto'); // Assuming userPhoto is stored as base64 or URL

    let birthDateFormatted = '';
    if (birthDateISO) {
      const date = new Date(birthDateISO);
      birthDateFormatted = date.toLocaleDateString('pt-BR');
    }

    setUserInfo({
      name,
      email,
      educationalLevel,
      birthDate: birthDateFormatted,
      profession,
      focus,
      photo,
      joinDate: 'Setembro 2025' // This should ideally come from registration timestamp
    });
  }, []);

  const handleShare = async () => {
    const profileText = `Meu Perfil Skillio:\nNome: ${userInfo.name}\nEmail: ${userInfo.email}\nNível: ${level}\nXP: ${xp}\nQuizzes Completos: ${quizzesCompleted}\nEscolaridade: ${userInfo.educationalLevel}\nData de Nascimento: ${userInfo.birthDate}\nProfissão: ${userInfo.profession}\nFoco: ${userInfo.focus}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Meu Perfil Skillio',
          text: profileText,
          url: window.location.href, // Share current profile URL
        });
        toast({ title: "Perfil compartilhado!" });
      } catch (error) {
        console.error('Erro ao compartilhar:', error);
        toast({ title: "Falha ao compartilhar", description: "Tente novamente.", variant: "destructive" });
      }
    } else {
      // Fallback for browsers that do not support Web Share API
      navigator.clipboard.writeText(profileText).then(() => {
        toast({ title: "Perfil copiado para a área de transferência!" });
      }).catch(err => {
        console.error('Erro ao copiar:', err);
        toast({ title: "Falha ao copiar perfil", description: "Tente novamente.", variant: "destructive" });
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link to="/">
            <Button variant="ghost" className="mb-6"><ArrowLeft className="h-4 w-4 mr-2" />Voltar</Button>
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
              <AvatarFallback className="text-2xl">{userInfo.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <h2 className="text-2xl font-bold mb-2">{userInfo.name.charAt(0).toUpperCase() + userInfo.name.slice(1)}</h2>
            <p className="text-white mb-2">{userInfo.email}</p>
            
            <div className="text-left space-y-2 mb-4 w-full">
              <p className="text-sm text-white">Escolaridade: <span className="font-semibold text-foreground">{userInfo.educationalLevel || 'Não informado'}</span></p>
              <p className="text-sm text-white">Nascimento: <span className="font-semibold text-foreground">{userInfo.birthDate || 'Não informado'}</span></p>
              <p className="text-sm text-white">Profissão: <span className="font-semibold text-foreground">{userInfo.profession || 'Não informado'}</span></p>
              <p className="text-sm text-white">Foco de Estudo: <span className="font-semibold text-foreground">{userInfo.focus || 'Não informado'}</span></p>
            </div>

            <div className="flex justify-center items-center space-x-2 mb-4">
              <Star className="h-5 w-5 text-yellow-400" />
              <span className="text-lg font-bold text-white">Nível {level}</span>
            </div>
            
            <div className="space-y-2 w-full">
              <div className="flex justify-between text-sm font-mono text-white">
                <span>{xp} XP</span>
                <span>{xpForNextLevel} XP</span>
              </div>
              <Progress value={progressPercentage} className="h-3 bg-primary/20" />
            </div>
            
            <Badge variant="secondary" className="mt-4 text-white">
              <Calendar className="h-3 w-3 mr-1" />Membro desde {userInfo.joinDate}
            </Badge>

            <div className="flex gap-2 mt-4 w-full">
              <Button variant="outline" className="w-full" onClick={() => navigate('/edit-profile')}> 
                <Edit className="h-4 w-4 mr-2" /> Editar Perfil
              </Button>
              <Button variant="outline" className="w-full" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" /> Compartilhar
              </Button>
            </div>
          </GameCard>

          <div>
            <h2 className="text-2xl font-bold mb-6 text-white">Conquistas</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {allAchievements.map((achievement) => {
                const isEarned = unlockedAchievements.includes(achievement.id);
                const iconNode = iconMap[achievement.icon];
                return (
                  <GameCard key={achievement.id} className={`p-4 transition-all ${isEarned ? 'border-green-500/50' : 'opacity-50'}`}>
                    <div className="flex items-center space-x-4">
                      <div className={`h-12 w-12 flex items-center justify-center rounded-lg ${isEarned ? 'bg-green-500/20 text-green-400' : 'bg-muted'}`}>
                        {React.cloneElement(iconNode as React.ReactElement, { className: "h-8 w-8" })}
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
                <span className="text-white">Quizzes Completos</span>
                <span className="font-bold text-white">{quizzesCompleted}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white">Conquistas</span>
                <span className="font-bold text-white">{unlockedAchievements.length} / {allAchievements.length}</span>
              </div>
            </div>
          </GameCard>

          <GameCard className="p-6 w-full">
            <h3 className="text-lg font-bold mb-4 text-white">Ações de Teste</h3>
            <div className="flex flex-col gap-2">
               <Button onClick={() => addXp(50)} variant="outline">
                <PlusCircle className="h-4 w-4 mr-2" /> Adicionar 50 XP
              </Button>
              <Button onClick={() => completeQuiz()} variant="outline">
                <PlusCircle className="h-4 w-4 mr-2" /> Completar um Quiz
              </Button>
            </div>
          </GameCard>

        </div>
      </div>
    </div>
  );
};

export default Profile;