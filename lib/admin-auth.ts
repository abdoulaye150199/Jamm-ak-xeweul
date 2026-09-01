import 'server-only';

import { createHmac, timingSafeEqual } from 'crypto';

export const ADMIN_SESSION_COOKIE = 'jamm_admin_session';

function getSessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error('ADMIN_SESSION_SECRET est manquant.');
  return secret;
}

function createSessionToken() {
  return createHmac('sha256', getSessionSecret()).update('jamm-ak-xeweul-admin').digest('hex');
}

function safeCompare(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export function isAdminCredentials(email: string, password: string) {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) return false;
  return safeCompare(email.trim().toLowerCase(), adminEmail.toLowerCase()) && safeCompare(password, adminPassword);
}

export function isValidAdminSession(token?: string) {
  if (!token) return false;
  try {
    return safeCompare(token, createSessionToken());
  } catch {
    return false;
  }
}

export function getAdminSessionToken() {
  return createSessionToken();
}
