const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../server/index');

test('GET /api/notes renvoie un tableau avec un code 200', async () => {
  const res = await request(app).get('/api/notes');
  assert.strictEqual(res.status, 200);
  assert.ok(Array.isArray(res.body));
});

test('POST /api/notes sans title ni content renvoie 400', async () => {
  const res = await request(app).post('/api/notes').send({});
  assert.strictEqual(res.status, 400);
});

test('POST /api/notes avec des données valides crée une note (201)', async () => {
  const res = await request(app).post('/api/notes').send({
    title: 'Note de test CI',
    content: 'Contenu de test CI'
  });
  assert.strictEqual(res.status, 201);
  assert.strictEqual(res.body.title, 'Note de test CI');
});

test('PUT /api/notes/:id sur un id inexistant renvoie 404', async () => {
  const res = await request(app).put('/api/notes/999999').send({
    title: 'x',
    content: 'x'
  });
  assert.strictEqual(res.status, 404);
});

test('DELETE /api/notes/:id supprime une note (204)', async () => {
  const created = await request(app).post('/api/notes').send({
    title: 'Note à supprimer',
    content: 'Contenu temporaire'
  });
  const id = created.body.id;

  const res = await request(app).delete(`/api/notes/${id}`);
  assert.strictEqual(res.status, 204);

  const afterDelete = await request(app).get('/api/notes');
  const stillExists = afterDelete.body.some(note => note.id === id);
  assert.strictEqual(stillExists, false);
});