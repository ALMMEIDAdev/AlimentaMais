import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import LoginScreen from './LoginScreen';
import RegisterScreen from './RegisterScreen';
import WelcomeScreen from './WelcomeScreen';

type AuthScreen = 'welcome' | 'login' | 'register';

export default function AuthFlow() {
  const [currentScreen, setCurrentScreen] = useState<AuthScreen>('welcome');
  const { login, register } = useAuth();
  const router = useRouter();

  const handleLogin = async (email: string, password: string) => {
    const success = await login(email, password);
    if (success) {
      router.replace('/(tabs)');
    }
    return success;
  };

  const handleRegister = async (email: string, password: string) => {
    return await register(email, password);
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

  return (
    <RegisterScreen
      onRegister={handleRegister}
      onBack={() => setCurrentScreen('welcome')}
      onLogin={() => setCurrentScreen('login')}
    />
  );
}
