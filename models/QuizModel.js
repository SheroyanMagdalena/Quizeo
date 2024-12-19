// models/QuizModel.js
const mongoose = require('mongoose');

// Define the schema for the Quizzes collection
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

// Create and export the model for the "Quizzes" collection
const QuizModel = mongoose.model('QuizModel', quizSchema, 'Quizzes');
module.exports = QuizModel;
