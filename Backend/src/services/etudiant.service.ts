import { pool } from '../config/database';
import { Etudiant } from '../models/etudiant.model';

export const getAll = async (): Promise<Etudiant[]> => {
  const res = await pool.query('SELECT * FROM etudiants ORDER BY id');
  return res.rows;
};

export const getById = async (id: number): Promise<Etudiant | null> => {
  const res = await pool.query('SELECT * FROM etudiants WHERE id=$1', [id]);
  return res.rows[0] ?? null;
};

export const createEtudiant = async (e: Etudiant): Promise<Etudiant> => {
  const res = await pool.query(
    'INSERT INTO etudiants (nom, prenom, email, age) VALUES ($1,$2,$3,$4) RETURNING *',
    [e.nom, e.prenom, e.email, e.age]
  );
  return res.rows[0];
};

export const updateEtudiant = async (id: number, e: Partial<Etudiant>): Promise<Etudiant | null> => {
  const existing = await getById(id);
  if (!existing) return null;
  const updated = {
    nom: e.nom ?? existing.nom,
    prenom: e.prenom ?? existing.prenom,
    email: e.email ?? existing.email,
    age: e.age ?? existing.age,
  };
  const res = await pool.query(
    'UPDATE etudiants SET nom=$1, prenom=$2, email=$3, age=$4 WHERE id=$5 RETURNING *',
    [updated.nom, updated.prenom, updated.email, updated.age, id]
  );
  return res.rows[0];
};

export const deleteEtudiant = async (id: number): Promise<boolean> => {
  const res = await pool.query('DELETE FROM etudiants WHERE id=$1', [id]);
  return (res.rowCount ?? 0) > 0;
};
