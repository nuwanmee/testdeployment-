// lib/totp.ts
import { authenticator } from 'otplib';
import * as QRCode from 'qrcode';
import speakeasy from 'speakeasy';

authenticator.options = {
  step: 30,
  window: 1,
};

export const generateSecret = () => {
  return speakeasy.generateSecret({
    length: 20,
    name: "Matrimony App",
    issuer: "Matrimony App"
  });
};

export const generateQRCode = async (otpauthUrl: string) => {
  try {
    return await QRCode.toDataURL(otpauthUrl);
  } catch (err) {
    console.error('QR code generation failed:', err);
    return null;
  }
};

export const verifyToken = (token: string, secret: string) => {
  return authenticator.check(token, secret);
};

export const generateBackupCodes = (count = 5) => {
  return Array.from({ length: count }, () => 
    Math.random().toString(36).substring(2, 10).toUpperCase()
  );
};