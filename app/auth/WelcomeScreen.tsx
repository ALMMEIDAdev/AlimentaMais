import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface WelcomeScreenProps {
  onLogin: () => void;
  onRegister: () => void;
}

export default function WelcomeScreen({ onLogin, onRegister }: WelcomeScreenProps) {
  const theme = useColorScheme() ?? 'light';
  const colors = Colors[theme];

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <ThemedText type="title" style={[styles.title, { color: colors.primary }]}>
          Alimenta<ThemedText style={{ color: colors.secondary }}>+</ThemedText>
        </ThemedText>
        <ThemedText style={[styles.subtitle, { color: colors.text }]}>
          Participe da maior loja da loja solidária da rede que transforme alimentos excedentes em esperança.
        </ThemedText>
      </View>

      <View style={styles.imageContainer}>
        {/* Imagem placeholder preta conforme solicitado */}
        <View style={styles.placeholderImage}>
          <ThemedText style={{ color: 'white', textAlign: 'center' }}>
            🍽️
          </ThemedText>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.loginButton, { backgroundColor: colors.primary }]}
          onPress={onLogin}
          activeOpacity={0.8}
        >
          <ThemedText style={[styles.buttonText, { color: 'white' }]}>
            Entrar
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.registerButton, { borderColor: colors.primary }]}
          onPress={onRegister}
          activeOpacity={0.8}
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
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.8,
    paddingHorizontal: 20,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  placeholderImage: {
    width: 200,
    height: 200,
    backgroundColor: '#000',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    gap: 16,
  },
  button: {
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButton: {
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  registerButton: {
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
  },
});
