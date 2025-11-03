import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { GameCard } from "@/components/ui/game-card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Brain, Trophy, Zap, RefreshCw, CheckCircle, XCircle } from "lucide-react";
import { quickQuizQuestions, QuickQuizQuestion } from '@/data/quickQuizQuestions';

const QuickQuiz = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [xp, setXp] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [shuffledQuestions, setShuffledQuestions] = useState<QuickQuizQuestion[]>([]);

  // Embaralha as perguntas ao iniciar
  useEffect(() => {
    const shuffled = [...quickQuizQuestions].sort(() => Math.random() - 0.5);
    setShuffledQuestions(shuffled);
  }, []);

  const currentQuestion = shuffledQuestions[currentQuestionIndex];
  const totalQuestions = shuffledQuestions.length;
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  const handleAnswerClick = (answerIndex: number) => {
    if (isAnswered) return;

    setSelectedAnswer(answerIndex);
    setIsAnswered(true);

    if (answerIndex === currentQuestion.correctAnswer) {
      setScore(score + 1);
      setXp(xp + 10);
      setCorrectAnswers(correctAnswers + 1);
    } else {
      setWrongAnswers(wrongAnswers + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setQuizFinished(true);
    }
  };

  const handleRestart = () => {
    const shuffled = [...quickQuizQuestions].sort(() => Math.random() - 0.5);
    setShuffledQuestions(shuffled);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setScore(0);
    setXp(0);
    setCorrectAnswers(0);
    setWrongAnswers(0);
    setQuizFinished(false);
  };

  if (shuffledQuestions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Carregando perguntas...</p>
      </div>
    );
  }

  if (quizFinished) {
    const accuracy = ((correctAnswers / totalQuestions) * 100).toFixed(1);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <GameCard className="p-8 text-center space-y-6">
            <div className="inline-block p-4 rounded-full bg-gradient-to-br from-yellow-400/20 to-orange-500/20">
              <Trophy className="h-16 w-16 text-yellow-500" />
            </div>
            
            <div>
              <h2 className="text-4xl font-bold mb-2">Quiz Concluído!</h2>
              <p className="text-muted-foreground">Parabéns por testar seus conhecimentos!</p>
            </div>

            <div className="grid grid-cols-2 gap-4 py-6">
              <div className="space-y-2">
                <div className="text-4xl font-bold text-primary">{xp}</div>
                <div className="text-sm text-muted-foreground">XP Ganho</div>
              </div>
              <div className="space-y-2">
                <div className="text-4xl font-bold text-green-500">{accuracy}%</div>
                <div className="text-sm text-muted-foreground">Precisão</div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="font-semibold">Respostas Corretas</span>
                </div>
                <span className="text-2xl font-bold text-green-500">{correctAnswers}</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                <div className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-500" />
                  <span className="font-semibold">Respostas Erradas</span>
                </div>
                <span className="text-2xl font-bold text-red-500">{wrongAnswers}</span>
              </div>
            </div>

            <div className="pt-6 space-y-3">
              <Button 
                onClick={handleRestart} 
                className="w-full bg-gradient-to-r from-primary to-primary/80"
                size="lg"
              >
                <RefreshCw className="h-5 w-5 mr-2" />
                Jogar Novamente
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => window.location.href = '/'}
              >
                Voltar para Home
              </Button>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Quer desbloquear mais recursos? 
                <a href="/register" className="text-primary font-semibold hover:underline ml-1">
                  Crie sua conta grátis
                </a>
              </p>
            </div>
          </GameCard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-8 px-4">
      <div className="container mx-auto max-w-3xl">
        {/* Header com estatísticas */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Quiz Rápido</h1>
          </div>
          
          <div className="flex gap-4">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              <Zap className="h-4 w-4 mr-1 text-yellow-500" />
              {xp} XP
            </Badge>
            <Badge variant="outline" className="text-lg px-4 py-2">
              {currentQuestionIndex + 1}/{totalQuestions}
            </Badge>
          </div>
        </div>

        {/* Barra de progresso */}
        <div className="mb-6 space-y-2">
          <Progress value={progress} className="h-3" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Pergunta {currentQuestionIndex + 1} de {totalQuestions}</span>
            <span>{progress.toFixed(0)}% completo</span>
          </div>
        </div>

        {/* Card da pergunta */}
        <GameCard className="p-8 space-y-6">
          <div className="space-y-2">
            <Badge variant="secondary">{currentQuestion.category}</Badge>
            <h2 className="text-2xl font-bold leading-tight">
              {currentQuestion.question}
            </h2>
          </div>

          <div className="grid gap-3">
            {currentQuestion.options.map((option, index) => {
              const isCorrect = index === currentQuestion.correctAnswer;
              const isSelected = selectedAnswer === index;
              
              let buttonStyle = "border-2 border-border hover:border-primary hover:bg-primary/5";
              
              if (isAnswered) {
                if (isCorrect) {
                  buttonStyle = "border-2 border-green-500 bg-green-500/10";
                } else if (isSelected && !isCorrect) {
                  buttonStyle = "border-2 border-red-500 bg-red-500/10";
                }
              } else if (isSelected) {
                buttonStyle = "border-2 border-primary bg-primary/10";
              }

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerClick(index)}
                  disabled={isAnswered}
                  className={`
                    w-full p-4 rounded-lg text-left transition-all
                    ${buttonStyle}
                    ${isAnswered ? 'cursor-default' : 'cursor-pointer'}
                    disabled:opacity-100
                  `}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{option}</span>
                    {isAnswered && isCorrect && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                    {isAnswered && isSelected && !isCorrect && (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {isAnswered && (
            <div className="pt-4">
              <Button 
                onClick={handleNextQuestion}
                className="w-full bg-gradient-to-r from-primary to-primary/80"
                size="lg"
              >
                {currentQuestionIndex < totalQuestions - 1 ? 'Próxima Pergunta' : 'Ver Resultado'}
              </Button>
            </div>
          )}
        </GameCard>

        {/* Estatísticas em tempo real */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <GameCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-green-500/10">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-green-500">{correctAnswers}</div>
                <div className="text-sm text-muted-foreground">Corretas</div>
              </div>
            </div>
          </GameCard>

          <GameCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-red-500/10">
                <XCircle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-red-500">{wrongAnswers}</div>
                <div className="text-sm text-muted-foreground">Erradas</div>
              </div>
            </div>
          </GameCard>
        </div>
      </div>
    </div>
  );
};

export default QuickQuiz;
