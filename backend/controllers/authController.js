import {
  getAuthenticatedUser,
  updateAuthenticatedUser,
} from '../services/userService.js';

export async function meHandler(req, res, next) {
  try {
    const user = await getAuthenticatedUser(req.user.id);
    res.json(user);
  } catch (err) {
    next(err);
  }
}

export async function updateProfileHandler(req, res, next) {
  try {
    const result = await updateAuthenticatedUser(req.user.id, req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
