import crypto from 'crypto';

export const generateEmailToken = () => {
  const token = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const expires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  return { token, hashedToken, expires };
};
