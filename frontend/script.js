const API_BASE_URL = 'https://team-lion-app.netlify.app/.netlify/functions/api';
const KEY_CODE = 'tlmsim25';

document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('isLoggedIn') === 'true') {
        showApp();
    }
});

async function handleAuth(type) {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    if (!username) {
        alert('Inserisci il tuo nome.');
        return;
    }
    if (type === 'register') {
        if (password !== KEY_CODE) {
            alert('Parola chiave errata.');
            return;
        }
        try {
            const response = await fetch(`${API_BASE_URL}/api/pilots`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: username })
            });
            if (response.ok) {
                alert(`Registrazione completata, benvenuto ${username}!`);
                localStorage.setItem('userName', username);
                localStorage.setItem('isLoggedIn', 'true');
                showApp();
            } else {
                const error = await response.json();
                alert(error.message || 'Errore di registrazione.');
            }
        } catch (error) {
            console.error('Errore:', error);
            alert('Errore di connessione. Riprova più tardi.');
        }
    } else if (type === 'login') {
        try {
            const response = await fetch(`${API_BASE_URL}/api/pilots`);
            const pilots = await response.json();
            if (pilots.some(p => p.name.toLowerCase() === username.toLowerCase())) {
                localStorage.setItem('userName', username);
                localStorage.setItem('isLoggedIn', 'true');
                showApp();
            } else {
                alert('Nome pilota non trovato. Registrati prima.');
            }
        } catch (error) {
            console.error('Errore:', error);
            alert('Errore di connessione. Riprova più tardi.');
        }
    }
}

function showApp() {
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('main-app').style.display = 'block';
    document.getElementById('welcome-message').textContent = `Ciao, ${localStorage.getItem('userName')}!`;
    showSection('dashboard-section');
    fetchPilotList();
}

function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userName');
    location.reload();
}

function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.style.display = 'none';
    });
    document.getElementById(sectionId).style.display = 'block';
}

async function fetchPilotList() {
    const listContainer = document.getElementById('pilot-list-container');
    listContainer.innerHTML = 'Caricamento piloti...';
    try {
        const response = await fetch(`${API_BASE_URL}/api/pilots`);
        const pilots = await response.json();
        listContainer.innerHTML = '';
        pilots.forEach((pilot, index) => {
            const statusText = pilot.psn_id ? `PSN: ${pilot.psn_id}` : 'Tap per compilare';
            const pilotHtml = `<div class='pilot-item' onclick="toggleDetails('pilot${index}')"><div class='toggle-section'><span class='pilot-name'>🏁 ${pilot.name.toUpperCase()}</span><span class='pilot-status' id='status${index}'>${statusText}</span><span class='arrow' id='arrow${index}'>▼</span></div><div class='pilot-details' id='pilot${index}' style='display: none;'><div class='form-row'><label>PSN ID:</label><input type='text' placeholder='Il tuo PSN ID' id='psn${index}' value='${pilot.psn_id || ''}'></div><strong style='color: var(--red-lion);'>🕐 Disponibilità:</strong><div class='checkbox-grid'>${['Mattina', 'Pomeriggio', 'Sera', 'Weekend'].map(time => `<div class='checkbox-item'><input type='checkbox' id='avail${index}-${time}' ${pilot.availability?.includes(time) ? 'checked' : ''}><label for='avail${index}-${time}'>${time}</label></div>`).join('')}</div><strong style='color: var(--red-lion);'>🏆 Tipo gare:</strong><div class='checkbox-grid'>${['Endurance', 'Sprint', 'Campionato', 'Fun Race'].map(type => `<div class='checkbox-item'><input type='checkbox' id='race${index}-${type}' ${pilot.race_types?.includes(type) ? 'checked' : ''}><label for='race${index}-${type}'>${type}</label></div>`).join('')}</div><div class='form-row'><label>Note:</label><textarea placeholder='Note: auto preferita, setup, esperienza...' id='notes${index}'>${pilot.notes || ''}</textarea></div><button class='save-btn' onclick="savePilot('${pilot.name}', ${index})">💾 SALVA</button></div></div>`;
            listContainer.innerHTML += pilotHtml;
        });
    } catch (error) {
        console.error('Errore:', error);
        listContainer.innerHTML = 'Errore nel caricamento dei dati.';
    }
}

async function savePilot(name, index) {
    const psnInput = document.getElementById(`psn${index}`);
    const notes = document.getElementById(`notes${index}`).value;
    const psn = psnInput.value.trim();
    if (!psn) {
        alert('Inserisci il tuo PSN ID per salvare!');
        return;
    }
    const availability = ['Mattina', 'Pomeriggio', 'Sera', 'Weekend'].filter(time => document.getElementById(`avail${index}-${time}`).checked).join(',');
    const raceTypes = ['Endurance', 'Sprint', 'Campionato', 'Fun Race'].filter(type => document.getElementById(`race${index}-${type}`).checked).join(',');
    const payload = { name, psn, availability, raceTypes, notes };
    try {
        const response = await fetch(`${API_BASE_URL}/api/pilots`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (response.ok) {
            alert('Dati salvati con successo!');
            await fetchPilotList();
            toggleDetails(`pilot${index}`);
        } else {
            alert('Errore nel salvare i dati. Riprova più tardi.');
        }
    } catch (error) {
        console.error('Errore:', error);
        alert('Errore di connessione. Controlla la rete.');
    }
}

function toggleDetails(id) {
    const details = document.getElementById(id);
    const arrow = document.getElementById(`arrow${id.replace('pilot', '').replace('event', '')}`);
    if (details.style.display === 'block') {
        details.style.display = 'none';
        if (arrow) arrow.classList.remove('rotated');
    } else {
        document.querySelectorAll('.pilot-details').forEach(detail => detail.style.display = 'none');
        document.querySelectorAll('.arrow').forEach(arr => arr.classList.remove('rotated'));
        details.style.display = 'block';
        if (arrow) arrow.classList.add('rotated');
    }
}

function renderPrivateArea() {}
function saveStats() {}
