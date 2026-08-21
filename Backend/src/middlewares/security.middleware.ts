import cors from 'cors';
export const securityMiddleware = cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET','POST','PUT','PATCH','DELETE'],
  allowedHeaders: ['Content-Type','Authorization'],
});
