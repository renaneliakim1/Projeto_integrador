import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import type {NavigationProp} from '@react-navigation/native';
import {Ionicons} from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useGenerativeAI} from '../hooks/useGenerativeAI';
import {useGamification} from '../hooks/useGamification';
import {useToast} from '../hooks/useToast';
import {usePerformance} from '../hooks/usePerformance';
import {useTimeTracker} from '../hooks/useTimeTracker';
import {trilhaPrincipal} from '../data/trilhaPrincipal';
import {subjects} from '../data/subjects';
import {Card} from '../components/ui/Card';
import Button from '../components/ui/Button';
import Progress from '../components/ui/Progress';
import Badge from '../components/ui/Badge';

type RootStackParamList = {
  Game: {blocoId: string};
  MainTabs: undefined;
  Trilha: undefined;
};

type GameRouteProp = RouteProp<RootStackParamList, 'Game'>;

interface Question {
  id: number;
  question: string;
  options: string[];
  correct: number;
  difficulty: string;
}

const GameScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<GameRouteProp>();
  const {blocoId} = route.params;
  const toast = useToast();

  const {
    addXp,
    completeBlock,
    isBlockCompleted,
    loseHeart,
    hearts,
    resetHearts,
    userFocus,
  } = useGamification();
  const {updatePerformance} = usePerformance();
  useTimeTracker();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [pendingScore, setPendingScore] = useState(0);
  const [pendingXp, setPendingXp] = useState(0);
  const [sessionAnswers, setSessionAnswers] = useState({
    correct: 0,
    incorrect: 0,
  });

  const trilhaBloco = trilhaPrincipal
    .flatMap(n => n.blocos)
    .find(b => b.id === blocoId);
  const subjectInfo = subjects.find(s => s.id === blocoId);

  let title: string | undefined;
  let nivel: number | null = null;
  let subject: string;
  let isTrailGame = false;

  if (trilhaBloco) {
    isTrailGame = true;
    title = trilhaBloco.titulo;
    const nivelInfo = trilhaPrincipal.find(n =>
      n.blocos.some(b => b.id === blocoId),
    );
    nivel = nivelInfo ? nivelInfo.nivel : 1;
    subject =
      trilhaBloco.tipo === 'foco'
        ? userFocus || 'Conhecimentos Gerais'
        : 'Conhecimentos Gerais';
  } else if (subjectInfo) {
    title = subjectInfo.name;
    nivel = 1;
    subject = subjectInfo.name;
  } else {
    title = undefined;
    subject = 'Conhecimentos Gerais';
  }

  const [educationalLevel, setEducationalLevel] = useState('medio');

  useEffect(() => {
    (async () => {
      const level = await AsyncStorage.getItem('userEducationalLevel');
      if (level) setEducationalLevel(level);
    })();
  }, []);

  const {generatedQuestions, loading, error, refetch} = useGenerativeAI(
    subject,
    educationalLevel,
    nivel || 1,
  );

  const questions: Question[] = generatedQuestions;

  // Verifica vidas no início
  useEffect(() => {
    if (
      isTrailGame &&
      hearts <= 0 &&
      blocoId &&
      !isBlockCompleted(blocoId)
    ) {
      toast.toast({
        title: 'Sem vidas!',
        description: 'Você precisa de vidas para começar um novo bloco.',
        variant: 'destructive',
      });
      navigation.navigate('Trilha');
    }
  }, [isTrailGame, hearts, blocoId, isBlockCompleted, navigation, toast]);

  const handleAnswer = useCallback(
    async (answerIndex: number | null) => {
      setSelectedAnswer(answerIndex);
      setShowResult(true);

      const isCorrect = answerIndex !== null && answerIndex === questions[currentQuestion]?.correct;
      if (isCorrect) {
        setSessionAnswers(prev => ({...prev, correct: prev.correct + 1}));
        setScore(prevScore => prevScore + 10);
        setPendingScore(prev => prev + 10);
        setPendingXp(prev => prev + 10);
        toast.toast({title: 'Correto! 🎉'});
      } else {
        setSessionAnswers(prev => ({...prev, incorrect: prev.incorrect + 1}));

        if (answerIndex !== null && answerIndex !== -1) {
          if (isTrailGame) {
            setMistakes(prev => prev + 1);
          }
          await loseHeart();
        }

        if (answerIndex === -1) {
          toast.toast({
            title: 'Tempo esgotado! ⏰',
            variant: 'destructive',
          });
        } else if (answerIndex === null) {
          toast.toast({title: 'Pergunta pulada!', variant: 'default'});
        } else {
          toast.toast({
            title: 'Incorreto 😔',
            description: 'Você perdeu uma vida.',
            variant: 'destructive',
          });
        }
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
      }, 500);
    },
    [currentQuestion, questions, toast, loseHeart, isTrailGame],
  );

  // Timer
  useEffect(() => {
    if (timeLeft > 0 && !showResult && !gameOver && questions.length > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showResult && questions.length > 0) {
      handleAnswer(-1 as any);
    }
  }, [timeLeft, showResult, gameOver, questions, handleAnswer]);

  // Limite de erros
  useEffect(() => {
    if (isTrailGame && mistakes >= 5) {
      setGameOver(true);
      toast.toast({
        title: 'Limite de erros atingido!',
        description: 'Você cometeu 5 erros e o quiz foi encerrado.',
        variant: 'destructive',
      });
    }
  }, [mistakes, isTrailGame, toast]);

  // Monitora vidas
  useEffect(() => {
    if (hearts <= 0 && !gameOver) {
      setGameOver(true);
      toast.toast({
        title: 'Sem vidas!',
        description: 'Você ficou sem vidas. O quiz foi encerrado.',
        variant: 'destructive',
      });
    }
  }, [hearts, gameOver, toast]);

  // Game Over
  useEffect(() => {
    const handleGameOver = async () => {
      if (!gameOver) return;

      try {
        await updatePerformance([
          {
            subject: subject,
            correct: sessionAnswers.correct,
            incorrect: sessionAnswers.incorrect,
          },
        ]);
      } catch (e) {
        console.warn('updatePerformance failed', e);
      }

      if (blocoId && isTrailGame) {
        if (mistakes < 5 && hearts > 0 && !isBlockCompleted(blocoId)) {
          let persistenceSucceeded = true;
          if (pendingXp > 0) {
            try {
              await addXp(pendingXp);
            } catch (e) {
              console.error('Failed to persist pending XP', e);
              persistenceSucceeded = false;
              toast.toast({
                title: 'Erro ao salvar XP',
                description: 'Não foi possível salvar a experiência no servidor.',
                variant: 'destructive',
              });
            }
          }
          try {
            await completeBlock(blocoId);
          } catch (e) {
            console.warn('completeBlock failed', e);
            persistenceSucceeded = false;
          }
          toast.toast({
            title: 'Bloco Concluído!',
            description: `Parabéns! Você completou o bloco e ganhou ${pendingXp} XP!`,
          });

          try {
            if (persistenceSucceeded) {
              await AsyncStorage.setItem('justFinishedQuiz', 'true');
            }
          } catch (e) {
            // ignore
          }
        } else if (mistakes >= 5 || hearts <= 0) {
          setPendingScore(0);
          setPendingXp(0);
          setScore(0);
          resetHearts();
        }
      } else if (!isTrailGame) {
        if (pendingXp > 0) {
          try {
            await addXp(pendingXp);
            await AsyncStorage.setItem('justFinishedQuiz', 'true');
            toast.toast({
              title: 'Quiz Finalizado!',
              description: `Você ganhou ${pendingXp} XP!`,
            });
          } catch (e) {
            console.error('Failed to persist XP for non-trail quiz', e);
            toast.toast({
              title: 'Erro ao salvar XP',
              description: 'Não foi possível salvar a experiência no servidor.',
              variant: 'destructive',
            });
          }
        }
      }
    };

    handleGameOver();
  }, [
    gameOver,
    blocoId,
    isTrailGame,
    completeBlock,
    isBlockCompleted,
    toast,
    pendingXp,
    addXp,
    mistakes,
    resetHearts,
    subject,
    sessionAnswers,
    updatePerformance,
    hearts,
  ]);

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
    setSessionAnswers({correct: 0, incorrect: 0});
  };

  // Sem vidas
  if (
    isTrailGame &&
    hearts <= 0 &&
    blocoId &&
    !isBlockCompleted(blocoId)
  ) {
    return (
      <View style={styles.centerContainer}>
        <Card style={styles.messageCard}>
          <Ionicons name="heart-dislike" size={64} color="#ef4444" />
          <Text style={styles.messageTitle}>Você está sem vidas!</Text>
          <Text style={styles.messageSubtitle}>
            Volte mais tarde para continuar sua jornada. As vidas recarregam
            com o tempo.
          </Text>
          <Button onPress={() => navigation.navigate('Trilha')}>
            Voltar para a Trilha
          </Button>
        </Card>
      </View>
    );
  }

  if (!title) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Bloco ou Matéria não encontrada.</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Card style={styles.messageCard}>
          <ActivityIndicator size="large" color="#a855f7" />
          <Text style={styles.messageTitle}>Carregando perguntas...</Text>
        </Card>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Card style={styles.messageCard}>
          <Text style={styles.messageTitle}>Erro ao carregar perguntas</Text>
          <Text style={styles.messageSubtitle}>{error}</Text>
          <Button onPress={() => refetch()}>Tentar Novamente</Button>
        </Card>
      </View>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Card style={styles.messageCard}>
          <Text style={styles.messageTitle}>
            Nenhuma pergunta encontrada para este bloco.
          </Text>
          <Button onPress={() => navigation.navigate('Trilha')}>
            Voltar para a Trilha
          </Button>
        </Card>
      </View>
    );
  }

  if (gameOver) {
    const playerWon = isTrailGame ? mistakes < 5 && hearts > 0 : true;
    const playerLost = isTrailGame && (mistakes >= 5 || hearts <= 0);

    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.centerContainer}>
        <Card style={styles.gameOverCard}>
          {playerLost ? (
            <>
              <Ionicons name="sad-outline" size={80} color="#ef4444" />
              <Text style={styles.gameOverTitle}>Quiz Encerrado!</Text>

              <View style={styles.defeatBox}>
                {mistakes >= 5 ? (
                  <>
                    <Text style={styles.defeatMainText}>
                      Você cometeu <Text style={styles.redText}>5 erros</Text>
                    </Text>
                    <Text style={styles.defeatSubText}>
                      e perdeu todas as suas chances
                    </Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.defeatMainText}>
                      Você ficou <Text style={styles.redText}>sem vidas</Text>
                    </Text>
                    <Text style={styles.defeatSubText}>
                      e não conseguiu completar o bloco
                    </Text>
                  </>
                )}
              </View>

              <View style={styles.warningBox}>
                <Text style={styles.warningTitle}>❌ XP descartado</Text>
                <Text style={styles.warningText}>
                  O XP só é salvo ao completar todas as 15 perguntas
                </Text>
              </View>

              <View style={styles.infoBox}>
                <Text style={styles.infoTitle}>
                  ⚠️ Bloco não completado
                </Text>
                <Text style={styles.infoText}>
                  Complete todas as 15 perguntas com vidas para desbloquear o
                  próximo bloco!
                </Text>
              </View>

              <Text style={styles.motivationalText}>
                💪 Não desanime! Tente novamente e melhore seu desempenho.
              </Text>
            </>
          ) : (
            <>
              <Ionicons name="trophy" size={64} color="#fbbf24" />
              <Text style={styles.gameOverTitle}>
                {isTrailGame ? 'Bloco Concluído!' : 'Quiz Finalizado!'}
              </Text>

              {isTrailGame ? (
                <>
                  <View style={styles.successBox}>
                    <Text style={styles.xpText}>+{pendingXp} XP</Text>
                    <Text style={styles.xpSubText}>
                      {sessionAnswers.correct} de 15 perguntas certas × 10 XP
                    </Text>
                  </View>
                  <Text style={styles.congratsText}>
                    🎉 Parabéns! Você completou o bloco!
                  </Text>
                </>
              ) : (
                <>
                  <Text style={styles.finalScoreText}>XP Final: {score}</Text>
                  <Text style={styles.congratsText}>
                    Parabéns! Continue assim! 🎉
                  </Text>
                </>
              )}
            </>
          )}

          <View style={styles.buttonContainer}>
            <Button onPress={() => navigation.navigate('MainTabs')}>
              Dashboard
            </Button>
            <Button
              variant="outline"
              onPress={() => navigation.navigate('Trilha')}>
              {isTrailGame ? 'Próximo Quiz' : 'Voltar'}
            </Button>
          </View>
        </Card>
      </ScrollView>
    );
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Trilha')}>
          <View style={styles.backButton}>
            <Ionicons name="arrow-back" size={20} color="#fafafa" />
            <Text style={styles.backButtonText}>{title}</Text>
          </View>
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => handleAnswer(null)}>
            <Ionicons name="play-skip-forward" size={24} color="#a3a3a3" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Trilha')}>
            <Ionicons name="close" size={24} color="#a3a3a3" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Progress */}
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressText}>
            Pergunta {currentQuestion + 1} de {questions.length}
          </Text>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreLabel}>XP:</Text>
            <Badge>{score.toString()}</Badge>
          </View>
        </View>
        <Progress value={progress} />
      </View>

      {/* Timer */}
      <View style={styles.timerContainer}>
        <Card
          style={[
            styles.timerCard,
            timeLeft <= 10 && styles.timerCardWarning,
          ]}>
          <Icon
            name="time-outline"
            size={32}
            color={timeLeft <= 5 ? '#ef4444' : '#a855f7'}
          />
          <Text
            style={[styles.timerText, timeLeft <= 5 && styles.timerTextDanger]}>
            {timeLeft}
          </Text>
          <Text style={styles.timerLabel}>segundos</Text>
        </Card>
      </View>

      {/* Question */}
      <View style={styles.questionContainer}>
        <Card style={styles.questionCard}>
          <Text style={styles.questionText}>{question.question}</Text>

          <View style={styles.optionsContainer}>
            {question.options.map((option: string, index: number) => {
              const isCorrectAnswer = index === question.correct;
              const isSelectedAnswer = index === selectedAnswer;
              
              let additionalButtonStyle = {};
              let additionalTextStyle = {};

              if (showResult) {
                if (isCorrectAnswer) {
                  additionalButtonStyle = styles.optionButtonCorrect;
                  additionalTextStyle = styles.optionTextCorrect;
                } else if (isSelectedAnswer) {
                  additionalButtonStyle = styles.optionButtonIncorrect;
                  additionalTextStyle = styles.optionTextIncorrect;
                }
              }

              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.optionButton, additionalButtonStyle]}
                  onPress={() => !showResult && handleAnswer(index)}
                  disabled={showResult}
                  activeOpacity={0.7}>
                  <Text style={styles.optionLabel}>
                    {String.fromCharCode(65 + index)}
                  </Text>
                  <Text style={[styles.optionText, additionalTextStyle]}>{option}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backButtonText: {
    color: '#fafafa',
    fontSize: 16,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 16,
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressText: {
    color: '#fafafa',
    fontSize: 14,
    fontWeight: '600',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scoreLabel: {
    color: '#a3a3a3',
    fontSize: 14,
  },
  timerContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  timerCard: {
    alignItems: 'center',
    padding: 24,
  },
  timerCardWarning: {
    borderColor: '#fbbf24',
    borderWidth: 2,
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fafafa',
    marginTop: 8,
  },
  timerTextDanger: {
    color: '#ef4444',
  },
  timerLabel: {
    fontSize: 14,
    color: '#a3a3a3',
    marginTop: 4,
  },
  questionContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  questionCard: {
    padding: 24,
  },
  questionText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fafafa',
    textAlign: 'center',
    marginBottom: 24,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(31, 41, 55, 0.5)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  optionButtonCorrect: {
    backgroundColor: '#22c55e',
    borderColor: '#16a34a',
  },
  optionButtonIncorrect: {
    backgroundColor: '#ef4444',
    borderColor: '#dc2626',
  },
  optionLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fafafa',
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: '#fafafa',
  },
  optionTextCorrect: {
    color: '#fff',
  },
  optionTextIncorrect: {
    color: '#fff',
  },
  messageCard: {
    padding: 32,
    alignItems: 'center',
    gap: 16,
    maxWidth: 400,
  },
  messageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fafafa',
    textAlign: 'center',
  },
  messageSubtitle: {
    fontSize: 14,
    color: '#a3a3a3',
    textAlign: 'center',
    lineHeight: 20,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
  },
  gameOverCard: {
    padding: 24,
    alignItems: 'center',
    gap: 16,
    maxWidth: 400,
  },
  gameOverTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fafafa',
    textAlign: 'center',
  },
  defeatBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 12,
    padding: 16,
    width: '100%',
  },
  defeatMainText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fafafa',
    textAlign: 'center',
  },
  redText: {
    color: '#ef4444',
  },
  defeatSubText: {
    fontSize: 14,
    color: '#d1d5db',
    textAlign: 'center',
    marginTop: 8,
  },
  warningBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 12,
    padding: 16,
    width: '100%',
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ef4444',
    textAlign: 'center',
  },
  warningText: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 4,
  },
  infoBox: {
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(251, 191, 36, 0.3)',
    borderRadius: 12,
    padding: 16,
    width: '100%',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fafafa',
    textAlign: 'center',
  },
  infoText: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 4,
  },
  motivationalText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fafafa',
    textAlign: 'center',
  },
  successBox: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(34, 197, 94, 0.3)',
    borderRadius: 12,
    padding: 24,
    width: '100%',
  },
  xpText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#22c55e',
    textAlign: 'center',
  },
  xpSubText: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 8,
  },
  congratsText: {
    fontSize: 16,
    color: '#a3a3a3',
    textAlign: 'center',
  },
  finalScoreText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fafafa',
    marginVertical: 16,
  },
  buttonContainer: {
    gap: 12,
    width: '100%',
    marginTop: 16,
  },
});

export default GameScreen;
