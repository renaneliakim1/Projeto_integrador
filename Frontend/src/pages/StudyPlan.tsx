import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ArrowLeft, RefreshCw, Rocket } from 'lucide-react';
import { useGamification } from '@/hooks/useGamification';
import { trilhaPrincipal } from '@/data/trilhaPrincipal';
import { Separator } from '@/components/ui/separator';
import { BookOpenCheck } from 'lucide-react';
import LoadingAnimation from '@/components/ui/LoadingAnimation';

// Tipos do Plano de Estudo (espelhado de QuizNivelamento.tsx)
type StudyPlanTopic = {
  title: string;
  description: string;
};

type StudyPlanAction = {
  area: string;
  emoji: string;
  topics: StudyPlanTopic[];
};

type StudyPlan = {
  title: string;
  greeting: string;
  analysis: {
    summary: string;
    focusPoints: string[];
    strength: string;
  };
  actionPlan: StudyPlanAction[];
  nextChallenge: {
    title: string;
    suggestion: string;
  };
  motivation: string;
};

// Componente para renderizar o plano de estudo
const StudyPlanDisplay = ({ plan }: { plan: StudyPlan }) => (
  <div className="space-y-6">
    <div className="text-center">
      <h3 className="text-2xl font-bold text-primary">{plan.title}</h3>
      <p className="text-muted-foreground">{plan.greeting}</p>
    </div>

    <Separator />

    <div>
      <h4 className="font-semibold text-xl mb-3">🔍 Raio-X do Conhecimento</h4>
      <p className="text-sm text-muted-foreground mb-4">{plan.analysis.summary}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <Card className="p-4 bg-background/50">
          <p className="font-bold">Pontos de Foco</p>
          <p className="text-muted-foreground">{plan.analysis.focusPoints.join(', ')}</p>
        </Card>
        <Card className="p-4 bg-background/50">
          <p className="font-bold">Ponto Forte</p>
          <p className="text-muted-foreground">{plan.analysis.strength}</p>
        </Card>
      </div>
    </div>

    <div>
      <h4 className="font-semibold text-xl mb-4">🔥 Plano de Ação</h4>
      <div className="space-y-4">
        {plan.actionPlan.map((action, index) => (
          <Card key={index} className="bg-background/50 overflow-hidden">
            <CardHeader className="p-4 bg-muted/50">
              <CardTitle className="flex items-center gap-3 text-lg">
                <span className="text-2xl">{action.emoji}</span> {action.area}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {action.topics.map((topic, i) => (
                <div key={i} className="flex items-start gap-3">
                  <BookOpenCheck className="h-5 w-5 mt-1 text-primary flex-shrink-0" />
                  <div>
                    <p className="font-semibold">{topic.title}</p>
                    <p className="text-sm text-muted-foreground">{topic.description}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>

    <Separator />

    <div className="text-center">
      <h4 className="font-semibold text-lg">{plan.nextChallenge.title}</h4>
      <p className="text-muted-foreground">{plan.nextChallenge.suggestion}</p>
      <p className="font-bold text-primary mt-2">{plan.motivation}</p>
    </div>
  </div>
);

const StudyPlan = () => {
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);
  const [isRefazerAtivo, setIsRefazerAtivo] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const navigate = useNavigate();
  const { level, blocosCompletos } = useGamification();

  useEffect(() => {
    try {
      const savedPlanString = localStorage.getItem('studyPlan');
      if (savedPlanString) {
        const savedPlan = JSON.parse(savedPlanString);
        setStudyPlan(savedPlan);
      }
    } catch (error) {
      console.error("Falha ao carregar o plano de estudo do localStorage:", error);
      setStudyPlan(null); // Garante que o estado é nulo se houver erro
    } finally {
      setCarregando(false);
    }

    const nivelAtualData = trilhaPrincipal.find(n => n.nivel === level);
    if (nivelAtualData) {
      const todosBlocosCompletos = nivelAtualData.blocos.every(bloco => blocosCompletos.includes(bloco.id));
      setIsRefazerAtivo(todosBlocosCompletos);
    } else {
      setIsRefazerAtivo(false);
    }
  }, [level, blocosCompletos]);

  const handleNavigateToQuiz = () => {
    navigate('/quiz-nivelamento');
  };

  if (carregando) {
    return <LoadingAnimation text="Carregando seu plano de estudo..." />;
  }

  return (
    <TooltipProvider>
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Link to="/dashboard">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Dashboard
          </Button>
        </Link>

        <main className="max-w-4xl mx-auto">
          {studyPlan ? (
            // --- Visualização do Plano de Estudo Existente ---
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-3xl font-bold text-center bg-gradient-primary bg-clip-text text-transparent">
                    Meu Plano de Estudo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <StudyPlanDisplay plan={studyPlan} />
                </CardContent>
              </Card>

              <div className="text-center mt-8">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="inline-block">
                      <Button 
                        size="lg" 
                        onClick={handleNavigateToQuiz} 
                        disabled={!isRefazerAtivo}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refazer Nivelamento
                      </Button>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isRefazerAtivo ? (
                      <p>Parabéns! Você completou o nível e pode refazer o nivelamento.</p>
                    ) : (
                      <p>Complete todos os blocos do seu nível atual para refazer o nivelamento.</p>
                    )}
                  </TooltipContent>
                </Tooltip>
              </div>
            </>
          ) : (
            // --- Card para Fazer o Quiz de Nivelamento ---
            <Card className="text-center p-8 sm:p-12 shadow-lg">
              <CardHeader>
                <Rocket className="mx-auto h-16 w-16 text-primary mb-4" />
                <CardTitle className="text-3xl font-bold">
                  Comece sua Jornada de Conhecimento!
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-lg mb-8">
                  Faça nosso quiz de nivelamento rápido para criar um plano de estudo personalizado, focado exatamente no que você precisa para evoluir.
                </p>
                <Button size="lg" className="bg-gradient-growth" onClick={handleNavigateToQuiz}>
                  Fazer Quiz de Nivelamento
                </Button>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </TooltipProvider>
  );
};

export default StudyPlan;