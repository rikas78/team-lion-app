const express = require('express');
const { Client } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Configurazione del client PostgreSQL con la variabile d'ambiente di Neon
const client = new Client({
    connectionString: process.env.NEON_DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

client.connect();

app.use(express.json());
app.use(cors());

// Endpoint per recuperare tutti i piloti
app.get('/api/pilots', async (req, res) => {
    try {
        const result = await client.query('SELECT * FROM pilots ORDER BY name');
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Errore nel recuperare i dati dei piloti.' });
    }
});

// Endpoint per salvare o aggiornare un pilota
app.post('/api/pilots', async (req, res) => {
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
        res.status(200).json({ message: 'Dati salvati con successo.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Errore nel salvare i dati.' });
    }
});

app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
});
```
eof

---

### Prossimi Passi

Ora devi solo salvare il file e inviare la modifica a GitHub per far partire il deploy.

1.  **Salva il file** `backend/server.js` con il nuovo codice.
2.  Apri il tuo terminale e naviga nella cartella del progetto.
3.  Esegui questi tre comandi in sequenza:

    ```bash
    git add backend/server.js
    git commit -m "Aggiornato server per forzare un nuovo deploy"
    git push origin main
    
