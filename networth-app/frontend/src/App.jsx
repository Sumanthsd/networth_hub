import { useEffect, useState } from 'react';
import DashboardPage from './pages/DashboardPage.jsx';
import AuthPage from './pages/AuthPage.jsx';
import { getCurrentUser, logoutUser } from './services/authService.js';

function App() {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    let active = true;

    async function loadUser() {
      const currentUser = await getCurrentUser();
      if (active) {
        setUser(currentUser);
      }
    }

    loadUser();
    return () => {
      active = false;
    };
  }, []);

  if (user === undefined) {
    return <div className="app-loading">Loading...</div>;
  }

  if (!user) {
    return <AuthPage onAuthenticated={setUser} />;
  }

  return (
    <DashboardPage
      user={user}
      onUserChange={setUser}
      onLogout={() => {
        logoutUser();
        setUser(null);
      }}
    />
  );
}

export default App;

