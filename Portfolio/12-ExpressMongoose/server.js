const express = require("express");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const app = express();
const PORT = 3000;
const mongoUrl = "mongodb://127.0.0.1:27017/f1";
let useMemoryStore = false;
let memoryTeams = [];
let memoryDrivers = [];

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.engine("ejs", require("ejs").__express);
app.set("view engine", "ejs");

mongoose.set("strictQuery", true);

const teamSchema = new mongoose.Schema({
  id: Number,
  name: String,
  nationality: String,
  url: String,
});

const driverSchema = new mongoose.Schema({
  num: Number,
  code: String,
  forename: String,
  surname: String,
  dob: Date,
  nationality: String,
  url: String,
  team: teamSchema,
});

const Team = mongoose.model("Team", teamSchema);
const Driver = mongoose.model("Driver", driverSchema);

function buildNationalityOptions(drivers, teams) {
  return [...new Set([
    ...drivers.map((driver) => driver.nationality),
    ...teams.map((team) => team.nationality),
  ].filter(Boolean))].sort();
}

function parseDate(value) {
  if (!value) return null;

  const [day, month, year] = value.split("/");
  if (!day || !month || !year) return null;

  return new Date(`${year}-${month}-${day}T00:00:00`);
}

function readCsvData(filePath) {
  const content = fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
  const rows = content.trim().split(/\r?\n/);

  if (!rows.length) {
    return [];
  }

  const headers = rows[0].split(",").map((item) => item.trim());

  return rows.slice(1).filter(Boolean).map((row) => {
    const values = row.split(",");
    const record = {};

    headers.forEach((key, index) => {
      record[key] = values[index] ? values[index].trim() : "";
    });

    return record;
  });
}

async function seedDatabase() {
  const csvPath = path.join(__dirname, "public", "data", "f1_2023.csv");

  if (!fs.existsSync(csvPath)) {
    return;
  }

  if (useMemoryStore) {
    if (memoryTeams.length > 0 || memoryDrivers.length > 0) {
      return;
    }

    const rows = readCsvData(csvPath);
    for (const row of rows) {
      const teamName = row.current_team && row.current_team !== "N/A" ? row.current_team.trim() : "";
      const team = teamName ? memoryTeams.find((item) => item.name === teamName) : null;

      if (teamName && !team) {
        memoryTeams.push({
          _id: `${teamName.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`,
          name: teamName,
          nationality: row.nationality || "",
          url: "",
        });
      }

      const finalTeam = teamName ? memoryTeams.find((item) => item.name === teamName) : null;
      memoryDrivers.push({
        _id: `${row.code}-${row.number}`,
        num: Number(row.number),
        code: row.code,
        forename: row.forename,
        surname: row.surname,
        dob: parseDate(row.dob),
        nationality: row.nationality,
        url: row.url,
        team: finalTeam
          ? {
              _id: finalTeam._id,
              name: finalTeam.name,
              nationality: finalTeam.nationality,
              url: finalTeam.url,
            }
          : null,
      });
    }
    return;
  }

  const [driverCount, teamCount] = await Promise.all([
    Driver.countDocuments(),
    Team.countDocuments(),
  ]);

  if (driverCount > 0 || teamCount > 0) {
    return;
  }

  const rows = readCsvData(csvPath);

  for (const row of rows) {
    const teamName = row.current_team && row.current_team !== "N/A" ? row.current_team.trim() : "";

    if (teamName) {
      const existingTeam = await Team.findOne({ name: teamName });
      if (!existingTeam) {
        await Team.create({
          name: teamName,
          nationality: row.nationality || "",
          url: "",
        });
      }
    }

    const team = teamName ? await Team.findOne({ name: teamName }) : null;

    await Driver.create({
      num: Number(row.number),
      code: row.code,
      forename: row.forename,
      surname: row.surname,
      dob: parseDate(row.dob),
      nationality: row.nationality,
      url: row.url,
      team: team
        ? {
            _id: team._id,
            id: team.id,
            name: team.name,
            nationality: team.nationality,
            url: team.url,
          }
        : null,
    });
  }
}

