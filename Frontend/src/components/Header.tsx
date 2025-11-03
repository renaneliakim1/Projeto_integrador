import { Button } from "@/components/ui/button";
import { BookOpen, Star, Trophy, User, Flame, Heart, Menu, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useGamification } from "@/hooks/useGamification";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from 'react';
import apiClient from "@/api/axios";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const { level, xp, xpForNextLevel, progressPercentage, streak, hearts, nextRefillInSeconds, refillHearts, refetchGamificationData } = useGamification();
  const [countdown, setCountdown] = useState<number | null>(null);
  const [userProfile, setUserProfile] = useState<{ first_name: string; foto: string | null } | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  // Escuta eventos de atualização de dados de gamificação
  useEffect(() => {
    const handleDataUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      const detail = customEvent.detail;
      if (detail && (detail.type === 'hearts' || detail.type === 'gamification')) {
        // Força atualização dos dados quando vidas ou gamificação mudarem
        refetchGamificationData();
      }
    };

    window.addEventListener('app:data:updated', handleDataUpdate);
    return () => {
      window.removeEventListener('app:data:updated', handleDataUpdate);
    };
  }, [refetchGamificationData]);

  // Atualiza countdown local a partir de nextRefillInSeconds
  useEffect(() => {
    let interval: number | undefined;
    if (nextRefillInSeconds && hearts <= 0) {
      setCountdown(nextRefillInSeconds);
      interval = window.setInterval(() => {
        setCountdown(prev => {
          if (prev === null) return null;
          if (prev <= 1) {
            // tempo zerou — tenta recarregar
            refillHearts();
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setCountdown(null);
    }
    return () => { if (interval) window.clearInterval(interval); };
  }, [nextRefillInSeconds, hearts, refillHearts]);

  const handleLogout = () => {
    navigate('/');
    logout();
    setIsMenuOpen(false);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Menu Hambúrguer - Mobile */}
          <div className="lg:hidden">
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px]">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col space-y-4 mt-6">
                  {location.pathname !== "/" && (
                    <Link to="/" onClick={closeMenu} className="text-foreground hover:text-primary transition-colors py-2">
                      Início
                    </Link>
                  )}
                  {isAuthenticated && location.pathname !== "/dashboard" && (
                    <Link to="/dashboard" onClick={closeMenu} className="text-foreground hover:text-primary transition-colors py-2">
                      Meu Desempenho
                    </Link>
                  )}
                  {location.pathname !== "/subjects" && (
                    <Link to="/subjects" onClick={closeMenu} className="text-foreground hover:text-primary transition-colors py-2">
                      Explorar
                    </Link>
                  )}
                  {location.pathname !== "/ranking" && (
                    <Link to="/ranking" onClick={closeMenu} className="text-foreground hover:text-primary transition-colors py-2">
                      Ranking
                    </Link>
                  )}
                  {location.pathname !== "/about" && (
                    <Link to="/about" onClick={closeMenu} className="text-foreground hover:text-primary transition-colors py-2">
                      Sobre Nós
                    </Link>
                  )}
                  
                  {/* Estatísticas Mobile */}
                  {isAuthenticated && (
                    <div className="pt-4 border-t space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Vidas</span>
                        <div className={`flex items-center gap-2 text-sm font-bold ${hearts > 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
                          <Heart className="w-4 h-4" />
                          <span>{hearts}</span>
                        </div>
                      </div>
                      
                      {streak > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Sequência</span>
                          <div className="flex items-center gap-2 text-sm font-bold text-orange-500">
                            <Flame className="w-4 h-4" />
                            <span>{streak} dias</span>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Nível</span>
                        <div className="flex items-center gap-2 text-sm font-bold text-amber-400">
                          <Star className="w-4 h-4" />
                          <span>{level}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>XP</span>
                          <span>{xp.toFixed(0)} / {xpForNextLevel}</span>
                        </div>
                        <Progress value={progressPercentage} className="h-2" />
                      </div>
                    </div>
                  )}
                  
                  {/* Botões de autenticação mobile */}
                  {!isAuthenticated && (
                    <div className="pt-4 border-t space-y-2">
                      {location.pathname !== '/login' && (
                        <Link to="/login" onClick={closeMenu} className="block">
                          <Button variant="outline" className="w-full">Entrar</Button>
                        </Link>
                      )}
                      {location.pathname !== '/register' && (
                        <Link to="/register" onClick={closeMenu} className="block">
                          <Button className="w-full bg-gradient-knowledge">
                            <User className="h-4 w-4 mr-2" />
                            Cadastrar
                          </Button>
                        </Link>
                      )}
                    </div>
                  )}
                  
                  {/* Botão Sair - Mobile */}
                  {isAuthenticated && (
                    <div className="pt-4 border-t">
                      <Button 
                        variant="outline" 
                        className="w-full border-primary/50" 
                        onClick={handleLogout}
                      >
                        Sair
                      </Button>
                    </div>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>

          {/* Logo - Centralizado em mobile, à esquerda em desktop */}
          <div className="flex items-center space-x-3 lg:flex-none absolute left-1/2 transform -translate-x-1/2 lg:static lg:transform-none">
            <Link to="/">
              <img src="/logoSkillio2.svg" alt="Skillio" className="h-12 w-18 rounded-md object-cover" />
            </Link>
          </div>

          {/* Menu Desktop - Visível apenas em telas grandes */}
          <nav className="hidden lg:flex items-center space-x-6">
            {location.pathname !== "/" && <Link to="/" className="text-foreground hover:text-primary transition-colors">Início</Link>}
            {isAuthenticated && location.pathname !== "/dashboard" && <Link to="/dashboard" className="text-foreground hover:text-primary transition-colors">Meu Desempenho</Link>}
            {location.pathname !== "/subjects" && <Link to="/subjects" className="text-foreground hover:text-primary transition-colors">Explorar</Link>}
            {location.pathname !== "/ranking" && <Link to="/ranking" className="text-foreground hover:text-primary transition-colors">Ranking</Link>}
            {location.pathname !== "/about" && <Link to="/about" className="text-foreground hover:text-primary transition-colors">Sobre Nós</Link>}
          </nav>
          
          {/* Área direita - Stats e Perfil */}
          <div className="flex items-center space-x-2">
            {isAuthenticated ? (
              <>
                {/* Stats - Visíveis apenas em desktop */}
                <div className="hidden lg:flex items-center gap-4 mr-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className={`flex items-center gap-2 text-sm font-bold ${hearts > 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
                        <Heart className="w-4 h-4" />
                        <span>{hearts}</span>
                        {hearts <= 0 && countdown !== null && (
                          <button onClick={() => refillHearts()} className="text-xs text-muted-foreground underline">
                            {Math.floor(countdown / 60).toString().padStart(2, '0')}:{(countdown % 60).toString().padStart(2, '0')}
                          </button>
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div>
                        <p>{hearts} vidas restantes</p>
                        {hearts <= 0 && countdown !== null && <p>Próxima vida em {Math.floor(countdown / 60)}m {countdown % 60}s</p>}
                        {hearts <= 0 && countdown === null && <p>Verificando recarga...</p>}
                      </div>
                    </TooltipContent>
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

                {/* Avatar e botão Sair - Visíveis em todas as telas */}
                <Link to="/profile">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={userProfile?.foto || undefined} />
                    <AvatarFallback>{userProfile?.first_name ? userProfile.first_name.charAt(0) : 'U'}</AvatarFallback>
                  </Avatar>
                </Link>
                <Button variant="outline" size="sm" className="border-primary/50 hidden lg:inline-flex" onClick={handleLogout}>Sair</Button>
              </>
            ) : (
              <>
                {/* Botões de login/cadastro - Desktop apenas */}
                <div className="hidden lg:flex items-center space-x-2">
                  {location.pathname !== '/login' && <Link to="/login"><Button variant="outline" size="sm" className="border-primary/50">Entrar</Button></Link>}
                  {location.pathname !== '/register' && <Link to="/register"><Button size="sm" className="bg-gradient-knowledge shadow-glow"><User className="h-4 w-4 mr-1" />Cadastrar</Button></Link>}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
