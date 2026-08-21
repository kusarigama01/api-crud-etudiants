import { Request, Response, NextFunction } from 'express';
import * as AuthService from '../services/auth.service';

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password } = req.body;
    const r = await AuthService.login(username, password);
    if (!r.ok) {
      if (r.lockedMs) return res.status(423).json({ success: false, error: { code: 'LOCKED_OUT', message: 'Compte bloqué', lockedMs: r.lockedMs }});
      return res.status(r.status).json({ success: false, error: { code: r.error, message: 'Nom d\'utilisateur ou mot de passe incorrect', attemptsLeft: r.attemptsLeft }});
    }
    res.json({ success: true, data: r.data });
  } catch (err) { next(err); }
};
