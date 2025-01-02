import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, updateDoc, enableIndexedDbPersistence } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBVbAs7QcskQi3vkS1X8RKQXGQ217r6nPA",
  authDomain: "wordgameseveryday.firebaseapp.com",
  projectId: "wordgameseveryday",
  storageBucket: "wordgameseveryday.firebasestorage.app",
  messagingSenderId: "588757366591",
  appId: "1:588757366591:web:3678d0bfa4c958b0c2058a",
  measurementId: "G-JFXDZ20MGZ",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

// Enable offline persistence
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === "failed-precondition") {
    console.error("Offline persistence failed: Multiple tabs open.");
  } else if (err.code === "unimplemented") {
    console.error("Offline persistence is not supported by the browser.");
  }
});

// Export functions and objects
export {
  auth,
  provider,
  db,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  doc,
  getDoc,
  setDoc,
  updateDoc,
};
