import nodemailer from 'nodemailer';
import dns from 'node:dns';

dns.setDefaultResultOrder('ipv4first');

function isTruthy(value) {
  return ['1', 'true', 'yes'].includes(String(value || '').toLowerCase());
}

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: isTruthy(process.env.SMTP_SECURE) || port === 465,
    auth: {
      user,
      pass,
    },
    family: 4,
  });
}
