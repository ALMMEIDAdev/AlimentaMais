import { useAuth } from '@/contexts/AuthContext';
import React, { useState } from 'react';
import LoginScreen from './LoginScreen';
import RegisterScreen from './RegisterScreen';
import WelcomeScreen from './WelcomeScreen';

type AuthScreen = 'welcome' | 'login' | 'register';

export default function AuthFlow() {
  const [currentScreen, setCurrentScreen] = useState<AuthScreen>('welcome');
  const { login, register } = useAuth();

  const handleLogin = async (email: string, password: string) => {
    return await login(email, password);
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
