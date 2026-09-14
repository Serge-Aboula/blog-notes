require('dotenv').config({
  path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env'
});
const { createClient } = require('@libsql/client');

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN // undefined en mode test, sans problème
});

async function initDb() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Migration : ajoute updated_at si la table existait déjà sans cette colonne
  const columns = await db.execute("PRAGMA table_info(notes)");
  const hasUpdatedAt = columns.rows.some(col => col.name === 'updated_at');
  if (!hasUpdatedAt) {
    await db.execute('ALTER TABLE notes ADD COLUMN updated_at TEXT');
    await db.execute('UPDATE notes SET updated_at = created_at WHERE updated_at IS NULL');
  }
}

module.exports = { db, initDb };