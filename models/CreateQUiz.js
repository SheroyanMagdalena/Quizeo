const mongoose = require('mongoose');

// Define the Quiz Schema
const quizSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
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
        enum: ['easy', 'medium', 'hard'],
        required: true,
    },
    timeLimit: {
        type: Number,
        required: true,
    },
    questions: [
        {
            questionText: {
                type: String,
                required: true,
            },
            options: [
                {
                    type: String,
                    required: true,
                },
            ],
            correctOption: {
                type: Number,
                required: true,
            },
        },
    ],
}, { timestamps: true }); // This adds createdAt and updatedAt timestamps automatically

// Create a Quiz model
const Quiz = mongoose.model('Quiz', quizSchema, 'CreateQuiz'); // 'CreateQuiz' is the collection name in MongoDB

module.exports = Quiz;
