// server.js
const http = require("http");
const WebSocket = require("ws");

// Function to generate a random 12-digit number (each digit 0-9)
function generateRandom12DigitNumber() {
  let result = "";
  for (let i = 0; i < 12; i++) {
    result += Math.floor(Math.random() * 10);
  }
  return result;
}

// Create an HTTP server (we don't serve any HTTP content in this example)
const server = http.createServer();

// Set up a WebSocket server on top of the HTTP server
const wss = new WebSocket.Server({ server });

// Log when a new client connects
wss.on("connection", (ws) => {
  console.log("New client connected.");
  
  // Optionally, send the current live number immediately upon connection
  ws.send(generateRandom12DigitNumber());
});

// Broadcast a new random 12-digit number to all connected clients every 3 seconds
setInterval(() => {
  const liveNumber = generateRandom12DigitNumber();
  console.log("Broadcasting:", liveNumber);
  
  // Iterate through all connected clients
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(liveNumber);
    }
  });
}, 3000);

// Start the HTTP server on port 3000
server.listen(3000, () => {
  console.log("Server is listening on http://localhost:3000");
});
