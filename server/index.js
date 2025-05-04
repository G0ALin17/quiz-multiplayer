const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const questions = require('./questions'); // questions = { capitals: [...], flags: [...] }

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
let selectedCategory = 'capitals'; // Default category

io.on('connection', (socket) => {
  console.log('✅ New player connected:', socket.id);

  // 🧠 Category selection
  socket.on('select_category', (category) => {
    if (questions[category]) {
      selectedCategory = category;
      console.log(`📚 Category selected: ${category}`);
    }
  });

  // 🌍 Player joins the game
  socket.on('join', (name) => {
    players[socket.id] = { id: socket.id, name, score: 0 };
    io.emit('players_update', Object.values(players));
  });

  // 🎯 Get questions for the selected category
  socket.on('get_questions', () => {
    socket.emit('questions_data', questions[selectedCategory]);
  });

  // ▶️ Start game
  socket.on('start_game', () => {
    gameStarted = true;
    currentQuestionIndex = 0;
  
    const categoryQuestions = questions[selectedCategory];
    if (!categoryQuestions || categoryQuestions.length === 0) {
      socket.emit('error', 'No questions available for this category.');
      return;
    }
  
    // Shuffle questions
    const shuffled = [...categoryQuestions].sort(() => Math.random() - 0.5);
  
    // Store the shuffled set on the socket
    socket.currentQuestions = shuffled;
  
    // Reset all scores
    Object.values(players).forEach(p => p.score = 0);
  
    // Send first question
    io.emit('question', shuffled[currentQuestionIndex]);
    io.emit('players_update', Object.values(players));
  });
   
  

  // ✅ Submit answer
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
      gameStarted = false;
      io.emit('game_over', Object.values(players));
    }
  
    io.emit('players_update', Object.values(players));
  });
  

  // ❌ Disconnect
  socket.on('disconnect', () => {
    console.log('❌ Player disconnected:', socket.id);
    delete players[socket.id];
    io.emit('players_update', Object.values(players));
  });
});

const path = require('path');
app.use(express.static(path.join(__dirname, '../client/build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

const port = process.env.PORT || 4000;
server.listen(port, () => {
  console.log(`✅ Server is running on port ${port}`);
});
