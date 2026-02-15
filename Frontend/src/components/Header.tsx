import { Button } from "@/components/ui/button";
import { BookOpen, Star, Trophy, User, Flame, Heart, Menu, X, UserCircle } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const { level, xp, xpForNextLevel, progressPercentage, streak, hearts, nextRefillInSeconds, refillHearts, refetchGamificationData, isLoading } = useGamification();
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
      if (detail && detail.type === 'hearts' && typeof detail.hearts === 'number') {
        // Atualização otimizada: não faz refetch, apenas usa o valor do evento
        console.log('🔔 Header: Vidas atualizadas via evento:', detail.hearts);
      }
      if (detail && detail.type === 'gamification') {
        // Apenas para mudanças gerais de gamificação fazemos refetch
        refetchGamificationData();
      }
    };

    window.addEventListener('app:data:updated', handleDataUpdate);
    return () => {
      window.removeEventListener('app:data:updated', handleDataUpdate);
    };
  }, [refetchGamificationData]);

  // Cronômetro local de recarga: quando vidas === 0 mostramos cronômetro de 15s
  // Cronômetro local de recarga: quando vidas === 0 mostramos cronômetro de 15s
  // Decrementa até 0; quando chega a 0, aguardamos a resposta de `refillHearts()`
  // e ajustamos o contador conforme `hearts` ou `next_in_seconds` retornados.
  useEffect(() => {
    const REFILL_SECONDS = 15;
    let interval: number | undefined;

    if (isAuthenticated && hearts === 0) {
      setCountdown(REFILL_SECONDS);
      interval = window.setInterval(() => {
        setCountdown(prev => {
          if (prev === null) return null;
          // decrementa até 0 (mantém 0 como sinal)
          return Math.max(0, prev - 1);
        });
      }, 1000);
    } else {
      setCountdown(null);
    }

    return () => { if (interval) window.clearInterval(interval); };
  }, [isAuthenticated, hearts]);

  // Quando countdown atingir exatamente 0, tenta refill e ajusta comportamento conforme resposta
  useEffect(() => {
    if (countdown !== 0) return;

    let mounted = true;

    (async () => {
      try {
        const resp = await refillHearts();
        if (!mounted) return;

        // Se o servidor já devolver hearts > 0, escondemos o cronômetro
        if (resp && typeof resp.hearts === 'number') {
          // Se atingiu o máximo, encerra ciclo e atualiza UI
          if (resp.hearts >= 5) {
            setCountdown(null);
            refetchGamificationData();
            return;
          }
          // Ainda não atingiu o máximo: agendamos próximo intervalo.
          const REFILL_SECONDS = 15;
          setCountdown(typeof resp.next_in_seconds === 'number' ? resp.next_in_seconds : REFILL_SECONDS);
          return;
        }

        // Se o servidor indicar próximo tempo (em segundos), use-o
        if (resp && typeof resp.next_in_seconds === 'number') {
          setCountdown(resp.next_in_seconds);
          return;
        }

        // Caso o refill não tenha liberado vida e não retornou next_in_seconds,
        // usa o padrão local de 15s antes de tentar novamente
        setCountdown(15);
      } catch (err) {
        console.error('Erro ao tentar recarregar vidas:', err);
        setCountdown(null);
      }
    })();

    return () => { mounted = false; };
  }, [countdown, refillHearts, refetchGamificationData]);

  // Background refill loop: enquanto hearts < 5, tenta recarregar a cada 15 segundos
  useEffect(() => {
    const REFILL_MS = 15 * 1000;
    if (!isAuthenticated || hearts >= 5) return;

    let intervalId: number | undefined;
    intervalId = window.setInterval(() => {
      // chamada periódica ao endpoint de refill; o servidor é a fonte da verdade
      refillHearts().catch(err => console.error('Background refill failed', err));
    }, REFILL_MS);

    return () => { if (intervalId) window.clearInterval(intervalId); };
  }, [isAuthenticated, hearts, refillHearts]);

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
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          {/* Logo - À esquerda */}
          <div className="flex items-center space-x-3">
            <Link to="/">
              <img src="/logoSkillio2.svg" alt="Skillio" className="h-10 w-22 rounded-md object-cover" />
            </Link>
          </div>

          {/* Menu Desktop - Visível apenas em telas grandes */}
          <nav className="hidden lg:flex items-center space-x-6">
            {location.pathname !== "/" && <Link to="/" className="text-foreground hover:text-primary transition-colors">Início</Link>}
            {isAuthenticated && location.pathname !== "/dashboard" && <Link to="/dashboard" className="text-foreground hover:text-primary transition-colors">Meu Desempenho</Link>}
            {location.pathname !== "/subjects" && <Link to="/subjects" className="text-foreground hover:text-primary transition-colors">Explorar</Link>}
            {location.pathname !== "/ranking" && <Link to="/ranking" className="text-foreground hover:text-primary transition-colors">Ranking</Link>}
            {location.pathname !== "/faq" && <Link to="/faq" className="text-foreground hover:text-primary transition-colors">FAQ</Link>}
            {location.pathname !== "/about" && <Link to="/about" className="text-foreground hover:text-primary transition-colors">Sobre Nós</Link>}
          </nav>
          
          {/* Área direita - Stats, Perfil e Menu Hambúrguer */}
          <div className="flex items-center space-x-2">
            {isAuthenticated ? (
              <>
                {/* Stats - Visíveis apenas em desktop */}
                <div className="hidden lg:flex items-center gap-4 mr-2">
                  {isLoading ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse">
                      <div className="h-4 w-16 bg-muted rounded" />
                    </div>
                  ) : (
                    <>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="px-2 py-0.5 rounded-md backdrop-blur-none bg-card/80">
                            <div className={`flex items-center gap-2 text-sm font-bold ${hearts > 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
                              <Heart className="w-4 h-4" />
                              <span>{hearts}</span>
                              {hearts === 0 && countdown !== null && (
                                <button onClick={() => refillHearts()} className="text-xs text-muted-foreground underline">
                                  {Math.floor(countdown / 60).toString().padStart(2, '0')}:{(countdown % 60).toString().padStart(2, '0')}
                                </button>
                              )}
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div>
                            <p>{hearts} vidas restantes</p>
                            {hearts === 0 && countdown !== null && <p>Próxima vida em {Math.floor(countdown / 60)}m {countdown % 60}s</p>}
                            {hearts === 0 && countdown === null && <p>Verificando recarga...</p>}
                          </div>
                        </TooltipContent>
                      </Tooltip>

                      {streak > 0 && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-1 text-sm font-bold text-secondary">
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
                            <div className="px-2 py-0.5 rounded-md backdrop-blur-none bg-card/80">
                              <div className="flex items-center gap-1 text-sm font-bold text-amber-400">
                                <Star className="w-4 h-4" />
                                <span>{level}</span>
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent><p>{xp.toFixed(0)} / {xpForNextLevel} XP</p></TooltipContent>
                        </Tooltip>
                        <div className="w-20"><Progress value={progressPercentage} className="h-2" /></div>
                      </div>
                    </>
                  )}
                </div>

                {/* Avatar - Visível em todas as telas */}
                <Link to="/profile">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={userProfile?.foto || undefined} className="object-cover" />
                    <AvatarFallback>{userProfile?.first_name ? userProfile.first_name.charAt(0) : 'U'}</AvatarFallback>
                  </Avatar>
                </Link>

                {/* Botão Sair Desktop */}
                <Button variant="outline" size="sm" className="border-primary/50 hidden lg:inline-flex" onClick={handleLogout}>Sair</Button>

                {/* Menu Hambúrguer Mobile - Autenticado */}
                <div className="lg:hidden">
                  <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Menu className="h-6 w-6" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-[280px]">
                      <SheetHeader>
                        <SheetTitle>Menu</SheetTitle>
                      </SheetHeader>
                      <nav className="flex flex-col space-y-4 mt-6">
                        {location.pathname !== "/" && (
                          <Link to="/" onClick={closeMenu} className="text-foreground hover:text-primary transition-colors py-2">
                            Início
                          </Link>
                        )}
                        {location.pathname !== "/dashboard" && (
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
                        {location.pathname !== "/faq" && (
                          <Link to="/faq" onClick={closeMenu} className="text-foreground hover:text-primary transition-colors py-2">
                            FAQ
                          </Link>
                        )}
                        {location.pathname !== "/about" && (
                          <Link to="/about" onClick={closeMenu} className="text-foreground hover:text-primary transition-colors py-2">
                            Sobre Nós
                          </Link>
                        )}
                        
                        {/* Estatísticas Mobile */}
                        <div className="pt-4 border-t space-y-3">
                          {isLoading ? (
                            <div className="space-y-3 animate-pulse">
                              <div className="h-4 bg-muted rounded w-full" />
                              <div className="h-4 bg-muted rounded w-3/4" />
                              <div className="h-4 bg-muted rounded w-full" />
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Vidas</span>
                                <div className="px-2 py-0.5 rounded-md backdrop-blur-none bg-card/80">
                                  <div className={`flex items-center gap-2 text-sm font-bold ${hearts > 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
                                    <Heart className="w-4 h-4" />
                                    <span>{hearts}</span>
                                  </div>
                                </div>
                              </div>
                              
                              {streak > 0 && (
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-muted-foreground">Sequência</span>
                                  <div className="flex items-center gap-2 text-sm font-bold text-secondary">
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
                            </>
                          )}
                        </div>
                        
                        {/* Botão Sair - Mobile */}
                        <div className="pt-4 border-t">
                          <Button 
                            variant="outline" 
                            className="w-full border-primary/50" 
                            onClick={handleLogout}
                          >
                            Sair
                          </Button>
                        </div>
                      </nav>
                    </SheetContent>
                  </Sheet>
                </div>
              </>
            ) : (
              <>
                {/* Botões de login/cadastro - Visíveis em desktop */}
                <div className="hidden lg:flex items-center space-x-2">
                  {location.pathname !== '/login' && <Link to="/login"><Button variant="outline" size="sm">Entrar</Button></Link>}
                  {location.pathname !== '/register' && <Link to="/register"><Button size="sm" className="bg-secondary hover:bg-secondary/90 text-white shadow-orange-glow"><User className="h-4 w-4 mr-1" />Cadastrar</Button></Link>}
                </div>

                {/* Menu Hambúrguer Mobile - Não Autenticado */}
                <div className="lg:hidden">
                  <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Menu className="h-6 w-6" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-[280px]">
                      <SheetHeader>
                        <SheetTitle>Menu</SheetTitle>
                      </SheetHeader>
                      <nav className="flex flex-col space-y-4 mt-6">
                        {location.pathname !== "/" && (
                          <Link to="/" onClick={closeMenu} className="text-foreground hover:text-primary transition-colors py-2">
                            Início
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
                        {location.pathname !== "/faq" && (
                          <Link to="/faq" onClick={closeMenu} className="text-foreground hover:text-primary transition-colors py-2">
                            FAQ
                          </Link>
                        )}
                        {location.pathname !== "/about" && (
                          <Link to="/about" onClick={closeMenu} className="text-foreground hover:text-primary transition-colors py-2">
                            Sobre Nós
                          </Link>
                        )}
                        
                        {/* Botões de autenticação no menu mobile */}
                        <div className="pt-4 border-t space-y-2">
                          {location.pathname !== '/login' && (
                            <Link to="/login" onClick={closeMenu} className="block">
                              <Button variant="outline" className="w-full">Entrar</Button>
                            </Link>
                          )}
                          {location.pathname !== '/register' && (
                            <Link to="/register" onClick={closeMenu} className="block">
                              <Button className="w-full bg-secondary hover:bg-secondary/90 text-white">
                                <User className="h-4 w-4 mr-2" />
                                Cadastrar
                              </Button>
                            </Link>
                          )}
                        </div>
                      </nav>
                    </SheetContent>
                  </Sheet>
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
