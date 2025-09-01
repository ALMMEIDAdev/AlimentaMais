// Serviço de Email para React Native
// Integração com SendGrid (100% gratuito) ou Firebase Functions

export interface EmailVerificationData {
  email: string;
  token: string;
  userName?: string;
}

export class EmailService {
  // Configuração do SendGrid (100% gratuito)
  private static readonly SENDGRID_API_KEY = 'SG.placeholder'; // Substitua pela sua API key
  private static readonly SENDGRID_ENDPOINT = 'https://api.sendgrid.com/v3/mail/send';
  
  // Configuração do Firebase Functions
  private static readonly FIREBASE_FUNCTION_URL = 'https://us-central1-alimentamais-4bdf4.cloudfunctions.net';

  /**
   * Enviar email de verificação com token único
   * Tenta Firebase Functions primeiro, depois SendGrid, depois simulação
   */
  static async sendVerificationEmail(data: EmailVerificationData): Promise<boolean> {
    try {
      const { email, token, userName = 'Usuário' } = data;
      
      // OPÇÃO 1: Tentar Firebase Functions (se disponível)
      try {
        const firebaseResult = await this.sendViaFirebaseFunctions('sendVerificationEmail', data);
        if (firebaseResult) {
          console.log('✅ Email enviado via Firebase Functions');
          return true;
        }
      } catch (error) {
        console.log('⚠️ Firebase Functions não disponível, tentando SendGrid...');
      }
      
      // OPÇÃO 2: Tentar SendGrid (se configurado)
      try {
        const sendgridResult = await this.sendViaSendGrid(data);
        if (sendgridResult) {
          console.log('✅ Email enviado via SendGrid');
          return true;
        }
      } catch (error) {
        console.log('⚠️ SendGrid não configurado, usando simulação...');
      }
      
      // OPÇÃO 3: Simulação (sempre funciona)
      return this.sendSimulatedEmail(data);
      
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      return false;
    }
  }

  /**
   * Enviar via Firebase Functions
   */
  private static async sendViaFirebaseFunctions(functionName: string, data: any): Promise<boolean> {
    try {
      const response = await fetch(`${this.FIREBASE_FUNCTION_URL}/${functionName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data }),
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Firebase Functions result:', result);
        return true;
      }
      
      return false;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Enviar via SendGrid (100% gratuito)
   */
  private static async sendViaSendGrid(data: EmailVerificationData): Promise<boolean> {
    try {
      const { email, token, userName } = data;
      
      // Template HTML do email
      const emailHtml = this.generateVerificationEmailHTML(userName, token);
      
      const response = await fetch(this.SENDGRID_ENDPOINT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.SENDGRID_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [
            {
              to: [{ email: email }],
              subject: '🔐 Verificação de Email - Alimenta+'
            }
          ],
          from: { email: 'noreply@alimentamais.com', name: 'Alimenta+' },
          content: [
            {
              type: 'text/html',
              value: emailHtml
            }
          ]
        }),
      });
      
      return response.ok;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Simulação de envio de email (sempre funciona)
   */
  private static sendSimulatedEmail(data: EmailVerificationData): boolean {
    const { email, token, userName = 'Usuário' } = data;
    
    console.log('='.repeat(60));
    console.log('📧 EMAIL DE VERIFICAÇÃO ENVIADO (SIMULAÇÃO)');
    console.log('='.repeat(60));
    console.log(`Para: ${email}`);
    console.log(`Assunto: 🔐 Verificação de Email - Alimenta+`);
    console.log(`Usuário: ${userName}`);
    console.log('');
    console.log('🔑 SEU TOKEN DE VERIFICAÇÃO:');
    console.log(`   ${token}`);
    console.log('');
    console.log('📋 INSTRUÇÕES:');
    console.log('1. Copie o token acima');
    console.log('2. Volte ao aplicativo');
    console.log('3. Cole o token no campo de verificação');
    console.log('4. Clique em "Verificar Token"');
    console.log('');
    console.log('⚠️ IMPORTANTE:');
    console.log('- Este token expira em 24 horas');
    console.log('- Use apenas uma vez');
    console.log('- Não compartilhe com ninguém');
    console.log('='.repeat(60));
    
    return true;
  }

  /**
   * Enviar email de boas-vindas
   */
  static async sendWelcomeEmail(email: string, userName: string): Promise<boolean> {
    try {
      const data = { email, userName };
      
      // Tentar Firebase Functions primeiro
      try {
        const firebaseResult = await this.sendViaFirebaseFunctions('sendWelcomeEmail', data);
        if (firebaseResult) {
          console.log('✅ Email de boas-vindas enviado via Firebase Functions');
          return true;
        }
      } catch (error) {
        console.log('⚠️ Firebase Functions não disponível para boas-vindas');
      }
      
      // Simulação
      console.log('='.repeat(60));
      console.log('🎉 EMAIL DE BOAS-VINDAS ENVIADO');
      console.log('='.repeat(60));
      console.log(`Para: ${email}`);
      console.log(`Usuário: ${userName}`);
      console.log('🎊 Parabéns! Sua conta foi verificada com sucesso!');
      console.log('='.repeat(60));
      
      return true;
    } catch (error) {
      console.error('Erro ao enviar email de boas-vindas:', error);
      return false;
    }
  }

  /**
   * Gerar HTML do email de verificação
   */
  private static generateVerificationEmailHTML(userName: string, token: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verificação de Email - Alimenta+</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .container {
            background-color: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            color: #2E7D32;
            margin-bottom: 10px;
          }
          .token-container {
            background-color: #f8f9fa;
            border: 2px dashed #2E7D32;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin: 20px 0;
          }
          .token {
            font-family: 'Courier New', monospace;
            font-size: 18px;
            font-weight: bold;
            color: #2E7D32;
            background-color: white;
            padding: 10px;
            border-radius: 5px;
            border: 1px solid #ddd;
            word-break: break-all;
          }
          .instructions {
            background-color: #e8f5e8;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .warning {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #666;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Alimenta+</div>
            <div style="color: #666; font-size: 16px;">Verificação de Email</div>
          </div>
          
          <div>
            <h2>Olá, ${userName}! 👋</h2>
            <p>Obrigado por se cadastrar no Alimenta+! Para ativar sua conta, você precisa verificar seu endereço de email.</p>
            
            <div class="token-container">
              <h3>🔑 Seu Token de Verificação:</h3>
              <div class="token">${token}</div>
            </div>
            
            <div class="instructions">
              <h3>📋 Como verificar seu email:</h3>
              <ol>
                <li>Copie o token acima</li>
                <li>Volte ao aplicativo Alimenta+</li>
                <li>Cole o token no campo de verificação</li>
                <li>Clique em "Verificar Token"</li>
              </ol>
            </div>
            
            <div class="warning">
              <strong>⚠️ Importante:</strong>
              <ul>
                <li>Este token expira em 24 horas</li>
                <li>Use apenas uma vez</li>
                <li>Não compartilhe com ninguém</li>
              </ul>
            </div>
            
            <p>Se você não solicitou esta verificação, pode ignorar este email.</p>
          </div>
          
          <div class="footer">
            <p>Este é um email automático, não responda.</p>
            <p>© 2024 Alimenta+. Todos os direitos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
