import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface LoginScreenProps {
  onLogin: (email: string, password: string) => Promise<boolean>;
  onBack: () => void;
  onRegister: () => void;
}

export default function LoginScreen({
  onLogin,
  onBack,
  onRegister,
}: LoginScreenProps) {
  const theme = useColorScheme() ?? "light";
  const colors = Colors[theme];
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Erro", "Por favor, preencha todos os campos");
      return;
    }

    setIsLoading(true);
    try {
      const success = await onLogin(email, password);
      if (success) {
        router.replace("/(tabs)");
      }
    } catch (error: any) {
      console.log('Erro capturado na tela de login:', error);
      console.log('Código do erro:', error.code);
      console.log('Mensagem do erro:', error.message);
      
      let message = "Erro ao fazer login. Tente novamente.";
      let title = "Erro";
      
      // Tratar erros específicos do Firebase
      if (error.code === "auth/user-not-found") {
        title = "Usuário Não Encontrado";
        message = "Não existe uma conta com este email. Verifique o email ou crie uma nova conta.";
      } else if (error.code === "auth/wrong-password") {
        title = "Senha Incorreta";
        message = "A senha informada está incorreta. Tente novamente.";
      } else if (error.code === "auth/invalid-credential") {
        title = "Credenciais Inválidas";
        message = "Email ou senha incorretos. Verifique suas credenciais e tente novamente.";
      } else if (error.code === "auth/invalid-email") {
        title = "Email Inválido";
        message = "O formato do email está incorreto. Verifique e tente novamente.";
      } else if (error.code === "auth/too-many-requests") {
        title = "Muitas Tentativas";
        message = "Muitas tentativas de login. Aguarde alguns minutos e tente novamente.";
      } else if (error.code === "auth/network-request-failed") {
        title = "Erro de Conexão";
        message = "Problema de conexão com a internet. Verifique sua conexão e tente novamente.";
      } else if (error.message === "EMAIL_NOT_VERIFIED") {
        title = "Email Não Verificado";
        message = "Seu email ainda não foi verificado. Verifique sua caixa de entrada, copie o token de verificação do email e complete a verificação antes de fazer login.";
      }
      
      Alert.alert(title, message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemedView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <MaterialIcons name="arrow-back" size={24} color={colors.text} />
      </TouchableOpacity>

      <View style={styles.header}>
        <ThemedText
          type="title"
          style={[styles.title, { color: colors.primary }]}
        >
          Alimenta<ThemedText style={{ color: colors.secondary }}>+</ThemedText>
        </ThemedText>

        <View style={styles.loginIconContainer}>
          <View style={[styles.loginIcon, { backgroundColor: colors.text }]}>
            <MaterialIcons name="person" size={40} color={colors.background} />
          </View>
        </View>

        <ThemedText
          type="subtitle"
          style={[styles.subtitle, { color: colors.primary }]}
        >
          →Login
        </ThemedText>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <ThemedText style={[styles.label, { color: colors.text }]}>
            Email
          </ThemedText>
          <TextInput
            style={[
              styles.input,
              { borderColor: colors.primary, color: colors.text },
            ]}
            placeholder="username@gmail.com"
            placeholderTextColor={colors.text + "80"}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
        </View>

        <View style={styles.inputContainer}>
          <ThemedText style={[styles.label, { color: colors.text }]}>
            Senha
          </ThemedText>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[
                styles.passwordInput,
                { borderColor: colors.primary, color: colors.text },
              ]}
              placeholder="••••••••••"
              placeholderTextColor={colors.text + "80"}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoComplete="password"
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

        <View style={styles.optionsRow}>
          <View style={styles.rememberContainer}>
            <ThemedText style={[styles.rememberText, { color: colors.text }]}>
              Manter Conectado
            </ThemedText>
          </View>
          <TouchableOpacity>
            <ThemedText style={[styles.forgotText, { color: colors.primary }]}>
              Esqueceu sua Senha?
            </ThemedText>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.loginButton, { backgroundColor: colors.primary }]}
          onPress={handleLogin}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <ThemedText style={styles.loginButtonText}>Entrar</ThemedText>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.helpButton}
          onPress={() => {
            Alert.alert(
              'Precisa de Ajuda?',
              '• Verificar email: Clique no link enviado para sua caixa de entrada\n• Esqueceu a senha: Use a opção "Esqueceu sua Senha?"\n• Problemas técnicos: Tente novamente em alguns instantes',
              [{ text: 'Entendi' }]
            );
          }}
        >
          <ThemedText style={[styles.helpButtonText, { color: colors.primary }]}>
            Precisa de ajuda?
          </ThemedText>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View
            style={[
              styles.dividerLine,
              { backgroundColor: colors.text + "40" },
            ]}
          />
          <ThemedText style={[styles.dividerText, { color: colors.text }]}>
            Entrar com:
          </ThemedText>
          <View
            style={[
              styles.dividerLine,
              { backgroundColor: colors.text + "40" },
            ]}
          />
        </View>

        <TouchableOpacity
          style={[styles.googleButton, { borderColor: colors.text + "40" }]}
        >
          <MaterialIcons name="g-translate" size={20} color="#4285F4" />
        </TouchableOpacity>

        <View style={styles.registerContainer}>
          <ThemedText style={[styles.registerText, { color: colors.text }]}>
            Novo Por Aqui?
          </ThemedText>
          <TouchableOpacity onPress={onRegister}>
            <ThemedText
              style={[styles.registerLink, { color: colors.primary }]}
            >
              Cadastre-se
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
    alignSelf: "flex-start",
  },
  header: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 20,
  },
  loginIconContainer: {
    marginBottom: 15,
  },
  loginIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "600",
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
    fontWeight: "500",
  },
  input: {
    height: 50,
    borderWidth: 2,
    borderRadius: 25,
    paddingHorizontal: 20,
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
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
    position: "absolute",
    right: 15,
    padding: 5,
  },
  optionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  rememberContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  rememberText: {
    fontSize: 14,
  },
  forgotText: {
    fontSize: 14,
    fontWeight: "500",
  },
  loginButton: {
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  loginButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  helpButton: {
    alignSelf: "center",
    marginBottom: 30,
  },
  helpButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    paddingHorizontal: 15,
    fontSize: 14,
  },
  googleButton: {
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  registerText: {
    fontSize: 16,
  },
  registerLink: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 5,
  },
});
