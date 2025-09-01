const functions = require('firebase-functions');
const nodemailer = require('nodemailer');
const admin = require('firebase-admin');

// Inicializar Firebase Admin
admin.initializeApp();

// Configuração do transporter de email
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: 'tokiin120@gmail.com', // Seu email
    pass: 'gvzm eddo qpfy eewt'  // Sua senha de app
  }
});

// Função para enviar email de verificação
exports.sendVerificationEmail = functions.https.onCall(async (data, context) => {
  try {
    const { email, token, userName } = data;
    
    // Validar dados
    if (!email || !token || !userName) {
      throw new functions.https.HttpsError('invalid-argument', 'Dados obrigatórios não fornecidos');
    }
    
    // Template HTML do email
    const emailHtml = `
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
    
    // Configurar email
    const mailOptions = {
      from: 'noreply@alimentamais.com',
      to: email,
      subject: '🔐 Verificação de Email - Alimenta+',
      html: emailHtml,
      text: `
Alimenta+ - Verificação de Email

Olá, ${userName}!

Obrigado por se cadastrar no Alimenta+! Para ativar sua conta, você precisa verificar seu endereço de email.

SEU TOKEN DE VERIFICAÇÃO:
${token}

COMO VERIFICAR SEU EMAIL:
1. Copie o token acima
2. Volte ao aplicativo Alimenta+
3. Cole o token no campo de verificação
4. Clique em "Verificar Token"

IMPORTANTE:
- Este token expira em 24 horas
- Use apenas uma vez
- Não compartilhe com ninguém

Se você não solicitou esta verificação, pode ignorar este email.

---
Este é um email automático, não responda.
© 2024 Alimenta+. Todos os direitos reservados.
      `
    };
    
    // Enviar email
    const result = await transporter.sendMail(mailOptions);
    
    console.log('Email enviado com sucesso:', result.messageId);
    
    return {
      success: true,
      messageId: result.messageId,
      message: 'Email de verificação enviado com sucesso!'
    };
    
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    throw new functions.https.HttpsError('internal', 'Erro ao enviar email de verificação');
  }
});


exports.sendWelcomeEmail = functions.https.onCall(async (data, context) => {
  try {
    const { email, userName } = data;
    
    
    if (!email || !userName) {
      throw new functions.https.HttpsError('invalid-argument', 'Dados obrigatórios não fornecidos');
    }
    
    
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bem-vindo ao Alimenta+</title>
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
            font-size: 32px;
            font-weight: bold;
            color: #2E7D32;
            margin-bottom: 10px;
          }
          .content {
            text-align: center;
          }
          .welcome-message {
            font-size: 24px;
            color: #2E7D32;
            margin-bottom: 20px;
          }
          .features {
            text-align: left;
            margin: 30px 0;
          }
          .feature {
            margin-bottom: 15px;
            padding: 10px;
            background-color: #f8f9fa;
            border-radius: 5px;
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
          </div>
          
          <div class="content">
            <div class="welcome-message">🎉 Bem-vindo, ${userName}!</div>
            <p>Sua conta foi verificada com sucesso! Agora você pode aproveitar todos os recursos do Alimenta+.</p>
            
            <div class="features">
              <h3>O que você pode fazer agora:</h3>
              <div class="feature">
                <strong>🍎 Registrar doações de alimentos</strong><br>
                Ajude a combater o desperdício alimentar
              </div>
              <div class="feature">
                <strong>📊 Acompanhar estatísticas</strong><br>
                Veja o impacto das suas doações
              </div>
              <div class="feature">
                <strong>🤝 Conectar com a comunidade</strong><br>
                Faça parte de uma rede de doadores
              </div>
            </div>
            
            <p>Obrigado por fazer parte desta missão de alimentar mais pessoas!</p>
          </div>
          
          <div class="footer">
            <p>© 2024 Alimenta+. Todos os direitos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    // Configurar email
    const mailOptions = {
      from: 'noreply@alimentamais.com',
      to: email,
      subject: '🎉 Bem-vindo ao Alimenta+!',
      html: emailHtml,
      text: `
Alimenta+ - Bem-vindo!

🎉 Bem-vindo, ${userName}!

Sua conta foi verificada com sucesso! Agora você pode aproveitar todos os recursos do Alimenta+.

O QUE VOCÊ PODE FAZER AGORA:

🍎 Registrar doações de alimentos
   Ajude a combater o desperdício alimentar

📊 Acompanhar estatísticas
   Veja o impacto das suas doações

🤝 Conectar com a comunidade
   Faça parte de uma rede de doadores

Obrigado por fazer parte desta missão de alimentar mais pessoas!

---
© 2024 Alimenta+. Todos os direitos reservados.
      `
    };
    
    // Enviar email
    const result = await transporter.sendMail(mailOptions);
    
    console.log('Email de boas-vindas enviado:', result.messageId);
    
    return {
      success: true,
      messageId: result.messageId,
      message: 'Email de boas-vindas enviado com sucesso!'
    };
    
  } catch (error) {
    console.error('Erro ao enviar email de boas-vindas:', error);
    throw new functions.https.HttpsError('internal', 'Erro ao enviar email de boas-vindas');
  }
});
