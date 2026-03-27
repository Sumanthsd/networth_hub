import nodemailer from 'nodemailer';
import dns from 'node:dns';
import { promises as dnsPromises } from 'node:dns';

dns.setDefaultResultOrder('ipv4first');

function isTruthy(value) {
  return ['1', 'true', 'yes'].includes(String(value || '').toLowerCase());
}

async function getTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  const ipv4Addresses = await dnsPromises.resolve4(host);
  const smtpIp = ipv4Addresses[0];

  return nodemailer.createTransport({
    host: smtpIp,
    port,
    secure: isTruthy(process.env.SMTP_SECURE) || port === 465,
    auth: {
      user,
      pass,
    },
    tls: {
      servername: host,
    },
    family: 4,
  });
}

export async function sendSignupOtpEmail({ email, name, otp }) {
  const from = process.env.MAIL_FROM || process.env.SMTP_USER;
  const greeting = name ? `Hi ${name},` : 'Hi,';
  const subject = 'Verify your NetWorth Hub account';
  const text = `${greeting}

Your NetWorth Hub verification code is ${otp}.

This code expires in 10 minutes.`;

  if (!from) {
    console.warn(
      `OTP delivery is not configured. Verification code for ${email}: ${otp}`
    );
    return { delivered: false };
  }

  const transporter = await getTransporter();

  if (!transporter) {
    console.warn(
      `OTP delivery is not configured. Verification code for ${email}: ${otp}`
    );
    return { delivered: false };
  }

  await transporter.sendMail({
    from,
    to: email,
    subject,
    text,
  });

  return { delivered: true };
}
