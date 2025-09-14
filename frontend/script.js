// script.js – Funzioni base e caricamento dati

const API_BASE_URL = 'https://team-lion-app.netlify.app/.netlify/functions/api';

// ========== REGISTRAZIONE & LOGIN ==========
async function handleRegister() {
  const name = document.getElementById('first-name').value.trim();
  const lastInitial = document.getElementById('last-initial').value.trim();
  const email = document.getElementById('email').value.trim();
  const mobile = document.getElementById('mobile').value.trim();
  const psn = document.getElementById('psn-id').value.trim();

  if (!name || !email || !psn) {
    alert('Compila i campi obbligatori (Nome, Email, PSN ID).');
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    alert('Inserisci un indirizzo email valido.');
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/drivers/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, lastInitial, email, mobile, psn })
    });
    if (response.ok) {
      const data = await response.json();
      alert(`Registrazione completata! Benvenuto ${data.driver.tlm_nickname}`);
      localStorage.setItem('tlmUser', JSON.stringify(data.driver));
      showWelcome(data.driver.name);
      clearForm();
    } else {
      const err = await response.json();
      alert(`Errore: ${err.error}`);
    }
  } catch (e) {
    console.error('Error register:', e);
    alert('Errore di connessione. Riprova più tardi.');
  }
}

async function handleLogin() {
  const psn = document.getElementById('psn-id').value.trim();
  if (!psn) {
    alert('Inserisci il tuo PSN ID per accedere.');
    return;
  }
  try {
    const response = await fetch(`${API_BASE_URL}/drivers/login?psn=${psn}`);
    if (response.ok) {
      const user = await response.json();
      localStorage.setItem('tlmUser', JSON.stringify(user));
      showWelcome(user.name);
      clearForm();
    } else {
      alert('Pilota non trovato. Registrati prima di accedere.');
    }
  } catch (e) {
    console.error('Error login:', e);
    alert('Errore di connessione. Riprova più tardi.');
  }
}

function showWelcome(name) {
  document.getElementById('auth-widget').style.display = 'none';
  document.getElementById('welcome-msg').style.display = 'block';
  document.getElementById('user-name').textContent = name;
}

function clearForm() {
  ['first-name','last-initial','email','mobile','psn-id'].forEach(id => {
    document.getElementById(id).value = '';
  });
}

// ========== INIT ==========
document.addEventListener('DOMContentLoaded', () => {
  const stored = localStorage.getItem('tlmUser');
  if (stored) {
    const user = JSON.parse(stored);
    showWelcome(user.name);
  }

  loadPodiumCards();
  loadLiveStandings();
  loadUpcomingEvents();
  loadVideoSpotlight();
  loadStats();
  loadRecentComplaints();
  loadPDFStatus();
});

