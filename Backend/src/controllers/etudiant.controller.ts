import { Request, Response, NextFunction } from 'express';
import * as EtudiantService from '../services/etudiant.service';

const parseId = (v: unknown): number => {
  if (typeof v !== 'string') throw new Error('Invalid id');
  const n = Number(v);
  if (Number.isNaN(n)) throw new Error('Invalid id');
  return Math.floor(n);
};

export const getAll = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const list = await EtudiantService.getAll();
    res.json({ success: true, data: list });
  } catch (err) { next(err); }
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseId(req.params.id as string);
    const item = await EtudiantService.getById(id);
    if (!item) return res.status(404).json({ success: false, error: { message: 'Étudiant introuvable' } });
    res.json({ success: true, data: item });
  } catch (err) { next(err); }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = req.body;
    const created = await EtudiantService.createEtudiant(payload);
    res.status(201).json({ success: true, data: created });
  } catch (err) { next(err); }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseId(req.params.id as string);
    const changed = await EtudiantService.updateEtudiant(id, req.body);
    if (!changed) return res.status(404).json({ success: false, error: { message: 'Étudiant introuvable' } });
    res.json({ success: true, data: changed });
  } catch (err) { next(err); }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseId(req.params.id as string);
    const ok = await EtudiantService.deleteEtudiant(id);
    if (!ok) return res.status(404).json({ success: false, error: { message: 'Étudiant introuvable' } });
    res.json({ success: true, message: 'Supprimé' });
  } catch (err) { next(err); }
};
