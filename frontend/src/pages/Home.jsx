import { useState, useEffect } from 'react';
import api from '../api';
import Note from '../components/Note';
import "../styles/Home.css";
import NoteForm from '../components/NoteForm';



function Home() {
  const [notes, setNotes] = useState([]);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');

  useEffect(() => {
    getNotes();
  }, []);


  const getNotes = () => {
    api.get('/api/notes/')
    .then((res) => res.data)
    .then((data) => {setNotes(data); console.log(data)})
    .catch((err) => alert(err));

  };

  const deleteNote = (id) => {
    api.delete(`/api/notes/delete/${id}/`).then((res) => {
      if (res.status === 204) alert('Note deleted!')
      else alert('Error deleting note!');
      getNotes();
    }).catch((error) => alert(error))
  };

  const createNote = (e) => {
    e.preventDefault();
    api.post('/api/notes/', { content, title })
    .then((res) => {
      if (res.status === 201) alert('Note created!')
      else alert('Error creating note!')
      getNotes();
    }).catch((error) => alert(error))
  }

  return (
    <div>
      <div>
        <h1>Home Page</h1>
        {notes.map((note) => (
          <Note note={note} onDelete={deleteNote} key={note.id} />
        ))}
      </div>
      <h2>Create a Note</h2>
      <NoteForm
        onSubmit={createNote}
        title={title}
        setTitle={setTitle}
        content={content}
        setContent={setContent}
      />
    </div>
  );
}

export default Home;