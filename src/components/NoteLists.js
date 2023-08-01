import React, { useState, useCallback, useRef, useEffect } from "react";
import { updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase-config";

const NoteLists = ({
  notes,
  selectedNote,
  newNote,
  handleInputChange,
  handleAddNote,
  handleNoteClick,
  handleDeleteNote,
  setNotes,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedNoteContent, setEditedNoteContent] = useState("");

  const boxRef = useRef(null);

  const handleEdit = (noteId, content) => {
    setIsEditing(true);
    setEditedNoteContent(content);
  };

  const handleEditInputChange = (event) => {
    setEditedNoteContent(event.target.value);
  };

  const handleSaveEdit = async (noteId) => {
    if (editedNoteContent.trim() !== "") {
      try {
        await updateDoc(doc(db, "notes", noteId), {
          content: editedNoteContent,
        });

        const updatedNotes = notes.map((note) =>
          note.id === noteId ? { ...note, content: editedNoteContent } : note
        );

        setIsEditing(false);
        setNotes(updatedNotes);
      } catch (error) {
        console.error("Error updating note: ", error);
      }
    }
  };

  const handleToggleCompletion = useCallback(
    async (noteId) => {
      const updatedNotes = notes.map((note) =>
        note.id === noteId ? { ...note, completed: !note.completed } : note
      );
      setNotes(updatedNotes);

      try {
        // Update the 'completed' status in Firestore
        await updateDoc(doc(db, "notes", noteId), {
          completed: updatedNotes.find((note) => note.id === noteId).completed,
        });
      } catch (error) {
        console.error("Error updating note completion: ", error);
      }
    },
    [notes, setNotes]
  );

  return (
    <div className="left-side">
      <h1>Lists</h1>
      <div className="add-note">
        <form  onSubmit={handleAddNote} className="form">
          <input 
            type="text"
            placeholder="Please add a new list"
            value={newNote}
            onChange={handleInputChange}
          />
          <button className="add-button">Add</button>
        </form>
      </div>
      <div className="notes-list">
        <ul>
          {notes.map((note) => (
            <React.Fragment key={note.id}>
              <li 
                className={`${selectedNote === note.id ? "active" : ""} ${
                  note.completed ? "completed" : ""
                }`}
                onClick={() => handleNoteClick(note.id)}
              >
                {isEditing && selectedNote === note.id ? (
                  <>
                    <input
                      type="text"
                      value={editedNoteContent}
                      onChange={handleEditInputChange}
                    />

                    <button className="material-symbols-outlined" onClick={() => handleSaveEdit(note.id)}>
                      Save
                    </button>
                  </>
                ) : (
                  <div className="span-container">
                    <span className={note.completed ? "completed-note" : ""}>
                      {note.content}
                    </span>
                    <button
                      className="material-symbols-outlined"
                      onClick={() => handleEdit(note.id, note.content)}
                    >
                      edit
                    </button>
                  </div>
                )}

                <div className="buttons">
                  <button
                    className="material-symbols-outlined"
                    onClick={() => handleToggleCompletion(note.id)}
                  >
                    check
                  </button>
                  <button
                    className="material-symbols-outlined"
                    onClick={() => handleDeleteNote(note.id)}
                  >
                    delete
                  </button>
                </div>
              </li>
              <div className="underline"></div>
            </React.Fragment>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default NoteLists;
