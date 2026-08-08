/**
 * SeramikBak Email Utility
 * Supports Resend API or SMTP (Gmail/Nodemailer)
 */
import nodemailer from 'nodemailer';

export async function sendPasswordResetEmail({ toEmail, userName, resetLink }) {
  const subject = 'SeramikBak - Şifre Sıfırlama Talebiniz';
  
  const htmlBody = `
    <!DOCTYPE html>
    <html lang="tr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Şifre Sıfırlama Talebi</title>
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 0; }
        .container { max-width: 580px; margin: 30px auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
        .header { background: #0f172a; padding: 24px 32px; text-align: center; color: #ffffff; }
        .logo-badge { display: inline-block; background: #b38e47; color: #ffffff; width: 40px; height: 40px; line-height: 40px; border-radius: 10px; font-weight: 900; font-size: 18px; margin-bottom: 8px; }
        .title { margin: 0; font-size: 20px; font-weight: 800; color: #ffffff; }
        .content { padding: 32px; font-size: 15px; line-height: 1.6; color: #334155; }
        .button-wrapper { text-align: center; margin: 28px 0; }
        .reset-btn { display: inline-block; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #ffffff !important; padding: 14px 28px; border-radius: 10px; font-weight: 700; text-decoration: none; font-size: 15px; box-shadow: 0 4px 12px rgba(15,23,42,0.2); }
        .link-box { background: #f1f5f9; padding: 12px; border-radius: 8px; font-size: 12px; word-break: break-all; color: #64748b; margin-top: 20px; }
        .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; }
        .warning { background: #fffbebfb; border: 1px solid #fde68a; color: #92400e; padding: 12px 16px; border-radius: 8px; font-size: 13px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo-badge">SB</div>
          <h1 class="title">SeramikBak Türkiye</h1>
        </div>
        <div class="content">
          <p>Merhaba <strong>${userName || 'Değerli Kullanıcımız'}</strong>,</p>
          <p>Hesabınız için bir şifre sıfırlama talebi aldık. Yeni şifrenizi güvenli bir şekilde belirlemek için aşağıdaki butona tıklayın:</p>
          
          <div class="button-wrapper">
            <a href="${resetLink}" target="_blank" class="reset-btn">Şifremi Yenile</a>
          </div>

          <div class="warning">
            ⚠️ Bu şifre sıfırlama bağlantısı <strong>15 dakika</strong> boyunca geçerlidir. Eğer şifre sıfırlama talebinde bulunmadıysanız bu e-postayı dikkate almayın. Hesabınız güvendedir.
          </div>

          <p style="margin-top: 24px; font-size: 13px; color: #64748b;">Buton çalışmıyorsa aşağıdaki bağlantıyı kopyalayıp tarayıcınıza yapıştırabilirsiniz:</p>
          <div class="link-box">${resetLink}</div>
        </div>
        <div class="footer">
          © 2026 SeramikBak. Tüm hakları saklıdır.<br>
          Bu otomatik bir e-postadır, lütfen yanıtlamayınız.
        </div>
      </div>
    </body>
    </html>
  `;

  // Option 1: SMTP / Nodemailer (Gmail / Custom Mail Server)
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  if (smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: smtpUser,
          pass: smtpPass
        }
      });

      const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM || `"SeramikBak" <${smtpUser}>`,
        to: toEmail,
        subject: subject,
        html: htmlBody
      });

      return { success: true, messageId: info.messageId };
    } catch (err) {
      console.error('Failed to send email via SMTP:', err);
    }
  }

  // Option 2: Resend API
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resendApiKey}`
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || 'SeramikBak <onboarding@resend.dev>',
          to: [toEmail],
          subject: subject,
          html: htmlBody
        })
      });
      const data = await res.json();
      if (res.ok) {
        return { success: true, messageId: data.id };
      } else {
        console.error('Resend email API error:', data);
        return { 
          success: false, 
          error: data.message || 'Resend mail gönderimi başarısız oldu.',
          resendError: data 
        };
      }
    } catch (err) {
      console.error('Failed to send email via Resend API:', err);
    }
  }

  // Development Fallback Logging
  console.log('====================================================');
  console.log(`[SERAMİKBAK MAIL SIMULATOR] To: ${toEmail}`);
  console.log(`Subject: ${subject}`);
  console.log(`Reset Link: ${resetLink}`);
  console.log('====================================================');

  return { 
    success: true, 
    simulated: true, 
    message: 'Reset link logged to console' 
  };
}
