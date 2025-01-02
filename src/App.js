import React, { useState, useEffect } from "react";
import { signInWithPopup, signOut, auth, provider, db, doc, getDoc, setDoc, updateDoc } from "./firebase";
import { AlertCircle } from "lucide-react";
import "./App.css";

const ChainLinks = () => {
  const [user, setUser] = useState(null); // Logged-in user
  const [scores, setScores] = useState({ solved: 0, failed: 0 }); // User's score
  const [currentPuzzle, setCurrentPuzzle] = useState(0);
  const [revealedWords, setRevealedWords] = useState([0]);
  const [input, setInput] = useState("");
  const [message, setMessage] = useState("");
  const [lives, setLives] = useState(5);
  const [gameWon, setGameWon] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const puzzles = [
    {
      words: ["APPLE", "GRAPE", "PEACH", "BERRY", "LEMON"],
      hints: [
        "A type of fruit",
        "A cluster fruit",
        "Stone fruit",
        "Small juicy fruit",
        "Yellow citrus fruit",
      ],
      connections: [
        "Both are sweet fruits",
        "Both are edible fruits",
        "Both are found in orchards",
        "Both are flavorful",
      ],
    },
  ];

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const userData = result.user;
      setUser(userData);

      const userDoc = doc(db, "scores", userData.uid);
      const docSnap = await getDoc(userDoc);

      if (docSnap.exists()) {
        setScores(docSnap.data());
      } else {
        await setDoc(userDoc, { solved: 0, failed: 0 });
        setScores({ solved: 0, failed: 0 });
      }
    } catch (error) {
      console.error("Error logging in:", error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setScores({ solved: 0, failed: 0 });
  };

  const checkGuess = async () => {
    const puzzle = puzzles[currentPuzzle];
    const nextWordIndex = revealedWords.length;
    const guess = input.toUpperCase();

    if (guess === puzzle.words[nextWordIndex]) {
      setRevealedWords([...revealedWords, nextWordIndex]);
      setInput("");
      setMessage("Correct! Try the next word.");

      if (nextWordIndex === puzzle.words.length - 1) {
        setGameWon(true);
        setMessage("Congratulations! You completed the chain!");

        const userDoc = doc(db, "scores", user.uid);
        await updateDoc(userDoc, { solved: scores.solved + 1 });
        setScores((prev) => ({ ...prev, solved: prev.solved + 1 }));
      }
    } else {
      setLives(lives - 1);
      setMessage(`Incorrect. ${lives - 1} lives remaining.`);
      if (lives <= 1) {
        setMessage("Game Over! The complete chain was: " + puzzle.words.join(" → "));

        const userDoc = doc(db, "scores", user.uid);
        await updateDoc(userDoc, { failed: scores.failed + 1 });
        setScores((prev) => ({ ...prev, failed: prev.failed + 1 }));
      }
    }
    setInput("");
  };

  const newGame = () => {
    setCurrentPuzzle((currentPuzzle + 1) % puzzles.length);
    setRevealedWords([0]);
    setInput("");
    setMessage("");
    setLives(5);
    setGameWon(false);
    setShowHint(false);
  };

  return (
    <div className="card">
      {user ? (
        <div className="user-info">
          <p>Welcome, <strong>{user.displayName}</strong></p>
          <p>Email: {user.email}</p>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      ) : (
        <button onClick={handleLogin} className="login-button">
          Login with Google
        </button>
      )}

      {user && (
        <>
          <div className="scores">
            <p>Games Solved: {scores.solved}</p>
            <p>Games Failed: {scores.failed}</p>
          </div>
          <h1 className="card-title">Chain Links</h1>
          <p className="card-description">Connect the words by meaning, not just letters!</p>
          <div className="lives">
            {Array.from({ length: 5 }, (_, index) => (
              <div key={index} className={`life-box ${index < lives ? "active" : "inactive"}`} />
            ))}
          </div>
          <div className="word-grid">
            {puzzle.words.map((word, index) => (
              <div key={index} className={`word-box ${revealedWords.includes(index) ? "revealed" : ""}`}>
                {revealedWords.includes(index) ? word : "?????"}
                <div className="hint">{puzzle.hints[index]}</div>
              </div>
            ))}
          </div>
          <div className="input-group">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value.toUpperCase())}
              placeholder="Enter next word"
              disabled={gameWon || lives === 0}
            />
            <button onClick={checkGuess} disabled={!input || gameWon || lives === 0} className="submit-button">
              Submit
            </button>
          </div>
          {message && (
            <div className={`alert ${message.includes("Correct") ? "success" : "error"}`}>
              <AlertCircle className="alert-icon" />
              {message}
            </div>
          )}
          {(gameWon || lives === 0) && (
            <button onClick={newGame} className="next-button">
              Play Next Chain
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default ChainLinks;
