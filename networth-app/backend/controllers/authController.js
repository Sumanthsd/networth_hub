import {
  changeAuthenticatedUserPassword,
  getAuthenticatedUser,
  loginUser,
  registerUser,
  resendSignupOtp,
  updateAuthenticatedUser,
  verifySignupOtp,
} from '../services/authService.js';

export async function registerHandler(req, res, next) {
  try {
    const result = await registerUser(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function resendOtpHandler(req, res, next) {
  try {
    const result = await resendSignupOtp(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function verifyOtpHandler(req, res, next) {
  try {
    const result = await verifySignupOtp(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function loginHandler(req, res, next) {
  try {
    const result = await loginUser(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

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

export async function changePasswordHandler(req, res, next) {
  try {
    const result = await changeAuthenticatedUserPassword(req.user.id, req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
