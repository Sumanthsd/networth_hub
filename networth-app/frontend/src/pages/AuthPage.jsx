import { useState } from 'react';
import {
  loginUser,
  registerUser,
  resendOtp,
  verifyOtp,
} from '../services/authService.js';

export default function AuthPage({ onAuthenticated }) {
  const [mode, setMode] = useState('login');
  const [pendingEmail, setPendingEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  async function handleLoginSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setLoading(true);
    setError('');
    setInfo('');

    try {
      const result = await loginUser({
        email: formData.get('email'),
        password: formData.get('password'),
      });
      onAuthenticated(result.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRegisterSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setLoading(true);
    setError('');
    setInfo('');

    try {
      const email = String(formData.get('email') || '').trim().toLowerCase();
      const result = await registerUser({
        name: formData.get('name'),
        email,
        password: formData.get('password'),
      });
      setPendingEmail(email);
      setMode('verify');
      setInfo(result.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifySubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setLoading(true);
    setError('');
    setInfo('');

    try {
      const result = await verifyOtp({
        email: pendingEmail || formData.get('email'),
        otp: formData.get('otp'),
      });
      onAuthenticated(result.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleResendOtp() {
    if (!pendingEmail) {
      setError('Register first so we know where to resend the code.');
      return;
    }

    setLoading(true);
    setError('');
    setInfo('');
    try {
      const result = await resendOtp({ email: pendingEmail });
      setInfo(result.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-panel">
        <div className="auth-copy">
          <div className="auth-eyebrow">NetWorth Hub</div>
          <h1>Welcome to NetWorth Hub.</h1>
          <p>
            Build financial discipline with a secure home for your assets,
            liabilities, and net worth history. Sign up, verify your email, and
            track everything in one place.
          </p>
        </div>

        <div className="auth-card">
          <div className="auth-tabs">
            <button
              className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
              type="button"
              onClick={() => {
                setMode('login');
                setError('');
                setInfo('');
              }}
            >
              Login
            </button>
            <button
              className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
              type="button"
              onClick={() => {
                setMode('register');
                setError('');
                setInfo('');
              }}
            >
              Register
            </button>
            <button
              className={`auth-tab ${mode === 'verify' ? 'active' : ''}`}
              type="button"
              onClick={() => {
                setMode('verify');
                setError('');
                setInfo('');
              }}
              disabled={!pendingEmail}
            >
              Verify OTP
            </button>
          </div>

          {mode === 'login' && (
            <form className="auth-form" onSubmit={handleLoginSubmit}>
              <div>
                <label className="label">Email</label>
                <input className="input" name="email" type="email" required />
              </div>
              <div>
                <label className="label">Password</label>
                <input
                  className="input"
                  name="password"
                  type="password"
                  minLength="8"
                  required
                />
              </div>
              <button className="btn btn-primary auth-submit" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          )}

          {mode === 'register' && (
            <form className="auth-form" onSubmit={handleRegisterSubmit}>
              <div>
                <label className="label">Full name</label>
                <input className="input" name="name" type="text" required />
              </div>
              <div>
                <label className="label">Email</label>
                <input className="input" name="email" type="email" required />
              </div>
              <div>
                <label className="label">Password</label>
                <input
                  className="input"
                  name="password"
                  type="password"
                  minLength="8"
                  required
                />
              </div>
              <button className="btn btn-primary auth-submit" disabled={loading}>
                {loading ? 'Sending OTP...' : 'Create account'}
              </button>
            </form>
          )}

          {mode === 'verify' && (
            <form className="auth-form" onSubmit={handleVerifySubmit}>
              <div>
                <label className="label">Email</label>
                <input
                  className="input"
                  name="email"
                  type="email"
                  defaultValue={pendingEmail}
                  disabled={Boolean(pendingEmail)}
                />
              </div>
              <div>
                <label className="label">OTP code</label>
                <input
                  className="input"
                  name="otp"
                  type="text"
                  inputMode="numeric"
                  minLength="6"
                  maxLength="6"
                  required
                />
              </div>
              <button className="btn btn-primary auth-submit" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify and continue'}
              </button>
              <button
                className="btn btn-outline auth-submit"
                type="button"
                onClick={handleResendOtp}
                disabled={loading || !pendingEmail}
              >
                Resend OTP
              </button>
            </form>
          )}

          {error && <div className="error mt-sm">{error}</div>}
          {info && <div className="auth-info mt-sm">{info}</div>}
        </div>
      </div>
    </div>
  );
}
