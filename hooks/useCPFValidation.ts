import { collection, getDocs, query, where } from 'firebase/firestore';
import { useState } from 'react';
import { db } from '../firebaseConfig';

export const useCPFValidation = () => {
  const [isCheckingCPF, setIsCheckingCPF] = useState(false);


  const formatCPF = (text: string): string => {
    const numbers = text.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
    if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
  };

 
  const validateCPF = (cpf: string): boolean => {
    const numbers = cpf.replace(/\D/g, '');
    
  
    if (numbers.length !== 11) return false;
    
    if (/^(\d)\1{10}$/.test(numbers)) return false;
    
    
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(numbers[i]) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(numbers[9])) return false;
    
   
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(numbers[i]) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(numbers[10])) return false;
    
    return true;
  };

  
  const checkCPFExists = async (cpf: string): Promise<boolean> => {
    if (!validateCPF(cpf)) return false;
    
    setIsCheckingCPF(true);
    try {
      const cpfNumbers = cpf.replace(/\D/g, '');
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('cpf', '==', cpfNumbers));
      const querySnapshot = await getDocs(q);
      
      return !querySnapshot.empty;
    } catch (error) {
      console.error('Erro ao verificar CPF:', error);
      return false;
    } finally {
      setIsCheckingCPF(false);
    }
  };

 
  const getCPFNumbers = (cpf: string): string => {
    return cpf.replace(/\D/g, '');
  };


  const validateCPFRealTime = (cpf: string): {
    isValid: boolean;
    isFormatted: boolean;
    isComplete: boolean;
    message: string;
  } => {
    const numbers = cpf.replace(/\D/g, '');
    const formatted = cpf.includes('.') || cpf.includes('-');
    
    if (numbers.length === 0) {
      return {
        isValid: false,
        isFormatted: false,
        isComplete: false,
        message: 'Digite seu CPF'
      };
    }
    
    if (numbers.length < 11) {
      return {
        isValid: false,
        isFormatted: formatted,
        isComplete: false,
        message: `${numbers.length}/11 dígitos`
      };
    }
    
    if (numbers.length === 11) {
      const isValid = validateCPF(cpf);
      return {
        isValid,
        isFormatted: formatted,
        isComplete: true,
        message: isValid ? 'CPF válido' : 'CPF inválido'
      };
    }
    
    return {
      isValid: false,
      isFormatted: formatted,
      isComplete: false,
      message: 'CPF muito longo'
    };
  };

  return {
    formatCPF,
    validateCPF,
    checkCPFExists,
    getCPFNumbers,
    validateCPFRealTime,
    isCheckingCPF
  };
};
