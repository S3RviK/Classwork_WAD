const express = require("express");

const app = express();
const PORT = 3000;

const scientists = [
{ id: 1, name: "Dr. Elena Rostova", department: "Climate", projects: 4 },
{ id: 2, name: "Prof. Marcus Vance", department: "Oceanography", projects: 2 },
{ id: 3, name: "Dr. Aisha Khan", department: "Climate", projects: 7 }
];

const initiatives = [
{ id: 1, name: "Ocean Cleanup", focus: "Marine Pollution", leadScientist: "Dr. Elena Rostova" },
{ id: 2, name: "Climate Action Now", focus: "Climate Change Mitigation", leadScientist: "Prof. Marcus Vance" },
{ id: 3, name: "Sustainable Agriculture", focus: "Food Security", leadScientist: "Dr. Aisha Khan" }
];

app.get("/api/scientists", (req, res) => {
  res.json(scientists);
});

app.get("/api/initiatives", (req, res) => {
  res.json(initiatives);
});

app.get("/", (req, res) => {
  res.send(`
    <div style="font-family: sans-serif; padding: 20px;">
      <h1>SustainHub Decoupled REST API</h1>
      <p>Status: <span style="color: green; font-weight: bold;">ONLINE</span></p>
      <p>Available JSON endpoints: <code>/api/scientists</code>, <code>/api/initiatives</code></p>
    </div>
  `);
});

// /api/scientists?dept - optional filter by department
app.get("/api/scientists", (req, res) => {
  const { dept } = req.query;

  if (dept) {
    const result = scientists.filter((scientist) => scientist.department === dept);
    return res.json(result);
  }

  res.json(scientists);
});

// /api/scientists/:id
app.get("/api/scientists/:id", (req, res) => {
  const scientistId = parseInt(req.params.id, 10);
  const scientist = scientists.find((scientist) => scientist.id === scientistId);

  if (!scientist) {
    return res.status(404).json({ success: false, message: "Scientist not found" });
  }

  res.json({ success: true, data: scientist });
});

app.get("/greet", (req, res) => {
    const {name, space} = req.query;
  res.send(`<h1>Hello ${name || "Guest"}! Welcome to ${space || "our space"}.</h1>`);
});

app.get("/about", (req, res) => {
  res.send("This is my WebApp Class project.");
});

app.post("/about", (req, res) => {
  res.send("This is still my WebApp Class project, but secure.");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});