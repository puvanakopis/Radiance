import nodemailer from 'nodemailer';
import { ENV } from '../config/env.js';

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  if (ENV.SMTP_HOST && ENV.SMTP_USER && ENV.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: ENV.SMTP_HOST,
      port: ENV.SMTP_PORT,
      secure: ENV.SMTP_SECURE,
      auth: {
        user: ENV.SMTP_USER,
        pass: ENV.SMTP_PASS,
      },
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 5000,
    });
    return transporter;
  }

  return null;
}

export async function sendOtpEmail({
  to,
  name,
  otp,
  expiresInMinutes = 10,
  purpose = 'Registration Verification',
}) {
  const mailTransporter = getTransporter();
  const userName = name || 'Valued Client';
  const isPasswordReset = purpose.toLowerCase().includes('password') || purpose.toLowerCase().includes('reset');

  const actionText = isPasswordReset
    ? 'We received a request to reset your Radiance account password. Please use the following one-time verification code to proceed:'
    : 'Thank you for choosing Radiance. To complete your registration and verify your email address, please use the following one-time verification code:';

  const footerText = isPasswordReset
    ? 'If you did not request a password reset, please secure your account immediately and disregard this email. Never share this code with anyone.'
    : 'If you did not request this registration, please safely disregard this email. Never share this code with anyone.';

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FBF9F5; margin: 0; padding: 20px; color: #1A1A1A; }
    .container { max-width: 520px; margin: 0 auto; background: #FFFFFF; border-radius: 16px; border: 1px solid #EAE3D9; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.04); }
    .header { background: #1A1A1A; padding: 32px 24px; text-align: center; color: #FFFFFF; }
    .header h1 { margin: 0; font-family: 'Playfair Display', Georgia, serif; font-size: 24px; letter-spacing: 2px; color: #FAF7F2; }
    .header p { margin: 6px 0 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #C87D55; }
    .body { padding: 32px 28px; }
    .greeting { font-size: 16px; font-weight: 600; margin-bottom: 12px; }
    .description { font-size: 14px; line-height: 1.6; color: #555555; margin-bottom: 24px; }
    .otp-box { background: #F7F4EE; border: 1px dashed #C87D55; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px; }
    .otp-code { font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #1A1A1A; margin: 0; }
    .otp-expiry { font-size: 12px; color: #8A7363; margin-top: 8px; }
    .footer-note { font-size: 12px; line-height: 1.5; color: #888888; border-top: 1px solid #EEEEEE; padding-top: 20px; }
    .footer { text-align: center; padding: 16px 24px; font-size: 11px; color: #999999; background: #FAF8F5; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>RADIANCE</h1>
      <p>Luxury Botanical Skincare</p>
    </div>
    <div class="body">
      <div class="greeting">Hello ${userName},</div>
      <div class="description">
        ${actionText}
      </div>
      <div class="otp-box">
        <div class="otp-code">${otp}</div>
        <div class="otp-expiry">Valid for ${expiresInMinutes} minutes</div>
      </div>
      <div class="footer-note">
        ${footerText}
      </div>
    </div>
    <div class="footer">
      &copy; 2026 Radiance Botanical Sanctuary. All rights reserved.
    </div>
  </div>
</body>
</html>
  `;

  // Always log in console for development visibility
  console.log(`\n======================================================`);
  console.log(` 📧 EMAIL OTP NOTIFICATION (Radiance Auth)`);
  console.log(` To:      ${to}`);
  console.log(` Purpose: ${purpose}`);
  console.log(` OTP:     >>> [ ${otp} ] <<<`);
  console.log(` Expires: In ${expiresInMinutes} minutes`);
  console.log(`======================================================\n`);

  if (!mailTransporter) {
    // Simulated delivery in dev mode when SMTP credentials are not set
    return true;
  }

  try {
    const subjectPrefix = isPasswordReset ? 'Password Reset Verification' : 'Registration Verification';
    await mailTransporter.sendMail({
      from: ENV.SMTP_FROM,
      to,
      subject: `${otp} is your Radiance ${subjectPrefix} Code`,
      text: `Your Radiance ${subjectPrefix.toLowerCase()} code is ${otp}. It will expire in ${expiresInMinutes} minutes.`,
      html: htmlContent,
    });
    return true;
  } catch (error) {
    console.error('Error sending OTP email through SMTP:', error);
    // Still return true in non-production so user flow isn't completely broken
    if (ENV.NODE_ENV !== 'production') {
      return true;
    }
    throw error;
  }
}
