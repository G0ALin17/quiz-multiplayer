const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const cors = require('cors');
const questions = require('./questions');

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, '../client/build'))); // Serve React build

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  }
});

let players = {};
let currentQuestionIndex = 0;
let selectedCategory = 'capitals';

io.on('connection', (socket) => {
  console.log('✅ New player connected:', socket.id);

  socket.on('select_category', (category) => {
    if (questions[category]) {
      selectedCategory = category;
      console.log(`📚 Category selected: ${category}`);
    }
  });

  socket.on('join', (name) => {
    players[socket.id] = { id: socket.id, name, score: 0 };
    io.emit('players_update', Object.values(players));
  });

  socket.on('get_questions', () => {
    socket.emit('questions_data', questions[selectedCategory]);
  });

  socket.on('start_game', () => {
    currentQuestionIndex = 0;
    const categoryQuestions = questions[selectedCategory];

    if (!categoryQuestions || categoryQuestions.length === 0) {
      socket.emit('error', 'No questions available for this category.');
      return;
    }

    const shuffled = [...categoryQuestions].sort(() => Math.random() - 0.5);
    socket.currentQuestions = shuffled;

    Object.values(players).forEach(p => p.score = 0);

    io.emit('question', shuffled[currentQuestionIndex]);
    io.emit('players_update', Object.values(players));
  });

  socket.on('submit_answer', ({ answer }) => {
    const player = players[socket.id];
    const currentQ = socket.currentQuestions?.[currentQuestionIndex];

    if (player && currentQ && answer === currentQ.correct) {
      player.score += 1;
    }

    if (socket.currentQuestions && currentQuestionIndex < socket.currentQuestions.length - 1) {
      currentQuestionIndex++;
      io.emit('question', socket.currentQuestions[currentQuestionIndex]);
    } else {
      io.emit('game_over', Object.values(players));
    }

    io.emit('players_update', Object.values(players));
  });

  socket.on('disconnect', () => {
    console.log('❌ Player disconnected:', socket.id);
    delete players[socket.id];
    io.emit('players_update', Object.values(players));
  });
});

// Fallback for React routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});