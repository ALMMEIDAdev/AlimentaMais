import { collection, getDocs, query, where } from 'firebase/firestore';
import { useState } from 'react';
import { db } from '../firebaseConfig';

export function useCPFValidation() {
  const [isCheckingCPF, setIsCheckingCPF] = useState(false);

  // Formatar CPF com pontos e hífen
  const formatCPF = (cpf: string): string => {
    const numbers = cpf.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  // Extrair apenas números do CPF
  const getCPFNumbers = (cpf: string): string => {
    return cpf.replace(/\D/g, '');
  };

  // Validar CPF
  const validateCPF = (cpf: string): boolean => {
    const numbers = getCPFNumbers(cpf);
    
    if (numbers.length !== 11) return false;
    
    // Verificar se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(numbers)) return false;
    
    // Calcular primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(numbers[i]) * (10 - i);
    }
    let remainder = sum % 11;
    let firstDigit = remainder < 2 ? 0 : 11 - remainder;
    
    if (parseInt(numbers[9]) !== firstDigit) return false;
    
    // Calcular segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(numbers[i]) * (11 - i);
    }
    remainder = sum % 11;
    let secondDigit = remainder < 2 ? 0 : 11 - remainder;
    
    return parseInt(numbers[10]) === secondDigit;
  };

  // Validar CPF em tempo real
  const validateCPFRealTime = (cpf: string) => {
    const numbers = getCPFNumbers(cpf);
    
    if (numbers.length === 0) {
      return { isValid: false, message: 'Digite seu CPF' };
    }
    
    if (numbers.length < 11) {
      return { isValid: false, message: 'CPF incompleto' };
    }
    
    if (numbers.length === 11) {
      if (validateCPF(cpf)) {
        return { isValid: true, message: 'CPF válido' };
      } else {
        return { isValid: false, message: 'CPF inválido' };
      }
    }
    
    return { isValid: false, message: 'CPF muito longo' };
  };

  // Verificar se CPF já existe no banco
  const checkCPFExists = async (cpf: string): Promise<boolean> => {
    const numbers = getCPFNumbers(cpf);
    
    if (numbers.length !== 11) return false;
    
    setIsCheckingCPF(true);
    
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('cpf', '==', numbers));
      const querySnapshot = await getDocs(q);
      
      return !querySnapshot.empty;
    } catch (error) {
      console.error('Erro ao verificar CPF:', error);
      return false;
    } finally {
      setIsCheckingCPF(false);
    }
  };

  // Verificar se email já existe no banco
  const checkEmailExists = async (email: string): Promise<boolean> => {
    if (!email || !email.includes('@')) return false;
    
    setIsCheckingCPF(true);
    
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email.toLowerCase().trim()));
      const querySnapshot = await getDocs(q);
      
      return !querySnapshot.empty;
    } catch (error) {
      console.error('Erro ao verificar email:', error);
      return false;
    } finally {
      setIsCheckingCPF(false);
    }
  };

  return {
    formatCPF,
    validateCPF,
    validateCPFRealTime,
    checkCPFExists,
    checkEmailExists,
    getCPFNumbers,
    isCheckingCPF
  };
}
