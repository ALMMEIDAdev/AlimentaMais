import * as AuthSession from 'expo-auth-session';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { useState } from 'react';
import { GOOGLE_CONFIG } from '../config/googleConfig';
import { auth } from '../firebaseConfig';

export interface GoogleUserData {
  name: string;
  email: string;
  photo?: string;
  id: string;
}

export function useGoogleAuth() {
  const [isLoading, setIsLoading] = useState(false);

  // Fazer login com Google usando Expo Auth Session
  const signInWithGoogle = async (): Promise<GoogleUserData | null> => {
    setIsLoading(true);
    
    try {
      // Verificar se o clientId está configurado
      if (!GOOGLE_CONFIG.webClientId || GOOGLE_CONFIG.webClientId.includes('YOUR_')) {
        throw new Error('Google Client ID não configurado. Verifique o arquivo config/googleConfig.ts');
      }

      // Configurar o redirect URI
      const redirectUri = AuthSession.makeRedirectUri();

      console.log('Redirect URI:', redirectUri);

      // Configurar o request
      const request = new AuthSession.AuthRequest({
        clientId: GOOGLE_CONFIG.webClientId,
        scopes: ['openid', 'profile', 'email'],
        redirectUri,
        responseType: AuthSession.ResponseType.Code,
        extraParams: {},
        prompt: AuthSession.Prompt.SelectAccount,
      });

      // Fazer a requisição de autenticação
      const result = await request.promptAsync({
        authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      });

      console.log('Resultado da autenticação:', result.type);

      if (result.type === 'success') {
        // Trocar o código por um token
        const tokenResponse = await AuthSession.exchangeCodeAsync(
          {
            clientId: GOOGLE_CONFIG.webClientId,
            code: result.params.code,
            redirectUri,
            extraParams: {
              code_verifier: request.codeVerifier || '',
            },
          },
          {
            tokenEndpoint: 'https://oauth2.googleapis.com/token',
          }
        );

        console.log('Token recebido:', !!tokenResponse.accessToken);

        // Obter informações do usuário
        const userInfoResponse = await fetch(
          `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${tokenResponse.accessToken}`
        );
        
        if (!userInfoResponse.ok) {
          throw new Error(`Erro ao obter dados do usuário: ${userInfoResponse.status}`);
        }
        
        const userInfo = await userInfoResponse.json();
        console.log('Dados do usuário obtidos:', userInfo.email);

        // Criar credencial do Firebase
        const credential = GoogleAuthProvider.credential(tokenResponse.idToken);
        
        // Fazer login no Firebase
        const firebaseResult = await signInWithCredential(auth, credential);
        
        // Extrair dados do usuário
        const userData: GoogleUserData = {
          name: userInfo.name || firebaseResult.user.displayName || '',
          email: userInfo.email || firebaseResult.user.email || '',
          photo: userInfo.picture || firebaseResult.user.photoURL || undefined,
          id: firebaseResult.user.uid,
        };
        
        console.log('Login com Google realizado com sucesso:', userData);
        return userData;
      } else if (result.type === 'cancel') {
        console.log('Login cancelado pelo usuário');
        return null;
      } else {
        console.error('Erro na autenticação:', result);
        throw new Error('Erro na autenticação com Google');
      }
    } catch (error: any) {
      console.error('Erro no login com Google:', error);
      
      // Retornar erro mais específico
      if (error.message.includes('Client ID não configurado')) {
        throw new Error('Configuração do Google Auth incompleta. Verifique o arquivo de configuração.');
      } else if (error.message.includes('invalid_request')) {
        throw new Error('Configuração OAuth inválida. Verifique o Google Cloud Console.');
      } else {
        throw new Error(`Erro no login com Google: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fazer logout do Google
  const signOutGoogle = async () => {
    try {
      await auth.signOut();
      console.log('Logout do Google realizado');
    } catch (error) {
      console.error('Erro ao fazer logout do Google:', error);
    }
  };

  return {
    signInWithGoogle,
    signOutGoogle,
    isLoading
  };
}
