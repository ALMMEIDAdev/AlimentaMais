import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useCPFValidation } from '@/hooks/useCPFValidation';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useState } from 'react';
import { ActivityIndicator, Alert, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { auth, db } from '../../firebaseConfig';

interface RegisterScreenProps {
  onRegister: (email: string, password: string) => Promise<boolean>;
  onBack: () => void;
  onLogin: () => void;
  onEmailVerification: (email: string) => void;
}

export default function RegisterScreen({ onRegister, onBack, onLogin, onEmailVerification }: RegisterScreenProps) {
  const theme = useColorScheme() ?? 'light';
  const colors = Colors[theme];
  const { formatCPF, validateCPF, checkCPFExists, getCPFNumbers, validateCPFRealTime, isCheckingCPF } = useCPFValidation();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cpf, setCpf] = useState('');
  const [birthDate, setBirthDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);


  const validateBirthDate = (date: Date) => {
    const today = new Date();
    const age = today.getFullYear() - date.getFullYear();
    const monthDiff = today.getMonth() - date.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
      return age - 1 >= 18;
    }
    return age >= 18;
  };

  const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    
    return {
      isValid: minLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar,
      minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumber,
      hasSpecialChar
    };
  };

  const handleRegister = async () => {
    if (!email.trim() || !password.trim() || !cpf.trim()) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    if (!validateCPF(cpf)) {
      Alert.alert('Erro', 'CPF inválido');
      return;
    }

    if (!validateBirthDate(birthDate)) {
      Alert.alert('Erro', 'Você deve ter pelo menos 18 anos para se cadastrar');
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      Alert.alert(
        'Senha Fraca', 
        'A senha deve ter:\n• Mínimo 8 caracteres\n• Uma letra maiúscula\n• Uma letra minúscula\n• Um número\n• Um caractere especial (!@#$%^&*)'
      );
      return;
    }

    setIsLoading(true);
    try {

      const cpfExists = await checkCPFExists(cpf);
      if (cpfExists) {
        Alert.alert('Erro', 'Este CPF já está cadastrado em outra conta. Se você esqueceu sua senha, use a opção de recuperação.');
        setIsLoading(false);
        return;
      }

    
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

    
      const userData = {
        uid: user.uid,
        email: email,
        cpf: getCPFNumbers(cpf), 
        birthDate: birthDate.toISOString(),
        createdAt: new Date().toISOString(),
        emailVerified: false,
        profileComplete: false
      };

      await setDoc(doc(db, 'users', user.uid), userData);


      Alert.alert(
        'Conta Criada!', 
        'Sua conta foi criada com sucesso! Um email de verificação foi enviado para sua caixa de entrada. Verifique seu email e clique no link para ativar sua conta.',
        [
          {
            text: 'Verificar Email',
            onPress: () => {
              onEmailVerification(email);
            }
          }
        ]
      );
    } catch (error: any) {
      let message = 'Erro ao criar conta. Tente novamente.';
      if (error.code === 'auth/email-already-in-use') {
        message = 'Este email já está em uso.';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Email inválido.';
      } else if (error.code === 'auth/weak-password') {
        message = 'A senha é muito fraca.';
      }
      Alert.alert('Erro', message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setBirthDate(selectedDate);
    }
  };

  const passwordValidation = validatePassword(password);
  const cpfValidation = validateCPFRealTime(cpf);

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <MaterialIcons name="arrow-back" size={24} color={colors.text} />
      </TouchableOpacity>

      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <ThemedText type="title" style={[styles.title, { color: colors.primary }]}>
            Alimenta<ThemedText style={{ color: colors.secondary }}>+</ThemedText>
          </ThemedText>
          
          <ThemedText type="subtitle" style={[styles.subtitle, { color: colors.primary }]}>
            →Cadastre-se
          </ThemedText>
          
          <View style={styles.iconContainer}>
            <View style={[styles.icon, { backgroundColor: colors.text }]}>
              <MaterialIcons name="person" size={40} color={colors.background} />
            </View>
          </View>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <ThemedText style={[styles.label, { color: colors.text }]}>Email</ThemedText>
            <TextInput
              style={[styles.input, { borderColor: colors.primary, color: colors.text }]}
              placeholder="username@gmail.com"
              placeholderTextColor={colors.text + '80'}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={[styles.label, { color: colors.text }]}>CPF</ThemedText>
            <TextInput
              style={[styles.input, { borderColor: colors.primary, color: colors.text }]}
              placeholder="000.000.000-00"
              placeholderTextColor={colors.text + '80'}
              value={cpf}
              onChangeText={(text) => setCpf(formatCPF(text))}
              keyboardType="numeric"
              maxLength={14}
              autoComplete="off"
            />
            {cpf.length > 0 && (
              <View style={styles.validationItem}>
                <MaterialIcons 
                  name={cpfValidation.isValid ? "check-circle" : "error"} 
                  size={16} 
                  color={cpfValidation.isValid ? colors.secondary : colors.textSecondary} 
                />
                <ThemedText style={[styles.validationText, { 
                    color: cpfValidation.isValid ? colors.secondary : colors.textSecondary 
                  }]}>
                  {cpfValidation.message}
                  {isCheckingCPF && ' (verificando...)'}
                </ThemedText>
              </View>
            )}
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={[styles.label, { color: colors.text }]}>Data de Nascimento</ThemedText>
            <TouchableOpacity
              style={[styles.dateInput, { borderColor: colors.primary }]}
              onPress={() => setShowDatePicker(true)}
            >
              <ThemedText style={[styles.dateText, { color: colors.text }]}>
                {birthDate.toLocaleDateString('pt-BR')}
              </ThemedText>
              <MaterialIcons name="calendar-today" size={20} color={colors.primary} />
            </TouchableOpacity>
            {birthDate && (
              <View style={styles.validationItem}>
                <MaterialIcons 
                  name={validateBirthDate(birthDate) ? "check-circle" : "error"} 
                  size={16} 
                  color={validateBirthDate(birthDate) ? colors.secondary : colors.textSecondary} 
                />
                <ThemedText style={[styles.validationText, { 
                    color: validateBirthDate(birthDate) ? colors.secondary : colors.textSecondary 
                  }]}>
                  {validateBirthDate(birthDate) ? 'Idade válida (18+ anos)' : 'Você deve ter pelo menos 18 anos'}
                </ThemedText>
              </View>
            )}
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={[styles.label, { color: colors.text }]}>Senha</ThemedText>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.passwordInput, { borderColor: colors.primary, color: colors.text }]}
                placeholder="••••••••••"
                placeholderTextColor={colors.text + '80'}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoComplete="password-new"
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <MaterialIcons 
                  name={showPassword ? "visibility" : "visibility-off"} 
                  size={20} 
                  color={colors.primary} 
                />
              </TouchableOpacity>
            </View>
            
            {/* Indicadores de validação da senha */}
            {password.length > 0 && (
              <View style={styles.passwordValidation}>
                <View style={styles.validationItem}>
                  <MaterialIcons 
                    name={passwordValidation.minLength ? "check-circle" : "radio-button-unchecked"} 
                    size={16} 
                    color={passwordValidation.minLength ? colors.secondary : colors.textSecondary} 
                  />
                  <ThemedText style={[styles.validationText, { 
                    color: passwordValidation.minLength ? colors.secondary : colors.textSecondary 
                  }]}>
                    Mínimo 8 caracteres
                  </ThemedText>
                </View>
                
                <View style={styles.validationItem}>
                  <MaterialIcons 
                    name={passwordValidation.hasUpperCase ? "check-circle" : "radio-button-unchecked"} 
                    size={16} 
                    color={passwordValidation.hasUpperCase ? colors.secondary : colors.textSecondary} 
                  />
                  <ThemedText style={[styles.validationText, { 
                    color: passwordValidation.hasUpperCase ? colors.secondary : colors.textSecondary 
                  }]}>
                    Uma letra maiúscula
                  </ThemedText>
                </View>
                
                <View style={styles.validationItem}>
                  <MaterialIcons 
                    name={passwordValidation.hasLowerCase ? "check-circle" : "radio-button-unchecked"} 
                    size={16} 
                    color={passwordValidation.hasLowerCase ? colors.secondary : colors.textSecondary} 
                  />
                  <ThemedText style={[styles.validationText, { 
                    color: passwordValidation.hasLowerCase ? colors.secondary : colors.textSecondary 
                  }]}>
                    Uma letra minúscula
                  </ThemedText>
                </View>
                
                <View style={styles.validationItem}>
                  <MaterialIcons 
                    name={passwordValidation.hasNumber ? "check-circle" : "radio-button-unchecked"} 
                    size={16} 
                    color={passwordValidation.hasNumber ? colors.secondary : colors.textSecondary} 
                  />
                  <ThemedText style={[styles.validationText, { 
                    color: passwordValidation.hasNumber ? colors.secondary : colors.textSecondary 
                  }]}>
                    Um número
                  </ThemedText>
                </View>
                
                <View style={styles.validationItem}>
                  <MaterialIcons 
                    name={passwordValidation.hasSpecialChar ? "check-circle" : "radio-button-unchecked"} 
                    size={16} 
                    color={passwordValidation.hasSpecialChar ? colors.secondary : colors.textSecondary} 
                  />
                  <ThemedText style={[styles.validationText, { 
                    color: passwordValidation.hasSpecialChar ? colors.secondary : colors.textSecondary 
                  }]}>
                    Um caractere especial (!@#$%^&*)
                  </ThemedText>
                </View>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={[styles.registerButton, { backgroundColor: colors.primary }]}
            onPress={handleRegister}
            disabled={isLoading || isCheckingCPF}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <ThemedText style={styles.registerButtonText}>
                {isCheckingCPF ? 'Verificando CPF...' : 'Criar Conta'}
              </ThemedText>
            )}
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <ThemedText style={[styles.loginText, { color: colors.text }]}>
              Já tem uma conta? 
            </ThemedText>
            <TouchableOpacity onPress={onLogin}>
              <ThemedText style={[styles.loginLink, { color: colors.primary }]}>
                Entrar
              </ThemedText>
            </TouchableOpacity>
          </View>

          <View style={styles.termsContainer}>
            <ThemedText style={[styles.termsText, { color: colors.text }]}>
              Ao se cadastrar, você concorda com nossos{' '}
            </ThemedText>
            <TouchableOpacity>
              <ThemedText style={[styles.termsLink, { color: colors.primary }]}>
                Termos de Uso
              </ThemedText>
            </TouchableOpacity>
            <ThemedText style={[styles.termsText, { color: colors.text }]}>
              {' '}e{' '}
            </ThemedText>
            <TouchableOpacity>
              <ThemedText style={[styles.termsLink, { color: colors.primary }]}>
                Política de Privacidade
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {showDatePicker && (
        <DateTimePicker
          value={birthDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          maximumDate={new Date()}
          minimumDate={new Date(1900, 0, 1)}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  backButton: {
    marginTop: 50,
    alignSelf: 'flex-start',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
  },
  iconContainer: {
    marginBottom: 15,
  },
  icon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    height: 50,
    borderWidth: 2,
    borderRadius: 25,
    paddingHorizontal: 20,
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    height: 50,
    borderWidth: 2,
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingRight: 50,
    fontSize: 16,
  },
  eyeButton: {
    position: 'absolute',
    right: 15,
    padding: 5,
  },
  registerButton: {
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  registerButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  loginText: {
    fontSize: 16,
  },
  loginLink: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 5,
  },
  termsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  termsText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  passwordValidation: {
    marginTop: 15,
    paddingHorizontal: 5,
  },
  validationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    width: '100%',
  },
  validationText: {
    fontSize: 12,
    marginLeft: 8,
    flex: 1,
  },
  dateInput: {
    height: 50,
    borderWidth: 2,
    borderRadius: 25,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: 16,
  },
  dateText: {
    flex: 1,
    marginRight: 10,
  },
});
