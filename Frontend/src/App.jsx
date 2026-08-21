import { useState } from 'react';
import LoginForm from './components/LoginForm';
const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState(null);
  const handleLoginSuccess = (user, token) => {
    setIsAuthenticated(true);
    setUsername(user);
  };
  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    setIsAuthenticated(false);
    setUsername(null);
  };
  return (
    <div className="app-root">
      <header className="app-header">
        <h1>Login Demo</h1>
        <div>
          {isAuthenticated ? (
            <div>
              <span>Connecté en tant que <strong>{username}</strong></span>
              <button onClick={handleLogout}>Déconnexion</button>
            </div>
          ) : (
            <span>Non connecté</span>
          )}
        </div>
      </header>
      <main className="app-main">
        {!isAuthenticated ? (
          <LoginForm onLoginSuccess={handleLoginSuccess} />
        ) : (
          <section style={{ textAlign: 'center' }}>
            <h2>Succès — vous êtes connecté</h2>
            <p>Accès aux routes protégées possible.</p>
          </section>
        )}
      </main>
    </div>
  );
};
export default App;
