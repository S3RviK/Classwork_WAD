const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/bmi", (req, res) => {
  const weight = Number(req.body.weight);
  const height = Number(req.body.height);

  if (!weight || !height || weight <= 0 || height <= 0) {
    return res.send("<h1>Please enter valid values.</h1><a href=\"/\">Back</a>");
  }

  const bmi = (weight / (height * height)) * 10000;
  let category = "";

  if (bmi < 18.5) {
    category = "Underweight";
  } else if (bmi < 25) {
    category = "Normal weight";
  } else if (bmi < 30) {
    category = "Overweight";
  } else {
    category = "Obesity";
  }

  res.send(`
    <h1>Your BMI is ${bmi.toFixed(2)}</h1>
    <p>Category: ${category}</p>
    <a href="/">Calculate again</a>
  `);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
