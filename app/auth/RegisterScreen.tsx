import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useCEPValidation } from '@/hooks/useCEPValidation';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useCPFValidation } from '@/hooks/useCPFValidation';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { auth, db } from '../../firebaseConfig';

interface RegisterScreenProps {
  onRegister: (email: string, password: string) => Promise<boolean>;
  onBack: () => void;
  onLogin: () => void;
  googleUserData?: {
    name: string;
    email: string;
    photo?: string;
    id: string;
  } | null;
}

export default function RegisterScreen({ onRegister, onBack, onLogin, googleUserData }: RegisterScreenProps) {
  const theme = useColorScheme() ?? 'light';
  const colors = Colors[theme];
  const { formatCPF, validateCPF, checkCPFExists, checkEmailExists, getCPFNumbers, validateCPFRealTime, isCheckingCPF } = useCPFValidation();
  const { formatCEP, validateCEPFormat, autoFetchCEP, getCEPNumbers, isCheckingCEP } = useCEPValidation();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cpf, setCpf] = useState('');
  const [cep, setCep] = useState('');
  const [city, setCity] = useState('');
  const [street, setStreet] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [addressComplement, setAddressComplement] = useState('');
  const [birthDate, setBirthDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Preencher dados do Google quando disponíveis
  useEffect(() => {
    if (googleUserData) {
      setName(googleUserData.name);
      setEmail(googleUserData.email);
    }
  }, [googleUserData]);

  const validateBirthDate = (date: Date) => {
    const today = new Date();
    const age = today.getFullYear() - date.getFullYear();
    const monthDiff = today.getMonth() - date.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
      return age - 1 >= 18;
    }
    return age >= 18;
  };

  const validateAddress = (city: string, street: string, neighborhood: string) => {
    return city.trim().length >= 2 && street.trim().length >= 5 && neighborhood.trim().length >= 2;
  };

  const validateName = (name: string) => {
    const trimmedName = name.trim();
    return trimmedName.length >= 2 && /^[a-zA-ZÀ-ÿ\s]+$/.test(trimmedName);
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
    if (!name.trim() || !email.trim() || !password.trim() || !cpf.trim() || !cep.trim() || !city.trim() || !street.trim() || !neighborhood.trim()) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    if (!validateName(name)) {
      Alert.alert('Erro', 'Nome deve ter pelo menos 2 caracteres e conter apenas letras');
      return;
    }

    if (!validateCPF(cpf)) {
      Alert.alert('Erro', 'CPF inválido');
      return;
    }

    if (!validateCEPFormat(cep)) {
      Alert.alert('Erro', 'CEP inválido');
      return;
    }

    if (!validateBirthDate(birthDate)) {
      Alert.alert('Erro', 'Você deve ter pelo menos 18 anos para se cadastrar');
      return;
    }

    if (!validateAddress(city, street, neighborhood)) {
      Alert.alert('Erro', 'Cidade, rua e bairro são obrigatórios');
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
      // Verificar se CPF já existe
      const cpfExists = await checkCPFExists(cpf);
      if (cpfExists) {
        Alert.alert('Erro', 'Este CPF já está cadastrado em outra conta. Se você esqueceu sua senha, use a opção de recuperação.');
        setIsLoading(false);
        return;
      }

      // Verificar se email já existe
      const emailExists = await checkEmailExists(email);
      if (emailExists) {
        Alert.alert('Erro', 'Este email já está cadastrado em outra conta. Se você esqueceu sua senha, use a opção de recuperação.');
        setIsLoading(false);
        return;
      }

      // Criar conta de autenticação
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Salvar dados do usuário no Firestore
      const userData = {
        uid: user.uid,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        cpf: getCPFNumbers(cpf), 
        cep: getCEPNumbers(cep),
        city: city.trim(),
        street: street.trim(),
        neighborhood: neighborhood.trim(),
        addressComplement: addressComplement.trim(),
        birthDate: birthDate.toISOString(),
        createdAt: new Date().toISOString(),
        emailVerified: false,
        profileComplete: false
      };

      await setDoc(doc(db, 'users', user.uid), userData);

      Alert.alert('Sucesso', 'Conta criada com sucesso!', [
        {
          text: 'OK',
          onPress: onLogin
        }
      ]);
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

  const handleCEPChange = async (cepValue: string) => {
    setCep(cepValue);
    
    if (validateCEPFormat(cepValue)) {
      const data = await autoFetchCEP(cepValue);
      if (data) {
        setCity(`${data.localidade}, ${data.uf}`);
        setStreet(data.logradouro);
        setNeighborhood(data.bairro || '');
      }
    } else {
      setCity('');
      setStreet('');
      setNeighborhood('');
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
            <ThemedText style={[styles.label, { color: colors.text }]}>Nome Completo</ThemedText>
            <TextInput
              style={[styles.input, { borderColor: colors.primary, color: colors.text }]}
              placeholder="Seu nome completo"
              placeholderTextColor={colors.text + '80'}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              autoComplete="name"
            />
            {name.length > 0 && (
              <View style={styles.validationItem}>
                <MaterialIcons 
                  name={validateName(name) ? "check-circle" : "error"} 
                  size={16} 
                  color={validateName(name) ? colors.secondary : colors.textSecondary} 
                />
                <ThemedText style={[styles.validationText, { 
                    color: validateName(name) ? colors.secondary : colors.textSecondary 
                  }]}>
                  {validateName(name) ? 'Nome válido' : 'Nome deve ter pelo menos 2 caracteres e conter apenas letras'}
                </ThemedText>
              </View>
            )}
          </View>

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
            <ThemedText style={[styles.label, { color: colors.text }]}>CEP</ThemedText>
            <TextInput
              style={[styles.input, { borderColor: colors.primary, color: colors.text }]}
              placeholder="00000-000"
              placeholderTextColor={colors.text + '80'}
              value={cep}
              onChangeText={(text) => handleCEPChange(formatCEP(text))}
              keyboardType="numeric"
              maxLength={9}
              autoComplete="postal-code"
            />
            {cep.length > 0 && (
              <View style={styles.validationItem}>
                <MaterialIcons 
                  name={validateCEPFormat(cep) ? "check-circle" : "error"} 
                  size={16} 
                  color={validateCEPFormat(cep) ? colors.secondary : colors.textSecondary} 
                />
                <ThemedText style={[styles.validationText, { 
                    color: validateCEPFormat(cep) ? colors.secondary : colors.textSecondary 
                  }]}>
                  {isCheckingCEP ? 'Buscando endereço...' : validateCEPFormat(cep) ? 'CEP válido' : 'CEP inválido'}
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
            <ThemedText style={[styles.label, { color: colors.text }]}>Cidade</ThemedText>
            <TextInput
              style={[styles.input, { borderColor: colors.primary, color: colors.text }]}
              placeholder="Cidade, Estado (preenchido automaticamente pelo CEP)"
              placeholderTextColor={colors.text + '80'}
              value={city}
              onChangeText={setCity}
              autoCapitalize="words"
              autoComplete="address-line2"
            />
            {city.length > 0 && (
              <View style={styles.validationItem}>
                <MaterialIcons 
                  name={city.length >= 2 ? "check-circle" : "error"} 
                  size={16} 
                  color={city.length >= 2 ? colors.secondary : colors.textSecondary} 
                />
                <ThemedText style={[styles.validationText, { 
                    color: city.length >= 2 ? colors.secondary : colors.textSecondary 
                  }]}>
                  {city.length >= 2 ? 'Cidade válida' : 'Cidade é obrigatória'}
                </ThemedText>
              </View>
            )}
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={[styles.label, { color: colors.text }]}>Rua</ThemedText>
            <TextInput
              style={[styles.input, { borderColor: colors.primary, color: colors.text }]}
              placeholder="Nome da rua (preenchido automaticamente pelo CEP)"
              placeholderTextColor={colors.text + '80'}
              value={street}
              onChangeText={setStreet}
              autoCapitalize="words"
              autoComplete="street-address"
            />
            {street.length > 0 && (
              <View style={styles.validationItem}>
                <MaterialIcons 
                  name={street.length >= 5 ? "check-circle" : "error"} 
                  size={16} 
                  color={street.length >= 5 ? colors.secondary : colors.textSecondary} 
                />
                <ThemedText style={[styles.validationText, { 
                    color: street.length >= 5 ? colors.secondary : colors.textSecondary 
                  }]}>
                  {street.length >= 5 ? 'Rua válida' : 'Rua deve ter pelo menos 5 caracteres'}
                </ThemedText>
              </View>
            )}
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={[styles.label, { color: colors.text }]}>Bairro</ThemedText>
            <TextInput
              style={[styles.input, { borderColor: colors.primary, color: colors.text }]}
              placeholder="Bairro (preenchido automaticamente pelo CEP)"
              placeholderTextColor={colors.text + '80'}
              value={neighborhood}
              onChangeText={setNeighborhood}
              autoCapitalize="words"
              autoComplete="off"
            />
            {neighborhood.length > 0 && (
              <View style={styles.validationItem}>
                <MaterialIcons 
                  name={neighborhood.length >= 2 ? "check-circle" : "error"} 
                  size={16} 
                  color={neighborhood.length >= 2 ? colors.secondary : colors.textSecondary} 
                />
                <ThemedText style={[styles.validationText, { 
                    color: neighborhood.length >= 2 ? colors.secondary : colors.textSecondary 
                  }]}>
                  {neighborhood.length >= 2 ? 'Bairro válido' : 'Bairro é obrigatório'}
                </ThemedText>
              </View>
            )}
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={[styles.label, { color: colors.text }]}>Complemento</ThemedText>
            <TextInput
              style={[styles.input, { borderColor: colors.primary, color: colors.text }]}
              placeholder="Complemento (opcional): apartamento, casa, etc."
              placeholderTextColor={colors.text + '80'}
              value={addressComplement}
              onChangeText={setAddressComplement}
              autoCapitalize="words"
              autoComplete="off"
            />
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
  multilineInput: {
    minHeight: 50,
    maxHeight: 100,
    borderWidth: 2,
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 15,
    fontSize: 16,
    textAlignVertical: 'top',
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
