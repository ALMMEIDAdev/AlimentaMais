import { useState } from 'react';

interface CEPData {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

export function useCEPValidation() {
  const [isCheckingCEP, setIsCheckingCEP] = useState(false);
  const [cepData, setCepData] = useState<CEPData | null>(null);

  // Formatar CEP com hífen
  const formatCEP = (cep: string): string => {
    const numbers = cep.replace(/\D/g, '');
    return numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
  };

  // Extrair apenas números do CEP
  const getCEPNumbers = (cep: string): string => {
    return cep.replace(/\D/g, '');
  };

  // Validar formato do CEP
  const validateCEPFormat = (cep: string): boolean => {
    const numbers = getCEPNumbers(cep);
    return numbers.length === 8;
  };

  // Buscar CEP na API ViaCEP
  const fetchCEP = async (cep: string): Promise<CEPData | null> => {
    const numbers = getCEPNumbers(cep);
    
    if (numbers.length !== 8) return null;
    
    setIsCheckingCEP(true);
    
    try {
      const response = await fetch(`https://viacep.com.br/ws/${numbers}/json/`);
      const data: CEPData = await response.json();
      
      if (data.erro) {
        return null;
      }
      
      setCepData(data);
      return data;
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      return null;
    } finally {
      setIsCheckingCEP(false);
    }
  };

  // Buscar CEP automaticamente quando completo
  const autoFetchCEP = async (cep: string): Promise<CEPData | null> => {
    const numbers = getCEPNumbers(cep);
    
    if (numbers.length === 8) {
      return await fetchCEP(cep);
    }
    
    return null;
  };

  // Validar CEP em tempo real
  const validateCEPRealTime = (cep: string) => {
    const numbers = getCEPNumbers(cep);
    
    if (numbers.length === 0) {
      return { isValid: false, message: 'Digite seu CEP' };
    }
    
    if (numbers.length < 8) {
      return { isValid: false, message: 'CEP incompleto' };
    }
    
    if (numbers.length === 8) {
      return { isValid: true, message: 'CEP válido' };
    }
    
    return { isValid: false, message: 'CEP muito longo' };
  };

  // Gerar endereço completo a partir dos dados do CEP
  const generateFullAddress = (cepData: CEPData, complemento?: string): string => {
    const parts = [
      cepData.logradouro,
      complemento || '',
      cepData.bairro,
      cepData.localidade,
      cepData.uf
    ].filter(part => part.trim());
    
    return parts.join(', ');
  };

  return {
    formatCEP,
    validateCEPFormat,
    validateCEPRealTime,
    fetchCEP,
    autoFetchCEP,
    generateFullAddress,
    getCEPNumbers,
    isCheckingCEP,
    cepData
  };
}
