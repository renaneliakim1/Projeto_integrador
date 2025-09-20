import { Button } from "@/components/ui/button";
import { GameCard } from "@/components/ui/game-card";
import { BookOpen, Star, Trophy, User, Flame } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useGamification } from "@/hooks/useGamification";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLogged, setIsLogged] = useState(false);
  const { level, xp, xpForNextLevel, progressPercentage, streak } = useGamification();

  useEffect(() => {
    const updateLogin = () => setIsLogged(!!localStorage.getItem("userEmail"));
    updateLogin();
    window.addEventListener("storage", updateLogin);
    window.addEventListener("focus", updateLogin);
    window.addEventListener("user-auth-changed", updateLogin);
    return () => {
      window.removeEventListener("storage", updateLogin);
      window.removeEventListener("focus", updateLogin);
      window.removeEventListener("user-auth-changed", updateLogin);
    };
  }, []);

  function handleLogout() {
    localStorage.clear();
    setIsLogged(false);
    window.dispatchEvent(new Event("user-auth-changed"));
    navigate("/");
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src="/public/logoSkillio2.svg" alt="Skillio" className="h-12 w-18 rounded-md object-cover" />
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            {location.pathname !== "/" && <Link to="/" className="text-foreground hover:text-primary transition-colors">Início</Link>}
            {isLogged && location.pathname !== "/dashboard" && <Link to="/dashboard" className="text-foreground hover:text-primary transition-colors">Meu Desempenho</Link>}
            <Link to="/subjects" className="text-foreground hover:text-primary transition-colors">Explorar</Link>
            <Link to="/ranking" className="text-foreground hover:text-primary transition-colors">Ranking</Link>
            <Link to="/about" className="text-foreground hover:text-primary transition-colors">Sobre Nós</Link>
          </nav>
          <div className="flex items-center space-x-2">
            {isLogged ? (
              <>
                <div className="hidden sm:flex items-center gap-4 mr-2">
                  {/* Streak */}
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
                  {/* Level & XP */}
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

                <Link to="/profile"><Button variant="ghost" size="icon"><User className="h-4 w-4" /></Button></Link>
                <Button variant="outline" size="sm" className="border-primary/50" onClick={handleLogout}>Sair</Button>
              </>
            ) : (
              <>
                <Link to="/login"><Button variant="outline" size="sm" className="border-primary/50">Entrar</Button></Link>
                <Link to="/register"><Button size="sm" className="bg-gradient-knowledge shadow-glow"><User className="h-4 w-4 mr-1" />Cadastrar</Button></Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
