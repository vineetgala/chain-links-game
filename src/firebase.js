import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  enableIndexedDbPersistence,
  collection,
  addDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";

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
enableIndexedDbPersistence(db)
  .catch((err) => {
    if (err.code === "failed-precondition") {
      console.error(
        "Offline persistence failed: Multiple tabs are open. IndexedDB persistence requires a single tab."
      );
    } else if (err.code === "unimplemented") {
      console.error(
        "Offline persistence is not supported by this browser. Falling back to online mode."
      );
    }
  });

// Set authentication persistence
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log("Authentication persistence set to local storage.");
  })
  .catch((error) => {
    console.error("Error setting authentication persistence:", error);
  });

// Function to add friend using button
const addFriendButton = (friendUsername) => {
  const user = auth.currentUser;
  if (!user) {
    console.error("User not authenticated.");
    return;
  }

  const usersQuery = query(collection(db, "users"), where("username", "==", friendUsername));
  getDocs(usersQuery)
    .then((userSnap) => {
      if (userSnap.empty) {
        alert("User not found!");
        return;
      }
      const friendUid = userSnap.docs[0].id;
      return addDoc(collection(db, "friendRequests"), {
        from: user.uid,
        to: friendUid,
        status: "pending",
      });
    })
    .then(() => {
      alert("Friend request sent!");
    })
    .catch((error) => {
      console.error("Error adding friend:", error);
    });
};

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
  collection,
  addDoc,
  query,
  where,
  getDocs,
  addFriendButton,
};
