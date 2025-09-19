import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { createTransport, Transporter, SendMailOptions } from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private transporter: Transporter;

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    // CORRECTION: Utiliser les clés correctes pour les variables d'environnement
    const emailUser = this.configService.get('MAIL_USER') || process.env.MAIL_USER;
    const emailPass = this.configService.get('MAIL_PASS') || process.env.MAIL_PASS;
    const mailHost = this.configService.get('MAIL_HOST') || process.env.MAIL_HOST || 'smtp.gmail.com';
    const mailPort = parseInt(this.configService.get('MAIL_PORT') || process.env.MAIL_PORT || '587');

    console.log('Email configuration:');
    console.log('- Host:', mailHost);
    console.log('- Port:', mailPort);
    console.log('- User:', emailUser ? emailUser.substring(0, 3) + '***@***' : 'NOT_SET');
    console.log('- Pass:', emailPass ? '***SET***' : 'NOT_SET');

    if (!emailUser || !emailPass) {
      console.warn('⚠️  Mail credentials not found. Email functionality will be limited.');
      // Créer un transporteur de test pour le développement
      this.transporter = createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: 'ethereal.user@ethereal.email',
          pass: 'ethereal.pass'
        }
      });
      return;
    }

    this.transporter = createTransport({
      host: mailHost,
      port: mailPort,
      secure: mailPort === 465, // true pour 465, false pour les autres ports
      auth: {
        user: emailUser,
        pass: emailPass, // Utilisez un mot de passe d'application Gmail
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Vérifier la connexion
    this.verifyConnection();
  }

  private async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log('✅ Mail transporter is ready');
    } catch (error) {
      console.error('❌ Mail transporter verification failed:', error.message);
    }
  }

  async sendPasswordResetEmail(to: string, otp: string): Promise<string> {
    try {
      const mailOptions: SendMailOptions = {
        from: process.env.MAIL_FROM || 'Service Security <noreply@yourapp.com>',
        to: to,
        subject: 'Password Reset Request',
        html: this.getPasswordResetTemplate(otp),
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully:', info.messageId);
      
      // Pour le développement avec Ethereal Email
      if (process.env.NODE_ENV === 'development') {
        console.log('Preview URL: %s', require('nodemailer').getTestMessageUrl(info));
      }
      
      return otp;
    } catch (error) {
      console.error('❌ Error sending email:', error);
      throw new InternalServerErrorException('Failed to send password reset email');
    }
  }

  private getPasswordResetTemplate(otp: string): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>OTP for Password Reset</title>
          <style>
              body {
                  font-family: 'Roboto', sans-serif;
                  margin: 0;
                  padding: 0;
                  background-color: #0a0a0a;
                  color: #ffffff;
              }
              .container {
                  max-width: 600px;
                  margin: 40px auto;
                  background: linear-gradient(145deg, #001f3f, #000000);
                  padding: 24px;
                  border-radius: 16px;
                  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.8);
                  border: 1px solid #1f1f1f;
              }
              .header {
                  text-align: center;
                  padding: 16px 0;
                  background: linear-gradient(to right, #007bff, #0056b3);
                  color: #ffffff;
                  border-radius: 12px 12px 0 0;
              }
              .header h1 {
                  margin: 0;
                  font-size: 26px;
                  font-weight: 700;
                  letter-spacing: 1px;
              }
              .content {
                  text-align: center;
                  padding: 20px;
              }
              .content p {
                  font-size: 16px;
                  line-height: 1.6;
                  margin: 16px 0;
                  color: #d1d1d1;
              }
              .otp {
                  font-size: 32px;
                  font-weight: bold;
                  color: #00ffcc;
                  margin: 20px 0;
                  background: linear-gradient(90deg, #00ffcc, #007bff);
                  -webkit-background-clip: text;
                  -webkit-text-fill-color: transparent;
                  letter-spacing: 3px;
                  padding: 15px;
                  border: 2px solid #00ffcc;
                  border-radius: 8px;
                  display: inline-block;
              }
              .footer {
                  text-align: center;
                  font-size: 14px;
                  color: #808080;
                  margin-top: 20px;
              }
              .footer a {
                  color: #00ffcc;
                  text-decoration: none;
                  font-weight: bold;
              }
              .footer a:hover {
                  text-decoration: underline;
              }
              .sports-tagline {
                  margin-top: 16px;
                  font-size: 14px;
                  color: #00ffcc;
                  font-style: italic;
                  letter-spacing: 0.5px;
              }
              .warning {
                  background-color: #ff4444;
                  color: white;
                  padding: 10px;
                  border-radius: 5px;
                  margin: 15px 0;
                  font-size: 14px;
              }
              @media (max-width: 768px) {
                  .container {
                      margin: 20px;
                      padding: 16px;
                  }
                  .header h1 {
                      font-size: 22px;
                  }
                  .content p {
                      font-size: 14px;
                  }
                  .otp {
                      font-size: 28px;
                  }
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>Password Reset</h1>
              </div>
              <div class="content">
                  <p>We've received your request to reset the password for your account. Use the OTP below:</p>
                  <div class="otp">${otp}</div>
                  <div class="warning">
                      ⚠️ This OTP will expire in 1 hour for security reasons.
                  </div>
                  <p>If you didn't make this request, please ignore this email or contact support immediately.</p>
              </div>
              <div class="footer">
                  <p>Need help? <a href="mailto:support@yourapp.com">Contact Support</a></p>
                  <p>&copy; 2025 Your App Inc. All rights reserved.</p>
                  <div class="sports-tagline">"Secure. Reliable. Trusted."</div>
              </div>
          </div>
      </body>
      </html>
    `;
  }

  // Méthode pour tester l'envoi d'email
  async testEmailConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('Email connection test failed:', error);
      return false;
    }
  }
}