// ========== PODIO ==========
async function loadPodiumCards() {
  const container = document.getElementById('podium-cards');
  try {
    const res = await fetch(`${API_BASE_URL}/championships/podium`);
    const data = await res.json();
    if (!data.length) {
      container.innerHTML = '<p>Nessun campionato attivo.</p>';
      return;
    }
    container.innerHTML = data.map(ch => `
      <div class="podium-card">
        <h3>${ch.name}</h3>
        ${ch.logo_url ? `<img src="${ch.logo_url}" alt="${ch.name}" class="champ-logo">` : ''}
        <div class="podium-positions">
          ${ch.podium.map(p => `
            <div class="position position-${p.position}">
              <span class="position-number">${p.position}°</span>
              <span class="driver-name">${p.driver}</span>
              <span class="points">${p.points} pts</span>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');
  } catch (e) {
    console.error('Error loading podium:', e);
    container.innerHTML = '<p>Errore caricamento podio.</p>';
  }
}

// ========== CLASSIFICHE LIVE ==========
async function loadLiveStandings() {
  const container = document.getElementById('live-standings');
  try {
    const res = await fetch(`${API_BASE_URL}/championships/live-standings`);
    const data = await res.json();
    if (!data.length) {
      container.innerHTML = '<li>Nessuna classifica disponibile.</li>';
      return;
    }
    // raggruppa per campionato
    const grouped = data.reduce((acc, cur) => {
      (acc[cur.championship] = acc[cur.championship]||[]).push(cur);
      return acc;
    }, {});
    container.innerHTML = Object.entries(grouped).map(([champ, list]) => `
      <li class="champ-group">
        <strong>${champ}</strong>
        <ul>
          ${list.map(p => `<li>${p.position}° ${p.tlm_nickname} (${p.total_points} pts)</li>`).join('')}
        </ul>
      </li>
    `).join('');
  } catch (e) {
    console.error('Error loading standings:', e);
    container.innerHTML = '<li>Errore caricamento classifiche.</li>';
  }
}

// ========== EVENTI FUTURI ==========
async function loadUpcomingEvents() {
  const tbody = document.getElementById('upcoming-events-body');
  try {
    const res = await fetch(`${API_BASE_URL}/events/upcoming`);
    const data = await res.json();
    if (!data.length) {
      tbody.innerHTML = '<tr><td colspan="6">Nessun evento programmato.</td></tr>';
      return;
    }
    tbody.innerHTML = data.map(e => `
      <tr>
        <td>${formatDate(e.event_date)}</td>
        <td>${e.event_time}</td>
        <td>${e.competition}</td>
        <td>${e.circuit}</td>
        <td>${e.car_class}</td>
        <td>${e.host}</td>
      </tr>
    `).join('');
  } catch (e) {
    console.error('Error loading events:', e);
    tbody.innerHTML = '<tr><td colspan="6">Errore caricamento eventi.</td></tr>';
  }
}

// ========== VIDEO SPOTLIGHT ==========
async function loadVideoSpotlight() {
  const container = document.getElementById('video-grid');
  // placeholder - implementa YouTube API se desideri
  container.innerHTML = `
    <div class="video-placeholder">
      <p>🎥 Prossimamente: video GT7!</p>
    </div>
  `;
}

// ========== STATISTICHE ==========
async function loadStats() {
  try {
    const res = await fetch(`${API_BASE_URL}/stats/dashboard`);
    const s = await res.json();
    document.getElementById('total-races').textContent = s.total_races || 0;
    document.getElementById('total-drivers').textContent = s.total_drivers || 0;
    document.getElementById('best-reaction').textContent = s.best_reaction ? `${s.best_reaction}ms` : 'N/A';
    document.getElementById('avg-fuel').textContent = s.avg_fuel ? `${s.avg_fuel}L` : 'N/A';
  } catch (e) {
    console.error('Error loading stats:', e);
  }
}

// ========== RECLAMI ==========
async function submitComplaint(e) {
  e.preventDefault();
  const user = JSON.parse(localStorage.getItem('tlmUser')||'{}');
  if (!user.id) {
    alert('Registrati per inviare reclami.');
    return;
  }
  const eventId = document.getElementById('event-select').value;
  const raceNumber = document.getElementById('race-number').value;
  const involved = Array.from(document.getElementById('involved-pilots').selectedOptions).map(o=>o.value);
  const videoUrl = document.getElementById('complaint-link').value;
  if (!eventId||!raceNumber) {
    alert('Compila i campi obbligatori.');
    return;
  }
  try {
    const res = await fetch(`${API_BASE_URL}/complaints`, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({
        eventId: parseInt(eventId),
        raceNumber: parseInt(raceNumber),
        complainantId: user.id,
        involvedPilots: involved,
        videoUrl,
        description: `Reclamo gara ${raceNumber}`
      })
    });
    if (res.ok) {
      alert('Reclamo inviato!');
      document.getElementById('complaint-form').reset();
      loadRecentComplaints();
    } else alert('Errore invio reclamo.');
  } catch (e) {
    console.error('Error submit complaint:', e);
    alert('Errore di connessione.');
  }
}

async function loadRecentComplaints() {
  const list = document.getElementById('complaints-list');
  try {
    const res = await fetch(`${API_BASE_URL}/complaints/recent`);
    const data = await res.json();
    if (!data.length) {
      list.innerHTML = '<li>Nessun reclamo recente.</li>';
      return;
    }
    list.innerHTML = data.map(c => `
      <li class="complaint-item">
        <strong>Gara #${c.race_number}</strong> - ${c.circuit} (${c.championship})
        <br>Da: ${c.complainant} | <em>${c.status}</em>
        <br><small>${formatDate(c.created_at)}</small>
      </li>
    `).join('');
  } catch (e) {
    console.error('Error loading complaints:', e);
    list.innerHTML = '<li>Errore caricamento reclami.</li>';
  }
}

// ========== UPLOAD PDF ==========
async function loadPDFStatus() {
  const table = document.getElementById('upload-status');
  try {
    const res = await fetch(`${API_BASE_URL}/pdf/status`);
    const data = await res.json();
    table.innerHTML = '<tr><th>File</th><th>Stato</th></tr>';
    data.forEach(u => {
      table.innerHTML += `
        <tr>
          <td>${u.filename}</td>
          <td class="status-${u.upload_status}">${u.upload_status}</td>
        </tr>
      `;
    });
  } catch (e) {
    console.error('Error loading PDF status:', e);
  }
}

// ========== UTILITY ==========
function formatDate(iso) {
  return new Date(iso).toLocaleDateString('it-IT');
}

function viewFullStandings() {
  window.location.href = '/standings.html';
}
