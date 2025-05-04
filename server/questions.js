const questions = {
  capitals: [
    {
      question: 'What is the capital of France?',
      options: ['Berlin', 'Madrid', 'Paris', 'Lisbon'],
      correct: 'Paris',
    },
    {
      question: 'What is the capital of Germany?',
      options: ['Berlin', 'Rome', 'Athens', 'Prague'],
      correct: 'Berlin',
    }
    // ➕ Add more capital questions
  ],
  flags: [
    {
      question: 'Which flag has a red circle on white background?',
      options: ['Japan', 'Canada', 'Bangladesh', 'Turkey'],
      correct: 'Japan',
    },
    {
      question: 'Which country has a maple leaf on its flag?',
      options: ['USA', 'UK', 'Canada', 'France'],
      correct: 'Canada',
    }
    // ➕ Add more flag questions
  ],
  math: [
    {
      question: 'What is 5 + 7?',
      options: ['10', '11', '12', '13'],
      correct: '12',
    },
    {
      question: 'What is 8 * 2?',
      options: ['14', '16', '18', '20'],
      correct: '16',
    }
  ],
  planets: [
    {
      question: 'Which planet is known as the Red Planet?',
      options: ['Earth', 'Venus', 'Mars', 'Jupiter'],
      correct: 'Mars',
    },
    {
      question: 'Which is the largest planet?',
      options: ['Earth', 'Neptune', 'Jupiter', 'Saturn'],
      correct: 'Jupiter',
    }
  ]
};

module.exports = questions;
