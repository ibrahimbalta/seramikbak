/**
 * SeramikBak Email Utility
 * Supports Resend API or SMTP (Gmail/Nodemailer) with local console simulation fallback.
 * Target Admin Notification Email: seramikbak@gmail.com
 */
import nodemailer from 'nodemailer';

export const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || 'seramikbak@gmail.com';

/**
 * Generic email sender
 */
export async function sendEmail({ to, subject, htmlBody }) {
  const recipients = Array.isArray(to) ? to.filter(Boolean) : [to].filter(Boolean);
  if (!recipients.length) return { success: false, error: 'No recipient email specified' };

  // 1. Option 1: SMTP / Nodemailer (Gmail / Custom SMTP)
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
        to: recipients.join(', '),
        subject,
        html: htmlBody
      });

      return { success: true, messageId: info.messageId };
    } catch (err) {
      console.error('Failed to send email via SMTP:', err);
    }
  }

  // 2. Option 2: Resend API
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
          from: process.env.EMAIL_FROM || 'SeramikBak <noreply@seramikbak.com>',
          to: recipients,
          subject,
          html: htmlBody
        })
      });
      const data = await res.json();
      if (res.ok) {
        return { success: true, messageId: data.id };
      } else {
        console.error('Resend API Error:', data);
      }
    } catch (err) {
      console.error('Failed to send email via Resend API:', err);
    }
  }

  // 3. Option 3: Local Console Simulation Fallback
  console.log('====================================================');
  console.log(`[SERAMİKBAK MAIL SIMULATOR] To: ${recipients.join(', ')}`);
  console.log(`Subject: ${subject}`);
  console.log('====================================================');

  return { success: true, simulated: true };
}

/**
 * 1. Şifre Sıfırlama E-postası
 */
export async function sendPasswordResetEmail({ toEmail, userName, resetLink }) {
  const subject = 'SeramikBak - Şifre Sıfırlama Talebiniz';
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px;">
      <div style="background: #0f172a; padding: 16px 24px; text-align: center; border-radius: 12px; color: #ffffff;">
        <h2 style="margin: 0; color: #d4af37;">SeramikBak Türkiye</h2>
      </div>
      <div style="padding: 24px 0; color: #334155; line-height: 1.6;">
        <p>Merhaba <strong>${userName || 'Kullanıcımız'}</strong>,</p>
        <p>Hesabınız için bir şifre sıfırlama talebi aldık. Aşağıdaki butona tıklayarak şifrenizi yenileyebilirsiniz:</p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${resetLink}" target="_blank" style="background: #0f172a; color: #ffffff; padding: 12px 24px; border-radius: 8px; font-weight: 700; text-decoration: none; display: inline-block;">Şifremi Yenile</a>
        </div>
        <p style="font-size: 12px; color: #64748b;">Bağlantı 15 dakika geçerlidir.</p>
      </div>
    </div>
  `;
  return sendEmail({ to: toEmail, subject, htmlBody });
}

/**
 * 2. İletişim Formu Bildirimi -> seramikbak@gmail.com
 */
export async function sendContactNotification({ name, email, phone, subject: msgSubject, message }) {
  const subject = `📩 Yeni İletişim Mesajı: ${name} (${msgSubject || 'Genel'})`;
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px;">
      <div style="background: #0f172a; padding: 16px 24px; border-radius: 12px; color: #ffffff;">
        <h3 style="margin: 0; color: #d4af37;">📬 SeramikBak Yeni İletişim Mesajı</h3>
      </div>
      <div style="padding: 20px 0; color: #334155; font-size: 14px; line-height: 1.6;">
        <p><strong>Gönderen:</strong> ${name}</p>
        <p><strong>E-Posta:</strong> <a href="mailto:${email}">${email}</a></p>
        <p><strong>Telefon:</strong> <a href="tel:${phone}">${phone || 'Belirtilmedi'}</a></p>
        <p><strong>Konu:</strong> ${msgSubject}</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
        <p><strong>Mesaj:</strong></p>
        <div style="background: #f8fafc; padding: 14px; border-radius: 8px; border-left: 4px solid #d4af37;">
          ${message}
        </div>
      </div>
    </div>
  `;
  return sendEmail({ to: ADMIN_EMAIL, subject, htmlBody });
}

