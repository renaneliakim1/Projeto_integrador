import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { GameCard } from "@/components/ui/game-card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { subjects } from "@/data/subjects";
import { useAuth } from "@/contexts/AuthContext";

const Subjects = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handlePlayClick = (subjectId: string) => {
    if (isAuthenticated) {
      // Usuário está logado, vai direto para o jogo
      navigate(`/game/${subjectId}`);
    } else {
      // Usuário NÃO está logado, redireciona para login com parâmetro redirect
      navigate(`/login?redirect=/game/${subjectId}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      
      <main className="pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-12">
            <Link to="/">
              <Button variant="ghost" className="mb-6">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao Início
              </Button>
            </Link>
            
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Escolha sua{" "}
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  Aventura
                </span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                Selecione uma disciplina e teste seus conhecimentos com perguntas 
                desafiadoras. Cada matéria oferece uma experiência única de aprendizado!
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {subjects.map((subject) => {
              const Icon = subject.icon;
              return (
                <div
                  key={subject.id}
                  className="group glass rounded-2xl p-7 hover:cursor-pointer border border-border/50 hover:border-primary/50 hover:shadow-glow transition-smooth hover-lift"
                  onClick={() => handlePlayClick(subject.id)}
                >
                  <div className="flex flex-col h-full space-y-5">
                    {/* Icon */}
                    <div className="flex items-center justify-between">
                      <div className="p-4 rounded-xl bg-gradient-primary/10 group-hover:bg-gradient-primary/20 transition-all duration-300 group-hover:scale-105">
                        <Icon className="h-8 w-8 text-primary drop-shadow-lg" />
                      </div>
                     {/*  <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
                        <span>{subject.questions}</span>
                        <span>perguntas</span>
                      </div>  */} {/* removido a quantidade de perguntas */}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 space-y-2">
                      <h3 className="text-2xl font-bold text-foreground group-hover:text-gradient-primary transition-all">
                        {subject.name}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {subject.description}
                      </p>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-border/50">
                      <span className="text-sm font-medium text-muted-foreground">Nível Médio</span>
                      <div className="flex items-center gap-2 text-primary font-semibold text-sm group-hover:gap-3 transition-all">
                        <span>Jogar</span>
                        <Play className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

    </div>
  );
};

export default Subjects;