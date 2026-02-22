import { GameCard } from "@/components/ui/game-card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Clock, Trophy, Zap, Brain, ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";

const GamePreview = () => {
  const carouselRef = useRef<HTMLDivElement | null>(null);

  // Carousel state similar to About.tsx
  const [cardsToShow, setCardsToShow] = useState<number>(1);
  const [slide, setSlide] = useState<number>(0);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      setCardsToShow(w >= 768 ? 3 : 1);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    setSlide(0);
  }, [cardsToShow]);

  const maxSlide = Math.max(0, 3 - cardsToShow);

  const prevSlide = () => setSlide((s) => (s <= 0 ? maxSlide : s - 1));
  const nextSlide = () => setSlide((s) => (s >= maxSlide ? 0 : s + 1));

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Como{" "}
            <span className="bg-gradient-wisdom bg-clip-text text-transparent">
              Funciona
            </span>
          </h2>
          <p className="text-xl text-muted-foreground break-words md:break-normal max-w-2xl mx-auto">
            Uma experiência de aprendizado completa com pontuação, 
            tempo limite e feedback instantâneo!
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Carousel for small screens, grid for md+ */}
          <div className="relative">
            <div ref={carouselRef} className="overflow-hidden md:overflow-visible">
              <div
                className="flex md:grid md:grid-cols-3 gap-6 md:gap-6 space-x-4 md:space-x-0 px-4"
                style={cardsToShow === 1 ? { transform: `translateX(-${slide * 100}%)`, transition: 'transform 500ms ease-out' } : undefined}
              >
              <div className="w-full flex-shrink-0 md:flex-shrink  md:min-w-0">
                <div className="flex flex-col items-center text-center space-y-4 p-6">
                  <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Tempo Desafiador</h3>
                    <p className="text-muted-foreground break-words md:break-normal text-sm text-center">Cada pergunta tem um tempo limite que testa sua agilidade mental e conhecimento instantâneo.</p>
                  </div>
                </div>
              </div>

              <div className="w-full flex-shrink-0 md:flex-shrink md:min-w-0">
                <div className="flex flex-col items-center text-center space-y-4 p-6">
                  <div className="w-16 h-16 bg-gradient-wisdom rounded-full flex items-center justify-center flex-shrink-0">
                    <Trophy className="h-8 w-8 text-secondary-foreground" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Sistema de Pontuação</h3>
                    <p className="text-muted-foreground break-words md:break-normal text-sm text-center">Ganhe pontos por respostas corretas e rápidas. Bata seus recordes e compare com outros jogadores!</p>
                  </div>
                </div>
              </div>

              <div className="w-full flex-shrink-0 md:flex-shrink md:min-w-0">
                <div className="flex flex-col items-center text-center space-y-4 p-6">
                  <div className="w-16 h-16 bg-gradient-warning rounded-full flex items-center justify-center flex-shrink-0">
                    <Zap className="h-8 w-8 text-warning-foreground" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Feedback Instantâneo</h3>
                    <p className="text-muted-foreground break-words md:break-normal text-sm text-center">Receba feedback visual e sonoro imediato para cada resposta, aprendendo com seus erros e acertos.</p>
                  </div>
                </div>
              </div>
              </div>
            </div>

            {/* Arrows - visible only on small screens (use slide state) */}
            {maxSlide > 0 && (
              <>
                <button aria-label="Anterior" onClick={prevSlide} className="md:hidden absolute left-2 top-1/2 -translate-y-1/2 bg-card/80 text-foreground p-2 rounded-full shadow-lg">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button aria-label="Próximo" onClick={nextSlide} className="md:hidden absolute right-2 top-1/2 -translate-y-1/2 bg-card/80 text-foreground p-2 rounded-full shadow-lg">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Mobile indicators */}
            {maxSlide > 0 && (
              <div className="flex md:hidden justify-center gap-2 mt-4 absolute left-0 right-0 bottom-0 pb-4">
                {Array.from({ length: maxSlide + 1 }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setSlide(i)}
                    className={`h-2 rounded-full transition-all ${slide === i ? 'w-8 bg-primary' : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'}`}
                    aria-label={`Ir para slide ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Card de destaque para o Quiz Rápido */}
        <div className="mt-16 max-w-4xl mx-auto">
          <GameCard className="p-8 bg-gradient-to-br from-primary/10 via-secondary/10 to-primary/5 border-2 border-primary/20 hover:border-secondary/30 transition-all">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-shrink-0">
                <div className="w-20 h-20 bg-gradient-wisdom rounded-full flex items-center justify-center shadow-lg shadow-orange-glow/40">
                  <Brain className="h-10 w-10 text-white" />
                </div>
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-bold mb-2">
                  Teste Seus Conhecimentos Agora!
                </h3>
                <p className="text-muted-foreground break-words md:break-normal mb-4">
                  100 perguntas rápidas de Matemática, Português, História, Geografia e Ciências. 
                  Sem necessidade de cadastro! 
                </p>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <span className="px-3 py-1 bg-primary/10 rounded-full text-sm font-medium">
                    ✓ Sem cadastro necessário
                  </span>
                  <span className="px-3 py-1 bg-primary/10 rounded-full text-sm font-medium">
                    ✓ 100 perguntas variadas
                  </span>
                  <span className="px-3 py-1 bg-primary/10 rounded-full text-sm font-medium">
                    ✓ Perguntas Aleatórias a cada jogo
                  </span>
                </div>
              </div>

              <div className="flex-shrink-0">
                <Link to="/quiz-rapido">
                  <Button 
                    size="lg" 
                    variant="energy"
                    className="text-lg px-8"
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