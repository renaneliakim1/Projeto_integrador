import { GameCard } from "@/components/ui/game-card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Clock, Trophy, Zap, Brain } from "lucide-react";
import { Link } from "react-router-dom";

const GamePreview = () => {
  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Como{" "}
            <span className="bg-gradient-success bg-clip-text text-transparent">
              Funciona
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Uma experiência de aprendizado completa com pontuação, 
            tempo limite e feedback instantâneo!
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center text-center space-y-4 p-6">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
                <Clock className="h-8 w-8 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Tempo Desafiador</h3>
                <p className="text-muted-foreground">
                  Cada pergunta tem um tempo limite que testa sua agilidade mental 
                  e conhecimento instantâneo.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center text-center space-y-4 p-6">
              <div className="w-16 h-16 bg-gradient-success rounded-full flex items-center justify-center flex-shrink-0">
                <Trophy className="h-8 w-8 text-success-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Sistema de Pontuação</h3>
                <p className="text-muted-foreground">
                  Ganhe pontos por respostas corretas e rápidas. Bata seus recordes 
                  e compare com outros jogadores!
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center text-center space-y-4 p-6">
              <div className="w-16 h-16 bg-gradient-warning rounded-full flex items-center justify-center flex-shrink-0">
                <Zap className="h-8 w-8 text-warning-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Feedback Instantâneo</h3>
                <p className="text-muted-foreground">
                  Receba feedback visual e sonoro imediato para cada resposta, 
                  aprendendo com seus erros e acertos.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Card de destaque para o Quiz Rápido */}
        <div className="mt-16 max-w-4xl mx-auto">
          <GameCard className="p-8 bg-gradient-to-br from-primary/5 via-primary/10 to-secondary/5 border-2 border-primary/20">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-shrink-0">
                <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-lg">
                  <Brain className="h-10 w-10 text-white" />
                </div>
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-bold mb-2">
                  Teste Seus Conhecimentos Agora!
                </h3>
                <p className="text-muted-foreground mb-4">
                  100 perguntas rápidas de Matemática, Português, História, Geografia e Ciências. 
                  Sem necessidade de cadastro! Ganhe 10 XP por resposta certa.
                </p>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <span className="px-3 py-1 bg-primary/10 rounded-full text-sm font-medium">
                    ✓ Sem cadastro necessário
                  </span>
                  <span className="px-3 py-1 bg-primary/10 rounded-full text-sm font-medium">
                    ✓ 100 perguntas variadas
                  </span>
                  <span className="px-3 py-1 bg-primary/10 rounded-full text-sm font-medium">
                    ✓ Contador de XP
                  </span>
                </div>
              </div>

              <div className="flex-shrink-0">
                <Link to="/quiz-rapido">
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-lg px-8"
                  >
                    <Zap className="h-5 w-5 mr-2" />
                    Jogar Agora
                  </Button>
                </Link>
              </div>
            </div>
          </GameCard>
        </div>
      </div>
    </section>
  );
};

export default GamePreview;