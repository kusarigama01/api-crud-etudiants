type Record = { attempts: number; lockedUntil: number | null };
const map = new Map<string, Record>();
const MAX = Number(process.env.LOCK_ATTEMPTS ?? 3);
const LOCK_MS = Number(process.env.LOCK_DURATION_MS ?? 60000);

export const registerFailed = (key: string) => {
  const now = Date.now();
  const r = map.get(key) ?? { attempts: 0, lockedUntil: null };
  if (r.lockedUntil && r.lockedUntil > now) return;
  r.attempts += 1;
  if (r.attempts >= MAX) {
    r.lockedUntil = now + LOCK_MS;
    r.attempts = 0;
  }
  map.set(key, r);
};

export const reset = (key: string) => {
  map.delete(key);
};

export const checkLockout = (key: string): { attemptsLeft: number; lockedMs: number | null } => {
  const now = Date.now();
  const r = map.get(key) ?? { attempts: 0, lockedUntil: null };
  if (r.lockedUntil && r.lockedUntil > now) {
    return { attemptsLeft: 0, lockedMs: r.lockedUntil - now };
  }
  return { attemptsLeft: Math.max(0, MAX - r.attempts), lockedMs: null };
};
