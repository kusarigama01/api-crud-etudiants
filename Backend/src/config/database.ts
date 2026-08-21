import { Pool } from 'pg';
const requiredEnv = ['DB_HOST','DB_PORT','DB_USER','DB_PASSWORD','DB_NAME'];
requiredEnv.forEach((k) => { if (!process.env[k]) throw new Error(`Variable d'environnement manquante : ${k}`); });
export const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});
