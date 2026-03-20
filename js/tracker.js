// tracker.js

document.addEventListener("DOMContentLoaded", () => {

  let today = new Date().toISOString().split('T')[0];
  let logs = JSON.parse(localStorage.getItem('waterLogs')) || {};
  if (!logs[today]) logs[today] = [];

  const morningLogsEl = document.getElementById('morningLogs');
  const noonLogsEl = document.getElementById('noonLogs');
  const nightLogsEl = document.getElementById('nightLogs');

  const goalDisplay = document.getElementById('goalDisplay');
  let goal = 2000;

  // --- Load saved goal ---
  let savedGoal = localStorage.getItem('waterGoal');
  if (savedGoal) {
    goal = parseInt(savedGoal);
  }
  goalDisplay.textContent = `${goal} ml`;

  // --- Time grouping ---
  function getTimeGroup(timeStr) {
    let [hour] = timeStr.split(":").map(Number);

    if (hour >= 5 && hour < 12) return "morning";
    else if (hour >= 12 && hour < 21) return "noon";
    else return "night";
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

    const totalEl = document.getElementById('dailyTotal');
    if (totalEl) totalEl.innerText = "Total: " + total + " ml";
  }

  // --- Update circle ---
  function updateCircle() {
    let total = logs[today].reduce((sum, e) => sum + e.amount, 0);
    let percent = Math.min(100, Math.round((total / goal) * 100));

    const currentEl = document.getElementById('current');
    const percentEl = document.getElementById('percent');
    const circle = document.querySelector('.circle');

    if (currentEl) currentEl.innerText = total + " ml";
    if (percentEl) percentEl.innerText = percent + "% of goal";

    if (circle) {
      circle.style.background =
        `conic-gradient(#3a86ff ${percent * 3.6}deg, #e0f0ff ${percent * 3.6}deg)`;
    }
  }

  // --- Add water ---
  function addWater(amount) {
    let now = new Date();
    let time = now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    let currentTotal = logs[today].reduce((sum, e) => sum + e.amount, 0);

    if (currentTotal + amount > goal) {
      alert(`You cannot exceed your daily goal of ${goal} ml!`);
      return;
    }

    logs[today].push({ time, amount });
    localStorage.setItem('waterLogs', JSON.stringify(logs));

    renderLogs();
    updateCircle();
  }

  // --- Quick add buttons ---
  document.querySelectorAll('.quick-add button').forEach(btn => {
    btn.addEventListener('click', () => {
      addWater(parseInt(btn.dataset.amount));
    });
  });

  // --- Custom add ---
  const customBtn = document.getElementById('customAddBtn');
  const customInput = document.getElementById('customAmount');

  if (customBtn && customInput) {
    customBtn.addEventListener('click', () => {
      let amount = parseInt(customInput.value);

      if (isNaN(amount) || amount <= 0) {
        alert("Please enter a valid amount!");
        return;
      }

      addWater(amount);
      customInput.value = "";
    });

    customInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        customBtn.click();
      }
    });
  }

  // --- Reset ---
  const resetBtn = document.getElementById('resetBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm("Reset today's intake?")) {
        logs[today] = [];
        localStorage.setItem('waterLogs', JSON.stringify(logs));
        renderLogs();
        updateCircle();
      }
    });
  }

  // --- Night mode ---
  const nightBtn = document.getElementById('nightModeBtn');
  if (nightBtn) {
    nightBtn.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
    });
  }

  // --- Midnight reset ---
  setInterval(() => {
    const now = new Date();
    if (now.getHours() === 0 && now.getMinutes() === 0) {
      logs[today] = [];
      localStorage.setItem('waterLogs', JSON.stringify(logs));
      renderLogs();
      updateCircle();
    }
  }, 60000);

  // --- Initial render ---
  renderLogs();
  updateCircle();

});