const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const questions = require('./questions'); // ✅ only this stays

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

let players = {};
let currentQuestionIndex = 0;
let gameStarted = false;

io.on('connection', (socket) => {
  console.log('New player connected:', socket.id);
  socket.on('get_questions', () => {
    socket.emit('questions_data', questions);
  });


  // Handle player joining
  socket.on('join', (name) => {
    players[socket.id] = { id: socket.id, name, score: 0 };
    console.log(`Player joined: ${name}`);
    io.emit('players_update', Object.values(players));
  });

  // Start the game
  socket.on('start_game', () => {
    gameStarted = true;
    currentQuestionIndex = 0;
    io.emit('question', questions[currentQuestionIndex]);
  });

  // Answer submission
  socket.on('submit_answer', ({ answer }) => {
    const player = players[socket.id];
    const correctAnswer = questions[currentQuestionIndex].correct;

    if (player && answer === correctAnswer) {
      player.score += 1;
    }

    if (currentQuestionIndex < questions.length - 1) {
      currentQuestionIndex++;
      io.emit('question', questions[currentQuestionIndex]);
    } else {
      gameStarted = false;
      io.emit('game_over', Object.values(players));
    }

    io.emit('players_update', Object.values(players));
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('Player disconnected:', socket.id);
    delete players[socket.id];
    io.emit('players_update', Object.values(players));
  });
});

const path = require('path');
app.use(express.static(path.join(__dirname, '../client/build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});cd

const port = process.env.PORT || 4000;
server.listen(port, () => {
  console.log(`✅ Server is running on port ${port}`);
});
