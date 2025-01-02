import React, { useState, useEffect } from "react";
import { signInWithPopup, signOut, auth, provider, db, doc, getDoc, setDoc, updateDoc, collection, addDoc, query, where, getDocs, onAuthStateChanged, addFriendButton } from "./firebase";
import "./App.css";

const ChainLinks = () => {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);
  const [scores, setScores] = useState({ solved: 0, failed: 0 });
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  let [currentPuzzle, setCurrentPuzzle] = useState(0);
  const [revealedWords, setRevealedWords] = useState([0]);
  const [input, setInput] = useState("");
  const [message, setMessage] = useState("");
  const [lives, setLives] = useState(5);
  const [gameWon, setGameWon] = useState(false);

  const puzzles = [
    {
      words: ["DOG", "CAT", "MOUSE", "RABBIT", "HORSE"],
      hints: ["Man's best friend", "A feline pet", "A small rodent", "Hops around", "A large farm animal"],
    },
    {
      words: ["CAR", "BUS", "TRAIN", "PLANE", "BOAT"],
      hints: ["Four wheels", "Public transport", "Runs on tracks", "Flies in the sky", "Floats on water"],
    },
    {
      words: ["ROSE", "LILY", "TULIP", "DAISY", "SUNFLOWER"],
      hints: ["A symbol of love", "Often white", "Spring flower", "Common wildflower", "Yellow and tall"],
    },
    {
      words: ["PYTHON", "JAVA", "C++", "JAVASCRIPT", "RUBY"],
      hints: ["A snake and a programming language", "Popular for enterprise applications", "Used for system programming", "Web development staple", "Precious gem and language"],
    },
    {
      words: ["EARTH", "MARS", "VENUS", "SATURN", "JUPITER"],
      hints: ["Our home planet", "The red planet", "Closest to Earth in size", "Known for its rings", "Largest in the solar system"],
    },    
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        const userDoc = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(userDoc);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setUsername(data.username || "");
          setScores(data.scores || { solved: 0, failed: 0 });
          fetchFriends(currentUser.uid);
          fetchLeaderboard(currentUser.uid);
        } else {
          await setDoc(userDoc, { username: "", scores: { solved: 0, failed: 0 } });
          setIsNewUser(true);
        }
      } else {
        setUser(null);
        setUsername("");
        setScores({ solved: 0, failed: 0 });
        setFriends([]);
        setLeaderboard([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchFriends = async (uid) => {
    const userDoc = doc(db, "users", uid);
    const friendsCollection = collection(userDoc, "friends");
    const friendsSnap = await getDocs(friendsCollection);
    setFriends(friendsSnap.docs.map((doc) => doc.data()));
  };

  const fetchLeaderboard = async (uid) => {
    const userDoc = doc(db, "users", uid);
    const friendsCollection = collection(userDoc, "friends");
    const friendsSnap = await getDocs(friendsCollection);

    const friendStats = [];
    for (const friendDoc of friendsSnap.docs) {
      const friendData = await getDoc(doc(db, "users", friendDoc.data().uid));
      if (friendData.exists()) {
        friendStats.push({ username: friendData.data().username, solved: friendData.data().scores.solved, failed: friendData.data().scores.failed });
      }
    }
    setLeaderboard(friendStats);
  };

  const sendFriendRequest = async (friendUsername) => {
    try {
      const usersQuery = query(collection(db, "users"), where("username", "==", friendUsername));
      const userSnap = await getDocs(usersQuery);

      if (userSnap.empty) {
        alert("User not found!");
        return;
      }

      const friendUid = userSnap.docs[0].id;

      await addDoc(collection(db, "friendRequests"), { from: user.uid, to: friendUid, status: "pending" });
      alert("Friend request sent!");
    } catch (error) {
      console.error("Error sending friend request:", error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setUsername("");
    setScores({ solved: 0, failed: 0 });
    setFriends([]);
    setLeaderboard([]);
  };

  const saveUsername = async () => {
    if (!username.trim()) return;

    const userDoc = doc(db, "users", user.uid);
    await updateDoc(userDoc, { username });
    setIsNewUser(false);
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

        const userDoc = doc(db, "users", user.uid);
        const docSnap = await getDoc(userDoc);
        if (docSnap.exists()) {
          const currentScores = docSnap.data().scores || { solved: 0, failed: 0 };
          await updateDoc(userDoc, { scores: { solved: currentScores.solved + 1, failed: currentScores.failed } });
          setScores({ ...currentScores, solved: currentScores.solved + 1 });
        }
      }
    } else {
      setLives(lives - 1);
      setMessage(`Incorrect. ${lives - 1} lives remaining.`);
      if (lives <= 1) {
        setMessage("Game Over! The complete chain was: " + puzzle.words.join(" → "));
        currentPuzzle = ((currentPuzzle + 1) % puzzles.length)+1;
        const userDoc = doc(db, "users", user.uid);
        const docSnap = await getDoc(userDoc);
        if (docSnap.exists()) {
          const currentScores = docSnap.data().scores || { solved: 0, failed: 0 };
          await updateDoc(userDoc, { scores: { solved: currentScores.solved, failed: currentScores.failed + 1 } });
          setScores({ ...currentScores, failed: currentScores.failed + 1 });
        }
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
  };

  return (
    <div className="container text-center my-5">
      {user ? (
        <>
          <div className="mb-4">
            <img src={user.photoURL} alt="Profile" className="rounded-circle" style={{ width: "100px", height: "100px", objectFit: "cover" }} />
            <h5 className="mt-3">{username || "Welcome!"}</h5>
          </div>
          {isNewUser && (
            <div className="username-input">
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter your username" className="form-control" />
              <button onClick={saveUsername} className="btn btn-primary mt-2">Save Username</button>
            </div>
          )}
          <button onClick={handleLogout} className="btn btn-danger mt-4">Logout</button>

          <div className="mt-4">
            <h3>Your Stats</h3>
            <p>Games Solved: <span className="badge bg-success">{scores.solved}</span></p>
            <p>Games Failed: <span className="badge bg-danger">{scores.failed}</span></p>
          </div>

          {/* <div className="mt-4">
            <h3>Friends</h3>
            <div className="input-group">
              <input
                type="text"
                id="friend-username"
                placeholder="Enter friend's username"
                className="form-control"
              />
              <button
                onClick={() => {
                  const friendUsername = document.getElementById("friend-username").value;
                  if (friendUsername.trim()) {
                    addFriendButton(friendUsername.trim());
                    document.getElementById("friend-username").value = ""; // Clear input
                  } else {
                    alert("Please enter a valid username.");
                  }
                }}
                className="btn btn-primary"
              >
                Add Friend
              </button>
            </div>
          </div>

                
          <div className="mt-4">
            <h3>Leaderboard</h3>
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Solved</th>
                  <th>Failed</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((friend, index) => (
                  <tr key={index}>
                    <td>{friend.username}</td>
                    <td>{friend.solved}</td>
                    <td>{friend.failed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div> */}

          <div className="mt-4">
            <h3>Current Puzzle</h3>
            <div className="word-grid">
              {puzzles[currentPuzzle]?.words.map((word, index) => (
                <div key={index} className="word-row">
                  <div
                    className={`word-box ${
                      revealedWords.includes(index) ? "revealed" : ""
                    }`}
                  >
                    {revealedWords.includes(index) ? word : "?????"}
                  </div>
                  <div className="hint-box">
                    {puzzles[currentPuzzle]?.hints[index]}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="input-group mt-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value.toUpperCase())}
              onKeyDown={(e) => {
                if (e.key === "Enter" && input.trim()) {
                  checkGuess();
                }
              }}
              placeholder="Enter next word"
              className="form-control"
              disabled={gameWon || lives === 0}
            />
            <button
              onClick={checkGuess}
              disabled={!input || gameWon || lives === 0}
              className="btn btn-primary"
            >
              Submit
            </button>
          </div>

          {message && (
            <div
              className={`alert ${
                message.includes("Correct") ? "alert-success" : "alert-danger"
              } mt-4`}
            >
              {message}
            </div>
          )}

          {(gameWon || lives === 0) && (
            <button onClick={newGame} className="btn btn-success mt-4">
              Play Next Chain
            </button>
          )}
        </>
      ) : (
        <button
          onClick={async () => await signInWithPopup(auth, provider)}
          className="btn btn-primary"
        >
          Login with Google
        </button>
      )}
    </div>
  );
};

export default ChainLinks;