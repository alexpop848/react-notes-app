import React, { useState, useEffect } from "react";
import NoteLists from "./NoteLists";
import NoteDetails from "./NoteDetails";
import { db } from "../firebase-config";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

const HomePage = () => {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [newNote, setNewNote] = useState("");
  const [selectedNoteItems, setSelectedNoteItems] = useState([]);
  const notesCollectionRef = collection(db, "notes"); //we establish the connection to the collection

  const handleInputChange = (event) => {
    setNewNote(event.target.value);
  };

  useEffect(() => {
    const getNotes = async () => {
      const data = await getDocs(notesCollectionRef);
      setNotes(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    };

    getNotes();
  }, [notesCollectionRef]);

  // Add new list with a unique id (Date.now)
  // We asign the handleAddNote function to the form submit
  const handleAddNote = async (e) => {
    e.preventDefault();
    if (newNote.trim() !== "") {
      const newNoteObject = {
        id: Date.now().toString(), // Outputs a unique number that will be used as a unique id
        content: newNote,
        completed: false,
        items: [], // Initialize empty array for note items
      };

      try {
        // Add new note to Firestore
        await addDoc(notesCollectionRef, newNoteObject);

        // Update the local state to include the new note
        setNotes([...notes, newNoteObject]);
        setNewNote("");
      } catch (error) {
        console.error("Error adding note: ", error);
      }
    }
  };

  const handleNoteClick = (id) => {
    const selectedNoteObject = notes.find((note) => note.id === id);
    setSelectedNoteItems(selectedNoteObject.items); // Update selected note items
    setSelectedNote(id);
  };

  // Delete notes lists
  const handleDeleteNote = async (id) => {
    try {
      // Delete the note from Firestore
      await deleteDoc(doc(db, "notes", id));

      // Update selectedNoteItems before deleting the note
      setSelectedNoteItems([]); // Resets the selectedNoteItems state to an empty array.

      // Remove the deleted note from the local state
      const updatedNotes = notes.filter((note) => note.id !== id);
      setNotes(updatedNotes);

      // Clear the selected note after deleting it
      setSelectedNote(null);
    } catch (error) {
      console.error("Error deleting note: ", error);
    }
  };

  // Delete items from specific list
  const handleDeleteItem = async (itemId) => {
    try {
      // Delete the item from the selected note in Firestore
      await updateDoc(doc(db, "notes", selectedNote), {
        items: selectedNoteItems.filter((item) => item.id !== itemId),
      });

      // Update the state to remove the deleted item
      const updatedItems = selectedNoteItems.filter(
        (item) => item.id !== itemId
      );
      setSelectedNoteItems(updatedItems);
    } catch (error) {
      console.error("Error deleting item", error);
    }
  };

  // Adding items to a specific note
  const handleAddItem = async (newItemContent) => {
    if (newItemContent.trim() !== "") {
      const newItem = {
        id: Date.now().toString(),
        content: newItemContent,
      };

      const updatedNotes = notes.map((note) =>
        note.id === selectedNote
          ? { ...note, items: [...note.items, newItem] } // We append a new item to the items array
          : note
      );
      try {
        // Update the selected note in Firestore to include the new item
        await updateDoc(doc(db, "notes", selectedNote), {
          items: [...selectedNoteItems, newItem],
        });

        setNotes(updatedNotes); // Update the state with the new item
        setSelectedNoteItems([...selectedNoteItems, newItem]); //This ensures that the UI displays the updated list of items for the selected note.
      } catch (error) {
        console.error("Error adding note: ", error);
      }
    }
  };

  // Toggle the 'completed' status for a specific note
  const handleToggleCompletion = async (noteId) => {
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
  };

  return (
    <div>
      <div className="container">
        <NoteLists
          notes={notes}
          selectedNote={selectedNote}
          newNote={newNote}
          handleInputChange={handleInputChange}
          handleAddNote={handleAddNote}
          handleNoteClick={handleNoteClick}
          handleDeleteNote={handleDeleteNote}
          setNotes={setNotes}
        />

        <NoteDetails
          notes={notes}
          selectedNote={selectedNote}
          selectedNoteItems={selectedNoteItems}
          handleDeleteItem={handleDeleteItem}
          handleAddItem={handleAddItem}
          setSelectedNoteItems={setSelectedNoteItems}
          setNotes={setNotes}
          handleToggleCompletion={handleToggleCompletion}
          handleDeleteNote={handleDeleteNote}
        />
      </div>
    </div>
  );
};

export default HomePage;
