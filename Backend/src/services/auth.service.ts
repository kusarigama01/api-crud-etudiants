import { pool } from '../config/database';
import jwt from 'jsonwebtoken';
import {
  reset,
  registerFailed,
  checkLockout
} from './lockout.service';

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev_jwt_secret';

const LOGIN_USERNAME = process.env.LOGIN_USERNAME ?? '';
const LOGIN_PASSWORD = process.env.LOGIN_PASSWORD ?? '';

const login = async (username: string, password: string) => {
  const { lockedMs } = checkLockout(username);

  if (lockedMs) {
    return {
      ok: false,
      status: 423,
      error: 'LOCKED',
      lockedMs
    };
  }

  const result = await pool.query(
    'SELECT * FROM etudiants WHERE email = $1',
    [username]
  );

  const user = result.rows[0];

  const credentialsAreValid =
    user &&
    username === LOGIN_USERNAME &&
    password === LOGIN_PASSWORD;

  if (!credentialsAreValid) {
    registerFailed(username);

    const lockoutState = checkLockout(username);

    return {
      ok: false,
      status: 401,
      error: 'INVALID_CREDENTIALS',
      attemptsLeft: lockoutState.attemptsLeft
    };
  }

  reset(username);

  const token = jwt.sign(
    {
      sub: String(user.id),
      username: user.email
    },
    JWT_SECRET,
    {
      expiresIn: '1h'
    }
  );

  return {
    ok: true,
    status: 200,
    data: {
      token,
      username: user.email
    }
  };
};

export { login };