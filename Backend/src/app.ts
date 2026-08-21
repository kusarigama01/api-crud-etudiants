import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { json } from 'body-parser';
import { errorHandler } from './middlewares/error.middleware';
import { securityMiddleware } from './middlewares/security.middleware';
import authRoutes from './routes/auth.routes';
import etudiantRoutes from './routes/etudiant.routes';

const app = express();
app.use(json());
app.use(helmet());
app.use(securityMiddleware);
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use(limiter);

app.get('/', (_req, res) => res.json({ success: true, message: 'Hello world' }));
app.use('/api/auth', authRoutes);
app.use('/api/etudiants', etudiantRoutes);

app.use(errorHandler);

export default app;
