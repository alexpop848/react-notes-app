import { initializeApp } from "firebase/app";
import { getFirestore } from '@firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDiXcod4jKXr4UyormN_gd6FF1ExSObT4M",
  authDomain: "notes-app-5231b.firebaseapp.com",
  projectId: "notes-app-5231b",
  storageBucket: "notes-app-5231b.appspot.com",
  messagingSenderId: "152265878484",
  appId: "1:152265878484:web:5f596b613b4c1318838441",
  measurementId: "G-0ZQ2CNLWFT"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app) // Populates the db variable with all the files from the app variable