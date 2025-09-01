// Configuração de Email para React Native
// Para produção, integre com Firebase Functions ou API externa

export const emailConfig = {
  // Configurações básicas
  from: 'noreply@alimentamais.com',
  
  // Modo de desenvolvimento (simula envio de emails)
  isDevelopment: true,
  
  // Para produção, configure com seu provedor de email
  production: {
    // Exemplo com SendGrid
    apiKey: process.env.SENDGRID_API_KEY || 'sua-api-key',
    endpoint: 'https://api.sendgrid.com/v3/mail/send',
    
    // Exemplo com Firebase Functions
    firebaseFunction: 'https://your-region-your-project.cloudfunctions.net/sendEmail',
  }
};

// Instruções para produção:
/*
OPÇÃO 1 - Firebase Functions (Recomendado):
1. Crie uma Cloud Function que envia emails
2. Use nodemailer na função (não no app)
3. Chame a função do React Native

OPÇÃO 2 - SendGrid:
1. Cadastre-se em https://sendgrid.com/
2. Gere uma API Key
3. Use fetch() para enviar emails

OPÇÃO 3 - AWS SES:
1. Configure AWS SES
2. Crie uma API REST
3. Integre com o app

OPÇÃO 4 - Serviço Próprio:
1. Crie um backend (Node.js, Python, etc.)
2. Integre com provedor de email
3. Exponha API REST
*/
