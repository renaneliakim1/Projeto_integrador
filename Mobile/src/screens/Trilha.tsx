import React, {useState, useMemo, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NavigationProp} from '@react-navigation/native';
import {Ionicons} from '@expo/vector-icons';
import {trilhaPrincipal} from '../data/trilhaPrincipal';
import {useGamification} from '../hooks/useGamification';
import {useToast} from '../hooks/useToast';
import apiClient from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  QuizNivelamento: undefined;
  MainTabs: undefined;
  Game: {blocoId: string};
  EditProfile: undefined;
  StudyPlan: undefined;
};

const {width} = Dimensions.get('window');
const CARD_SIZE = (width - 80) / 5; // 5 cards per row with padding

const TrilhaScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const {blocosCompletos, hearts, addXp} = useGamification();
  const toast = useToast();

  const [checkingPlan, setCheckingPlan] = useState(true);
  const [recompensasColetadas, setRecompensasColetadas] = useState<number[]>(
    [],
  );

  const todosOsBlocos = useMemo(
    () => trilhaPrincipal.flatMap(n => n.blocos),
    [],
  );

  // Carrega recompensas coletadas do AsyncStorage
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem('recompensasColetadas');
        if (saved) {
          setRecompensasColetadas(JSON.parse(saved));
        }
      } catch (error) {
        console.error('Error loading rewards:', error);
      }
    })();
  }, []);

  // Verifica se o usuário completou o quiz de nivelamento
  useEffect(() => {
    (async () => {
      try {
        const resp = await apiClient.get('/users/me/');
        const performanceData = resp.data?.performance || [];

        // Verifica se há dados de performance com respostas registradas
        const hasPerformanceData =
          performanceData.length > 0 &&
          performanceData.some((area: any) =>
            area.subjects.some(
              (subject: any) =>
                subject.correct_answers > 0 || subject.incorrect_answers > 0,
            ),
          );

        if (!hasPerformanceData) {
          toast.toast({
            title: 'Quiz de Nivelamento Pendente',
            description:
              'Você precisa completar o quiz de nivelamento antes de acessar a trilha.',
            variant: 'destructive',
          });
          navigation.navigate('QuizNivelamento');
        } else {
          setCheckingPlan(false);
        }
      } catch (e) {
        console.warn(
          'Could not verify quiz completion, allowing access by fallback.',
          e,
        );
        setCheckingPlan(false);
      }
    })();
  }, [navigation, toast]);

  const handleBlockClick = (blocoId: string) => {
    navigation.navigate('Game', {blocoId});
  };

  const handleClaimReward = async (nivel: number) => {
    if (recompensasColetadas.includes(nivel)) return;

    addXp(100);
    const novasRecompensas = [...recompensasColetadas, nivel];
    setRecompensasColetadas(novasRecompensas);

    try {
      await AsyncStorage.setItem(
        'recompensasColetadas',
        JSON.stringify(novasRecompensas),
      );
    } catch (error) {
      console.error('Error saving rewards:', error);
    }

    toast.toast({
      title: 'Recompensa Coletada!',
      description: 'Você ganhou 100 XP extras!',
      variant: 'default',
    });
  };

  if (checkingPlan) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#a855f7" />
        <Text style={styles.loadingText}>Verificando progresso...</Text>
        <Text style={styles.loadingSubtext}>Aguarde um momento</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Seu Caminho de Aprendizado</Text>
        <Text style={styles.subtitle}>
          Avance pelos níveis, complete desafios e colete suas recompensas para
          dominar novas habilidades.
        </Text>
      </View>

      {/* Níveis */}
      {trilhaPrincipal.map(nivel => {
        const isLevelComplete = nivel.blocos.every(b =>
          blocosCompletos.includes(b.id),
        );
        const isRewardClaimed = recompensasColetadas.includes(nivel.nivel);

        return (
          <View key={nivel.nivel} style={styles.nivelContainer}>
            {/* Level Title */}
            <View style={styles.nivelHeader}>
              <View style={styles.divider} />
              <Text style={styles.nivelTitulo}>{nivel.titulo}</Text>
              <View style={styles.divider} />
            </View>

            {/* Blocos Grid */}
            <View style={styles.blocosGrid}>
              {nivel.blocos.map((bloco, i) => {
                const isCompleto = blocosCompletos.includes(bloco.id);
                const indiceGlobal = todosOsBlocos.findIndex(
                  b => b.id === bloco.id,
                );
                const blocoAnterior =
                  indiceGlobal > 0 ? todosOsBlocos[indiceGlobal - 1] : null;
                const isUnlocked =
                  indiceGlobal === 0 ||
                  (blocoAnterior && blocosCompletos.includes(blocoAnterior.id));

                let status: 'completo' | 'desbloqueado' | 'bloqueado' =
                  'bloqueado';
                if (isCompleto) status = 'completo';
                else if (isUnlocked) status = 'desbloqueado';

                const hasNoHearts = hearts <= 0;
                const isDisabled =
                  status === 'bloqueado' ||
                  (status === 'desbloqueado' && hasNoHearts && !isCompleto);

                const isCurrentCard = status === 'desbloqueado' && !hasNoHearts;

                return (
                  <TouchableOpacity
                    key={bloco.id}
                    style={[
                      styles.blocoCard,
                      isDisabled && styles.blocoDisabled,
                      isCurrentCard && styles.blocoActive,
                    ]}
                    onPress={() => !isDisabled && handleBlockClick(bloco.id)}
                    disabled={isDisabled}
                    activeOpacity={0.7}>
                    <Image
                      source={{
                        uri: `https://via.placeholder.com/100/6366f1/ffffff?text=${indiceGlobal + 1}`,
                      }}
                      style={styles.blocoImage}
                    />
                    {isCompleto && (
                      <View style={styles.completeBadge}>
                        <Ionicons name="checkmark-circle" size={20} color="#fff" />
                      </View>
                    )}
                    {status === 'bloqueado' && (
                      <View style={styles.lockBadge}>
                        <Ionicons name="lock-closed" size={20} color="#fff" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Reward Button */}
            <View style={styles.rewardContainer}>
              <TouchableOpacity
                style={[
                  styles.rewardButton,
                  isLevelComplete &&
                    !isRewardClaimed &&
                    styles.rewardButtonActive,
                  isRewardClaimed && styles.rewardButtonClaimed,
                ]}
                disabled={!isLevelComplete || isRewardClaimed}
                onPress={() => handleClaimReward(nivel.nivel)}
                activeOpacity={0.7}>
                <Icon
                  name="gift"
                  size={32}
                  color={
                    isLevelComplete && !isRewardClaimed
                      ? '#fbbf24'
                      : isRewardClaimed
                        ? '#a855f7'
                        : '#6b7280'
                  }
                />
                <Text
                  style={[
                    styles.rewardText,
                    isLevelComplete &&
                      !isRewardClaimed &&
                      styles.rewardTextActive,
                  ]}>
                  Recompensa
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  content: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#fafafa',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  loadingSubtext: {
    color: '#a3a3a3',
    fontSize: 14,
    marginTop: 8,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fafafa',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: '#a3a3a3',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 320,
  },
  nivelContainer: {
    marginBottom: 48,
  },
  nivelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  nivelTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#a855f7',
    marginHorizontal: 16,
  },
  blocosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
  },
  blocoCard: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  blocoDisabled: {
    opacity: 0.3,
  },
  blocoActive: {
    borderWidth: 2,
    borderColor: '#22c55e',
  },
  blocoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  completeBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#22c55e',
    borderRadius: 12,
    padding: 2,
  },
  lockBadge: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{translateX: -10}, {translateY: -10}],
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    padding: 2,
  },
  rewardContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  rewardButton: {
    width: 96,
    height: 96,
    borderRadius: 12,
    backgroundColor: 'rgba(31, 41, 55, 0.5)',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  rewardButtonActive: {
    borderColor: '#fbbf24',
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
  },
  rewardButtonClaimed: {
    borderColor: 'rgba(168, 85, 247, 0.5)',
  },
  rewardText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#9ca3af',
  },
  rewardTextActive: {
    color: '#fbbf24',
  },
});

export default TrilhaScreen;
