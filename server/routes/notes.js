const express = require('express');
const { db } = require('../db');

const router = express.Router();

// GET /api/notes -> liste toutes les notes, plus récentes en premier
router.get('/', async (_req, res) => {
  const result = await db.execute('SELECT * FROM notes ORDER BY created_at DESC');
  res.json(result.rows);
});

// POST /api/notes -> crée une note
router.post('/', async (req, res) => {
  const title = (req.body.title || '').trim();
  const content = (req.body.content || '').trim();

  if (!title || !content) {
    return res.status(400).json({ error: 'Le titre et le contenu sont requis' });
  }

  const result = await db.execute({
    sql: 'INSERT INTO notes (title, content, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
    args: [title, content]
  });

  const newNote = await db.execute({
    sql: 'SELECT * FROM notes WHERE id = ?',
    args: [result.lastInsertRowid]
  });

  res.status(201).json(newNote.rows[0]);
});

// PUT /api/notes/:id -> met à jour une note
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const title = (req.body.title || '').trim();
  const content = (req.body.content || '').trim();

  if (!title || !content) {
    return res.status(400).json({ error: 'Le titre et le contenu sont requis' });
  }

  await db.execute({
    sql: 'UPDATE notes SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    args: [title, content, id]
  });

  const updated = await db.execute({
    sql: 'SELECT * FROM notes WHERE id = ?',
    args: [id]
  });

  if (updated.rows.length === 0) {
    return res.status(404).json({ error: 'Note introuvable' });
  }

  res.json(updated.rows[0]);
});

// DELETE /api/notes/:id -> supprime une note
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  await db.execute({
    sql: 'DELETE FROM notes WHERE id = ?',
    args: [id]
  });
  res.status(204).send();
});

module.exports = router;