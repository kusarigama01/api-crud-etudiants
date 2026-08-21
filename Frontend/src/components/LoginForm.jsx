import { useEffect, useState } from 'react';

const LOCK_STORAGE_KEY = 'login_lock';

const LoginForm = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [message, setMessage] = useState('');
  const [attemptsLeft, setAttemptsLeft] = useState(null);

  const [lockedUntil, setLockedUntil] = useState(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  const isLocked = lockedUntil !== null && lockedUntil > Date.now();

  /*
   * Restaure le verrouillage après un refresh.
   */
  useEffect(() => {
    const savedLock = localStorage.getItem(LOCK_STORAGE_KEY);

    if (!savedLock) {
      return;
    }

    try {
      const lockData = JSON.parse(savedLock);

      if (
        typeof lockData.lockedUntil === 'number' &&
        lockData.lockedUntil > Date.now()
      ) {
        setLockedUntil(lockData.lockedUntil);
        setRemainingSeconds(
          Math.ceil((lockData.lockedUntil - Date.now()) / 1000)
        );

        if (typeof lockData.username === 'string') {
          setUsername(lockData.username);
        }

        setMessage('Compte temporairement bloqué.');
      } else {
        localStorage.removeItem(LOCK_STORAGE_KEY);
      }
    } catch {
      localStorage.removeItem(LOCK_STORAGE_KEY);
    }
  }, []);

  /*
   * Timer dynamique.
   * Il provoque volontairement un nouveau render chaque seconde.
   */
  useEffect(() => {
    if (lockedUntil === null) {
      return;
    }

    const updateTimer = () => {
      const remaining = Math.max(
        0,
        Math.ceil((lockedUntil - Date.now()) / 1000)
      );

      setRemainingSeconds(remaining);

      if (remaining <= 0) {
        setLockedUntil(null);
        setRemainingSeconds(0);
        setAttemptsLeft(null);
        setMessage('');
        localStorage.removeItem(LOCK_STORAGE_KEY);
      }
    };

    updateTimer();

    const intervalId = setInterval(updateTimer, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [lockedUntil]);

  /*
   * Active le verrouillage et le sauvegarde dans localStorage.
   */
  const startLockout = (lockedMs) => {
    const lockEnd = Date.now() + lockedMs;

    setLockedUntil(lockEnd);
    setRemainingSeconds(Math.ceil(lockedMs / 1000));
    setAttemptsLeft(0);
    setMessage('Trop de tentatives. Compte temporairement bloqué.');

    localStorage.setItem(
      LOCK_STORAGE_KEY,
      JSON.stringify({
        username,
        lockedUntil: lockEnd,
      })
    );
  };

  /*
   * Connexion vers le backend.
   */
  const login = async () => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const body = await response.json().catch(() => ({}));

      /*
       * Connexion refusée.
       */
      if (!response.ok) {
        const error = body?.error;

        setMessage(
          error?.message ?? 'Nom d’utilisateur ou mot de passe incorrect.'
        );

        if (typeof error?.attemptsLeft === 'number') {
          setAttemptsLeft(error.attemptsLeft);
        }

        if (typeof error?.lockedMs === 'number' && error.lockedMs > 0) {
          startLockout(error.lockedMs);
        }

        return;
      }

      /*
       * Connexion réussie.
       */
      const token = body?.data?.token;
      const loggedUsername = body?.data?.username ?? username;

      if (!token) {
        setMessage('Réponse invalide du serveur.');
        return;
      }

      localStorage.setItem('jwt_token', token);

      localStorage.removeItem(LOCK_STORAGE_KEY);

      setLockedUntil(null);
      setRemainingSeconds(0);
      setAttemptsLeft(null);
      setMessage('Connexion réussie.');

      setPassword('');

      if (typeof onLoginSuccess === 'function') {
        onLoginSuccess(loggedUsername, token);
      }
    } catch (error) {
      console.error('Erreur réseau :', error);

      setMessage(
        'Erreur réseau : impossible de contacter le serveur.'
      );
    }
  };

  /*
   * Soumission du formulaire.
   */
  const handleSubmit = (event) => {
    event.preventDefault();

    if (isLocked) {
      return;
    }

    if (!username.trim() || !password) {
      setMessage('Veuillez remplir tous les champs.');
      return;
    }

    login();
  };

  return (
    <div className="login-card">
      <h2>Connexion</h2>

      {isLocked && (
        <div className="lockout">
          <div className="lock-seconds">
            {remainingSeconds}s
          </div>

          <div>
            Trop de tentatives échouées.
          </div>

          <div>
            Réessayez dans {remainingSeconds} seconde
            {remainingSeconds > 1 ? 's' : ''}.
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          placeholder="Nom d'utilisateur"
          autoComplete="username"
          disabled={isLocked}
        />

        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Mot de passe"
          autoComplete="current-password"
          disabled={isLocked}
        />

        <button
          type="submit"
          disabled={isLocked}
        >
          {isLocked ? 'Compte bloqué' : 'Se connecter'}
        </button>
      </form>

      {!isLocked && message && (
        <div className="msg">
          {message}
        </div>
      )}

      {!isLocked && attemptsLeft !== null && (
        <div className="attempts">
          Tentatives restantes : {attemptsLeft}
        </div>
      )}
    </div>
  );
};

export default LoginForm;