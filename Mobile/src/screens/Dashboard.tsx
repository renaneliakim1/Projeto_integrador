import Button from '@components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/Card';
import Progress from '@components/ui/Progress';
import { useAuth } from '@contexts/AuthContext';
import { trilhaPrincipal } from '@data/trilhaPrincipal';
import { Ionicons } from '@expo/vector-icons';
import { useDashboardData } from '@hooks/useDashboardData';
import { useGamification } from '@hooks/useGamification';
import { useTimeTracker } from '@hooks/useTimeTracker';
import { useToast } from '@hooks/useToast';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

// Tipagem explícita para calculatePerformance
interface Subject {
  correct_answers?: number;
  incorrect_answers?: number;
}
const calculatePerformance = (subjects: Subject[]): number => {
  const totalAcertos = subjects.reduce((sum: number, item: Subject) => sum + (item.correct_answers || 0), 0);
  const totalErros = subjects.reduce((sum: number, item: Subject) => sum + (item.incorrect_answers || 0), 0);
  const total = totalAcertos + totalErros;
  return total > 0 ? Math.round((totalAcertos / total) * 100) : 0;
};

type RootStackParamList = {
  Login: undefined;
  Trilha: undefined;
  StudyPlan: undefined;
  QuizNivelamento: undefined;
};

const DashboardScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const toast = useToast();
  const { isAuthenticated } = useAuth();
  const { totalTimeInSeconds } = useTimeTracker();
  const { userData, performanceData, activities, isLoading, refetchData, error } = useDashboardData();
  const { level, xp, streak, dailyQuests, blocosCompletos, hearts, nextRefillInSeconds } = useGamification();

  // Mascote animado
  const mascotAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(mascotAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(mascotAnim, { toValue: 0, duration: 1200, useNativeDriver: true })
      ])
    ).start();
  }, [mascotAnim]);

  const userName = userData?.first_name || 'Usuário';
  const profilePicture = userData?.profile?.foto || `https://api.dicebear.com/8.x/adventurer/svg?seed=${userName}`;
  const studyPlan = (userData?.profile && 'study_plan' in userData.profile)
    ? (userData.profile as any).study_plan
    : null;
  const [blockCountOnQuizStart, setBlockCountOnQuizStart] = useState(0);
  useEffect(() => {
    const loadBlockCount = async () => {
      const count = await AsyncStorage.getItem('blockCountOnQuizStart');
      setBlockCountOnQuizStart(parseInt(count || '0', 10));
    };
    loadBlockCount();
  }, []);

  const initialQuizDone = useMemo(() => {
    if (performanceData && performanceData.length > 0) {
      const hasAnyAnswers = performanceData.some(area =>
        area.subjects.some(subject => 
          subject.correct_answers > 0 || subject.incorrect_answers > 0
        )
      );
      return hasAnyAnswers;
    }
    return false;
  }, [performanceData]);

  const hasCompletedAnyLevel = useMemo(() => {
    if (!blocosCompletos) return false;
    return trilhaPrincipal.some(nivel => nivel.blocos.every(b => blocosCompletos.includes(b.id)));
  }, [blocosCompletos]);

  const canRetakeQuiz = useMemo(() => {
    if (!blocosCompletos) return false;
    return hasCompletedAnyLevel && blocosCompletos.length > blockCountOnQuizStart;
  }, [blocosCompletos, blockCountOnQuizStart, hasCompletedAnyLevel]);

  const handleNextExercise = () => {
    if (initialQuizDone) {
      if (hearts <= 0) {
        const minutes = nextRefillInSeconds ? Math.floor(nextRefillInSeconds / 60) : 0;
        const seconds = nextRefillInSeconds ? nextRefillInSeconds % 60 : 0;
        toast.toast({
          title: 'Sem vidas disponíveis! 💔',
          description: nextRefillInSeconds 
            ? `Próxima vida em ${minutes}m ${seconds}s.` 
            : 'As vidas recarregam a cada 3 minutos.',
          variant: 'default'
        });
        return;
      }
      navigation.navigate('Trilha');
    } else {
      toast.toast({ 
        title: 'Quiz de Nivelamento Pendente',
        description: 'Você precisa concluir o quiz de nivelamento antes de acessar as lições.',
        variant: 'destructive'
      });
      navigation.navigate('QuizNivelamento');
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const progress = useMemo(() => {
    if (!blocosCompletos) return 0;
    const currentLevelBlocks = blocosCompletos.length % 15;
    return (currentLevelBlocks / 15) * 100;
  }, [blocosCompletos]);

  const overallPerformance = useMemo(() => {
    if (!performanceData || performanceData.length === 0) return 0;
    const performances = performanceData.map(area => calculatePerformance(area.subjects));
    const sum = performances.reduce((a, b) => a + b, 0);
    return Math.round(sum / performances.length);
  }, [performanceData]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View style={styles.gradientBackground}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header com gradiente e mascote */}
        <View style={styles.header}>
          <View style={styles.mascotContainer}>
            <Animated.View style={{
              transform: [{ scale: mascotAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] }) }],
              shadowColor: '#3b82f6',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.4,
              shadowRadius: 16,
              elevation: 12,
            }}>
              <Image source={require('../../../assets/mascot.png')} style={styles.mascotImage} />
            </Animated.View>
          </View>
          <View style={styles.profileSection}>
            <Image source={{ uri: profilePicture }} style={styles.profileImage} />
            <View style={styles.greetingSection}>
              <Text style={styles.greeting}>Bem-vindo,</Text>
              <Text style={styles.userName}>{userName}!</Text>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Ionicons name="star" size={16} color="#fbbf24" />
                  <Text style={styles.statText}>Nível: <Text style={styles.statValue}>{level}</Text></Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="trophy" size={16} color="#fbbf24" />
                  <Text style={styles.statText}>XP: <Text style={styles.statValue}>{xp}</Text></Text>
                </View>
              </View>
              {streak > 0 && (
                <View style={styles.streakContainer}>
                  <Ionicons name="flame" size={16} color="#f59e0b" />
                  <Text style={styles.streakText}>Sequência: {streak} dias 🔥</Text>
                </View>
              )}
            </View>
          </View>
          <View style={styles.actionButtons}>
            {!initialQuizDone ? (
              <Button
                variant="outline"
                onPress={() => navigation.navigate('QuizNivelamento')}
              >
                Quiz de Nivelamento
              </Button>
            ) : (
              <>
                {studyPlan && (
                  <Button
                    variant="outline"
                    onPress={() => navigation.navigate('StudyPlan')}
                    style={styles.buttonMargin}
                  >
                    Meu Plano de Estudo
                  </Button>
                )}
                {canRetakeQuiz && (
                  <Button
                    variant="outline"
                    onPress={() => navigation.navigate('QuizNivelamento')}
                    style={styles.buttonMargin}
                  >
                    Refazer Quiz
                  </Button>
                )}
              </>
            )}
            <Button
              variant="secondary"
              onPress={handleNextExercise}
              style={styles.nextLessonButton}
            >
              Próxima Lição
            </Button>
          </View>
        </View>
        {/* Restante do dashboard: cards, missões, desempenho, etc. */}
        <View style={styles.statsGrid}>
          {/* Hearts Card */}
          <Card variant="default" style={styles.statCard}>
            <CardContent>
              <View style={styles.cardContent}>
                <Ionicons name="heart" size={32} color="#ef4444" />
                <Text style={styles.statCardValue}>{hearts}/5</Text>
                <Text style={styles.statCardLabel}>Vidas</Text>
                {nextRefillInSeconds !== null && nextRefillInSeconds > 0 && (
                  <Text style={styles.refillText}>
                    +1 em {Math.floor(nextRefillInSeconds / 60)}:{String(nextRefillInSeconds % 60).padStart(2, '0')}
                  </Text>
                )}
              </View>
            </CardContent>
          </Card>
          {/* Progress Card */}
          <Card variant="default" style={styles.statCard}>
            <CardContent>
              <View style={styles.cardContent}>
                <Ionicons name="trending-up" size={32} color="#3b82f6" />
                <Text style={styles.statCardValue}>{Math.round(progress)}%</Text>
                <Text style={styles.statCardLabel}>Progresso</Text>
                <Progress value={progress} color="#3b82f6" style={styles.progressBar} />
              </View>
            </CardContent>
          </Card>
          {/* Study Time Card */}
          <Card variant="default" style={styles.statCard}>
            <CardContent>
              <View style={styles.cardContent}>
                <Ionicons name="time" size={32} color="#f59e0b" />
                <Text style={styles.statCardValue}>{formatTime(totalTimeInSeconds)}</Text>
                <Text style={styles.statCardLabel}>Tempo Hoje</Text>
              </View>
            </CardContent>
          </Card>
          {/* Performance Card */}
          <Card variant="default" style={styles.statCard}>
            <CardContent>
              <View style={styles.cardContent}>
                <Ionicons name="stats-chart" size={32} color="#22c55e" />
                <Text style={styles.statCardValue}>{overallPerformance}%</Text>
                <Text style={styles.statCardLabel}>Desempenho</Text>
              </View>
            </CardContent>
          </Card>
        </View>
        {/* Missões Diárias */}
        <Card variant="default" style={styles.questsCard}>
          <CardHeader>
            <CardTitle>Missões Diárias</CardTitle>
          </CardHeader>
          <CardContent>
            {dailyQuests && dailyQuests.length > 0 ? (
              dailyQuests.map((quest) => (
                <View
                  key={quest.quest.id}
                  style={[styles.questItem, quest.is_completed && styles.questItemCompleted]}
                >
                  <Ionicons name={quest.is_completed ? 'checkmark-circle' : 'radio-button-off'} size={24} color={quest.is_completed ? '#f59e0b' : '#737373'} />
                  <Text style={[styles.questText, quest.is_completed && styles.questTextCompleted]}>
                    {quest.quest.description}
                  </Text>
                  {!quest.is_completed && (
                    <Text style={styles.questReward}>+{quest.quest.xp_reward} XP</Text>
                  )}
                </View>
              ))
            ) : (
              <Text style={styles.noQuestsText}>Nenhuma missão disponível hoje</Text>
            )}
          </CardContent>
        </Card>
        {/* Desempenho por Área */}
        {performanceData && performanceData.length > 0 && (
          <Card variant="default" style={styles.performanceCard}>
            <CardHeader>
              <CardTitle>Desempenho por Área</CardTitle>
            </CardHeader>
            <CardContent>
              {performanceData.map((area) => {
                const areaPerf = calculatePerformance(area.subjects);
                return (
                  <View key={area.area_name} style={styles.performanceItem}>
                    <View style={styles.performanceHeader}>
                      <Text style={styles.performanceLabel}>{area.area_name}</Text>
                      <Text style={styles.performanceValue}>{areaPerf}%</Text>
                    </View>
                    <Progress value={areaPerf} color={areaPerf >= 70 ? '#22c55e' : areaPerf >= 40 ? '#f59e0b' : '#ef4444'} />
                  </View>
                );
              })}
            </CardContent>
          </Card>
        )}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    position: 'relative',
  },
  mascotContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  mascotImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#fff',
    borderWidth: 4,
    borderColor: '#3b82f6',
    marginBottom: 8,
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
  },
  header: {
    padding: 16,
    paddingTop: 8,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#3b82f6',
  },
  greetingSection: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: '#a3a3a3',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 4,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 14,
    color: '#a3a3a3',
  },
  statValue: {
    color: '#3b82f6',
    fontWeight: 'bold',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  streakText: {
    fontSize: 14,
    color: '#f59e0b',
    fontWeight: '600',
  },
  actionButtons: {
    gap: 8,
  },
  buttonMargin: {
    marginBottom: 8,
  },
  nextLessonButton: {
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    gap: 8,
  },
  statCard: {
    width: (width - 40) / 2,
    minHeight: 120,
  },
  cardContent: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  statCardValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 8,
  },
  statCardLabel: {
    fontSize: 12,
    color: '#a3a3a3',
    marginTop: 4,
  },
  refillText: {
    fontSize: 10,
    color: '#ef4444',
    marginTop: 4,
  },
  progressBar: {
    width: '100%',
    marginTop: 8,
  },
  questsCard: {
    margin: 16,
    marginTop: 8,
  },
  questItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    marginBottom: 8,
  },
  questItemCompleted: {
    backgroundColor: '#2a1f0a',
  },
  questText: {
    flex: 1,
    fontSize: 14,
    color: '#ffffff',
  },
  questTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#737373',
  },
  questReward: {
    fontSize: 12,
    color: '#a3a3a3',
  },
  noQuestsText: {
    fontSize: 14,
    color: '#737373',
    textAlign: 'center',
    padding: 16,
  },
  performanceCard: {
    margin: 16,
    marginTop: 0,
  },
  performanceItem: {
    marginBottom: 16,
  },
  performanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  performanceLabel: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
  },
  performanceValue: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: 'bold',
  },
  bottomSpacer: {
    height: 32,
  },
});

export default DashboardScreen;
