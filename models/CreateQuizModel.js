const mongoose = require('mongoose');

// Define the schema for the CreateQuiz collection
const createQuizSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId, // Ensure this references the User's _id
    ref: 'User',
    required: true, // Ensure the quiz is always tied to a user
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

// Create and export the model for the "CreateQuiz" collection
const CreateQuizModel = mongoose.model('CreateQuizModel', createQuizSchema, 'CreateQuiz');
module.exports = CreateQuizModel;
