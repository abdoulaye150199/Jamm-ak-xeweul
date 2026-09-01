import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'crypto';

export const MEMBER_SESSION_COOKIE = 'jamm_member_session';
const SESSION_TTL_SECONDS = 60 * 60 * 8;

function getSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error('ADMIN_SESSION_SECRET est manquant.');
  return secret;
}

function sign(payload: string) {
  return createHmac('sha256', getSecret()).update(payload).digest('base64url');
}

function safeCompare(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export function hashMemberPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyMemberPassword(password: string, storedHash: string) {
  const [salt, expectedHash] = storedHash.split(':');
  if (!salt || !expectedHash) return false;

  const actualHash = scryptSync(password, salt, 64).toString('hex');
  return safeCompare(actualHash, expectedHash);
}

export function createMemberSessionToken(memberId: string) {
  const payload = `${memberId}.${Date.now()}`;
  return `${Buffer.from(payload).toString('base64url')}.${sign(payload)}`;
}

export function getMemberIdFromSession(token?: string) {
  if (!token) return null;

  try {
    const [encodedPayload, signature] = token.split('.');
    if (!encodedPayload || !signature) return null;

    const payload = Buffer.from(encodedPayload, 'base64url').toString('utf8');
    if (!safeCompare(signature, sign(payload))) return null;

    const separator = payload.lastIndexOf('.');
    const memberId = payload.slice(0, separator);
    const issuedAt = Number(payload.slice(separator + 1));
    const ageSeconds = (Date.now() - issuedAt) / 1000;

    if (!memberId || !Number.isFinite(issuedAt) || ageSeconds < 0 || ageSeconds > SESSION_TTL_SECONDS) return null;
    return memberId;
  } catch {
    return null;
  }
}

export { SESSION_TTL_SECONDS };
