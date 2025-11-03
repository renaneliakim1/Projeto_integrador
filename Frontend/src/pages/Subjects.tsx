import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { GameCard } from "@/components/ui/game-card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { subjects } from "@/data/subjects";

const Subjects = () => {
  const navigate = useNavigate();
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
                <GameCard
                  key={subject.id}
                  variant={subject.variant}
                  className="p-6 hover:cursor-pointer group"
                >
                  <div className="text-center space-y-4">
                    <div className="mx-auto w-16 h-16 bg-background/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform backdrop-blur-sm">
                      <Icon className="h-8 w-8" />
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-bold mb-2">{subject.name}</h3>
                      <p className="text-current/80 text-sm mb-4">
                        {subject.description}
                      </p>
                      <div className="flex justify-between items-center text-sm text-current/70 mb-4">
                        <span>{subject.questions} perguntas</span>
                        <span>Nível: Médio</span>
                      </div>
                    </div>

                    <Button
                      variant="secondary"
                      className="w-full bg-background/20 hover:bg-background/30 backdrop-blur-sm"
                      onClick={() => {
                        const userEmail = localStorage.getItem("userEmail");
                        if (userEmail && userEmail !== "null" && userEmail !== "undefined") {
                          navigate(`/game/${subject.id}`);
                        } else {
                          navigate("/login");
                        }
                      }}>
                      Jogar Agora
                    </Button>
                  </div>
                </GameCard>
              );
            })}
          </div>
        </div>
      </main>

    </div>
  );
};

export default Subjects;