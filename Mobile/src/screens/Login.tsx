import React, {useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Ionicons} from '@expo/vector-icons';
import {useAuth} from '@contexts/AuthContext';
import apiClient from '@services/api';
import Button from '@components/ui/Button';
import Input from '@components/ui/Input';
import {Card} from '@components/ui/Card';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigation = useNavigation();
  const {login} = useAuth();

  const handleSubmit = async () => {
    if (!email || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await apiClient.post('/auth/login/', {
        username: email,
        password,
      });

      const {access, refresh} = response.data;
      await login(access, refresh);

      // Navegação automática após login bem-sucedido
    } catch (err: any) {
      let description = 'Ocorreu um erro inesperado. Tente novamente.';
      if (err?.response?.status === 401) {
        description = 'Credenciais inválidas. Verifique seu email e senha.';
      } else if (err?.response?.data?.detail) {
        description = err.response.data.detail;
      }
      setError(description);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="book" size={32} color="#ffffff" />
          </View>
          <Text style={styles.title}>Entrar no EduJornada</Text>
          <Text style={styles.subtitle}>
            Acesse sua conta e continue aprendendo
          </Text>
        </View>

        <Card style={styles.card}>
          <View style={styles.form}>
            <Input
              label="Email ou usuário"
              value={email}
              onChangeText={setEmail}
              placeholder="Digite seu email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View>
              <Input
                label="Senha"
                value={password}
                onChangeText={setPassword}
                placeholder="Digite sua senha"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}>
                <Icon
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color="#a3a3a3"
                />
              </TouchableOpacity>
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Button
              variant="game"
              size="lg"
              onPress={handleSubmit}
              disabled={isLoading}
              loading={isLoading}
              style={styles.submitButton}>
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>

            <TouchableOpacity
              onPress={() => navigation.navigate('Register' as never)}
              disabled={isLoading}>
              <Text style={styles.registerText}>
                Não tem uma conta?{' '}
                <Text style={styles.registerLink}>Cadastre-se</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </Card>

        <View style={styles.footer}>
          <Ionicons name="shield-checkmark" size={16} color="#a3a3a3" />
          <Text style={styles.footerText}>
            Seus dados estão protegidos e seguros
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#3b82f6',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fafafa',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#a3a3a3',
    textAlign: 'center',
  },
  card: {
    padding: 24,
  },
  form: {
    gap: 16,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 48,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  submitButton: {
    marginTop: 8,
  },
  registerText: {
    color: '#a3a3a3',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 16,
  },
  registerLink: {
    color: '#f59e0b',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    gap: 8,
  },
  footerText: {
    color: '#a3a3a3',
    fontSize: 12,
  },
});

export default LoginScreen;
