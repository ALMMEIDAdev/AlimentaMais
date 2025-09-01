import AsyncStorage from '@react-native-async-storage/async-storage';
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../firebaseConfig';
import { GoogleUserData, useGoogleAuth } from '../hooks/useGoogleAuth';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<GoogleUserData | null>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { signInWithGoogle } = useGoogleAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userData = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || '',
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
      const userData = {
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || '',
      };
      setUser(userData);
      await AsyncStorage.setItem('@AlimentaMais:user', JSON.stringify(userData));
      return true;
    } catch (error) {
      console.log('Erro no login:', error);
      return false;
    }
  };

  const register = async (email: string, password: string): Promise<boolean> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      const userData = {
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || '',
      };
      setUser(userData);
      await AsyncStorage.setItem('@AlimentaMais:user', JSON.stringify(userData));
      return true;
    } catch (error) {
      console.log('Erro no registro:', error);
      return false;
    }
  };

  const loginWithGoogle = async (): Promise<GoogleUserData | null> => {
    try {
      const googleUserData = await signInWithGoogle();
      if (googleUserData) {
        const userData = {
          id: googleUserData.id,
          email: googleUserData.email,
          name: googleUserData.name,
        };
        setUser(userData);
        await AsyncStorage.setItem('@AlimentaMais:user', JSON.stringify(userData));
      }
      return googleUserData;
    } catch (error: any) {
      console.error('Erro no login com Google:', error);
      
      // Re-throw o erro para que possa ser tratado na UI
      throw error;
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

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, loginWithGoogle, logout }}>
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
