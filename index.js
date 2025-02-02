import dotenv from "dotenv";
dotenv.config();

import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = process.env.CLOUD || 3000;

const db = new pg.Client({
  user: process.env.DBUSER,
  host: process.env.HOST,
  database: process.env.DBNAME,
  password: process.env.POSTGRES,
  port: process.env.DBPORT,
});

db.connect();

let totalCorrect = 0;
let highScore = 0;
let quiz = [];
let currentQuestion = {};
let arrayOfCountries = [];

async function fetchQuizData() {
  try {
    const res = await db.query("SELECT * FROM flags");
    quiz = res.rows;
  } catch (err) {
    console.error("Error executing query", err.stack);
  }
  db.end()
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function nextQuestion() {
  // shuffle the quiz array
  shuffle(quiz);
  arrayOfCountries = quiz.slice(0, 4); // pick four countries
  const randomIndex = Math.floor(Math.random() * arrayOfCountries.length);
  currentQuestion = arrayOfCountries[randomIndex];
  console.log("Next question:", currentQuestion);
}

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", async (req, res) => {
  try {
    totalCorrect = 0;
    nextQuestion();
    res.render("index.ejs", {
      question: currentQuestion,
      highScore: highScore,
      totalScore: totalCorrect,
      arrayOfCountries: arrayOfCountries,
    });
  } catch (err) {
    console.error("Error rendering home page:", err);
  }
});

app.get("/about", (req, res) => {
  res.render("about.ejs");
});

app.get("/contact", (req, res) => {
  res.render("contact.ejs");
});

app.post("/submit", async (req, res) => {
  try {
    const submit = req.body.submit;
    if (submit === "submit") {
      let answer = req.body.answer.trim();
      let isCorrect = false;

      if (currentQuestion.name.toLowerCase() === answer.toLowerCase()) {
        totalCorrect++;
        if (totalCorrect > highScore) {
          highScore = totalCorrect;
        }
        isCorrect = true;
      }

      nextQuestion();
      res.render("index.ejs", {
        question: currentQuestion,
        wasCorrect: isCorrect,
        totalScore: totalCorrect,
        highScore: highScore,
        arrayOfCountries: arrayOfCountries,
      });

    } else if (submit === "give-up") {
      res.redirect("/");
    }
  } catch (err) {
    console.error("Error handling submission:", err);
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
  fetchQuizData().then(() => {
    console.log("Quiz data loaded successfully");
  });
});