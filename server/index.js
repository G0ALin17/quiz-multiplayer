// server/index.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Change this to your frontend domain if deploying
    methods: ['GET', 'POST']
  }
});

let players = {};

io.on('connection', (socket) => {
  console.log('New player connected:', socket.id);

  socket.on('join_game', (name) => {
    players[socket.id] = { name, score: 0 };
    io.emit('players_update', Object.values(players));
  });

  socket.on('submit_answer', ({ correct }) => {
    if (players[socket.id] && correct) {
      players[socket.id].score += 1;
    }
    io.emit('players_update', Object.values(players));
  });

  socket.on('join', (name) => {
    players[socket.id] = name;
    console.log(`Player joined: ${name}`);
    io.emit('players_update', Object.values(players));
  });
  

  socket.on('disconnect', () => {
    console.log('Player disconnected:', socket.id);
    delete players[socket.id];
    io.emit('players_update', Object.values(players));
  });
});

server.listen(4000, () => {
  console.log('✅ Server is running on http://localhost:4000');
});
