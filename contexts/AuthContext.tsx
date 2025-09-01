import AsyncStorage from '@react-native-async-storage/async-storage';
import { createUserWithEmailAndPassword, onAuthStateChanged, reload, sendEmailVerification, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebaseConfig';
import { EmailService } from '../services/emailService';

interface User {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkEmailVerification: () => Promise<boolean>;
  sendVerificationEmail: (email: string) => Promise<boolean>;
  verifyEmailWithToken: (email: string, token: string) => Promise<boolean>;
  generateVerificationToken: (email: string) => Promise<string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {

        await reload(firebaseUser);
        
        const userData = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || '',
          emailVerified: firebaseUser.emailVerified,
        };
        setUser(userData);
        await AsyncStorage.setItem('@AlimentaMais:user', JSON.stringify(userData));
      } else {
        setUser(null);
        await AsyncStorage.removeItem('@AlimentaMais:user');
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Verificar se o email foi verificado
      if (!firebaseUser.emailVerified) {
        // Fazer logout do usuário não verificado
        await signOut(auth);
        throw new Error('EMAIL_NOT_VERIFIED');
      }
      
      const userData = {
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || '',
        emailVerified: firebaseUser.emailVerified,
      };
      setUser(userData);
      await AsyncStorage.setItem('@AlimentaMais:user', JSON.stringify(userData));
      return true;
    } catch (error: any) {
      console.log('Erro no login:', error);
      
      // Propagar erros específicos do Firebase
      if (error.code === 'auth/user-not-found' || 
          error.code === 'auth/wrong-password' ||
          error.code === 'auth/invalid-credential' ||
          error.code === 'auth/invalid-email' ||
          error.code === 'auth/too-many-requests' ||
          error.code === 'auth/network-request-failed') {
        throw error; // Propagar o erro original do Firebase
      }
      
      if (error.message === 'EMAIL_NOT_VERIFIED') {
        throw error; // Propagar erro de email não verificado
      }
      
      // Para outros erros, lançar um erro genérico
      throw new Error('Erro desconhecido durante o login');
    }
  };

  const register = async (email: string, password: string): Promise<boolean> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Gerar token único para verificação
      await generateVerificationToken(email);
      
      // Enviar email de verificação com token
      await sendEmailVerification(firebaseUser);
      
      return true;
    } catch (error) {
      console.log('Erro no registro:', error);
      return false;
    }
  };

  const checkEmailVerification = async (): Promise<boolean> => {
    try {
      if (auth.currentUser) {
        await reload(auth.currentUser);
        return auth.currentUser.emailVerified;
      }
      return false;
    } catch (error) {
      console.log('Erro ao verificar email:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      await AsyncStorage.removeItem('@AlimentaMais:user');
      setUser(null);
    } catch (error) {
      console.log('Erro no logout:', error);
    }
  };

  // Gerar token único para verificação de email
  const generateVerificationToken = async (email: string): Promise<string> => {
    try {
      // Gerar token único de 32 caracteres
      const token = Math.random().toString(36).substring(2, 15) + 
                   Math.random().toString(36).substring(2, 15) + 
                   Date.now().toString(36);
      
      // Salvar token no Firestore com expiração de 24 horas
      const tokenData = {
        email: email,
        token: token,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
        used: false
      };
      
      await setDoc(doc(db, 'verification_tokens', token), tokenData);
      
      return token;
    } catch (error) {
      console.log('Erro ao gerar token:', error);
      throw new Error('Erro ao gerar token de verificação');
    }
  };

  // Verificar email com token
  const verifyEmailWithToken = async (email: string, token: string): Promise<boolean> => {
    try {
      // Buscar token no Firestore
      const tokenDoc = await getDoc(doc(db, 'verification_tokens', token));
      
      if (!tokenDoc.exists()) {
        throw new Error('Token inválido');
      }
      
      const tokenData = tokenDoc.data();
      
      // Verificar se o token é válido
      if (tokenData.email !== email) {
        throw new Error('Token não corresponde ao email');
      }
      
      if (tokenData.used) {
        throw new Error('Token já foi utilizado');
      }
      
      if (new Date() > tokenData.expiresAt.toDate()) {
        throw new Error('Token expirado');
      }
      
      // Marcar token como usado
      await updateDoc(doc(db, 'verification_tokens', token), {
        used: true,
        usedAt: new Date()
      });
      
      // Atualizar status de verificação do usuário no Firestore
      const userQuery = query(collection(db, 'users'), where('email', '==', email));
      const userSnapshot = await getDocs(userQuery);
      
      if (!userSnapshot.empty) {
        const userDoc = userSnapshot.docs[0];
        const userData = userDoc.data();
        
        await updateDoc(doc(db, 'users', userDoc.id), {
          emailVerified: true,
          verifiedAt: new Date()
        });
        
        // Enviar email de boas-vindas
        await EmailService.sendWelcomeEmail(email, userData.name || email.split('@')[0]);
      }
      
      return true;
    } catch (error) {
      console.log('Erro ao verificar token:', error);
      return false;
    }
  };

  // Enviar email de verificação
  const sendVerificationEmail = async (email: string): Promise<boolean> => {
    try {
      // Buscar usuário pelo email
      const userQuery = query(collection(db, 'users'), where('email', '==', email));
      const userSnapshot = await getDocs(userQuery);
      
      if (userSnapshot.empty) {
        throw new Error('Usuário não encontrado');
      }
      
      const userData = userSnapshot.docs[0].data();
      
      // Gerar novo token
      const token = await generateVerificationToken(email);
      
      // Enviar email usando o serviço de email
      const emailSent = await EmailService.sendVerificationEmail({
        email: email,
        token: token,
        userName: userData.name || email.split('@')[0]
      });
      
      if (emailSent) {
        console.log(`Email de verificação enviado para ${email} com token: ${token}`);
        return true;
      } else {
        throw new Error('Falha ao enviar email');
      }
    } catch (error) {
      console.log('Erro ao enviar email:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      login, 
      register, 
      logout, 
      checkEmailVerification,
      sendVerificationEmail,
      verifyEmailWithToken,
      generateVerificationToken
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
