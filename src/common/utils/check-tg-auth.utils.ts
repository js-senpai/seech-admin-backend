// eslint-disable-next-line @typescript-eslint/no-var-requires
const crypto = require('crypto');
export async function checkTgAuth({ hash, token, ...userData }) {
  const secretKey = crypto.createHash('sha256').update(token).digest();
  const dataCheckString = Object.keys(userData)
    .sort()
    .map((key) => `${key}=${userData[key]}`)
    .join('\n');
  const hmac = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');
  return hmac === hash;
}
