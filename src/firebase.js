import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, updateDoc } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBVbAs7QcskQi3vkS1X8RKQXGQ217r6nPA",
    authDomain: "wordgameseveryday.firebaseapp.com",
    projectId: "wordgameseveryday",
    storageBucket: "wordgameseveryday.firebasestorage.app",
    messagingSenderId: "588757366591",
    appId: "1:588757366591:web:3678d0bfa4c958b0c2058a",
    measurementId: "G-JFXDZ20MGZ"
  };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

export { auth, provider, signInWithPopup, signOut, db, doc, setDoc, getDoc, updateDoc };
