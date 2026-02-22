import { Link, useNavigate } from "react-router-dom";
import { GameCard } from "@/components/ui/game-card";
import { BookOpen, Heart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Footer = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Função para lidar com clique nas disciplinas
  const handleSubjectClick = (e: React.MouseEvent, subjectId: string) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      // Redireciona para login com redirect para a disciplina
      navigate(`/login?redirect=/lesson/${subjectId}`);
    } else {
      // Se logado, vai direto para a aula
      navigate(`/lesson/${subjectId}`);
    }
  };

  return (
    <footer className="hidden md:block bg-card/50 border-t py-12 px-4">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <img
              src="/logoSkillio2.svg"
              alt="Skillio"
              className="h-12 w-18 rounded-md object-cover"
            />
              
            </div>
            <p className="text-muted-foreground mb-4">
              Skillio é uma plataforma de jogos educativos que transforma o aprendizado 
              em uma experiência divertida e eficaz para estudantes de todas as idades.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Explorar</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link 
                  to="#" 
                  onClick={(e) => handleSubjectClick(e, "matematica")}
                  className="hover:text-primary transition-colors"
                >
                  Matemática
                </Link>
              </li>
              <li>
                <Link 
                  to="#" 
                  onClick={(e) => handleSubjectClick(e, "portugues")}
                  className="hover:text-primary transition-colors"
                >
                  Português
                </Link>
              </li>
              <li>
                <Link 
                  to="#" 
                  onClick={(e) => handleSubjectClick(e, "ingles")}
                  className="hover:text-primary transition-colors"
                >
                  Inglês
                </Link>
              </li>
              <li>
                <Link 
                  to="#" 
                  onClick={(e) => handleSubjectClick(e, "espanhol")}
                  className="hover:text-primary transition-colors"
                >
                  Espanhol
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Recursos</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><Link to="/ranking" className="hover:text-primary transition-colors">Ranking</Link></li>
{/*               <li><Link to="/profile" className="hover:text-primary transition-colors">Perfil</Link></li> */}
              <li><Link to="/dashboard" className="hover:text-primary transition-colors">Estatísticas</Link></li>
              <li><Link to="/planos" className="hover:text-primary transition-colors">Planos</Link></li>
              <li className="flex gap-2">
                <Link to="/suporte" className="hover:text-primary transition-colors">Suporte</Link>
              </li>
              <li><Link to="/faq" className="hover:text-primary transition-colors">FAQ</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
          {/* <p className="flex items-center justify-center gap-2">
            Feito com <Heart className="h-4 w-4 text-red-500" /> pela equipe EdGame
          </p> */}
          <p className="text-sm mt-2">
            © 2026 Skillio. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;