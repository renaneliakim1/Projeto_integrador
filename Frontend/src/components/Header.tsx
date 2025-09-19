import { Button } from "@/components/ui/button";
import { GameCard } from "@/components/ui/game-card";
import { BookOpen, Trophy, User } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLogged, setIsLogged] = useState(false);

  useEffect(() => {
    // Atualiza login ao montar e sempre que a página for focada ou evento customizado
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
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userEducationalLevel");
    localStorage.removeItem("userPreferredSubject");
    setIsLogged(false);
    // Força atualização imediata do Header
    window.dispatchEvent(new Event("user-auth-changed"));
    navigate("/");
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img
              src="/public/logoSkillio2.svg"
              alt="Skillio"
              className="h-12 w-18 rounded-md object-cover"
            />
            {/* <GameCard variant="game" size="sm" className="p-2">
              <BookOpen className="h-6 w-6" />
            </GameCard> */}
            {/* <div>
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                EdGame
              </h1>
              <p className="text-sm text-muted-foreground">Aprenda jogando!</p>
            </div> */}
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            {location.pathname !== "/" && (
              <Link
                to="/"
                className="text-foreground hover:text-primary transition-colors"
              >
                Início
              </Link>
            )}
            <Link
              to="/subjects"
              className="text-foreground hover:text-primary transition-colors"
            >
              Explorar
            </Link>
            <Link
              to="/ranking"
              className="text-foreground hover:text-primary transition-colors"
            >
              Ranking
            </Link>
            <Link
              to="/about"
              className="text-foreground hover:text-primary transition-colors"
            >
              Sobre Nós
            </Link>
          </nav>
          <div className="flex items-center space-x-2">
            {isLogged ? (
              <>
                <Link to="/profile">
                  <Button variant="ghost" size="icon">
                    <User className="h-4 w-4" />
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-primary/50"
                  onClick={handleLogout}
                >
                  Sair
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-primary/50"
                  >
                    Entrar
                  </Button>
                </Link>
                <Link to="/register">
                  <Button
                    size="sm"
                    className="bg-gradient-knowledge shadow-glow"
                  >
                    <User className="h-4 w-4 mr-1" />
                    Cadastrar
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
