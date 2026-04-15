import { Resend } from "resend";
import fs from 'fs';
import path from 'path';

class EmailService {
  private resend: Resend;
  private fromEmail: string;
  private templatesPath: string;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
    this.fromEmail = process.env.FROM_EMAIL || 'no-reply@ztstelecomfzco.com';
    this.templatesPath = path.resolve(process.cwd(), "Templates");
  }

  async sendEmail(
    recipients: string | string[],
    subject: string,
    templateName: string,
    templateData?: Record<string, any>
  ) {
    try {
      // Ensure recipients is always an array
      const emails = Array.isArray(recipients) ? recipients : [recipients];

      const html = this.loadTemplate(templateName, templateData);

      const { data, error } = await this.resend.emails.send({
        from: this.fromEmail,
        to: emails,
        subject: subject,
        html: html,
      });

      if (error) {
        console.error('Email service error:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Email service error:', error);
      throw error;
    }
  }

  /**
   * Send magic link email for password reset
   */
  async sendMagicLink(email: string, token: string, url: string) {
    try {
      const userName = email.split('@')[0];
      const magicLinkUrl = url; // Better Auth provides the complete URL with token

      const result = await this.sendEmail(
        email,
        'Reset Your Password - LandStore.my',
        'magic-link',
        {
          userName,
          magicLinkUrl,
        }
      );

      return result;
    } catch (error) {
      console.error('Failed to send magic link email:', error);
      throw error;
    }
  }

  /**
   * Send email verification link during signup
   */
  async sendVerificationEmail(email: string, token: string, url: string) {
    try {
      const userName = email.split('@')[0];
      const verificationUrl = url;

      const result = await this.sendEmail(
        email,
        'Verify Your Email - LandStore.my',
        'email-verification',
        {
          userName,
          verificationUrl,
        }
      );

      return result;
    } catch (error) {
      console.error('Failed to send verification email:', error);
      throw error;
    }
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(email: string, userName: string) {
    try {
      return await this.sendEmail(
        email,
        'Welcome to LandStore.my',
        'welcome-email',
        {
          userName,
        }
      );
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      throw error;
    }
  }

  private loadTemplate(templateName: string, templateData?: Record<string, any>): string {
    const templatePath = path.join(this.templatesPath, `${templateName}.html`);
    let html = fs.readFileSync(templatePath, 'utf-8');

    if (templateData) {
      Object.keys(templateData).forEach((key) => {
        html = html.replace(new RegExp(`{{${key}}}`, 'g'), templateData[key]);
      });
    }

    return html;
  }
}

// Export singleton instance
export const emailService = new EmailService();
export default emailService;