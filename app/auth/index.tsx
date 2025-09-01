import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';
import EmailVerificationScreen from './EmailVerificationScreen';
import LoginScreen from './LoginScreen';
import RegisterScreen from './RegisterScreen';
import WelcomeScreen from './WelcomeScreen';

type AuthScreen = 'welcome' | 'login' | 'register' | 'emailVerification';

export default function AuthFlow() {
  const [currentScreen, setCurrentScreen] = useState<AuthScreen>('welcome');
  const [verificationEmail, setVerificationEmail] = useState('');
  const { login, register } = useAuth();
  const router = useRouter();

  const handleLogin = async (email: string, password: string) => {
    try {
      const success = await login(email, password);
      if (success) {
        router.replace('/(tabs)');
      }
      return success;
    } catch (error: any) {
      if (error.message === 'EMAIL_NOT_VERIFIED') {
        // Não redirecionar automaticamente, apenas mostrar mensagem
        // O usuário deve verificar o email e tentar login novamente
        Alert.alert(
          'Email Não Verificado',
          'Seu email ainda não foi verificado. Verifique sua caixa de entrada, clique no link de confirmação e tente fazer login novamente.',
          [{ text: 'OK' }]
        );
        return false;
      }
      return false;
    }
  };

  const handleRegister = async (email: string, password: string) => {
    return await register(email, password);
  };

  const handleEmailVerification = (email: string) => {
    setVerificationEmail(email);
    setCurrentScreen('emailVerification');
  };

  const handleVerificationComplete = () => {
    // Após verificação, redirecionar para login
    setCurrentScreen('login');
    // Mostrar mensagem de sucesso
    Alert.alert('Sucesso', 'Email verificado com sucesso! Agora você pode fazer login.');
  };

  if (currentScreen === 'welcome') {
    return (
      <WelcomeScreen
        onLogin={() => setCurrentScreen('login')}
        onRegister={() => setCurrentScreen('register')}
      />
    );
  }

  if (currentScreen === 'login') {
    return (
      <LoginScreen
        onLogin={handleLogin}
        onBack={() => setCurrentScreen('welcome')}
        onRegister={() => setCurrentScreen('register')}
      />
    );
  }

  if (currentScreen === 'register') {
    return (
      <RegisterScreen
        onRegister={handleRegister}
        onBack={() => setCurrentScreen('welcome')}
        onLogin={() => setCurrentScreen('login')}
        onEmailVerification={handleEmailVerification}
      />
    );
  }

  if (currentScreen === 'emailVerification') {
    return (
      <EmailVerificationScreen
        email={verificationEmail}
        onVerificationComplete={handleVerificationComplete}
        onBack={() => setCurrentScreen('register')}
      />
    );
  }

  return null;
}
