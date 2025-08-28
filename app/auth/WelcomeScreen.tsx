import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import React, { useCallback, useMemo } from 'react';
import {
  Dimensions,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';

interface WelcomeScreenProps {
  onLogin: () => void;
  onRegister: () => void;
}

const { width: screenWidth } = Dimensions.get('window');

export default function WelcomeScreen({ onLogin, onRegister }: WelcomeScreenProps) {
  const theme = useColorScheme() ?? 'light';
  const colors = Colors[theme];

  
  const containerStyle = useMemo(() => [
    styles.container, 
    { backgroundColor: colors.background }
  ], [colors.background]);

  const titleStyle = useMemo(() => [
    styles.title, 
    { color: colors.primary }
  ], [colors.primary]);

  const subtitleStyle = useMemo(() => [
    styles.subtitle, 
    { color: colors.text }
  ], [colors.text]);

  const loginButtonStyle = useMemo(() => [
    styles.button, 
    styles.loginButton, 
    { backgroundColor: colors.primary }
  ], [colors.primary]);

  const registerButtonStyle = useMemo(() => [
    styles.button, 
    styles.registerButton, 
    { borderColor: colors.primary }
  ], [colors.primary]);

  
  const handleLogin = useCallback(() => {
    onLogin();
  }, [onLogin]);

  const handleRegister = useCallback(() => {
    onRegister();
  }, [onRegister]);

 
  const accessibilityHint = Platform.select({
    ios: 'Toque duas vezes para ativar',
    android: 'Toque para ativar',
    default: 'Toque para ativar'
  });

 
  if (!onLogin || !onRegister) {
    console.warn('WelcomeScreen: onLogin and onRegister props are required');
    return null;
  }

  return (
    <ThemedView style={containerStyle}>
      <View style={styles.header}>
        <ThemedText 
          type="title" 
          style={titleStyle}
          accessible={true}
          accessibilityRole="header"
          accessibilityLabel="Título do aplicativo Alimenta Mais"
        >
          Alimenta<ThemedText style={{ color: colors.secondary }}>+</ThemedText>
        </ThemedText>
        <ThemedText 
          style={subtitleStyle}
          accessible={true}
          accessibilityRole="text"
          accessibilityLabel="Descrição do aplicativo"
        >
          Participe da maior loja solidária da rede que transforma alimentos excedentes em esperança.
        </ThemedText>
      </View>

      <View style={styles.imageContainer}>
        <View 
          style={styles.placeholderImage}
          accessible={true}
          accessibilityRole="image"
          accessibilityLabel="Ícone de prato de comida"
        >
          <ThemedText style={styles.emojiText}>
            🍽️
          </ThemedText>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={loginButtonStyle}
          onPress={handleLogin}
          activeOpacity={0.8}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Botão para fazer login"
          accessibilityHint={accessibilityHint}
          accessibilityState={{ disabled: false }}
        >
          <ThemedText style={[styles.buttonText, { color: 'white' }]}>
            Entrar
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={registerButtonStyle}
          onPress={handleRegister}
          activeOpacity={0.8}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Botão para se cadastrar"
          accessibilityHint={accessibilityHint}
          accessibilityState={{ disabled: false }}
        >
          <ThemedText style={[styles.buttonText, { color: colors.primary }]}>
            Cadastre-se
          </ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Math.max(20, screenWidth * 0.05), 
    justifyContent: 'space-between',
    paddingVertical: 30,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
    flex: 1,
    justifyContent: 'center',
  },
  title: {
  fontSize: Math.max(32, screenWidth * 0.08), 
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Math.max(16, screenWidth * 0.04), 
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.8,
    paddingHorizontal: 20,
    maxWidth: screenWidth * 0.8, 
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 60,
    paddingVertical: 20,
  },
  placeholderImage: {
    width: Math.min(180, screenWidth * 0.45), 
    height: Math.min(180, screenWidth * 0.45), 
    backgroundColor: '#000',
    borderRadius: Math.min(90, screenWidth * 0.225), 
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    marginVertical: 10,
  },
  emojiText: {
    color: 'white', 
    textAlign: 'center',
    fontSize: Math.min(50, screenWidth * 0.12), 
  },
  buttonContainer: {
    gap: 16,
    paddingHorizontal: 10,
    paddingBottom: 20,
    marginTop: 'auto',
  },
  button: {
    height: 56, 
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 44, 
  },
  loginButton: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  registerButton: {
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});
