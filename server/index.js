const express = require('express');
const WebSocket = require('ws');
const http = require('http');
const path = require('path');
const GameServer = require('./game/GameServer');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Serve static files
app.use(express.static(path.join(__dirname, '../client')));

// Initialize game server
const gameServer = new GameServer();

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('New client connected');
  gameServer.addPlayer(ws);

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      gameServer.handleMessage(ws, message);
    } catch (err) {
      console.error('Error parsing message:', err);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    gameServer.removePlayer(ws);
  });

  ws.on('error', (err) => {
    console.error('WebSocket error:', err);
  });
});

// Start game loop
gameServer.start(wss);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Game server started with ${gameServer.tickRate} FPS`);
});
