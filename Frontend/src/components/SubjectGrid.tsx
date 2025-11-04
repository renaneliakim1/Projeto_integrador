import { GameCard } from "@/components/ui/game-card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { subjects } from "@/data/subjects";

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
              <GameCard
                key={subject.id}
                className="p-6 hover:cursor-pointer group bg-card/50 border-border hover:border-primary/50 hover:shadow-elevated backdrop-blur-sm"
              >
                <div className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform group-hover:bg-primary/20">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold mb-2 text-foreground">{subject.name}</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      {subject.description}
                    </p>
                    <div className="flex justify-between items-center text-sm text-muted-foreground mb-4">
                      <span>{subject.questions} perguntas</span>
                      <span>Nível: Médio</span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/50"
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
                    Jogar Agora
                  </Button>
                </div>
              </GameCard>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default SubjectGrid;