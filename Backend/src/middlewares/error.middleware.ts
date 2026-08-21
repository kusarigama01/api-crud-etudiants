import { Request, Response, NextFunction } from 'express';
export const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  if (err?.message) return res.status(400).json({ success: false, error: { message: err.message } });
  res.status(500).json({ success: false, error: { message: 'Internal server error' } });
};
