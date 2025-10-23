import { Button } from "@/components/ui/button";
import { BookOpen, Star, Trophy, User, Flame, Heart } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useGamification } from "@/hooks/useGamification";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from 'react';
import apiClient from "@/api/axios";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const { level, xp, xpForNextLevel, progressPercentage, streak, hearts } = useGamification();
  const [userProfile, setUserProfile] = useState<{ first_name: string; foto: string | null } | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (isAuthenticated) {
        try {
          const response = await apiClient.get('/users/me/');
                    setUserProfile({
                      first_name: response.data.first_name,
                      foto: response.data.profile ? response.data.profile.foto : null
                    });        } catch (error) {
          console.error("Failed to fetch user data for header", error);
        }
      }
    };

    fetchUserData();
  }, [isAuthenticated]);

  const handleLogout = () => {
    navigate('/');
    logout();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link to="/">
              <img src="/logoSkillio2.svg" alt="Skillio" className="h-12 w-18 rounded-md object-cover" />
            </Link>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            {location.pathname !== "/" && <Link to="/" className="text-foreground hover:text-primary transition-colors">Início</Link>}
            {isAuthenticated && location.pathname !== "/dashboard" && <Link to="/dashboard" className="text-foreground hover:text-primary transition-colors">Meu Desempenho</Link>}
            {location.pathname !== "/subjects" && <Link to="/subjects" className="text-foreground hover:text-primary transition-colors">Explorar</Link>}
            {location.pathname !== "/ranking" && <Link to="/ranking" className="text-foreground hover:text-primary transition-colors">Ranking</Link>}
            {location.pathname !== "/about" && <Link to="/about" className="text-foreground hover:text-primary transition-colors">Sobre Nós</Link>}
          </nav>
          <div className="flex items-center space-x-2">
            {isAuthenticated ? (
              <>
                <div className="hidden sm:flex items-center gap-4 mr-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className={`flex items-center gap-1 text-sm font-bold ${hearts > 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
                        <Heart className="w-4 h-4" />
                        <span>{hearts}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent><p>{hearts} vidas restantes</p></TooltipContent>
                  </Tooltip>

                  {streak > 0 && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-1 text-sm font-bold text-orange-500">
                          <Flame className="w-4 h-4" />
                          <span>{streak}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent><p>{streak} dias em sequência!</p></TooltipContent>
                    </Tooltip>
                  )}

                  <div className="flex items-center gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-1 text-sm font-bold text-amber-400">
                          <Star className="w-4 h-4" />
                          <span>{level}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent><p>{xp.toFixed(0)} / {xpForNextLevel} XP</p></TooltipContent>
                    </Tooltip>
                    <div className="w-20"><Progress value={progressPercentage} className="h-2" /></div>
                  </div>
                </div>

                <Link to="/profile">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={userProfile?.foto || undefined} />
                    <AvatarFallback>{userProfile?.first_name ? userProfile.first_name.charAt(0) : 'U'}</AvatarFallback>
                  </Avatar>
                </Link>
                <Button variant="outline" size="sm" className="border-primary/50" onClick={handleLogout}>Sair</Button>
              </>
            ) : (
              <>
                {location.pathname !== '/login' && <Link to="/login"><Button variant="outline" size="sm" className="border-primary/50">Entrar</Button></Link>}
                {location.pathname !== '/register' && <Link to="/register"><Button size="sm" className="bg-gradient-knowledge shadow-glow"><User className="h-4 w-4 mr-1" />Cadastrar</Button></Link>}
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
