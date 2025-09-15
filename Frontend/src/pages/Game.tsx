import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GameCard } from "@/components/ui/game-card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, Trophy, Pause, X, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useGenerativeAI } from "@/hooks/useGenerativeAI"; // Import the new hook

// Define the structure for a question
interface Question {
  id: number;
  question: string;
  options: string[];
  correct: number;
  difficulty: string;
}

const subjectNames: { [key: string]: string } = {
  matematica: "Matemática",
  portugues: "Português", 
  ingles: "Inglês",
  espanhol: "Espanhol",
  frances: "Francês",
  alemao: "Alemão",
  italiano: "Italiano",
  japones: "Japonês",
  chines: "Chinês",
  russo: "Russo",
  arabe: "Árabe",
  fisica: "Física",
  quimica: "Química",
  biologia: "Biologia",
  historia: "História",
  geografia: "Geografia",
  filosofia: "Filosofia",
  sociologia: "Sociologia",
  psicologia: "Psicologia",
  economia: "Economia",
  direito: "Direito",
  medicina: "Medicina",
  engenharia: "Engenharia",
  arquitetura: "Arquitetura",
  literatura: "Literatura",
  astronomia: "Astronomia",
  geologia: "Geologia",
  estatistica: "Estatística",
  "ciencias-ambientais": "Ciências Ambientais",
  "educacao-fisica": "Educação Física",
  administracao: "Administração",
  artes: "Artes",
  fotografia: "Fotografia",
  musica: "Música",
  teatro: "Teatro",
  "design-grafico": "Design Gráfico",
  "game-design": "Game Design",
  turismo: "Turismo",
  informatica: "Informática"
};

const Game = () => {
  const { subjectId } = useParams<{ subjectId: string }>();
  const { toast } = useToast();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Retrieve educational level and preferred subject from localStorage
  const educationalLevel = localStorage.getItem('userEducationalLevel') || 'medio'; // Default to 'medio' if not found
  const preferredSubject = localStorage.getItem('userPreferredSubject') || ''; // Default to empty

  // Determine the subject to use for AI generation
  const currentSubject = subjectId || preferredSubject;

  // Use the generative AI hook
  const { generatedQuestions, loading, error, refetch } = useGenerativeAI(
    currentSubject,
    educationalLevel
  );

  // Use generatedQuestions directly
  const questions: Question[] = generatedQuestions;

  const resetGame = useCallback(() => {
    setCurrentQuestion(0);
    setScore(0);
    setTimeLeft(30);
    setSelectedAnswer(null);
    setShowResult(false);
    setGameOver(false);
    setIsPaused(false);
    // Only refetch if there are no questions and not already loading/errored
    if (generatedQuestions.length === 0 && !loading && !error && currentSubject) {
      refetch();
    }
  }, [generatedQuestions, loading, error, refetch, currentSubject]);

  useEffect(() => {
    // Reset game state when subjectId changes or new questions are generated
    resetGame();
  }, [subjectId, generatedQuestions, resetGame]);


  const handleAnswer = useCallback((answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    setShowResult(true);
    
    const isCorrect = answerIndex === questions[currentQuestion]?.correct;
    if (isCorrect) {
      const points = Math.max(100 + (timeLeft * 10), 100);
      setScore(score + points);
      toast({
        title: "Correto! 🎉",
        description: `+${points} pontos`,
      });
    } else if (answerIndex === -1) {
      toast({
        title: "Tempo esgotado! ⏰",
        description: "Tente ser mais rápido na próxima!",
      });
    } else {
      toast({
        title: "Incorreto 😔",
        description: "Continue tentando!",
        variant: "destructive",
      });
    }

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
  }, [currentQuestion, questions, timeLeft, score, toast]);

  // Timer
  useEffect(() => {
    if (timeLeft > 0 && !showResult && !gameOver && !isPaused && questions.length > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showResult && questions.length > 0) {
      handleAnswer(-1); // Tempo esgotado
    }
  }, [timeLeft, showResult, gameOver, isPaused, questions, handleAnswer]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <GameCard className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Carregando perguntas...</h2>
          <Progress value={null} className="h-3 w-full animate-pulse" />
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
          <Button variant="game" onClick={refetch}>Tentar Novamente</Button>
        </GameCard>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <GameCard className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Nenhuma pergunta encontrada para esta disciplina.</h2>
          <Link to="/subjects">
            <Button variant="game">Voltar às Disciplinas</Button>
          </Link>
        </GameCard>
      </div>
    );
  }

  if (gameOver) {
    const percentage = Math.round((score / (questions.length * 400)) * 100);
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <GameCard variant="subject" className="p-8 text-center max-w-md">
          <Trophy className="h-16 w-16 mx-auto mb-6 text-warning" />
          <h2 className="text-3xl font-bold mb-4">Jogo Finalizado!</h2>
          <div className="space-y-4 mb-6">
            <div className="text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              {score}
            </div>
            <p className="text-lg text-muted-foreground">pontos finais</p>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {percentage}% de aproveitamento
            </Badge>
          </div>
          <div className="flex gap-4">
            <Button variant="game" onClick={resetGame} className="flex-1">
              <RotateCcw className="h-4 w-4 mr-2" />
              Jogar Novamente
            </Button>
            <Link to="/subjects" className="flex-1">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Disciplinas
              </Button>
            </Link>
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
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <Link to="/subjects">
            <Button variant="ghost">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {subjectNames[currentSubject as keyof typeof subjectNames] || "Disciplina"}
            </Button>
          </Link>
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => setIsPaused(!isPaused)}
            >
              <Pause className="h-4 w-4" />
            </Button>
            <Link to="/subjects">
              <Button variant="ghost" size="icon">
                <X className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Game Info */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium">
              Pergunta {currentQuestion + 1} de {questions.length}
            </span>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">Pontos:</span>
              <Badge variant="secondary" className="text-lg font-bold">
                {score}
              </Badge>
            </div>
          </div>
          <Progress value={progress} className="h-3" />
        </div>

        {/* Timer */}
        <div className="max-w-2xl mx-auto mb-8">
          <GameCard 
            variant={timeLeft > 10 ? "default" : "warning"} 
            className="p-6 text-center"
          >
            <Clock className={`h-8 w-8 mx-auto mb-2 ${timeLeft <= 5 ? 'animate-pulse' : ''}`} />
            <div className="text-3xl font-bold">
              {timeLeft}
            </div>
            <div className="text-sm text-muted-foreground">segundos</div>
            {isPaused && (
              <Badge variant="secondary" className="mt-2">
                Jogo Pausado
              </Badge>
            )}
          </GameCard>
        </div>

        {/* Question */}
        <div className="max-w-2xl mx-auto">
          <GameCard variant="subject" className="p-8 mb-8">
            <h2 className="text-2xl font-bold text-center mb-8">
              {question.question}
            </h2>
            
            <div className="grid gap-4">
              {question.options.map((option: string, index: number) => {
                let variant: "default" | "success" | "destructive" = "default";
                
                if (showResult) {
                  if (index === question.correct) {
                    variant = "success";
                  } else if (index === selectedAnswer && selectedAnswer !== question.correct) {
                    variant = "destructive";
                  }
                }
                
                return (
                  <Button
                    key={index}
                    variant={variant === "default" ? "outline" : variant}
                    className="h-16 text-lg justify-start px-6"
                    onClick={() => !showResult && !isPaused && handleAnswer(index)}
                    disabled={showResult || isPaused}
                  >
                    <span className="font-bold mr-4">
                      {String.fromCharCode(65 + index)})
                    </span>
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
