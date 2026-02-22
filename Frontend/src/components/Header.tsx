import { Button } from "@/components/ui/button";
import { Star, Flame, Heart, Menu, X } from "@/components/icons";
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
    const [showRegisterOption, setShowRegisterOption] = useState(false);
    // Refetch gamification ao sair de /game ou /quiz
    useEffect(() => {
      // Detecta se saiu de uma tela de quiz
      const isQuizPage = /\/game(\/|$)/.test(location.pathname) || /\/quiz(\/|$)/.test(location.pathname);
      // Sempre que a rota muda, se NÃO está mais em quiz, força refetch
      if (!isQuizPage) {
        refetchGamificationData();
      }
    }, [location.pathname, refetchGamificationData]);
  // ...existing code...

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

  // Lê se o usuário clicou em 'Entrar' anteriormente (persistido em localStorage)
  useEffect(() => {
    try {
      const v = localStorage.getItem('clicked_login');
      setShowRegisterOption(v === '1');
    } catch (e) {
      // ignore
    }
  }, []);

  // Quando o usuário estiver autenticado, limpa o indicador
  useEffect(() => {
    if (isAuthenticated) {
      try {
        localStorage.removeItem('clicked_login');
      } catch (e) {}
      setShowRegisterOption(false);
    }
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

    // Não recarrega vidas se estiver em uma tela de quiz (rota /game ou /quiz)
    const isQuizPage = typeof window !== 'undefined' &&
      (/\/game(\/|$)/.test(window.location.pathname) || /\/quiz(\/|$)/.test(window.location.pathname));
    if (isQuizPage) return;

    const intervalId = window.setInterval(() => {
      refillHearts().catch(err => console.error('Background refill failed', err));
    }, REFILL_MS);

    return () => { if (intervalId) window.clearInterval(intervalId); };
  }, [isAuthenticated, hearts, refillHearts]);

  // Mostrar menu inferior também em certos tablets (ex: 1920x1200 com touch)
  const [showBottomNav, setShowBottomNav] = useState(false);
  const [forceTopNav, setForceTopNav] = useState(false);

  useEffect(() => {
    const detectBottomNav = () => {
      if (typeof window === 'undefined') return;
      const innerW = window.innerWidth;
      const innerH = window.innerHeight;
      const screenW = window.screen?.width ?? 0;
      const screenH = window.screen?.height ?? 0;
      const maxScreen = Math.max(screenW, screenH);
      const minScreen = Math.min(screenW, screenH);
      const isTouch = typeof navigator !== 'undefined' && ((navigator as any).maxTouchPoints && (navigator as any).maxTouchPoints > 0 || 'ontouchstart' in window);
      const dpr = typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1;

      // Calcula resolução física aproximada (CSS pixels * DPR)
      const physMax = Math.round(maxScreen * dpr);
      const physMin = Math.round(minScreen * dpr);

      // Tolerância para cobrir pequenas variações/reporting differences
      const tol = 20;
      const isExact1920x1200Physical = (Math.abs(physMax - 1920) <= tol && Math.abs(physMin - 1200) <= tol);

      // Regras de visibilidade:
      // - <= 768px: mostrar bottom nav (mobile)
      // - 769px..1023px: mostrar APENAS top nav
      // - >= 1024px: comportamento desktop normal; top nav visível (via lg:flex)
      // - Exception: dispositivos táteis com resolução física ~1920x1200 -> forçar top nav

      try {
        // eslint-disable-next-line no-console
        console.log('[Header] detectBottomNav', { innerW, innerH, screenW, screenH, maxScreen, minScreen, dpr, physMax, physMin, isTouch, isExact1920x1200Physical });
      } catch (e) {}

      if (innerW <= 768) {
        setShowBottomNav(true);
        setForceTopNav(false);
        return;
      }

      // 769..1023 -> somente top nav
      if (innerW >= 769 && innerW <= 1023) {
        setShowBottomNav(false);
        setForceTopNav(true);
        return;
      }

      // >=1024
      if (isExact1920x1200Physical && isTouch) {
        setShowBottomNav(false);
        setForceTopNav(true);
        return;
      }

      setShowBottomNav(false);
      setForceTopNav(false);
    };

    detectBottomNav();
    window.addEventListener('resize', detectBottomNav);
    return () => window.removeEventListener('resize', detectBottomNav);
  }, []);

  const handleLogout = () => {
    navigate('/');
    logout();
    setIsMenuOpen(false);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          {/* Logo - À esquerda */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-3">
              <img src="/logoSkillio2.svg" alt="Skillio" className="h-10 w-auto rounded-md object-cover" />
              <span className="font-bold text-lg leading-none hidden sm:inline"></span>
            </Link>
          </div>

          {/* Menu Desktop - Visível apenas em telas grandes. Forçar visibilidade em tablets 1920x1200 */}
          <nav className={`${forceTopNav ? 'flex' : 'hidden lg:flex'} items-center space-x-6`}>
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
                {/* Stats - Visíveis apenas em desktop (ou forçado para tablets 1920x1200) */}
                <div className={`${forceTopNav ? 'flex' : 'hidden lg:flex'} items-center gap-4 mr-2`}>
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
                <Button variant="outline" size="sm" className={`${forceTopNav ? 'inline-flex' : 'hidden lg:inline-flex'} border-primary/50`} onClick={handleLogout}>Sair</Button>

                {/* Mobile sheet removed from top header; moved to bottom navigation */}
              </>
            ) : (
              <>
                {/* Botões de login/cadastro - Visíveis em desktop (ou forçado para tablets 1920x1200) */}
                <div className={`${forceTopNav ? 'flex' : 'hidden lg:flex'} items-center space-x-2`}>
                  {location.pathname !== '/login' && (
                    <Link to="/login">
                      <Button variant="outline" size="sm">
                        Entrar
                      </Button>
                    </Link>
                  )}
                  {location.pathname !== '/register' && <Link to="/register"><Button size="sm" className="bg-secondary hover:bg-secondary/90 text-white shadow-orange-glow">Cadastrar</Button></Link>}
                </div>

                {/* Mobile sheet removed from top header; moved to bottom navigation */}
              </>
            )}
          </div>
        </div>
      </div>
     </header>
      {/* Bottom navigation for small screens (visible below 768px) and detected tablets */}
      <nav className={`fixed bottom-0 left-0 right-0 z-50 bg-card/95 border-t backdrop-blur-sm ${showBottomNav ? '' : 'hidden'}`}>
        <div className="container mx-auto px-2 py-1">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex-1 flex flex-col items-center justify-center py-2 text-[11px] text-foreground hover:text-primary">
              <img src="/home.svg" alt="Início" className="w-6 h-6 mb-0.5" />
              <span className="mt-1">Início</span>
            </Link>

            {isAuthenticated ? (
              <Link to="/dashboard" className="flex-1 flex flex-col items-center justify-center py-2 text-[11px] text-foreground hover:text-primary">
                <img src="/desempenho.svg" alt="Desempenho" className="w-6 h-6 mb-0.5" />
                <span className="mt-1">Desempenho</span>
              </Link>
            ) : (
              <Link to="/ranking" className="flex-1 flex flex-col items-center justify-center py-2 text-[11px] text-foreground hover:text-primary">
                <img src="/ranking.svg" alt="Ranking" className="w-6 h-6 mb-0.5" />
                <span className="mt-1">Ranking</span>
              </Link>
            )}

            {isAuthenticated ? (
              <Link to="/trilha" className="flex-1 flex flex-col items-center justify-center py-2 text-[11px] text-foreground hover:text-primary">
                <img src="/foguet1.svg" alt="Trilha" className="w-6 h-6 mb-0.5" />
                <span className="mt-1">Trilha</span>
              </Link>
            ) : showRegisterOption ? (
              <Link to="/register" onClick={() => { try { localStorage.removeItem('clicked_login'); } catch(e){}; setShowRegisterOption(false); }} className="flex-1 flex flex-col items-center justify-center py-2 text-[11px] text-foreground hover:text-primary">
                <img src="/register.svg" alt="Cadastrar" className="w-6 h-6 mb-0.5" />
                <span className="mt-1">Cadastrar</span>
              </Link>
            ) : (
              <Link to="/login" onClick={() => { try { localStorage.setItem('clicked_login','1'); } catch(e){}; setShowRegisterOption(true); }} className="flex-1 flex flex-col items-center justify-center py-2 text-[11px] text-foreground hover:text-primary">
                <img src="/login.svg" alt="Entrar" className="w-6 h-6 mb-0.5" />
                <span className="mt-1">Entrar</span>
              </Link>
            )}

            <Link to="/subjects" className="flex-1 flex flex-col items-center justify-center py-2 text-[11px] text-foreground hover:text-primary">
              <img src="/explorar.svg" alt="Explorar" className="w-6 h-6 mb-0.5" />
              <span className="mt-1">Explorar</span>
            </Link>

           

            {/* Hamburger menu - opens the sheet (mobile) */}
            <div className="flex-1 flex items-center justify-center">
              <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Abrir menu">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[280px]">
                  <SheetHeader>
                    <SheetTitle>Menu</SheetTitle>
                  </SheetHeader>
                  <nav className="flex flex-col space-y-4 mt-6">
                    {isAuthenticated && (
                      <Link to="/profile" onClick={closeMenu} className="flex items-center gap-3 text-foreground hover:text-primary transition-colors py-2">
                        <Avatar className="w-5 h-5">
                          <AvatarImage src={userProfile?.foto || undefined} className="object-cover" />
                          <AvatarFallback>{userProfile?.first_name ? userProfile.first_name.charAt(0) : 'U'}</AvatarFallback>
                        </Avatar>
                        <span>Perfil</span>
                      </Link>
                    )}
                    {/* Links sempre visíveis no menu hambúrguer */}
                    <Link to="/faq" onClick={closeMenu} className="text-foreground hover:text-primary transition-colors py-2">
                      <div className="flex items-center gap-3">
                        <img src="/faq.svg" alt="FAQ" className="w-4 h-4" />
                        <span>FAQ</span>
                      </div>
                    </Link>
                    <Link to="/planos" onClick={closeMenu} className="text-foreground hover:text-primary transition-colors py-2">
                      <div className="flex items-center gap-3">
                        <img src="/planos.svg" alt="Planos" className="w-4 h-4" />
                        <span>Planos</span>
                      </div>
                    </Link>
                    <Link to="/suporte" onClick={closeMenu} className="text-foreground hover:text-primary transition-colors py-2">
                      <div className="flex items-center gap-3">
                        <img src="/surpote.svg" alt="Suporte" className="w-4 h-4" />
                        <span>Suporte</span>
                      </div>
                    </Link>
                    <Link to="/about" onClick={closeMenu} className="text-foreground hover:text-primary transition-colors py-2">
                      <div className="flex items-center gap-3">
                        <img src="/info.svg" alt="Sobre Nós" className="w-4 h-4" />
                        <span>Sobre Nós</span>
                      </div>
                    </Link>

                    {isAuthenticated && (
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
                    )}

                    <div className="pt-4 border-t">
                      {isAuthenticated ? (
                        <>
                          <Link to="/profile" onClick={closeMenu} className="block mb-2">
                            <Button className="w-full">Perfil</Button>
                          </Link>
                          <Button variant="outline" className="w-full border-primary/50" onClick={handleLogout}>Sair</Button>
                        </>
                      ) : (
                        <>
                          {location.pathname !== '/login' && (
                            <Link to="/login" onClick={closeMenu} className="block mb-2">
                              <Button variant="outline" className="w-full">Entrar</Button>
                            </Link>
                          )}
                          {location.pathname !== '/register' && (
                            <Link to="/register" onClick={closeMenu} className="block">
                              <Button className="w-full bg-secondary hover:bg-secondary/90 text-white">Cadastrar</Button>
                            </Link>
                          )}
                        </>
                      )}
                    </div>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Header;
