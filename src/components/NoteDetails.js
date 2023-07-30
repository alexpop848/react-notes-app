import React, { useState } from "react";
import { db } from "../firebase-config";
import { updateDoc, doc } from "firebase/firestore";

const NoteDetails = ({
  selectedNote,
  notes,
  selectedNoteItems,
  handleDeleteItem,
  handleAddItem,
  setSelectedNoteItems,
  setNotes,
  handleDeleteNote,
}) => {
  const note = notes.find((note) => note.id === selectedNote);

  const handleDeleteList = () => {
    if (selectedNote) {
      handleDeleteNote(selectedNote);
    }
  };

  const handleItemDelete = async (itemId) => {
    try {
      // Call the handleDeleteItem function from HomePage component to delete the item from Firestore
      await handleDeleteItem(itemId);

      // Update the selected note items state after deleting the item
      const updatedItems = selectedNoteItems.filter(
        (item) => item.id !== itemId
      );
      setSelectedNoteItems(updatedItems);
    } catch (error) {
      console.error("Error deleting item", error);
    }
  };

  const handleItemAdd = (event) => {
    event.preventDefault();
    const newItemContent = event.target.elements.itemContent.value;
    handleAddItem(newItemContent);
    event.target.elements.itemContent.value = ""; // Clear the input field
  };

  const handleToggleItemCompletion = async (itemId) => {
    const updatedItems = selectedNoteItems.map((item) =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );

    const updatedNotes = notes.map((note) =>
      note.id === selectedNote ? { ...note, items: updatedItems } : note
    );

    setSelectedNoteItems(updatedItems);
    setNotes(updatedNotes);

    try {
      // Update the 'completed' status in Firestore
      await updateDoc(doc(db, "notes", selectedNote), {
        items: updatedItems,
      });
    } catch (error) {
      console.error("Error updating note items: ", error);
    }
  };

  const [editedItemId, setEditedItemId] = useState(null);
  const [editedItemContent, setEditedItemContent] = useState("");

  const handleEditItem = (itemId, content) => {
    setEditedItemId(itemId);
    setEditedItemContent(content);
  };

  const handleEditItemInputChange = (event) => {
    setEditedItemContent(event.target.value);
  };

  const handleSaveItemEdit = async (itemId) => {
    if (editedItemContent.trim() !== "") {
      const updatedItems = selectedNoteItems.map((item) =>
        item.id === itemId ? { ...item, content: editedItemContent } : item
      );

      const updatedNotes = notes.map((note) =>
        note.id === selectedNote ? { ...note, items: updatedItems } : note
      );

      // Perform the Firestore update
      try {
        await updateDoc(doc(db, "notes", selectedNote), {
          items: updatedItems,
        });

        setEditedItemId(null);
        setSelectedNoteItems(updatedItems);
        setNotes(updatedNotes);
      } catch (error) {
        console.error("Error updating item: ", error);
      }
    }
  };

  if (!note || !note.content) {
    return (
      <div className="note-details">
        Please select a list to view its items.
      </div>
    );
  }

  return (
    <div className="note-details">
      <div className="details-header">
        <h1 className={note.completed ? "completed-note" : ""}>
          {note.content}
        </h1>
        <button
          className="material-symbols-outlined"
          onClick={handleDeleteList}
        >
          delete
        </button>
      </div>
      <form onSubmit={handleItemAdd} className="form">
        <input type="text" name="itemContent" placeholder="Add a new item" />
        <button className="add-button">Add</button>
      </form>
      <ul>
        {selectedNoteItems.map((item) => (
          <li key={item.id} className="details-li">
            <span
              className={`${item.completed ? "completed-note" : ""} ${
                editedItemId === item.id ? "editable" : ""
              }`}
            >{editedItemId === item.id ? (
              <>
                <input
                  type="text"
                  value={editedItemContent}
                  onChange={handleEditItemInputChange}
                />
                <button
                  className="material-symbols-outlined"
                  onClick={() => handleSaveItemEdit(item.id)}
                >
                  Save
                </button>
              </>
            ) : (
              <>
                {item.content}
                <button
                  className="material-symbols-outlined"
                  onClick={() => handleEditItem(item.id, item.content)}
                >
                  edit
                </button>
              </>
            )}</span>
              
              <div className="buttons">
                <button
                  className="material-symbols-outlined"
                  onClick={() => handleItemDelete(item.id)}
                >
                  delete
                </button>
                <button
                  className="material-symbols-outlined"
                  onClick={() => handleToggleItemCompletion(item.id)}
                >
                  check
                </button>
              </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NoteDetails;
