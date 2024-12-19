const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken'); // <-- Added this line to import jsonwebtoken
const Quiz = require('./models/CreateQUiz');  // Import the Quiz model from the models folder
const CreateQuizModel = require('./models/CreateQuizModel');  // For CreateQuiz collection
const QuizModel = require('./models/QuizModel');  // For Quizzes collection
require('dotenv').config();  // Load environment variables


const app = express();

app.use(bodyParser.json());
app.use(express.static("public"));
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

// MongoDB connection
mongoose.connect(
  "mongodb://sheroyanmagdalena:Maga1234@cluster0-shard-00-00.gct5q.mongodb.net:27017/Quizeo?replicaSet=atlas-mc32lf-shard-0&ssl=true&authSource=admin"
);

var db = mongoose.connection;

db.on("error", () => console.log("Error in Connecting to Database"));
db.once("open", () => console.log("Connected to Database"));

// User Schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

// User Model
const User = mongoose.model("User", userSchema, "Users");

// Register Endpoint
app.post("/sign_up", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send("Email already registered. Please log in.");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      surname,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    console.log("Record Inserted Successfully");
    return res.redirect("/login.html");
  } catch (err) {
    console.error("Error registering user:", err.message);
    res.status(500).send("Server error. Please try again later.");
  }
});

// Middleware to authenticate the user based on the token
const authenticateUser = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];  // Get token from Authorization header

  if (!token) {
      return res.status(401).json({ message: 'No token provided' });
  }

  try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the token
      req.userId = decoded.userId; // Attach the userId from token to the request

      console.log('Decoded userId:', req.userId);  // Log userId to verify

      next();  // Proceed to the next middleware or endpoint
  } catch (error) {
      console.error('Error verifying token:', error);
      return res.status(403).json({ message: 'Invalid or expired token' });
  }
};


// Example login logic to store the token
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send("Invalid email or password");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send("Invalid email or password");
    }

    // Generate JWT token (Assuming `jsonwebtoken` package is installed)
    const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Send the token to the frontend
    res.json({ token });  // Send token back to the frontend
  } catch (err) {
    console.error("Error logging in user:", err);
    res.status(500).send("Server error. Please try again later.");
  }
});

// Serve index.html at root
app.get("/", (req, res) => {
  res.set({
    "Access-Control-Allow-Origin": "*",
  });
  return res.redirect("/index.html");
});

app.post('/api/createQuiz', authenticateUser, async (req, res) => {
  const { title, category, difficulty, timeLimit, questions } = req.body;

  try {
      // Use the userId from the token (attached by the authenticateUser middleware)
      const userId = req.userId;

      console.log('Creating quiz for userId:', userId);  // Log the userId

      // Create the new quiz object
      const newQuiz = new Quiz({
          userId,  // Save quiz under the user's ID
          title,
          category,
          difficulty,
          timeLimit,
          questions,
      });

      await newQuiz.save();  // Save the quiz in the database

      res.status(201).json({ message: 'Quiz created successfully!' });  // Send a success message
  } catch (err) {
      console.error('Error creating quiz:', err);
      res.status(500).json({ message: 'Failed to create quiz' });
  }
});


// API 1: Fetch data from CreateQuiz collection (for myquiz.html)
app.get("/api/myquiz", authenticateUser, async (req, res) => {
  try {
      // Fetch quizzes based on userId (which should be in the token)
      const quizzes = await CreateQuizModel.find({ userId: req.userId });  // Filter quizzes by userId
      
      if (!quizzes || quizzes.length === 0) {
          return res.status(404).json({ message: "No quizzes found" });  // If no quizzes are found
      }
      
      res.json(quizzes);  // Send quizzes as JSON response
  } catch (err) {
      console.error("Error fetching quizzes:", err);
      res.status(500).json({ message: "Failed to fetch quizzes. Please try again later." });
  }
});


// API 2: Fetch data from Quizzes collection (for thequiz.html)
app.get("/api/thequiz", authenticateUser, async (req, res) => {
  try {
    // Fetch quizzes from the Quizzes collection (not CreateQuizModel)
    const quizzes = await QuizModel.find();  // Fetch all quizzes

    if (!quizzes || quizzes.length === 0) {
      return res.status(404).json({ message: 'No quizzes found' });
    }

    res.json(quizzes);  // Return quizzes as JSON
  } catch (err) {
    console.error("Error fetching quizzes:", err);
    res.status(500).json({ message: "Failed to fetch quizzes. Please try again later." });
  }
});

// API to fetch quiz details for the quizStart page (from both Quizzes collection and CreateQuizModel collection)
app.get("/api/quizDetails", authenticateUser, async (req, res) => {
  const { id } = req.query;  // Get quiz ID from query string

  try {
    // First, check in the Quizzes collection (QuizModel)
    let quiz = await QuizModel.findById(id);  // Search for the quiz by ID in Quizzes collection

    if (!quiz) {
      // If not found in QuizModel, check in CreateQuizModel collection
      quiz = await CreateQuizModel.findById(id);  // Search for the quiz by ID in CreateQuiz collection
    }

    // If quiz is not found in either collection
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    // Return quiz details as JSON
    res.json(quiz);
  } catch (err) {
    console.error("Error fetching quiz:", err);
    res.status(500).json({ message: "Failed to fetch quiz. Please try again later." });
  }
});




// User Profile Endpoint: fetch user by userId from the token
app.get('/api/userProfile', authenticateUser, async (req, res) => {
    try {
        const user = await User.findById(req.userId);  // Find user by userId (decoded from token)

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);  // Send user data as JSON response
    } catch (err) {
        console.error('Error fetching user profile:', err);
        res.status(500).json({ message: 'Failed to fetch user profile' });
    }
});
app.post('/api/submitQuiz', authenticateUser, async (req, res) => {
  const { quizId, answers } = req.body;

  try {
      // Fetch the quiz based on the quizId
      const quiz = await CreateQuizModel.findById(quizId);

      if (!quiz) {
          return res.status(404).json({ message: 'Quiz not found' });
      }

      // Check the user's answers
      let score = 0;
      quiz.questions.forEach((question, index) => {
          if (answers[index] === question.correctOption) {
              score++;
          }
      });

      // Send the score back to the frontend
      res.json({ score });

  } catch (err) {
      console.error('Error grading quiz:', err);
      res.status(500).json({ message: 'Failed to grade the quiz' });
  }
});



// Start the server
app.listen(3000, () => {
  console.log("Listening on port 3000");
});
