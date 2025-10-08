export const config = {
  secret: process.env.JWT_SECRET || 'your-secret-key',
  expiresIn: '24h',
  refreshExpiresIn: '7d',
  issuer: 'securevote',
  audience: 'securevote-app',
};