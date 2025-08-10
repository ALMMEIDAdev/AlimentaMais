import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

interface RegisterScreenProps {
  onRegister: (email: string, password: string) => Promise<boolean>;
  onBack: () => void;
  onLogin: () => void;
}

export default function RegisterScreen({ onRegister, onBack, onLogin }: RegisterScreenProps) {
  const theme = useColorScheme() ?? 'light';
  const colors = Colors[theme];
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setIsLoading(true);
    try {
      const success = await onRegister(email, password);
      if (!success) {
        Alert.alert('Erro', 'Erro ao criar conta. Tente novamente.');
      }
    } catch {
      Alert.alert('Erro', 'Erro ao criar conta. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <MaterialIcons name="arrow-back" size={24} color={colors.text} />
      </TouchableOpacity>

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
        </View>

        <TouchableOpacity
          style={[styles.registerButton, { backgroundColor: colors.primary }]}
          onPress={handleRegister}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <ThemedText style={styles.registerButtonText}>Registrar-se</ThemedText>
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
});
