const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Database setup
const db = new sqlite3.Database("./example.db", (err) => {
    if (err) console.error("Database error: ", err.message);
    else console.log("Connected to SQLite database.");
});

// Create table if it doesn't exist
db.run(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        age INTEGER NOT NULL
    )
`);

// Endpoint to insert user data
app.post("/add-user", (req, res) => {
    const { name, email, age } = req.body;

    db.run(
        "INSERT INTO users (name, email, age) VALUES (?, ?, ?)",
        [name, email, age],
        function (err) {
            if (err) {
                console.error(err.message);
                res.status(500).send({ message: "Failed to insert user." });
            } else {
                res.send({ message: "User added successfully." });
            }
        }
    );
});

// Endpoint to retrieve all users
app.get("/users", (req, res) => {
    db.all("SELECT * FROM users", [], (err, rows) => {
        if (err) {
            console.error(err.message);
            res.status(500).send({ message: "Failed to fetch users." });
        } else {
            res.send(rows);
        }
    });
});

// Create an HTTP server from the Express app
const server = http.createServer(app);

// Set up WebSocket server on the same HTTP server, using the path "/ws"
const wss = new WebSocket.Server({ server, path: "/ws" });

// Function to generate a random 12-digit number as a string
function generateLiveNumber() {
    return Math.floor(Math.random() * 1e12).toString().padStart(12, "0");
}

// Broadcast a new live number to all connected WebSocket clients every 5 seconds
setInterval(() => {
    const liveNumber = generateLiveNumber();
    console.log("Broadcasting live number:", liveNumber);
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(liveNumber);
        }
    });
}, 5000);

// Start the server
server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
