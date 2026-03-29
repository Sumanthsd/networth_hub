import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import DashboardPage from './pages/DashboardPage.jsx';
import AuthPage from './pages/AuthPage.jsx';
import { getCurrentUser } from './services/authService.js';
import { setAuthTokenProvider } from './services/apiClient.js';

function App() {
  const { getToken, isLoaded, isSignedIn, signOut } = useAuth();
  const [user, setUser] = useState(undefined);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    setAuthTokenProvider(
      isSignedIn
        ? () =>
            getToken({
              skipCache: true,
            })
        : null
    );
  }, [getToken, isLoaded, isSignedIn]);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (!isSignedIn) {
      setAuthError('');
      setUser(null);
      return;
    }

    let active = true;

    async function loadUser() {
      try {
        const token = await getToken();

        if (!active) {
          return;
        }

        if (!token) {
          setAuthError('Waiting for your Clerk session...');
          setUser(null);
          return;
        }

        const currentUser = await getCurrentUser();

        if (!active) {
          return;
        }

        if (!currentUser) {
          setAuthError(
            'Signed in to Clerk, but the app could not load your profile yet. Refresh once and try again.'
          );
          setUser(null);
          return;
        }

        setAuthError('');
        setUser(currentUser);
      } catch (error) {
        if (active) {
          setAuthError('Unable to finish sign-in. Please refresh and try again.');
          setUser(null);
        }
      }
    }

    loadUser();
    return () => {
      active = false;
    };
  }, [isLoaded, isSignedIn]);

  if (!isLoaded || user === undefined) {
    return <div className="app-loading">Loading...</div>;
  }

  if (!user) {
    return <AuthPage message={authError} isSignedIn={isSignedIn} />;
  }

  return (
    <DashboardPage
      user={user}
      onUserChange={setUser}
      onLogout={async () => {
        await signOut();
        setUser(null);
      }}
    />
  );
}

export default App;