async function connectDatabase() {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUrl, {
        serverSelectionTimeoutMS: 2000,
      });
    }
    useMemoryStore = false;
    return true;
  } catch (error) {
    useMemoryStore = true;
    console.warn("MongoDB not available, using in-memory data store instead.");
    return false;
  }
}

async function loadInitialData(req, res, next) {
  try {
    await connectDatabase();

    if (useMemoryStore) {
      await seedDatabase();
      req.teams = [...memoryTeams].sort((a, b) => a.name.localeCompare(b.name));
      req.drivers = [...memoryDrivers].sort((a, b) => `${a.surname}${a.forename}`.localeCompare(`${b.surname}${b.forename}`));
      req.viewMode = req.query.view === "teams" ? "teams" : "drivers";
      next();
      return;
    }

    await seedDatabase();

    const [teams, drivers] = await Promise.all([
      Team.find({}).sort({ name: 1 }),
      Driver.find({}).sort({ surname: 1, forename: 1 }),
    ]);

    req.teams = teams;
    req.drivers = drivers;
    req.viewMode = req.query.view === "teams" ? "teams" : "drivers";
    next();
  } catch (error) {
    console.error("Error loading data:", error);
    req.teams = [];
    req.drivers = [];
    req.viewMode = req.query.view === "teams" ? "teams" : "drivers";
    next();
  }
}

app.get("/", loadInitialData, async (req, res) => {
  const editingDriver = useMemoryStore
    ? memoryDrivers.find((driver) => driver._id === String(req.query.editId)) || null
    : await Driver.findOne({ _id: req.query.editId }).lean();

  const nationalities = buildNationalityOptions(req.drivers, req.teams);

  res.render("index", {
    nationalities,
    teams: req.teams,
    drivers: req.drivers,
    viewMode: req.viewMode,
    editingDriver,
  });
});

app.get("/driver/:id/edit", loadInitialData, async (req, res) => {
  const editingDriver = useMemoryStore
    ? memoryDrivers.find((driver) => driver._id === req.params.id) || null
    : await Driver.findById(req.params.id).lean();

  const nationalities = buildNationalityOptions(req.drivers, req.teams);

  res.render("index", {
    nationalities,
    teams: req.teams,
    drivers: req.drivers,
    viewMode: "drivers",
    editingDriver,
  });
});

app.post("/driver", async (req, res) => {
  const { driverId, num, code, forename, surname, dob, nationality, url, teamName } = req.body;

  if (useMemoryStore) {
    const team = teamName ? memoryTeams.find((item) => item.name === teamName) : null;
    const driverData = {
      _id: driverId || `${code}-${Date.now()}`,
      num: Number(num),
      code,
      forename,
      surname,
      dob: dob ? new Date(dob) : null,
      nationality,
      url,
      team: team
        ? {
            _id: team._id,
            name: team.name,
            nationality: team.nationality,
            url: team.url,
          }
        : null,
    };

    if (driverId) {
      const index = memoryDrivers.findIndex((driver) => driver._id === driverId);
      if (index >= 0) {
        memoryDrivers[index] = driverData;
      }
    } else {
      memoryDrivers.push(driverData);
    }

    res.redirect("/?view=drivers");
    return;
  }

  const team = teamName ? await Team.findOne({ name: teamName }) : null;
  const driverData = {
    num: Number(num),
    code,
    forename,
    surname,
    dob: dob ? new Date(dob) : null,
    nationality,
    url,
    team: team
      ? {
          _id: team._id,
          id: team.id,
          name: team.name,
          nationality: team.nationality,
          url: team.url,
        }
      : null,
  };

  if (driverId) {
    await Driver.findByIdAndUpdate(driverId, driverData);
  } else {
    await Driver.create(driverData);
  }

  res.redirect("/?view=drivers");
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
