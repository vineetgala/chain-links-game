import React, { useState } from "react";
import { AlertCircle } from "lucide-react";
import "./App.css";

const ChainLinks = () => {
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
    {
      words: ["WATER", "RIVER", "OCEAN", "WAVES", "SHORE"],
      hints: [
        "H2O",
        "A flowing water body",
        "A vast water body",
        "Surface movement of water",
        "Where land meets water",
      ],
      connections: [
        "Both are water-related",
        "Both are aquatic features",
        "Both are related to the sea",
        "Both are found near beaches",
      ],
    },
  ];

  const [currentPuzzle, setCurrentPuzzle] = useState(0);
  const [revealedWords, setRevealedWords] = useState([0]);
  const [input, setInput] = useState("");
  const [message, setMessage] = useState("");
  const [lives, setLives] = useState(5);
  const [gameWon, setGameWon] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const checkGuess = () => {
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
      }
    } else {
      setLives(lives - 1);
      setMessage(`Incorrect. ${lives - 1} lives remaining.`);
      if (lives <= 1) {
        setMessage(
          "Game Over! The complete chain was: " + puzzle.words.join(" → ")
        );
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

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && input) {
      checkGuess();
    }
  };

  const puzzle = puzzles[currentPuzzle];

  return (
    <div className="card">
      <h1 className="card-title">Chain Links</h1>
      <p className="card-description">
        Connect the words by meaning, not just letters!
      </p>

      <div className="lives">
        {Array.from({ length: 5 }, (_, index) => (
          <div
            key={index}
            className={`life-box ${index < lives ? "active" : "inactive"}`}
          />
        ))}
      </div>

      <div className="word-grid">
        {puzzle.words.map((word, index) => (
          <div
            key={index}
            className={`word-box ${
              revealedWords.includes(index) ? "revealed" : ""
            }`}
          >
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
          onKeyDown={handleKeyDown}
          placeholder="Enter next word"
          disabled={gameWon || lives === 0}
        />
        <button
          onClick={checkGuess}
          disabled={!input || gameWon || lives === 0}
          className="submit-button"
        >
          Submit
        </button>
      </div>

      {message && (
        <div className={`alert ${message.includes("Correct") ? "success" : "error"}`}>
          <AlertCircle className="alert-icon" />
          {message}
        </div>
      )}

      {showHint && (
        <div className="alert hint">
          <strong>Hint:</strong> Think about how{" "}
          {puzzle.words[revealedWords.length - 1]} connects to the next word.
        </div>
      )}

      {(gameWon || lives === 0) && (
        <button onClick={newGame} className="next-button">
          Play Next Chain
        </button>
      )}
    </div>
  );
};

export default ChainLinks;
