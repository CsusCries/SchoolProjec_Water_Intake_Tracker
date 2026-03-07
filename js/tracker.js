// tracker.js

let today = new Date().toISOString().split('T')[0];
let logs = JSON.parse(localStorage.getItem('waterLogs')) || {};
if (!logs[today]) logs[today] = [];

const morningLogsEl = document.getElementById('morningLogs');
const noonLogsEl = document.getElementById('noonLogs');
const nightLogsEl = document.getElementById('nightLogs');

const goalDisplay = document.getElementById('goalDisplay');
let goal = 2000; // default fallback

// --- Load saved goal from localStorage ---
let savedGoal = localStorage.getItem('waterGoal');
if (savedGoal) {
  goal = parseInt(savedGoal);
}
goalDisplay.textContent = `${goal} ml`;

// --- Determine time group (Morning, Noon, Night) ---
function getTimeGroup(timeStr) {
  let [hour] = timeStr.split(":").map(Number);

  if (hour >= 5 && hour < 12) {
    return "morning";   // 5 AM – 11:59 AM
  } else if (hour >= 12 && hour < 21) {
    return "noon";      // 12 PM – 8:59 PM
  } else {
    return "night";     // 9 PM – 4:59 AM
  }
}

// --- Render logs ---
function renderLogs() {
  morningLogsEl.innerHTML = "";
  noonLogsEl.innerHTML = "";
  nightLogsEl.innerHTML = "";

  let total = 0;
  logs[today].forEach((entry, idx) => {
    const li = document.createElement('li');
    li.textContent = `${entry.time} — ${entry.amount} ml`;

    const delBtn = document.createElement('button');
    delBtn.textContent = "🗑️";
    delBtn.className = "delete-btn";
    delBtn.onclick = () => {
      logs[today].splice(idx, 1);
      localStorage.setItem('waterLogs', JSON.stringify(logs));
      renderLogs();
      updateCircle();
    };
    li.appendChild(delBtn);

    const group = getTimeGroup(entry.time);
    if (group === "morning") morningLogsEl.appendChild(li);
    else if (group === "noon") noonLogsEl.appendChild(li);
    else nightLogsEl.appendChild(li);

    total += entry.amount;
  });

  document.getElementById('dailyTotal').innerText = "Total: " + total + " ml";
}

// --- Update circular progress ---
function updateCircle() {
  let total = logs[today].reduce((sum, e) => sum + e.amount, 0);
  let percent = Math.min(100, Math.round((total / goal) * 100));
  document.getElementById('current').innerText = total + " ml";
  document.getElementById('percent').innerText = percent + "% of goal";
  document.querySelector('.circle').style.background =
    `conic-gradient(#3a86ff ${percent * 3.6}deg, #e0f0ff ${percent * 3.6}deg)`;
}

// --- Add water (24-hour format for accuracy) ---
function addWater(amount) {
  let now = new Date();
  let time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  logs[today].push({ time, amount });
  localStorage.setItem('waterLogs', JSON.stringify(logs));
  renderLogs();
  updateCircle();
}

// --- Quick-add buttons ---
document.querySelectorAll('.quick-add button').forEach(btn => {
  btn.addEventListener('click', () => addWater(parseInt(btn.dataset.amount)));
});

// --- Reset today manually ---
document.getElementById('resetBtn').addEventListener('click', () => {
  if (confirm("Reset today's intake?")) {
    logs[today] = [];
    localStorage.setItem('waterLogs', JSON.stringify(logs));
    renderLogs();
    updateCircle();
  }
});

// --- Initial render ---
renderLogs();
updateCircle();

// --- Optional: live reset at midnight ---
function checkMidnightReset() {
  const now = new Date();
  if (now.getHours() === 0 && now.getMinutes() === 0) {
    logs[today] = [];
    localStorage.setItem('waterLogs', JSON.stringify(logs));
    renderLogs();
    updateCircle();
  }
}
setInterval(checkMidnightReset, 60000); // check every minute

document.getElementById('nightModeBtn').addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
});
