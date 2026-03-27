import { verifyAuthToken } from '../services/authService.js';

export function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
      const error = new Error('Authentication required');
      error.status = 401;
      throw error;
    }

    const payload = verifyAuthToken(token);
    req.user = {
      id: Number(payload.sub),
      email: payload.email,
      name: payload.name,
    };
    next();
  } catch (err) {
    err.status = err.status || 401;
    next(err);
  }
}
