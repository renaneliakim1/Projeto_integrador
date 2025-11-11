import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  Dimensions,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import {Ionicons} from '@expo/vector-icons';
import { useAuth } from '@contexts/AuthContext';
import { useGamification } from '@hooks/useGamification';
import { useToast } from '@hooks/useToast';
import { Card, CardContent } from '@components/ui/Card';
import Button from '@components/ui/Button';
import Progress from '@components/ui/Progress';
import Badge from '@components/ui/Badge';
import apiClient from '@services/api';
import { allAchievements } from '@data/achievements';

type RootStackParamList = {
  EditProfile: undefined;
  Login: undefined;
};

interface UserProfileData {
  birth_date: string;
  educational_level: string;
  profession: string;
  focus: string;
  foto: string | null;
}

interface UserData {
  id: number;
  username: string;
  email: string;
  first_name: string;
  profile: UserProfileData;
  date_joined: string;
}

const { width } = Dimensions.get('window');

const ProfileScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const toast = useToast();
  const { logout } = useAuth();
  const {
    level,
    xp,
    blocosCompletos,
    xpForNextLevel,
    streak,
    unlockedAchievements,
    isLoading: isGamificationLoading,
  } = useGamification();

  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    focus: '',
    photo: null as string | null,
    joinDate: '',
  });
  const [isLoading, setIsLoading] = useState(true);

  // Calcula progresso para o próximo nível
  const progressPercentage = xpForNextLevel > 0 ? ((xp % (xpForNextLevel / 15)) / (xpForNextLevel / 15)) * 100 : 0;

  // Formata data de entrada
  const formatJoinDate = (dateString: string) => {
    if (!dateString) return 'Data desconhecida';
    const date = new Date(dateString);
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  // Fetch dados do usuário
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await apiClient.get<UserData>('/users/me/');
        const { data } = response;

        setUserInfo({
          name: data.first_name,
          email: data.email,
          focus: data.profile.focus,
          photo: data.profile.foto,
          joinDate: formatJoinDate(data.date_joined),
        });
      } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
        toast.toast({ title: 'Erro ao carregar perfil', variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    };

    if (!isGamificationLoading) {
      fetchUserData();
    }
  }, [isGamificationLoading, toast]);

  const handleShare = async () => {
    const profileText = `Meu Perfil EduJornada:\nNome: ${userInfo.name}\nNível: ${level}\nXP: ${xp}\nBlocos Completos: ${blocosCompletos?.length || 0}`;

    try {
      await Share.share({
        message: profileText,
      });
    } catch (error) {
      toast.toast({ title: 'Erro ao compartilhar', variant: 'destructive' });
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigation.navigate('Login');
    } catch (error) {
      toast.toast({ title: 'Erro ao sair', variant: 'destructive' });
    }
  };

  if (isLoading || isGamificationLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Meu <Text style={styles.headerTitleAccent}>Perfil</Text>
        </Text>
        <Text style={styles.headerSubtitle}>Veja seu progresso e conquistas</Text>
      </View>

      {/* Profile Card */}
      <Card style={styles.profileCard}>
        <CardContent>
          {/* Avatar e Info */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              {userInfo.photo ? (
                <Image source={{ uri: userInfo.photo }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>
                    {userInfo.name ? userInfo.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                  </Text>
                </View>
              )}
              <View style={styles.avatarBadge}>
                <Ionicons name="star" size={16} color="#ffffff" />
              </View>
            </View>

            <Badge variant="secondary" style={styles.memberBadge}>
              <Ionicons name="calendar" size={12} color="#f59e0b" />
              <Text style={styles.memberText}> Membro desde {userInfo.joinDate}</Text>
            </Badge>
          </View>

          {/* User Info */}
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {userInfo.name ? userInfo.name.charAt(0).toUpperCase() + userInfo.name.slice(1) : 'Usuário'}
            </Text>
            <View style={styles.emailContainer}>
              <Ionicons name="mail" size={16} color="#a3a3a3" />
              <Text style={styles.email}>{userInfo.email}</Text>
            </View>
          </View>

          {/* Focus */}
          <View style={styles.focusContainer}>
            <View style={styles.focusHeader}>
              <Ionicons name="flag" size={20} color="#3b82f6" />
              <Text style={styles.focusTitle}>Foco de Estudo</Text>
            </View>
            <Text style={styles.focusText}>{userInfo.focus || 'Não informado'}</Text>
          </View>

          {/* Level and Progress */}
          <View style={styles.levelSection}>
            <View style={styles.levelStats}>
              <View style={styles.levelItem}>
                <View style={styles.levelIconContainer}>
                  <Ionicons name="flash" size={24} color="#f59e0b" />
                </View>
                <View>
                  <Text style={styles.levelLabel}>Nível Atual</Text>
                  <Text style={styles.levelValue}>{level}</Text>
                </View>
              </View>
              <View style={styles.levelItem}>
                <Text style={styles.levelLabel}>XP Total</Text>
                <Text style={styles.xpValue}>{xp.toFixed(0)}</Text>
              </View>
            </View>

            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Nível {level} → Nível {level + 1}</Text>
                <Text style={styles.progressValue}>{progressPercentage.toFixed(0)}%</Text>
              </View>
              <Progress value={progressPercentage} color="#3b82f6" />
              <View style={styles.progressFooter}>
                <Text style={styles.progressFooterText}>{xp.toFixed(0)} XP</Text>
                <Text style={styles.progressFooterText}>{xpForNextLevel} XP</Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <Button
              variant="default"
              onPress={() => navigation.navigate('EditProfile')}
              style={styles.actionButton}
            >
              <Ionicons name="pencil" size={16} color="#ffffff" />
              <Text style={styles.buttonText}> Editar Perfil</Text>
            </Button>
            <Button
              variant="outline"
              onPress={handleShare}
              style={styles.actionButton}
            >
              <Ionicons name="share-social" size={16} color="#3b82f6" />
              <Text style={styles.buttonTextOutline}> Compartilhar</Text>
            </Button>
          </View>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <Card style={styles.statCard}>
          <CardContent>
            <View style={styles.statContent}>
              <View style={[styles.statIcon, { backgroundColor: '#3b82f610' }]}>
                <Ionicons name="book" size={24} color="#3b82f6" />
              </View>
              <View>
                <Text style={styles.statLabel}>Blocos Completos</Text>
                <Text style={styles.statValue}>{blocosCompletos?.length || 0}</Text>
              </View>
            </View>
          </CardContent>
        </Card>

        <Card style={styles.statCard}>
          <CardContent>
            <View style={styles.statContent}>
              <View style={[styles.statIcon, { backgroundColor: '#f59e0b10' }]}>
                <Ionicons name="trophy" size={24} color="#f59e0b" />
              </View>
              <View>
                <Text style={styles.statLabel}>Conquistas</Text>
                <Text style={styles.statValue}>
                  {unlockedAchievements?.length || 0} / {allAchievements?.length || 0}
                </Text>
              </View>
            </View>
          </CardContent>
        </Card>

        <Card style={styles.statCard}>
          <CardContent>
            <View style={styles.statContent}>
              <View style={[styles.statIcon, { backgroundColor: '#f59e0b10' }]}>
                <Ionicons name="flame" size={24} color="#f59e0b" />
              </View>
              <View>
                <Text style={styles.statLabel}>Sequência</Text>
                <Text style={styles.statValue}>{streak || 0} dias</Text>
              </View>
            </View>
          </CardContent>
        </Card>
      </View>

      {/* Achievements Section */}
      <View style={styles.achievementsSection}>
        <View style={styles.achievementsHeader}>
          <View style={styles.achievementsTitleContainer}>
            <Ionicons name="ribbon" size={24} color="#3b82f6" />
            <Text style={styles.achievementsTitle}>Conquistas</Text>
          </View>
          <Badge variant="outline">
            <Text style={styles.achievementsBadgeText}>
              {unlockedAchievements?.length || 0} / {allAchievements?.length || 0}
            </Text>
          </Badge>
        </View>

        <View style={styles.achievementsGrid}>
          {allAchievements.map((achievement) => {
            const isEarned = unlockedAchievements?.includes(achievement.id);
            return (
              <Card
                key={achievement.id}
                style={[
                  styles.achievementCard,
                  isEarned ? styles.achievementCardEarned : styles.achievementCardLocked,
                ]}
              >
                <CardContent>
                  <View style={styles.achievementContent}>
                    <View
                      style={[
                        styles.achievementIcon,
                        isEarned ? styles.achievementIconEarned : styles.achievementIconLocked,
                      ]}
                    >
                      <Ionicons name={achievement.icon} size={28} color={isEarned ? '#f59e0b' : '#737373'} />
                    </View>
                    <View style={styles.achievementInfo}>
                      <Text style={styles.achievementName}>{achievement.name}</Text>
                      <Text style={styles.achievementDescription} numberOfLines={2}>
                        {achievement.description}
                      </Text>
                      {isEarned && (
                        <Badge variant="secondary" style={styles.earnedBadge}>
                          <Ionicons name="checkmark-circle" size={12} color="#f59e0b" />
                          <Text style={styles.earnedText}> Conquistado</Text>
                        </Badge>
                      )}
                    </View>
                  </View>
                </CardContent>
              </Card>
            );
          })}
        </View>
      </View>

      {/* Logout Button */}
      <View style={styles.logoutSection}>
        <Button variant="destructive" onPress={handleLogout}>
          <Ionicons name="log-out" size={16} color="#ffffff" />
          <Text style={styles.buttonText}> Sair da Conta</Text>
        </Button>
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
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
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerTitleAccent: {
    color: '#3b82f6',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#a3a3a3',
    marginTop: 4,
  },
  profileCard: {
    margin: 16,
    marginTop: 8,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#3b82f6',
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#3b82f6',
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0a0a0a',
  },
  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  memberText: {
    fontSize: 12,
    color: '#f59e0b',
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  email: {
    fontSize: 14,
    color: '#a3a3a3',
  },
  focusContainer: {
    backgroundColor: '#3b82f610',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#3b82f620',
  },
  focusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  focusTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  focusText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  levelSection: {
    marginBottom: 16,
  },
  levelStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  levelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  levelIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f59e0b20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelLabel: {
    fontSize: 12,
    color: '#a3a3a3',
  },
  levelValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  xpValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  progressSection: {
    gap: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 12,
    color: '#a3a3a3',
  },
  progressValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  progressFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressFooterText: {
    fontSize: 10,
    color: '#737373',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonTextOutline: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    gap: 8,
  },
  statCard: {
    width: (width - 40) / 2,
  },
  statContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#a3a3a3',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  achievementsSection: {
    padding: 16,
    paddingTop: 8,
  },
  achievementsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  achievementsTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  achievementsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  achievementsBadgeText: {
    fontSize: 12,
    color: '#a3a3a3',
  },
  achievementsGrid: {
    gap: 12,
  },
  achievementCard: {
    borderWidth: 1,
  },
  achievementCardEarned: {
    borderColor: '#f59e0b50',
    backgroundColor: '#f59e0b10',
  },
  achievementCardLocked: {
    borderColor: '#26262650',
    opacity: 0.6,
  },
  achievementContent: {
    flexDirection: 'row',
    gap: 12,
  },
  achievementIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementIconEarned: {
    backgroundColor: '#f59e0b20',
  },
  achievementIconLocked: {
    backgroundColor: '#1a1a1a',
  },
  achievementInfo: {
    flex: 1,
  },
  achievementName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 12,
    color: '#a3a3a3',
    marginBottom: 8,
  },
  earnedBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  earnedText: {
    fontSize: 10,
    color: '#f59e0b',
  },
  logoutSection: {
    padding: 16,
    paddingTop: 8,
  },
  bottomSpacer: {
    height: 32,
  },
});

export default ProfileScreen;
