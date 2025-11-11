import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import {Ionicons} from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '@contexts/AuthContext';
import { useToast } from '@hooks/useToast';
import Button from '@components/ui/Button';
import Input from '@components/ui/Input';
import { Card, CardContent } from '@components/ui/Card';
import apiClient from '@services/api';

type RootStackParamList = {
  Login: undefined;
  QuizNivelamento: undefined;
};

const RegisterScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const toast = useToast();
  const { login } = useAuth();

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Step 1 - Dados básicos
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [aceitouTermos, setAceitouTermos] = useState(false);

  // Step 2 - Dados pessoais
  const [escolaridade, setEscolaridade] = useState('');
  const [dataNascimento, setDataNascimento] = useState<Date | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [profissao, setProfissao] = useState('');

  // Step 3 - Foco
  const [foco, setFoco] = useState('');

  // Step 4 - Foto
  const [fotoUri, setFotoUri] = useState<string | null>(null);
  const [fotoFile, setFotoFile] = useState<any>(null);

  const opcoesFoco = ['ENEM', 'Lógica', 'Direito', 'Português', 'Matemática', 'Programação', 'História'];
  const opcoesEscolaridade = [
    { label: 'Selecione', value: '' },
    { label: 'Básico', value: 'basico' },
    { label: 'Ensino Fundamental', value: 'fundamental' },
    { label: 'Ensino Médio', value: 'medio' },
    { label: 'Superior', value: 'superior' },
  ];

  const handleAvancar = () => {
    if (step === 1) {
      if (!aceitouTermos || !name || !email || !password || !confirmPassword) {
        toast.toast({ title: 'Preencha todos os campos e aceite os termos.', variant: 'destructive' });
        return;
      }
      if (password !== confirmPassword) {
        toast.toast({ title: 'Senhas não coincidem', variant: 'destructive' });
        return;
      }
      if (password.length < 8) {
        toast.toast({
          title: 'Senha muito curta',
          description: 'A senha deve ter pelo menos 8 caracteres.',
          variant: 'destructive',
        });
        return;
      }
    }
    if (step === 2) {
      if (!escolaridade || !dataNascimento) {
        toast.toast({
          title: 'Preencha sua escolaridade e data de nascimento.',
          variant: 'destructive',
        });
        return;
      }
    }
    setStep(step + 1);
  };

  const handleVoltar = () => {
    setStep(step - 1);
  };

  const handleSelectImage = async () => {
    // Pede permissão para acessar galeria
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      toast.toast({ 
        title: 'Permissão negada', 
        description: 'É necessário permitir acesso à galeria',
        variant: 'destructive' 
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setFotoUri(asset.uri);
      setFotoFile({
        uri: asset.uri,
        type: 'image/jpeg',
        name: 'profile.jpg',
      });
    }
  };

  const handleCadastro = async () => {
    setIsLoading(true);

    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);
    formData.append('first_name', name);
    formData.append('terms_accepted', String(aceitouTermos));

    if (dataNascimento) {
      formData.append('birth_date', dataNascimento.toISOString().split('T')[0]);
    }
    if (escolaridade) {
      formData.append('educational_level', escolaridade);
    }
    if (profissao) {
      formData.append('profession', profissao);
    }
    if (foco) {
      formData.append('focus', foco);
    }
    if (fotoFile) {
      formData.append('foto', fotoFile as any);
    }

    try {
      const response = await apiClient.post('/users/register/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const { access, refresh } = response.data;
      await login(access, refresh);

      toast.toast({
        title: 'Conta criada com sucesso!',
        description: 'Bem-vindo ao EduJornada!',
        variant: 'success',
      });

      navigation.navigate('QuizNivelamento');
    } catch (error: any) {
      let description = 'Ocorreu um erro inesperado. Tente novamente.';
      if (error?.response?.data) {
        try {
          const errors = error.response.data;
          const errorKey = Object.keys(errors)[0];
          const errorMessages = errors[errorKey];
          const message = Array.isArray(errorMessages) ? errorMessages[0] : errorMessages;
          description = message.replace(
            'user with this email already exists.',
            'Já existe uma conta com este e-mail.'
          );
        } catch {
          description = 'Não foi possível processar o erro retornado pelo servidor.';
        }
      }
      toast.toast({
        title: 'Erro no cadastro',
        description: description,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="person-add" size={32} color="#ffffff" />
          </View>
          <Text style={styles.title}>Criar Conta</Text>
          <Text style={styles.subtitle}>Junte-se ao EduJornada e comece a aprender</Text>
        </View>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          {[1, 2, 3, 4].map((s) => (
            <View
              key={s}
              style={[
                styles.progressDot,
                s === step && styles.progressDotActive,
                s < step && styles.progressDotCompleted,
              ]}
            />
          ))}
        </View>

        <Card style={styles.card}>
          <CardContent>
            {/* Back Button */}
            {step > 1 && (
              <TouchableOpacity
                style={styles.backButton}
                onPress={handleVoltar}
                disabled={isLoading}
              >
                <Ionicons name="arrow-back" size={24} color="#3b82f6" />
              </TouchableOpacity>
            )}

            {/* Step 1 - Dados Básicos */}
            {step === 1 && (
              <View style={styles.form}>
                <Input
                  label="Nome"
                  value={name}
                  onChangeText={setName}
                  placeholder="Seu nome completo"
                  editable={!isLoading}
                />

                <Input
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="seu_email@email.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!isLoading}
                />

                <Input
                  label="Senha"
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Mínimo 8 caracteres"
                  secureTextEntry={!showPassword}
                  editable={!isLoading}
                  rightIcon={
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                      <Icon
                        name={showPassword ? 'eye-off' : 'eye'}
                        size={20}
                        color="#737373"
                      />
                    </TouchableOpacity>
                  }
                />

                <Input
                  label="Confirmar Senha"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirme sua senha"
                  secureTextEntry={!showConfirmPassword}
                  editable={!isLoading}
                  rightIcon={
                    <TouchableOpacity
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      <Icon
                        name={showConfirmPassword ? 'eye-off' : 'eye'}
                        size={20}
                        color="#737373"
                      />
                    </TouchableOpacity>
                  }
                />

                {/* Termos */}
                <View style={styles.termsContainer}>
                  <Text style={styles.termsText}>
                    Ao criar uma conta, você concorda com nossos Termos e Condições.
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.checkboxContainer}
                  onPress={() => setAceitouTermos(!aceitouTermos)}
                  disabled={isLoading}
                >
                  <View style={[styles.checkbox, aceitouTermos && styles.checkboxChecked]}>
                    {aceitouTermos && <Ionicons name="checkmark" size={16} color="#ffffff" />}
                  </View>
                  <Text style={styles.checkboxLabel}>Aceito os termos e condições</Text>
                </TouchableOpacity>

                <Button onPress={handleAvancar} disabled={isLoading}>
                  Avançar
                </Button>

                <TouchableOpacity
                  onPress={() => navigation.navigate('Login')}
                  style={styles.loginLink}
                >
                  <Text style={styles.loginLinkText}>
                    Já possui conta? <Text style={styles.loginLinkBold}>Login</Text>
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Step 2 - Dados Pessoais */}
            {step === 2 && (
              <View style={styles.form}>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Escolaridade</Text>
                  <View style={styles.pickerContainer}>
                    {opcoesEscolaridade.map((opcao) => (
                      <TouchableOpacity
                        key={opcao.value}
                        style={[
                          styles.pickerOption,
                          escolaridade === opcao.value && styles.pickerOptionSelected,
                        ]}
                        onPress={() => setEscolaridade(opcao.value)}
                        disabled={isLoading}
                      >
                        <Text
                          style={[
                            styles.pickerOptionText,
                            escolaridade === opcao.value && styles.pickerOptionTextSelected,
                          ]}
                        >
                          {opcao.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Data de Nascimento</Text>
                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setShowDatePicker(true)}
                    disabled={isLoading}
                  >
                    <Text style={styles.dateButtonText}>
                      {dataNascimento
                        ? dataNascimento.toLocaleDateString('pt-BR')
                        : 'Selecione a data'}
                    </Text>
                    <Ionicons name="calendar" size={20} color="#3b82f6" />
                  </TouchableOpacity>
                  {showDatePicker && (
                    <DateTimePicker
                      value={dataNascimento || new Date()}
                      mode="date"
                      display="default"
                      onChange={(event, selectedDate) => {
                        setShowDatePicker(false);
                        if (selectedDate) {
                          setDataNascimento(selectedDate);
                        }
                      }}
                      maximumDate={new Date()}
                      minimumDate={new Date(1950, 0, 1)}
                    />
                  )}
                </View>

                <Input
                  label="Profissão (Opcional)"
                  value={profissao}
                  onChangeText={setProfissao}
                  placeholder="Sua profissão"
                  editable={!isLoading}
                />

                <Button onPress={handleAvancar} disabled={isLoading}>
                  Avançar
                </Button>
              </View>
            )}

            {/* Step 3 - Foco */}
            {step === 3 && (
              <View style={styles.form}>
                <Input
                  label="Qual seu foco?"
                  value={foco}
                  onChangeText={setFoco}
                  placeholder="Digite seu foco principal"
                  editable={!isLoading}
                />

                <View style={styles.suggestionsContainer}>
                  <Text style={styles.suggestionsLabel}>Sugestões:</Text>
                  <View style={styles.suggestionsList}>
                    {opcoesFoco.map((opcao) => (
                      <TouchableOpacity
                        key={opcao}
                        style={styles.suggestionChip}
                        onPress={() => setFoco(opcao)}
                        disabled={isLoading}
                      >
                        <Text style={styles.suggestionChipText}>{opcao}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <Button onPress={handleAvancar} disabled={isLoading}>
                  Avançar
                </Button>
              </View>
            )}

            {/* Step 4 - Foto */}
            {step === 4 && (
              <View style={styles.form}>
                <Text style={styles.label}>Foto de Perfil (Opcional)</Text>

                <TouchableOpacity
                  style={styles.imagePickerButton}
                  onPress={handleSelectImage}
                  disabled={isLoading}
                >
                  {fotoUri ? (
                    <Image source={{ uri: fotoUri }} style={styles.previewImage} />
                  ) : (
                    <View style={styles.imagePlaceholder}>
                      <Ionicons name="camera" size={40} color="#737373" />
                      <Text style={styles.imagePlaceholderText}>Selecionar Foto</Text>
                    </View>
                  )}
                </TouchableOpacity>

                <Button onPress={handleCadastro} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <ActivityIndicator color="#ffffff" style={styles.loader} />
                      <Text style={styles.buttonText}>Finalizando...</Text>
                    </>
                  ) : (
                    'Finalizar Cadastro'
                  )}
                </Button>
              </View>
            )}
          </CardContent>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 16,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#a3a3a3',
    textAlign: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#262626',
  },
  progressDotActive: {
    backgroundColor: '#3b82f6',
    width: 32,
  },
  progressDotCompleted: {
    backgroundColor: '#22c55e',
  },
  card: {
    padding: 0,
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 10,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  form: {
    paddingTop: 48,
    gap: 16,
  },
  termsContainer: {
    marginTop: 8,
  },
  termsText: {
    fontSize: 12,
    color: '#a3a3a3',
    textAlign: 'center',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#3b82f6',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#ffffff',
  },
  loginLink: {
    marginTop: 8,
    alignItems: 'center',
  },
  loginLinkText: {
    fontSize: 14,
    color: '#a3a3a3',
  },
  loginLinkBold: {
    color: '#3b82f6',
    fontWeight: 'bold',
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  pickerContainer: {
    gap: 8,
  },
  pickerOption: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#262626',
    backgroundColor: '#1a1a1a',
  },
  pickerOptionSelected: {
    borderColor: '#3b82f6',
    backgroundColor: '#1e3a8a',
  },
  pickerOptionText: {
    fontSize: 14,
    color: '#a3a3a3',
    textAlign: 'center',
  },
  pickerOptionTextSelected: {
    color: '#ffffff',
    fontWeight: '600',
  },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#262626',
    backgroundColor: '#1a1a1a',
  },
  dateButtonText: {
    fontSize: 14,
    color: '#ffffff',
  },
  suggestionsContainer: {
    marginTop: 8,
  },
  suggestionsLabel: {
    fontSize: 12,
    color: '#a3a3a3',
    marginBottom: 8,
  },
  suggestionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestionChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  suggestionChipText: {
    fontSize: 12,
    color: '#3b82f6',
  },
  imagePickerButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: 'center',
    marginVertical: 16,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderWidth: 2,
    borderColor: '#3b82f6',
    borderStyle: 'dashed',
    borderRadius: 60,
  },
  imagePlaceholderText: {
    fontSize: 12,
    color: '#737373',
    marginTop: 8,
  },
  loader: {
    marginRight: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RegisterScreen;
