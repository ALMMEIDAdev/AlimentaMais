// Configuração do Google Sign-In
// IMPORTANTE: Configure corretamente no Firebase Console e Google Cloud Console

export const GOOGLE_CONFIG = {
  // Web Client ID do Firebase Console (verifique se está correto)
  webClientId: '484799326297-1vdlf2j0q7qia8cdjeurdf88ke544fh1.apps.googleusercontent.com',
  
  // Project ID do Firebase
  projectId: 'alimentamais-4bdf4',
  
  // Para desenvolvimento, você pode usar um ID temporário
  // Para produção, configure no Firebase Console
  iosClientId: '484799326297-1vdlf2j0q7qia8cdjeurdf88ke544fh1.apps.googleusercontent.com',
  androidClientId: '484799326297-1vdlf2j0q7qia8cdjeurdf88ke544fh1.apps.googleusercontent.com',
};

// Instruções para configurar:
// 1. Acesse https://console.firebase.google.com
// 2. Selecione seu projeto
// 3. Vá em Authentication > Sign-in method
// 4. Habilite o Google Sign-In
// 5. Copie o Web Client ID e cole aqui
