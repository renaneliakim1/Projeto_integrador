import { Ionicons } from '@expo/vector-icons';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const mascot = require('../../../assets/mascot.png');
const { width } = Dimensions.get('window');

interface HeroStats {
  record: {
    holder: string | null;
    xp: number;
  };
  online_players: number;
}

// Definição das rotas aceitas
type RootStackParamList = {
  Trilha: undefined;
  QuizNivelamento: undefined;
};

const HeroScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [stats, setStats] = useState<HeroStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simula chamada à API
    setTimeout(() => {
      setStats({
        record: { holder: 'Renan', xp: 12000 },
        online_players: 42,
      });
      setLoading(false);
    }, 1200);
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.badge}>
          <View style={styles.badgeDot} />
          <Text style={styles.badgeText}>Plataforma Educacional Gamificada</Text>
        </View>
        <Text style={styles.title}>
          Aprenda Brincando com o <Text style={styles.gradient}>Skillio</Text>
        </Text>
        <Text style={styles.description}>
          Transforme seus estudos em uma <Text style={styles.bold}>aventura emocionante</Text>. Jogue, aprenda e conquiste conhecimento em diversas disciplinas.
        </Text>
        <View style={styles.ctaRow}>
          <TouchableOpacity style={styles.ctaButton} onPress={() => navigation.navigate('Trilha')}>
            <Ionicons name="play" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.ctaButtonText}>Começar a Jogar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.ctaOutline} onPress={() => navigation.navigate('QuizNivelamento')}>
            <Text style={styles.ctaOutlineText}>Quiz Rápido</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>5+</Text>
            <Text style={styles.statLabel}>Disciplinas</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>1000+</Text>
            <Text style={styles.statLabel}>Perguntas</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>∞</Text>
            <Text style={styles.statLabel}>Diversão</Text>
          </View>
        </View>
      </View>
      <View style={styles.mascotCard}>
        <View style={styles.mascotBg} />
        <Image source={mascot} style={styles.mascotImg} />
        <View style={styles.heroStatsCards}>
          <View style={styles.heroCard}>
            <Ionicons name="trophy" size={28} color="#fbbf24" style={styles.heroCardIcon} />
            {loading ? (
              <ActivityIndicator size="small" color="#737373" />
            ) : stats?.record.holder ? (
              <View>
                <Text style={styles.heroCardLabel}>Recorde Atual</Text>
                <Text style={styles.heroCardValue}>{stats.record.holder} • {stats.record.xp} XP</Text>
              </View>
            ) : (
              <Text style={styles.heroCardValue}>Seja o primeiro no ranking!</Text>
            )}
          </View>
          <View style={styles.heroCard}>
            <Ionicons name="people" size={28} color="#3b82f6" style={styles.heroCardIcon} />
            {loading ? (
              <ActivityIndicator size="small" color="#737373" />
            ) : (
              <View>
                <Text style={styles.heroCardLabel}>Jogadores Online</Text>
                <Text style={styles.heroCardValue}>{stats?.online_players || 0} ativos agora</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  content: {
    alignItems: 'center',
    paddingBottom: 32,
  },
  header: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 16,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59,130,246,0.08)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 12,
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3b82f6',
    marginRight: 8,
  },
  badgeText: {
    color: '#3b82f6',
    fontWeight: '600',
    fontSize: 13,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  gradient: {
    color: '#3b82f6',
    fontWeight: 'bold',
  },
  description: {
    fontSize: 18,
    color: '#a3a3a3',
    textAlign: 'center',
    marginBottom: 16,
  },
  bold: {
    color: '#fff',
    fontWeight: 'bold',
  },
  ctaRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginRight: 8,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  ctaButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  ctaOutline: {
    borderWidth: 2,
    borderColor: '#3b82f6',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: 'transparent',
  },
  ctaOutlineText: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 24,
    marginTop: 8,
    marginBottom: 8,
  },
  statBox: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  statLabel: {
    fontSize: 13,
    color: '#a3a3a3',
  },
  mascotCard: {
    width: width - 32,
    backgroundColor: 'rgba(59,130,246,0.08)',
    borderRadius: 32,
    alignItems: 'center',
    padding: 24,
    marginTop: 16,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
  },
  mascotBg: {
    position: 'absolute',
    top: 32,
    left: 0,
    right: 0,
    height: 180,
    backgroundColor: '#3b82f6',
    opacity: 0.12,
    borderRadius: 90,
    zIndex: 0,
  },
  mascotImg: {
    width: 180,
    height: 180,
    borderRadius: 90,
    marginBottom: 16,
    zIndex: 1,
  },
  heroStatsCards: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
    width: '100%',
    justifyContent: 'center',
  },
  heroCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    minWidth: 140,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  heroCardIcon: {
    marginBottom: 8,
  },
  heroCardLabel: {
    color: '#a3a3a3',
    fontSize: 13,
    marginBottom: 2,
    textAlign: 'center',
  },
  heroCardValue: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    textAlign: 'center',
  },
});

export default HeroScreen;
