import { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GameCard } from "@/components/ui/game-card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, Trophy, X, RotateCcw, CheckCircle, HeartCrack, SkipForward, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useGenerativeAI } from "@/hooks/useGenerativeAI";
import { trilhaPrincipal } from "@/data/trilhaPrincipal";
import { subjects } from "@/data/subjects"; // Import subjects
import { useGamification } from "@/hooks/useGamification";
import { usePerformance } from "@/hooks/usePerformance";
import { useTimeTracker } from "@/hooks/useTimeTracker";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

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
  const [gameOverProcessed, setGameOverProcessed] = useState(false);
  const [lossReason, setLossReason] = useState<'mistakes' | 'hearts' | null>(null); // Armazena o motivo da derrota

  const educationalLevel = localStorage.getItem('userEducationalLevel') || 'medio';

  // Sistema de sons do jogo
  const playSound = useCallback((soundType: 'correct' | 'wrong' | 'victory' | 'defeat') => {
    try {
      const soundPaths = {
        correct: '/sounds/correct.mp3',
        wrong: '/sounds/wrong.mp3',
        victory: '/sounds/victory.mp3',
        defeat: '/sounds/defeat.mp3'
      };
      
      const audio = new Audio(soundPaths[soundType]);
      audio.volume = 0.5; // Volume ajustável (0.0 a 1.0)
      audio.play().catch(err => {
        // Silenciosamente ignora erros (ex: autoplay bloqueado pelo navegador)
        console.log('Audio playback prevented:', err);
      });
    } catch (error) {
      // Ignora erros de som para não quebrar o jogo
      console.log('Sound error:', error);
    }
  }, []);

  const { generatedQuestions, loading, error, refetch } = useGenerativeAI(
    subject,
    educationalLevel,
    nivel || 1
  );

  const questions: Question[] = generatedQuestions;

  // Verifica vidas APENAS no início do jogo, não durante
  useEffect(() => {
    // Só redireciona se:
    // 1. É um jogo de trilha
    // 2. Não tem vidas
    // 3. O bloco não está completo
    // 4. O jogo NÃO está em andamento (currentQuestion === 0, não está em gameOver nem showResult)
    if (isTrailGame && hearts <= 0 && blocoId && !isBlockCompleted(blocoId) && 
        currentQuestion === 0 && !gameOver && !showResult) {
        toast({ title: "Sem vidas!", description: "Você precisa de vidas para começar um novo bloco.", variant: "destructive" });
        navigate('/trilha');
    }
  }, [isTrailGame, hearts, blocoId, isBlockCompleted, navigate, toast, currentQuestion, gameOver, showResult]);

  const handleAnswer = useCallback(async (answerIndex: number) => {
    // Previne múltiplas execuções
    if (showResult || gameOver) return;
    
    setSelectedAnswer(answerIndex);
    setShowResult(true);
    
    const isCorrect = answerIndex === questions[currentQuestion]?.correct;
  if (isCorrect) {
    playSound('correct'); // Som de acerto
    setSessionAnswers(prev => ({ ...prev, correct: prev.correct + 1 }));
    setScore(prevScore => prevScore + 10);
    setPendingScore(prev => prev + 10);
    setPendingXp(prev => prev + 10);
    toast({ title: "Correto! 🎉" });
    
    // Avança para próxima pergunta
    setTimeout(() => {
      if (currentQuestion + 1 < questions.length) {
        setCurrentQuestion(currentQuestion + 1);
        setTimeLeft(30);
        setSelectedAnswer(null);
        setShowResult(false);
      } else {
        // Toca som de vitória IMEDIATAMENTE antes de mostrar tela
        playSound('victory');
        setGameOver(true);
      }
    }, 500);
    
    } else {
      playSound('wrong'); // Som de erro
      setSessionAnswers(prev => ({ ...prev, incorrect: prev.incorrect + 1 }));
      
      // Captura vidas ANTES de perder
      const heartsBeforeLoss = hearts;
      let newMistakes = mistakes;
      
      // Perde vida quando erra (não em pulos ou tempo esgotado)
      if (answerIndex !== null && answerIndex !== -1) {
        if (isTrailGame) {
          newMistakes = mistakes + 1;
          setMistakes(newMistakes);
        }
        await loseHeart();
        toast({ title: "Incorreto 😔", description: "Você perdeu uma vida.", variant: "destructive" });
      } else if (answerIndex === -1) {
        toast({ title: "Tempo esgotado! ⏰", variant: "destructive" });
      } else {
        toast({ title: "Pergunta pulada!", variant: "default" });
      }

      // Verifica condições de derrota
      const shouldEndByMistakes = isTrailGame && newMistakes >= 5;
      const shouldEndByHearts = answerIndex !== null && answerIndex !== -1 && heartsBeforeLoss <= 1;
      
      console.log('🔍 Debug Game Over Check:', { 
        shouldEndByMistakes, 
        shouldEndByHearts, 
        newMistakes, 
        heartsBeforeLoss,
        answerIndex,
        isTrailGame,
        currentQuestion,
        totalQuestions: questions.length
      });
      
      // Se perdeu, PARA AQUI e não avança
      if (shouldEndByMistakes || shouldEndByHearts) {
        console.log('❌ GAME OVER TRIGGERED - Vai mostrar tela de derrota');
        // Toca som de derrota IMEDIATAMENTE
        playSound('defeat');
        // Marca o motivo da derrota ANTES de setar gameOver
        const reason = shouldEndByMistakes ? 'mistakes' : 'hearts';
        setLossReason(reason);
        console.log('🏴 Loss Reason setado como:', reason);
        
        setTimeout(() => {
          console.log('⏰ Timeout executado - Setando gameOver = true');
          setGameOver(true);
          setShowResult(false); // Remove showResult para evitar conflitos
          if (typeof document !== 'undefined') {
            const el = document.activeElement as HTMLElement | null;
            if (el && typeof el.blur === 'function') el.blur();
          }
        }, 1500);
        return; // CRITICAL: Impede execução do código abaixo
      }

      // Só chega aqui se NÃO perdeu - avança para próxima
      setTimeout(() => {
        if (currentQuestion + 1 < questions.length) {
          setCurrentQuestion(currentQuestion + 1);
          setTimeLeft(30);
          setSelectedAnswer(null);
          setShowResult(false);
          if (typeof document !== 'undefined') {
            const el = document.activeElement as HTMLElement | null;
            if (el && typeof el.blur === 'function') el.blur();
          }
        } else {
          // Toca som de vitória IMEDIATAMENTE antes de mostrar tela
          playSound('victory');
          setGameOver(true);
        }
      }, 500);
    }
  }, [currentQuestion, questions, toast, loseHeart, isTrailGame, mistakes, hearts, showResult, gameOver, playSound]);

  useEffect(() => {
    if (timeLeft > 0 && !showResult && !gameOver && questions.length > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showResult && questions.length > 0 && !gameOver) {
      handleAnswer(-1);
    }
  }, [timeLeft, showResult, gameOver, questions, handleAnswer]);

  // UseEffect de backup removido - agora a detecção é 100% dentro de handleAnswer para evitar conflitos

  useEffect(() => {
      const handleGameOver = async () => {
      if (!gameOver || gameOverProcessed) {
        if (!gameOver) console.log('⏭️ handleGameOver: gameOver é false, pulando');
        if (gameOverProcessed) console.log('⏭️ handleGameOver: já processado, pulando');
        return;
      }
      
      console.log('🎮 handleGameOver EXECUTANDO...', { mistakes, hearts, blocoId, lossReason });
      setGameOverProcessed(true);

      try {
        await updatePerformance([{
          subject: subject,
          correct: sessionAnswers.correct,
          incorrect: sessionAnswers.incorrect,
        }]);
      } catch (e) {
        console.warn('updatePerformance failed', e);
      }

      // Regra de negócio: se o jogador perdeu por erros ou por ficar sem vidas,
      // não salvar XP nem mostrar toasts de sucesso. Limpa pending XP/score.
      if (lossReason) {
        console.log('🏴 handleGameOver: jogador perdeu — descartando XP e evitando persistência', lossReason);
        try {
          setPendingScore(0);
          setPendingXp(0);
          setScore(0);
        } catch (e) {
          console.warn('Erro ao limpar XP pendente após derrota', e);
        }
        return; // Não persistir XP nem mostrar alertas de sucesso
      }

      if (blocoId && isTrailGame) {
        // Verifica se o jogador venceu (não há lossReason E ainda tem vidas)
        if (!lossReason && hearts > 0 && !isBlockCompleted(blocoId)) {
          console.log('✅ Jogador VENCEU o bloco');
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
            persistenceSucceeded = false;
          }
          toast({
            title: "Bloco Concluído!",
            description: `Parabéns! Você completou o bloco e ganhou ${pendingXp} XP!`,
          });
          try {
            if (persistenceSucceeded) {
              sessionStorage.setItem('justFinishedQuiz', 'true');
            }
          } catch (e) {
            // ignore storage errors
          }
        } else if (lossReason) {
          console.log('❌ Jogador PERDEU o bloco por:', lossReason);
          setPendingScore(0);
          setPendingXp(0);
          setScore(0);
        }
      } else if (!isTrailGame) {
        console.log('🎯 Quiz avulso finalizado');
        if (pendingXp > 0) {
          try {
            await addXp(pendingXp);
            sessionStorage.setItem('justFinishedQuiz', 'true');
            toast({
              title: "Quiz Finalizado!",
              description: `Você ganhou ${pendingXp} XP!`,
            });
          } catch (e) {
            console.error('Failed to persist XP for non-trail quiz', e);
            toast({ title: "Erro ao salvar XP", description: "Não foi possível salvar a experiência no servidor.", variant: 'destructive' });
          }
        }
      }
    };

    handleGameOver();
  }, [gameOver, gameOverProcessed, blocoId, isTrailGame, completeBlock, isBlockCompleted, toast, pendingScore, pendingXp, addXp, mistakes, subject, sessionAnswers, updatePerformance, hearts, lossReason, playSound]);

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
      setGameOverProcessed(false);
      setLossReason(null); // Reseta o motivo da derrota
      if (typeof document !== 'undefined') {
        const el = document.activeElement as HTMLElement | null;
        if (el && typeof el.blur === 'function') el.blur();
      }
  };

  // Remove focus/hover visual residual ao trocar de pergunta
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const el = document.activeElement as HTMLElement | null;
      if (el && typeof el.blur === 'function') el.blur();
    }
  }, [currentQuestion]);

  console.log('📊 Estado atual do jogo:', { 
    gameOver, 
    lossReason, 
    hearts, 
    mistakes, 
    currentQuestion, 
    loading, 
    error,
    questionsLength: questions?.length 
  });

  if (!title) {
      console.log('❌ RETURN: Título não encontrado');
      return <div className="text-center p-8">Bloco ou Matéria não encontrada.</div>
  }

  if (loading) {
    console.log('⏳ RETURN: Carregando perguntas...');
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

  // PRIORIDADE 1: Verifica gameOver PRIMEIRO (assim mostra resultado antes de qualquer outra coisa)
  if (gameOver) {
    // Se há lossReason, o jogador perdeu. Caso contrário, venceu (ou é quiz avulso)
    const playerLost = lossReason !== null;
    const playerWon = !playerLost;

    console.log('🎬 RENDERIZANDO TELA DE GAMEOVER:', { 
      gameOver, 
      playerWon, 
      playerLost, 
      lossReason, 
      mistakes, 
      hearts,
      gameOverProcessed 
    });

    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-2 sm:px-4">
        <GameCard variant="subject" className="p-4 sm:p-6 md:p-8 text-center max-w-md w-full mx-2 sm:mx-4 bg-card">
          {playerLost ? (
            <>
              {/* GIF de Derrota */}
              <div className="mb-6 rounded-lg overflow-hidden shadow-2xl">
                <img 
                  src="/videos/defeat.gif" 
                  alt="Derrota"
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    // Se o GIF falhar ao carregar, esconde o elemento
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
              <HeartCrack className="h-16 w-16 sm:h-20 sm:w-20 mx-auto mb-4 sm:mb-6 text-red-500" />
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 md:mb-8 text-foreground">Quiz Encerrado!</h2>
              <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-8">
                <div className="bg-red-500/10 border-2 border-red-500/30 p-3 sm:p-4 rounded-lg">
                  {lossReason === 'mistakes' ? (
                    <>
                      <p className="text-base sm:text-lg md:text-xl font-bold text-foreground break-words">
                        Você cometeu <span className="text-red-500">5 erros</span>
                      </p>
                      <p className="text-sm sm:text-base text-foreground/80 mt-2 break-words">
                        e perdeu todas as suas chances
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-base sm:text-lg md:text-xl font-bold text-foreground break-words">
                        Você ficou <span className="text-red-500">sem vidas</span>
                      </p>
                      <p className="text-sm sm:text-base text-foreground/80 mt-2 break-words">
                        e não conseguiu completar o bloco
                      </p>
                    </>
                  )}
                </div>
                
                <div className="bg-red-500/10 border-2 border-red-500/30 p-3 sm:p-4 rounded-lg">
                  <p className="text-base sm:text-lg font-bold text-red-600 dark:text-red-400 break-words">
                    ❌ XP descartado
                  </p>
                  <p className="text-xs sm:text-sm text-foreground/70 mt-1 break-words">
                    O XP só é salvo ao completar todas as 15 perguntas
                  </p>
                </div>
                
                <div className="bg-yellow-500/10 border-2 border-yellow-500/30 p-3 sm:p-4 rounded-lg">
                  <p className="text-base sm:text-lg font-bold text-foreground break-words">
                    ⚠️ Bloco não completado
                  </p>
                  <p className="text-xs sm:text-sm text-foreground/70 mt-1 break-words">
                    Complete todas as 15 perguntas com vidas para desbloquear o próximo bloco!
                  </p>
                </div>
                
                <p className="text-base sm:text-lg font-semibold text-foreground break-words">
                  💪 Não desanime! Tente novamente e melhore seu desempenho.
                </p>
              </div>
              <div className="bg-blue-500/15 border-2 border-blue-500/40 p-3 sm:p-4 md:p-5 rounded-xl mb-6 sm:mb-8 shadow-lg">
                <div className="flex items-start gap-2 sm:gap-3 text-left">
                  <span className="text-2xl sm:text-3xl flex-shrink-0">💡</span>
                  <div>
                    <p className="text-base sm:text-lg font-bold text-blue-600 dark:text-blue-400 mb-1 sm:mb-2 break-words">Dica Importante</p>
                    <p className="text-sm sm:text-base font-medium text-foreground break-words">
                      Revise o conteúdo e volte mais preparado!
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* GIF de Vitória */}
              <div className="mb-6 rounded-lg overflow-hidden shadow-2xl">
                <img 
                  src="/videos/victory.gif" 
                  alt="Vitória"
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    // Se o GIF falhar ao carregar, esconde o elemento
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
              <Trophy className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 sm:mb-6 text-warning" />
              <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 break-words">{isTrailGame ? 'Bloco Concluído!' : 'Quiz Finalizado!'}</h2>
              {isTrailGame ? (
                <>
                  <div className="bg-green-500/10 border-2 border-green-500/30 p-4 sm:p-6 rounded-lg mb-4 sm:mb-6">
                    <p className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                      +{pendingXp} XP
                    </p>
                    <p className="text-xs sm:text-sm text-foreground/70 break-words">
                      {sessionAnswers.correct} de 15 perguntas certas × 10 XP
                    </p>
                  </div>
                  <p className="text-base sm:text-lg text-muted-foreground mb-3 sm:mb-4 break-words">
                    🎉 Parabéns! Você completou o bloco!
                  </p>
                </>
              ) : (
                <>
                  <p className="text-xl sm:text-2xl font-bold my-3 sm:my-4">XP Final: {score}</p>
                  <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4 break-words">Parabéns! Continue assim! 🎉</p>
                </>
              )}
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

  // PRIORIDADE 2: Verifica se tem vidas para INICIAR um jogo da trilha (não interfere com gameOver)
  if (isTrailGame && hearts <= 0 && blocoId && !isBlockCompleted(blocoId) && currentQuestion === 0) {
    console.log('🚫 BLOQUEIO: Sem vidas no início do jogo - redirecionando');
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

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="flex justify-between items-center mb-8">
          <Link to={isTrailGame ? "/trilha" : "/subjects"}>
            <Button variant="ghost">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {title}
            </Button>
          </Link>
          <div className="flex items-center space-x-4">
            {/* Mobile-only lives indicator: visible on small screens, hidden on sm+ to avoid changing desktop header */}
            <div className="flex items-center space-x-2 sm:hidden mr-2">
              <Heart className="h-5 w-5 text-red-500" aria-hidden="true" />
              <span className="text-sm font-medium">{hearts}</span>
            </div>
            <Button variant="ghost" onClick={() => handleAnswer(null)}><SkipForward className="h-4 w-4" /></Button>
            <Link to={isTrailGame ? "/trilha" : "/subjects"}><Button variant="ghost" size="icon"><X className="h-4 w-4" /></Button></Link>
          </div>
        </div>

        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium">Pergunta {currentQuestion + 1} de {questions.length}</span>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">XP:</span>
              <Badge variant="secondary" className="text-lg font-bold">{score}</Badge>
            </div>
          </div>
          <Progress value={progress} className="h-3" />
        </div>

        <div className="max-w-2xl mx-auto mb-4 sm:mb-8">
          <GameCard variant={timeLeft > 10 ? "default" : "warning"} className="p-4 sm:p-6 text-center">
            <Clock className={`h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 ${timeLeft <= 5 ? 'animate-pulse' : ''}`} />
            <div className="text-2xl sm:text-3xl font-bold">{timeLeft}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">segundos</div>
          </GameCard>
        </div>

        <div className="max-w-2xl mx-auto">
          <GameCard variant="subject" className="p-4 sm:p-6 md:p-8 mb-4 sm:mb-8 text-left">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-left mb-4 sm:mb-6 md:mb-8 break-words">{question.question}</h2>
            <div className="grid gap-3 sm:gap-4">
              {question.options.map((option: string, index: number) => {
                let variant: "default" | "success" | "destructive" = "default";
                let bgClass = "";
                // O destaque só aparece após seleção
                if (showResult) {
                  if (index === question.correct) {
                    variant = "success";
                    bgClass = "bg-green-500 text-white border-green-600";
                  } else if (selectedAnswer === index) {
                    variant = "destructive";
                    bgClass = "bg-red-500 text-white border-red-600";
                  } else {
                    bgClass = "bg-background border-muted text-muted-foreground";
                  }
                } else {
                  // Sem hover, sem destaque, sem animação
                  bgClass = "bg-background border-muted text-foreground";
                }
                return (
                  <button
                    key={index}
                    className={`w-full p-3 sm:p-4 rounded-lg border font-medium text-base sm:text-lg transition-none text-left flex items-start ${bgClass}`}
                    style={{
                      boxShadow: 'none',
                      color: undefined,
                      backgroundColor: undefined,
                      borderColor: undefined,
                      transform: 'none',
                      animationDuration: undefined,
                    }}
                    disabled={showResult || gameOver}
                    onClick={() => handleAnswer(index)}
                  >
                    <span className="font-bold mr-2 sm:mr-3 md:mr-4 flex-shrink-0">{String.fromCharCode(65 + index)}</span>
                    <span className="break-words">{option}</span>
                  </button>
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