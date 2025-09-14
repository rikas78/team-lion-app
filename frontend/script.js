// URL base per le Netlify Functions
const API_BASE_URL = 'https://team-lion-app.netlify.app/.netlify/functions';

async function fetchPilots() {
  try {
    const response = await fetch(`${API_BASE_URL}/pilots`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const pilots = await response.json();
    displayPilots(pilots);
  } catch (err) {
    console.error("Errore nel recupero dei piloti:", err);
  }
}

function displayPilots(pilots) {
  const list = document.getElementById('pilots-list');
  list.innerHTML = pilots.map(p => `
    <li>
      <strong>${p.name}</strong> (PSN: ${p.psn_id}) – Disponibilità: ${p.availability}
      <br>Tipi di gara: ${p.race_types}<br>Note: ${p.notes}
    </li>
  `).join('');
}

// All’avvio della pagina, carica i piloti
document.addEventListener('DOMContentLoaded', fetchPilots);
