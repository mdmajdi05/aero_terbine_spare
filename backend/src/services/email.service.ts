import nodemailer from 'nodemailer';
import { env } from '../config/env';

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    });
  }
  return transporter;
}

async function send(to: string, subject: string, html: string): Promise<void> {
  if (!env.SMTP_PASS) return; // skip if SMTP not configured
  await getTransporter().sendMail({ from: env.EMAIL_FROM, to, subject, html });
}

export async function sendRFQConfirmation(to: string, rfqId: string): Promise<void> {
  await send(
    to,
    'RFQ Received — AeroTurbineSpare',
    `<h2>Thank you for your RFQ!</h2>
     <p>Your request <strong>#${rfqId.slice(0, 8).toUpperCase()}</strong> has been received.</p>
     <p>Our team will respond within 24 hours.</p>
     <p>— AeroTurbineSpare Team</p>`,
  );
  await send(
    env.RFQ_NOTIFY_EMAIL,
    `New RFQ Submitted — ${rfqId.slice(0, 8).toUpperCase()}`,
    `<p>A new RFQ has been submitted. ID: <strong>${rfqId}</strong></p><p>Requester: ${to}</p>`,
  );
}

export async function sendPasswordReset(to: string, token: string, frontendUrl: string): Promise<void> {
  const link = `${frontendUrl}/reset-password?token=${token}`;
  await send(
    to,
    'Password Reset — AeroTurbineSpare',
    `<h2>Reset Your Password</h2>
     <p>Click the link below to reset your password (valid for 1 hour):</p>
     <a href="${link}">${link}</a>`,
  );
}
