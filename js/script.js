const goal = 2000;
let logs = JSON.parse(localStorage.getItem('waterLogs')) || {};
const today = new Date().toISOString().split('T')[0];

if (!logs[today]) logs[today] = [];

const currentAmountEl = document.getElementById('currentAmount');
const percentAmountEl = document.getElementById('percentAmount');
const progressCircle = document.getElementById('progressCircle');

const morningLogsEl = document.getElementById('morningLogs');
const noonLogsEl = document.getElementById('noonLogs');
const eveningLogsEl = document.getElementById('eveningLogs');
const totalIntakeEl = document.getElementById('totalIntake');

function updateProgress() {
  const total = logs[today].reduce((sum, entry) => sum + entry.amount, 0);
  currentAmountEl.textContent = total + ' ml';
  
  const percent = Math.min(100, Math.round((total / goal) * 100));
  percentAmountEl.textContent = percent + '% of goal';
  
  // Update conic gradient for progress circle
  const rotation = (percent / 100) * 360;
  progressCircle.style.background = `conic-gradient(#3a86ff ${rotation}deg, #3a86ff20 0deg)`;
  
  // Visual feedback when goal reached
  if (percent >= 100) {
    progressCircle.style.boxShadow = '0 0 20px rgba(58, 134, 255, 0.5)';
  } else {
    progressCircle.style.boxShadow = 'none';
  }
}

function renderLogs() {
  morningLogsEl.innerHTML = '';
  noonLogsEl.innerHTML = '';
  eveningLogsEl.innerHTML = '';

  if (logs[today].length === 0) {
    morningLogsEl.innerHTML = '<li class="empty-state">No entries yet today</li>';
    return;
  }

  // Sort logs by time
  logs[today].sort((a, b) => {
    const timeA = a.time.split(':').map(Number);
    const timeB = b.time.split(':').map(Number);
    return (timeA[0] * 60 + timeA[1]) - (timeB[0] * 60 + timeB[1]);
  });

  logs[today].forEach((entry, idx) => {
    const li = document.createElement('li');
    
    const infoSpan = document.createElement('span');
    infoSpan.innerHTML = `<span class="log-time">${entry.time}</span> — <span class="log-amount">${entry.amount} ml</span>`;
    
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'log-actions';
    
    // Edit button
    const editBtn = document.createElement('button');
    editBtn.textContent = '✏️';
    editBtn.className = 'edit-btn';
    editBtn.onclick = () => editEntry(idx);
    
    // Delete button
    const delBtn = document.createElement('button');
    delBtn.textContent = '🗑️';
    delBtn.className = 'delete-btn';
    delBtn.onclick = () => deleteEntry(idx);
    
    actionsDiv.appendChild(editBtn);
    actionsDiv.appendChild(delBtn);
    li.appendChild(infoSpan);
    li.appendChild(actionsDiv);

    // Categorize by time
    const hour = parseInt(entry.time.split(':')[0]);
    if (hour < 12) morningLogsEl.appendChild(li);
    else if (hour < 18) noonLogsEl.appendChild(li);
    else eveningLogsEl.appendChild(li);
  });
}

function updateTotal() {
  const total = logs[today].reduce((sum, entry) => sum + entry.amount, 0);
  totalIntakeEl.textContent = 'Total: ' + total + ' ml';
}

function addWater(amount) {
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  logs[today].push({ time, amount });
  saveAndRefresh();
}

function deleteEntry(index) {
  logs[today].splice(index, 1);
  saveAndRefresh();
}

function editEntry(index) {
  const entry = logs[today][index];
  const newAmount = prompt('Edit amount (ml):', entry.amount);
  if (newAmount && !isNaN(newAmount) && newAmount > 0) {
    logs[today][index].amount = parseInt(newAmount);
    saveAndRefresh();
  }
}

function saveAndRefresh() {
  localStorage.setItem('waterLogs', JSON.stringify(logs));
  renderLogs();
  updateProgress();
  updateTotal();
}

// Event Listeners
document.querySelectorAll('.quick-add-buttons button').forEach(btn => {
  btn.addEventListener('click', () => {
    addWater(parseInt(btn.getAttribute('data-amount')));
  });
});

document.getElementById('resetBtn').addEventListener('click', () => {
  if (confirm("Reset today's water intake? This cannot be undone.")) {
    logs[today] = [];
    saveAndRefresh();
  }
});

document.getElementById('viewCalendar').addEventListener('click', () => {
  alert('Calendar view coming soon! 📅\n\nYour data is saved locally.');
});

// Initialize
renderLogs();
updateProgress();
updateTotal();