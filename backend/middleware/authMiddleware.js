import { verifyToken } from '@clerk/backend';
import {
  loadClerkUser,
  syncLocalUserFromClerk,
} from '../services/clerkUserService.js';

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';

    if (!token) {
      const error = new Error('Authentication required');
      error.status = 401;
      throw error;
    }

    const origins = (process.env.CORS_ORIGIN || '')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean);

    const verifiedToken = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
      authorizedParties: origins,
      clockSkewInMs: 60000,
    });

    if (!verifiedToken?.sub) {
      const error = new Error('Authentication required');
      error.status = 401;
      throw error;
    }

    const clerkUser = await loadClerkUser(verifiedToken.sub);
    const localUser = await syncLocalUserFromClerk(clerkUser);
    req.user = {
      id: localUser.id,
      email: localUser.email,
      name: localUser.name,
      clerkUserId: localUser.clerk_user_id,
      clerkSessionId: verifiedToken.sid || null,
    };
    next();
  } catch (err) {
    err.status = err.status || 401;
    next(err);
  }
}