/**
 * 3. Müşteri Bayi Teklif Talebi Bildirimi -> seramikbak@gmail.com + Bayi E-postası
 */
export async function sendLeadNotification({ name, phone, city, notes, dealerName, dealerEmail, productName }) {
  const subject = `🚨 Yeni Bayi Teklif Talebi: ${name} - ${dealerName || 'Yetkili Bayi'}`;
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px;">
      <div style="background: #0f172a; padding: 16px 24px; border-radius: 12px; color: #ffffff;">
        <h3 style="margin: 0; color: #d4af37;">🏷️ Müşteri Fiyat Teklifi İstedi</h3>
      </div>
      <div style="padding: 20px 0; color: #334155; font-size: 14px; line-height: 1.6;">
        <p><strong>Müşteri Adı:</strong> ${name}</p>
        <p><strong>Telefon:</strong> <a href="tel:${phone}">${phone}</a></p>
        <p><strong>Şehir:</strong> ${city || 'Belirtilmedi'}</p>
        <p><strong>İstenen Ürün:</strong> ${productName || 'Seramik Ürünü'}</p>
        <p><strong>Hedef Bayi:</strong> ${dealerName || 'En Yakın Bayi'}</p>
        {notes && <p><strong>Not:</strong> ${notes}</p>}
      </div>
    </div>
  `;

  const recipients = [ADMIN_EMAIL];
  if (dealerEmail && dealerEmail.includes('@')) recipients.push(dealerEmail);

  return sendEmail({ to: recipients, subject, htmlBody });
}

/**
 * 4. Mimar & Müteahhit Proje Talebi Bildirimi -> seramikbak@gmail.com
 */
export async function sendProjectDemandNotification({ companyName, contactName, contactPhone, contactEmail, projectName, city, quantityM2, budgetM2 }) {
  const subject = `🔥 BÜYÜK PROJE TALEBİ: ${projectName || 'Mimari Proje'} (${quantityM2 || 0} m²)`;
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px;">
      <div style="background: #0f172a; padding: 16px 24px; border-radius: 12px; color: #ffffff;">
        <h3 style="margin: 0; color: #d4af37;">🏢 Mimar & Müteahhit Proje Talebi</h3>
      </div>
      <div style="padding: 20px 0; color: #334155; font-size: 14px; line-height: 1.6;">
        <p><strong>Proje Adı:</strong> ${projectName}</p>
        <p><strong>Firma:</strong> ${companyName}</p>
        <p><strong>Yetkili:</strong> ${contactName}</p>
        <p><strong>Telefon:</strong> <a href="tel:${contactPhone}">${contactPhone}</a></p>
        <p><strong>E-Posta:</strong> ${contactEmail}</p>
        <p><strong>Şehir / Konum:</strong> ${city}</p>
        <p><strong>Metraj İhtiyacı:</strong> <strong>${quantityM2} m²</strong></p>
        <p><strong>m² Bütçesi:</strong> ${budgetM2}</p>
      </div>
    </div>
  `;

  return sendEmail({ to: ADMIN_EMAIL, subject, htmlBody });
}

/**
 * 5. Usta Başvurusu Bildirimi -> seramikbak@gmail.com
 */
export async function sendInstallerNotification({ name, phone, city, experienceYears, specialties }) {
  const subject = `👷 Yeni Usta Başvurusu: ${name} (${city})`;
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px;">
      <div style="background: #0f172a; padding: 16px 24px; border-radius: 12px; color: #ffffff;">
        <h3 style="margin: 0; color: #d4af37;">🛠️ Yeni Seramik Ustası Kaydoldu</h3>
      </div>
      <div style="padding: 20px 0; color: #334155; font-size: 14px; line-height: 1.6;">
        <p><strong>Usta Adı:</strong> ${name}</p>
        <p><strong>Telefon:</strong> <a href="tel:${phone}">${phone}</a></p>
        <p><strong>Hizmet Şehri:</strong> ${city}</p>
        <p><strong>Tecrübe:</strong> ${experienceYears} Yıl</p>
        <p><strong>Uzmanlık:</strong> ${specialties || 'Seramik Döşeme'}</p>
      </div>
    </div>
  `;

  return sendEmail({ to: ADMIN_EMAIL, subject, htmlBody });
}
