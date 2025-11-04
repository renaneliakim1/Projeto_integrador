import { GameCard } from "@/components/ui/game-card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { subjects } from "@/data/subjects";
import { Play } from "lucide-react";

const SubjectGrid = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 px-4 bg-muted/30">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Escolha sua{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Disciplina
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore diferentes áreas do conhecimento e teste seus conhecimentos 
            com perguntas desafiadoras e divertidas!
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {subjects.map((subject) => {
            const Icon = subject.icon;
            return (
              <div
                key={subject.id}
                className="group glass rounded-2xl p-7 hover:cursor-pointer border border-border/50 hover:border-primary/50 hover:shadow-glow transition-smooth hover-lift"
                onClick={() => {
                  const userEmail = localStorage.getItem("userEmail");
                  console.log("User email from localStorage in SubjectGrid:", userEmail);
                  if (userEmail) {
                    navigate(`/game/${subject.id}`);
                  } else {
                    navigate("/login");
                  }
                }}
              >
                <div className="flex flex-col h-full space-y-5">
                  {/* Icon */}
                  <div className="flex items-center justify-between">
                    <div className="p-4 rounded-xl bg-gradient-primary/10 group-hover:bg-gradient-primary/20 transition-all duration-300 group-hover:scale-105">
                      <Icon className="h-8 w-8 text-primary drop-shadow-lg" />
                    </div>
                    <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
                      <span>{subject.questions}</span>
                      <span>perguntas</span>
                    </div>
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
    </section>
  );
};

export default SubjectGrid;