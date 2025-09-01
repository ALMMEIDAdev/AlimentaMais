import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { MaterialIcons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

interface EmailVerificationScreenProps {
  email: string;
  onVerificationComplete: () => void;
  onBack: () => void;
}

export default function EmailVerificationScreen({ email, onVerificationComplete, onBack }: EmailVerificationScreenProps) {
  const theme = useColorScheme() ?? 'light';
  const colors = Colors[theme];
  const { sendVerificationEmail, verifyEmailWithToken } = useAuth();
  
  const [verificationToken, setVerificationToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [emailSent, setEmailSent] = useState(false);

  // Contador para reenvio de email
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Enviar email de verificação
  const handleSendVerificationEmail = useCallback(async () => {
    setIsResending(true);
    try {
      const success = await sendVerificationEmail(email);
      if (success) {
        setEmailSent(true);
        setCountdown(60); // 60 segundos de espera
        Alert.alert('Sucesso', 'Email de verificação enviado! Verifique sua caixa de entrada.');
      } else {
        Alert.alert('Erro', 'Erro ao enviar email de verificação. Tente novamente.');
      }
    } catch {
      Alert.alert('Erro', 'Erro ao enviar email de verificação. Tente novamente.');
    } finally {
      setIsResending(false);
    }
  }, [email, sendVerificationEmail]);

  // Verificar token de verificação
  const handleVerifyToken = async () => {
    if (!verificationToken.trim()) {
      Alert.alert('Erro', 'Por favor, insira o token de verificação.');
      return;
    }
    
    setIsLoading(true);
    try {
      const success = await verifyEmailWithToken(email, verificationToken);
      
      if (success) {
        Alert.alert('Sucesso', 'Email verificado com sucesso!', [
          {
            text: 'OK',
            onPress: onVerificationComplete
          }
        ]);
      } else {
        Alert.alert('Erro', 'Token inválido ou expirado. Verifique o token e tente novamente.');
      }
    } catch {
      Alert.alert('Erro', 'Erro ao verificar token. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Enviar email inicial ao montar o componente
  useEffect(() => {
    if (!emailSent) {
      handleSendVerificationEmail();
    }
  }, [emailSent, handleSendVerificationEmail]);

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
            →Verificação de Email
          </ThemedText>
          
          <View style={styles.iconContainer}>
            <View style={[styles.icon, { backgroundColor: colors.text }]}>
              <MaterialIcons name="email" size={40} color={colors.background} />
            </View>
          </View>
        </View>

        <View style={styles.content}>
          <ThemedText style={[styles.message, { color: colors.text }]}>
            Enviamos um email de verificação para:
          </ThemedText>
          
          <View style={[styles.emailContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <MaterialIcons name="email" size={20} color={colors.primary} />
            <ThemedText style={[styles.emailText, { color: colors.text }]}>
              {email}
            </ThemedText>
          </View>

          <View style={styles.instructions}>
            <ThemedText style={[styles.instructionText, { color: colors.textSecondary }]}>
              📧 Verifique sua caixa de entrada
            </ThemedText>
            <ThemedText style={[styles.instructionText, { color: colors.textSecondary }]}>
              🔑 Copie o token de verificação do email
            </ThemedText>
            <ThemedText style={[styles.instructionText, { color: colors.textSecondary }]}>
              ✅ Cole o token abaixo e confirme
            </ThemedText>
          </View>

          <View style={styles.tokenContainer}>
            <ThemedText style={[styles.tokenLabel, { color: colors.text }]}>
              Token de Verificação
            </ThemedText>
            <TextInput
              style={[styles.tokenInput, { borderColor: colors.primary, color: colors.text }]}
              placeholder="Cole aqui o token do email"
              placeholderTextColor={colors.text + '80'}
              value={verificationToken}
              onChangeText={setVerificationToken}
              autoCapitalize="none"
              autoComplete="off"
            />
          </View>

          <TouchableOpacity
            style={[styles.verifyButton, { backgroundColor: colors.primary }]}
            onPress={handleVerifyToken}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <ThemedText style={styles.verifyButtonText}>
                Verificar Token
              </ThemedText>
            )}
          </TouchableOpacity>

          <View style={styles.resendContainer}>
            <ThemedText style={[styles.resendText, { color: colors.text }]}>
              Não recebeu o email?
            </ThemedText>
            
            <TouchableOpacity
              onPress={handleSendVerificationEmail}
              disabled={countdown > 0 || isResending}
              style={styles.resendButton}
            >
              {isResending ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <ThemedText style={[styles.resendLink, { color: colors.primary }]}>
                  {countdown > 0 ? `Reenviar em ${countdown}s` : 'Reenviar email'}
                </ThemedText>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.tipsContainer}>
            <ThemedText style={[styles.tipsTitle, { color: colors.text }]}>
              💡 Dicas:
            </ThemedText>
            <ThemedText style={[styles.tipText, { color: colors.textSecondary }]}>
              • Verifique a pasta de spam/lixo eletrônico
            </ThemedText>
            <ThemedText style={[styles.tipText, { color: colors.textSecondary }]}>
              • Aguarde alguns minutos para o email chegar
            </ThemedText>
            <ThemedText style={[styles.tipText, { color: colors.textSecondary }]}>
              • Confirme se o email está correto
            </ThemedText>
          </View>
        </View>
      </ScrollView>
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
  content: {
    flex: 1,
    alignItems: 'center',
  },
  message: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 25,
    borderWidth: 2,
    marginBottom: 30,
    minWidth: 280,
  },
  emailText: {
    fontSize: 16,
    marginLeft: 10,
    fontWeight: '500',
  },
  instructions: {
    alignItems: 'center',
    marginBottom: 30,
  },
  instructionText: {
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  verifyButton: {
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    minWidth: 280,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  verifyButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  resendText: {
    fontSize: 16,
    marginBottom: 10,
  },
  resendButton: {
    padding: 10,
  },
  resendLink: {
    fontSize: 16,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  tipsContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  tipText: {
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  tokenContainer: {
    width: '100%',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  tokenLabel: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  tokenInput: {
    height: 50,
    borderWidth: 2,
    borderRadius: 25,
    paddingHorizontal: 20,
    fontSize: 16,
    textAlign: 'center',
  },
});
