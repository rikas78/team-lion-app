const express = require("express");
const { Client } = require("pg");
const cors = require("cors");
const serverless = require("serverless-http");
const app = express();
const client = new Client({
  connectionString: process.env.NEON_DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});
client.connect();
app.use(express.json());
app.use(cors());
app.post("/pilots", async (req, res) => {
  const { name, psn, availability, raceTypes, notes } = req.body;
  try {
    const query = `
      INSERT INTO pilots (name, psn_id, availability, race_types, notes)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (name) DO UPDATE SET
      psn_id = EXCLUDED.psn_id,
      availability = EXCLUDED.availability,
      race_types = EXCLUDED.race_types,
      notes = EXCLUDED.notes
    `;
    await client.query(query, [name, psn, availability, raceTypes, notes]);
    res.status(200).json({ message: "Dati salvati con successo." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore nel salvare i dati." });
  }
});
module.exports.handler = serverless(app);

// Route GET per ottenere i piloti
app.get("/pilots", async (req, res) => {
  try {
    const query = `SELECT * FROM pilots ORDER BY name`;
    const result = await client.query(query);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore nel recuperare i dati." });
  }
});
