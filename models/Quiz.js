// models/Quiz.js
const mongoose = require('mongoose');

// Define the schema for a quiz
const quizSchema = new mongoose.Schema({
  uuid: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    required: true,
  },
  timeLimit: {
    type: Number,
    required: true,
  },
  questions: [
    {
      questionText: String,
      options: [String],
      correctOption: Number,
    },
  ],
});

// Create the model for the "Quizzes" collection
const Quiz = mongoose.model('Quiz', quizSchema, 'Quizzes');  // Ensure the third argument is 'Quizzes'

module.exports = Quiz;
