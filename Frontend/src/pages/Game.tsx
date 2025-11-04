import { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GameCard } from "@/components/ui/game-card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, Trophy, X, RotateCcw, CheckCircle, HeartCrack, SkipForward } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useGenerativeAI } from "@/hooks/useGenerativeAI";
import { trilhaPrincipal } from "@/data/trilhaPrincipal";
import { subjects } from "@/data/subjects"; // Import subjects
import { useGamification } from "@/hooks/useGamification";
import { usePerformance } from "@/hooks/usePerformance";
import { useTimeTracker } from "@/hooks/useTimeTracker";
import { useAuth } from "@/contexts/AuthContext";

interface Question {
  id: number;
  question: string;
  options: string[];
  correct: number;
  difficulty: string;
}

const Game = () => {
  const { blocoId } = useParams<{ blocoId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const { addXp, completeBlock, isBlockCompleted, loseHeart, hearts, resetHearts, userFocus } = useGamification();
  const { updatePerformance } = usePerformance();
  useTimeTracker(); // Inicia o rastreamento de tempo nesta página

  // Verificação de autenticação - redireciona para login se não estiver autenticado
  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: "Login necessário",
        description: "Você precisa estar logado para jogar.",
        variant: "destructive",
      });
      navigate(`/login?redirect=${location.pathname}`);
    }
  }, [isAuthenticated, navigate, location.pathname, toast]);

  const trilhaBloco = trilhaPrincipal.flatMap(n => n.blocos).find(b => b.id === blocoId);
  const subjectInfo = subjects.find(s => s.id === blocoId);

  let title: string | undefined;
  let nivel: number | null = null;
  let subject: string;
  let isTrailGame = false;

  if (trilhaBloco) { // It's a trail game
    isTrailGame = true;
    title = trilhaBloco.titulo;
    const nivelInfo = trilhaPrincipal.find(n => n.blocos.some(b => b.id === blocoId));
    nivel = nivelInfo ? nivelInfo.nivel : 1; // Default to 1 if not found
  // Se o bloco for do tipo foco use o foco do usuário quando disponível,
  // caso contrário use 'Conhecimentos Gerais' como fallback para garantir
  // que `useGenerativeAI` sempre receba um subject válido.
  subject = trilhaBloco.tipo === 'foco' ? (userFocus || 'Conhecimentos Gerais') : 'Conhecimentos Gerais';
  } else if (subjectInfo) { // It's a subject game
    title = subjectInfo.name;
    nivel = 1; // Default level for subject games
    subject = subjectInfo.name;
  } else {
    title = undefined;
    subject = 'Conhecimentos Gerais';
  }

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [pendingScore, setPendingScore] = useState(0);
  const [pendingXp, setPendingXp] = useState(0);
  const [sessionAnswers, setSessionAnswers] = useState({ correct: 0, incorrect: 0 });

  const educationalLevel = localStorage.getItem('userEducationalLevel') || 'medio';

  const { generatedQuestions, loading, error, refetch } = useGenerativeAI(
    subject,
    educationalLevel,
    nivel || 1
  );

  const questions: Question[] = generatedQuestions;

  useEffect(() => {
    // Impede o início do jogo se o usuário não tiver vidas e o bloco não estiver completo
    if (isTrailGame && hearts <= 0 && blocoId && !isBlockCompleted(blocoId)) {
        toast({ title: "Sem vidas!", description: "Você precisa de vidas para começar um novo bloco.", variant: "destructive" });
        navigate('/trilha');
    }
  }, [isTrailGame, hearts, blocoId, isBlockCompleted, navigate, toast]);

  const handleAnswer = useCallback(async (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    setShowResult(true);
    
    const isCorrect = answerIndex === questions[currentQuestion]?.correct;
  if (isCorrect) {
    setSessionAnswers(prev => ({ ...prev, correct: prev.correct + 1 }));
    // Sempre contabiliza pontos de score imediatamente ao acertar.
    // Em jogos de trilha, adiamos a atribuição de XP ao backend até a finalização do bloco
    // (o usuário precisa completar as 15 perguntas do nível para receber o XP do bloco).
    setScore(prevScore => prevScore + 10);
    if (isTrailGame) {
      setPendingScore(prev => prev + 10);
      setPendingXp(prev => prev + 10);  // 10 XP por pergunta certa
      toast({ title: "Correto! 🎉" });
    } else {
      // Para quizzes avulsos (não-trilha), damos XP imediatamente e aguardamos a persistência
      try {
        await addXp(10);  // 10 XP por pergunta certa
        toast({ title: "Correto! 🎉", description: `+10 Pontos, +10 XP` });
        // sinaliza que houve atualização persistida para que o Dashboard recupere os dados ao voltar
        sessionStorage.setItem('justFinishedQuiz', 'true');
      } catch (e) {
        console.warn('addXp failed (inline question)', e);
        toast({ title: "Correto! 🎉", description: `+10 Pontos (erro ao persistir XP)` });
      }
    }
    } else {
      setSessionAnswers(prev => ({ ...prev, incorrect: prev.incorrect + 1 }));
      
      // Perde vida em TODOS os tipos de quiz quando erra (não apenas trilha)
      if (answerIndex !== null && answerIndex !== -1) { // Apenas erros contam, não pulos ou tempo esgotado
        if (isTrailGame) {
          setMistakes(prev => prev + 1);
        }
        // Aguarda a perda de vida para garantir que o estado seja atualizado no header
        await loseHeart();
      }
      
      if (answerIndex === -1) {
        toast({ title: "Tempo esgotado! ⏰", variant: "destructive" });
      } else if (answerIndex === null) { // Pulo
        toast({ title: "Pergunta pulada!", variant: "default" });
      } else {
        toast({ title: "Incorreto 😔", description: "Você perdeu uma vida.", variant: "destructive" });
      }
    }

    // Avança para próxima pergunta depois de mostrar resultado. Mantemos UX responsivo com timeout.
    setTimeout(() => {
      if (currentQuestion + 1 < questions.length) {
        setCurrentQuestion(currentQuestion + 1);
        setTimeLeft(30);
        setSelectedAnswer(null);
        setShowResult(false);
      } else {
        setGameOver(true);
      }
    }, 2000);
  }, [currentQuestion, questions, addXp, toast, loseHeart, isTrailGame, setPendingScore, setPendingXp]);

  useEffect(() => {
    if (timeLeft > 0 && !showResult && !gameOver && questions.length > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showResult && questions.length > 0) {
      handleAnswer(-1);
    }
  }, [timeLeft, showResult, gameOver, questions, handleAnswer]);

  useEffect(() => {
    if (isTrailGame && mistakes >= 5) {
        setGameOver(true);
        toast({ title: "Limite de erros atingido!", description: "Você cometeu 5 erros e o quiz foi encerrado.", variant: "destructive" });
    }
  }, [mistakes, isTrailGame, toast]);

  // Monitora as vidas e encerra o jogo quando chegarem a zero
  useEffect(() => {
    if (hearts <= 0 && !gameOver) {
      setGameOver(true);
      toast({ 
        title: "Sem vidas!", 
        description: "Você ficou sem vidas. O quiz foi encerrado.", 
        variant: "destructive" 
      });
    }
  }, [hearts, gameOver, toast]);

  useEffect(() => {
      const handleGameOver = async () => {
      if (!gameOver) return;

      try {
        await updatePerformance([{
          subject: subject,
          correct: sessionAnswers.correct,
          incorrect: sessionAnswers.incorrect,
        }]);
      } catch (e) {
        console.warn('updatePerformance failed', e);
      }

      if (blocoId && isTrailGame) {
        if (mistakes < 5 && !isBlockCompleted(blocoId)) { // Player won
          // Ao concluir o bloco, persistimos o XP ganho durante o bloco no backend
          let persistenceSucceeded = true;
          if (pendingXp > 0) {
            try {
              await addXp(pendingXp);
            } catch (e) {
              console.error('Failed to persist pending XP', e);
              persistenceSucceeded = false;
              toast({ title: "Erro ao salvar XP", description: "Não foi possível salvar a experiência no servidor.", variant: 'destructive' });
            }
          }
          try {
            await completeBlock(blocoId);
          } catch (e) {
            console.warn('completeBlock failed', e);
            // We consider block completion non-fatal for navigation, but mark persistence as partial
            persistenceSucceeded = false;
          }
          toast({
            title: "Bloco Concluído!",
            description: `Parabéns! Você completou o bloco. (${pendingScore} pontos ganhos durante o jogo.)`,
          });
          // Marca que finalizou um quiz/jogo para que o Dashboard atualize quando o usuário voltar
          try {
            if (persistenceSucceeded) {
              sessionStorage.setItem('justFinishedQuiz', 'true');
            }
          } catch (e) {
            // ignore storage errors
          }

          // Após uma breve pausa para o usuário ver a tela de conclusão, redirecionamos para a Trilha
          setTimeout(() => {
            navigate('/trilha');
          }, 2000);
        } else if (mistakes >= 5) { // Player lost
          // Descarta os pontos e XP pendentes (não concluiu o bloco)
          setPendingScore(0);
          setPendingXp(0);
          resetHearts();
          // NÃO redireciona automaticamente - aguarda ação do usuário
        }
      }
    };

    handleGameOver();
  }, [gameOver, blocoId, isTrailGame, completeBlock, isBlockCompleted, navigate, toast, pendingScore, pendingXp, addXp, mistakes, resetHearts, subject, sessionAnswers, updatePerformance]);

  const resetGame = () => {
      refetch();
      setCurrentQuestion(0);
      setScore(0);
      setTimeLeft(30);
      setSelectedAnswer(null);
      setShowResult(false);
      setGameOver(false);
      setMistakes(0);
      setPendingScore(0);
      setPendingXp(0);
      setSessionAnswers({ correct: 0, incorrect: 0 });
  };

  if (isTrailGame && hearts <= 0 && blocoId && !isBlockCompleted(blocoId)) {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <GameCard className="p-8 text-center">
                <HeartCrack className="h-16 w-16 mx-auto mb-6 text-destructive" />
                <h2 className="text-2xl font-bold mb-4">Você está sem vidas!</h2>
                <p className="text-muted-foreground mb-6">Volte mais tarde para continuar sua jornada. As vidas recarregam com o tempo.</p>
                <Button variant="game" onClick={() => navigate('/trilha')}>Voltar para a Trilha</Button>
            </GameCard>
        </div>
    );
  }

  if (!title) {
      return <div className="text-center p-8">Bloco ou Matéria não encontrada.</div>
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <GameCard className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Carregando perguntas...</h2>
          <Progress value={undefined} className="h-3 w-full animate-pulse" />
        </GameCard>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <GameCard className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Erro ao carregar perguntas</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button variant="game" onClick={() => refetch()}>Tentar Novamente</Button>
        </GameCard>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <GameCard className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Nenhuma pergunta encontrada para este bloco.</h2>
          <Link to="/trilha">
            <Button variant="game">Voltar para a Trilha</Button>
          </Link>
        </GameCard>
      </div>
    );
  }

  if (gameOver) {
    const playerWon = isTrailGame ? mistakes < 5 : true;
    const playerLost = isTrailGame && mistakes >= 5;

    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <GameCard variant="subject" className="p-8 text-center max-w-md bg-card">
          {playerLost ? (
            <>
              <HeartCrack className="h-20 w-20 mx-auto mb-6 text-red-500" />
              <h2 className="text-4xl font-bold mb-8 text-foreground">Quiz Encerrado!</h2>
              <div className="space-y-6 mb-8">
                <div className="bg-red-500/10 border-2 border-red-500/30 p-4 rounded-lg">
                  <p className="text-xl font-bold text-foreground">
                    Você cometeu <span className="text-red-500">5 erros</span>
                  </p>
                  <p className="text-base text-foreground/80 mt-2">
                    e perdeu todas as suas chances
                  </p>
                </div>
                <p className="text-lg font-semibold text-foreground">
                  💪 Não desanime! Tente novamente e melhore seu desempenho.
                </p>
              </div>
              <div className="bg-blue-500/15 border-2 border-blue-500/40 p-5 rounded-xl mb-8 shadow-lg">
                <div className="flex items-start gap-3 text-left">
                  <span className="text-3xl flex-shrink-0">💡</span>
                  <div>
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400 mb-2">Dica Importante</p>
                    <p className="text-base font-medium text-foreground">
                      Revise o conteúdo e volte mais preparado!
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <Trophy className="h-16 w-16 mx-auto mb-6 text-warning" />
              <h2 className="text-3xl font-bold mb-4">{isTrailGame ? 'Bloco Concluído!' : 'Quiz Finalizado!'}</h2>
              <p className="text-2xl font-bold my-4">Pontuação Final: {score}</p>
              <p className="text-muted-foreground mb-4">Parabéns! Continue assim! 🎉</p>
            </>
          )}
          <div className="flex flex-col gap-4 mt-8">
            {playerWon && (
              <>
                <Button variant="game" onClick={() => navigate('/dashboard')} className="w-full">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
                <Button variant="outline" onClick={() => navigate(isTrailGame ? '/trilha' : '/subjects')} className="w-full">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Próximo Quiz
                </Button>
              </>
            )}
            {playerLost && (
              <>
                <Button variant="game" onClick={() => navigate('/dashboard')} className="w-full">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
                <Button variant="outline" onClick={() => navigate(isTrailGame ? '/trilha' : '/subjects')} className="w-full">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {isTrailGame ? 'Voltar para a Trilha' : 'Voltar'}
                </Button>
              </>
            )}
          </div>
        </GameCard>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <Link to={isTrailGame ? "/trilha" : "/subjects"}>
            <Button variant="ghost">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {title}
            </Button>
          </Link>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => handleAnswer(null)}><SkipForward className="h-4 w-4" /></Button>
            <Link to={isTrailGame ? "/trilha" : "/subjects"}><Button variant="ghost" size="icon"><X className="h-4 w-4" /></Button></Link>
          </div>
        </div>

        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium">Pergunta {currentQuestion + 1} de {questions.length}</span>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">Pontos:</span>
              <Badge variant="secondary" className="text-lg font-bold">{score}</Badge>
            </div>
          </div>
          <Progress value={progress} className="h-3" />
        </div>

        <div className="max-w-2xl mx-auto mb-8">
          <GameCard variant={timeLeft > 10 ? "default" : "warning"} className="p-6 text-center">
            <Clock className={`h-8 w-8 mx-auto mb-2 ${timeLeft <= 5 ? 'animate-pulse' : ''}`} />
            <div className="text-3xl font-bold">{timeLeft}</div>
            <div className="text-sm text-muted-foreground">segundos</div>
          </GameCard>
        </div>

        <div className="max-w-2xl mx-auto">
          <GameCard variant="subject" className="p-8 mb-8">
            <h2 className="text-2xl font-bold text-center mb-8">{question.question}</h2>
            <div className="grid gap-4">
              {question.options.map((option: string, index: number) => {
                let variant: "default" | "success" | "destructive" = "default";
                if (showResult) {
                  if (index === question.correct) variant = "success";
                  else if (index === selectedAnswer) variant = "destructive";
                }
                return (
                  <Button
                    key={index}
                    variant={variant === "default" ? "outline" : variant}
                    className="h-16 text-lg justify-start px-6"
                    onClick={() => !showResult && handleAnswer(index)}
                    disabled={showResult}
                  >
                    <span className="font-bold mr-4">{String.fromCharCode(65 + index)}</span>
                    {option}
                  </Button>
                );
              })}
            </div>
          </GameCard>
        </div>
      </div>
    </div>
  );
};

export default Game;