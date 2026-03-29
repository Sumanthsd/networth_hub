import { useState } from 'react';
import { useSignIn, useSignUp } from '@clerk/clerk-react';

function formatClerkError(error, fallback) {
  const message = error?.errors?.[0]?.longMessage || error?.errors?.[0]?.message;
  return message || fallback;
}

export default function AuthPage({ message = '' }) {
  const { isLoaded: isSignInLoaded, signIn, setActive } = useSignIn();
  const { isLoaded: isSignUpLoaded, signUp } = useSignUp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localMessage, setLocalMessage] = useState('');

  const isReady = isSignInLoaded && isSignUpLoaded;

  async function handleSignIn(event) {
    event.preventDefault();

    if (!isReady) {
      return;
    }

    setIsSubmitting(true);
    setLocalMessage('');

    try {
      const result = await signIn.create({
        identifier: email.trim(),
        password,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        return;
      }

      setLocalMessage('Sign-in needs one more step in Clerk. Please verify your account and try again.');
    } catch (error) {
      setLocalMessage(formatClerkError(error, 'Unable to sign in right now.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCreateAccount() {
    if (!isReady) {
      return;
    }

    setIsSubmitting(true);
    setLocalMessage('');

    try {
      const result = await signUp.create({
        emailAddress: email.trim(),
        password,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        return;
      }

      await signUp.prepareEmailAddressVerification({
        strategy: 'email_code',
      });

      setLocalMessage('Account created. Check your email for the Clerk verification code, then sign in here.');
    } catch (error) {
      setLocalMessage(formatClerkError(error, 'Unable to create your account right now.'));
    } finally {
      setIsSubmitting(false);
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
            liabilities, and net worth history.
          </p>
        </div>

        <div className="auth-card auth-card-plain">
          <div className="auth-copy-block">
            <div className="tile-title">Authentication</div>
            <div className="card-sub">
              Use your email and password to access your personal dashboard.
            </div>
          </div>

          <form className="auth-plain-form" onSubmit={handleSignIn}>
            <label className="auth-field">
              <span className="auth-field-label">Email</span>
              <input
                autoComplete="email"
                className="auth-field-input"
                name="email"
                placeholder="Enter your email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>

            <label className="auth-field">
              <span className="auth-field-label">Password</span>
              <input
                autoComplete="current-password"
                className="auth-field-input"
                name="password"
                placeholder="Enter your password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>

            <div className="auth-actions-row">
              <button
                className="btn btn-primary auth-action-button"
                disabled={isSubmitting || !isReady}
                type="submit"
              >
                {isSubmitting ? 'Please wait...' : 'Sign In'}
              </button>

              <button
                className="btn btn-outline auth-action-button"
                disabled={isSubmitting || !isReady}
                type="button"
                onClick={handleCreateAccount}
              >
                Create Account
              </button>
            </div>
          </form>

          {(localMessage || message) && (
            <div className="error auth-feedback">{localMessage || message}</div>
          )}
        </div>
      </div>
    </div>
  );
}
