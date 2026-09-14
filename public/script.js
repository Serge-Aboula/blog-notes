const form = document.getElementById('note-form');
const idInput = document.getElementById('note-id');
const titleInput = document.getElementById('note-title');
const contentInput = document.getElementById('note-content');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const notesList = document.getElementById('notes-list');
const errorBox = document.getElementById('error-message');

function showError(message) {
  errorBox.textContent = message;
  errorBox.style.display = 'block';
}

function clearError() {
  errorBox.style.display = 'none';
}

function resetForm() {
  idInput.value = '';
  titleInput.value = '';
  contentInput.value = '';
  submitBtn.textContent = 'Ajouter';
  cancelBtn.style.display = 'none';
}

async function fetchNotes() {
  try {
    clearError();
    const res = await fetch('/api/notes');
    if (!res.ok) throw new Error();
    const notes = await res.json();
    renderNotes(notes);
  } catch (err) {
    showError('Erreur de connexion au serveur.');
  }
}

function renderNotes(notes) {
  notesList.innerHTML = '';
  notes.forEach(note => {
    const card = document.createElement('div');
    card.className = 'note-card';

    const title = document.createElement('h3');
    title.textContent = note.title;

    const content = document.createElement('p');
    content.textContent = note.content;

    const date = document.createElement('div');
    date.className = 'note-date';
    date.textContent = new Date(note.created_at + 'Z').toLocaleString('fr-FR');

    const actions = document.createElement('div');
    actions.className = 'note-actions';

    const editBtn = document.createElement('button');
    editBtn.textContent = '✏️ Modifier';
    editBtn.addEventListener('click', () => startEdit(note));

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '🗑️ Supprimer';
    deleteBtn.addEventListener('click', () => deleteNote(note.id, note.title));

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    card.appendChild(title);
    card.appendChild(content);
    card.appendChild(date);
    card.appendChild(actions);
    notesList.appendChild(card);
  });
}

function startEdit(note) {
  idInput.value = note.id;
  titleInput.value = note.title;
  contentInput.value = note.content;
  submitBtn.textContent = 'Enregistrer';
  cancelBtn.style.display = 'inline-block';
  titleInput.focus();
}

cancelBtn.addEventListener('click', resetForm);

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  clearError();

  const title = titleInput.value.trim();
  const content = contentInput.value.trim();
  const id = idInput.value;

  if (!title || !content) return;

  const isEditing = Boolean(id);
  const url = isEditing ? `/api/notes/${id}` : '/api/notes';
  const method = isEditing ? 'PUT' : 'POST';

  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content })
    });

    if (res.ok) {
      resetForm();
      fetchNotes();
    } else {
      const error = await res.json();
      showError(error.error);
    }
  } catch (err) {
    showError('Erreur de connexion au serveur.');
  }
});

async function deleteNote(id, title) {
  const confirmed = confirm(`Supprimer la note "${title}" ? Cette action est irréversible.`);
  if (!confirmed) return;

  try {
    clearError();
    const res = await fetch(`/api/notes/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error();
    fetchNotes();
  } catch (err) {
    showError('Impossible de supprimer cette note.');
  }
}

fetchNotes();