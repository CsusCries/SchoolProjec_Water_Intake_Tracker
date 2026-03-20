let currentDate = new Date();

let hydrationChart;
let monthlyChart;

// Convert time into groups
function getTimeGroup(timeStr) {
  const [hourMin, period] = timeStr.split(" ");
  let [hour] = hourMin.split(":").map(Number);

  if (period === "PM" && hour !== 12) hour += 12;
  if (period === "AM" && hour === 12) hour = 0;

  if (hour < 12) return "morning";
  else if (hour < 18) return "noon";
  else return "evening";
}

// Render calendar
function renderCalendar() {
  let calendar = document.getElementById("calendar");
  calendar.innerHTML = "";

  let year = currentDate.getFullYear();
  let month = currentDate.getMonth();

  let firstDay = new Date(year, month, 1).getDay();
  let daysInMonth = new Date(year, month + 1, 0).getDate();

  let monthNames = ["January","February","March","April","May","June",
                    "July","August","September","October","November","December"];

  document.getElementById("monthYear").innerText =
    monthNames[month] + " " + year;

  let logs = JSON.parse(localStorage.getItem("waterLogs")) || {};

  for (let i = 0; i < firstDay; i++) {
    calendar.appendChild(document.createElement("div"));
  }

  for (let day = 1; day <= daysInMonth; day++) {
    let cell = document.createElement("div");
    cell.classList.add("day");
    cell.innerText = day;

    let dateKey = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;

    if (logs[dateKey]) {
      let total = logs[dateKey].reduce((sum, e) => sum + e.amount, 0);
      cell.title = `💧 ${total} ml`;
      cell.classList.add("has-water");
    }

    cell.onclick = () => viewDay(dateKey);
    calendar.appendChild(cell);
  }

  renderGraph(logs, year, month);
  renderMonthlyComparison(logs);
}

function changeMonth(direction) {
  currentDate.setMonth(currentDate.getMonth() + direction);
  renderCalendar();
}

// View day details
function viewDay(dateKey) {
  document.getElementById("selectedDate").innerText = "Date: " + dateKey;

  let logs = JSON.parse(localStorage.getItem("waterLogs")) || {};

  const morningEl = document.getElementById("morningLogs");
  const noonEl = document.getElementById("noonLogs");
  const eveningEl = document.getElementById("eveningLogs");

  morningEl.innerHTML = "";
  noonEl.innerHTML = "";
  eveningEl.innerHTML = "";

  let total = 0;

  if (logs[dateKey]) {
    logs[dateKey].forEach((entry, idx) => {
      const li = document.createElement("li");
      li.textContent = `${entry.time} — ${entry.amount} ml`;

      const delBtn = document.createElement("button");
      delBtn.textContent = "🗑️";
      delBtn.className = "delete-btn";

      delBtn.onclick = () => {
        logs[dateKey].splice(idx, 1);
        localStorage.setItem("waterLogs", JSON.stringify(logs));
        viewDay(dateKey);
        renderCalendar();
      };

      li.appendChild(delBtn);

      const group = getTimeGroup(entry.time);

      if (group === "morning") morningEl.appendChild(li);
      else if (group === "noon") noonEl.appendChild(li);
      else eveningEl.appendChild(li);

      total += entry.amount;
    });
  }

  document.getElementById("dailyTotal").innerText = "Total: " + total + " ml";
}

// Daily Graph
function renderGraph(logs, year, month) {
  let labels = [];
  let data = [];

  let daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    let dateKey = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    labels.push(day);

    if (logs[dateKey]) {
      let total = logs[dateKey].reduce((sum, e) => sum + e.amount, 0);
      data.push(total);
    } else {
      data.push(0);
    }
  }

  const ctx = document.getElementById("hydrationChart").getContext("2d");

  if (hydrationChart) hydrationChart.destroy();

  hydrationChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [{
        label: "Water Intake (ml)",
        data: data,
        borderColor: "blue",
        backgroundColor: "rgba(0,123,255,0.2)",
        fill: true,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

// Monthly Comparison Graph
function renderMonthlyComparison(logs) {
  let monthlyTotals = Array(12).fill(0);

  Object.keys(logs).forEach(dateKey => {
    let [year, month] = dateKey.split("-");
    month = parseInt(month) - 1;

    let total = logs[dateKey].reduce((sum, e) => sum + e.amount, 0);

    monthlyTotals[month] += total;
  });

  const ctx = document.getElementById("monthlyComparisonChart").getContext("2d");

  if (monthlyChart) monthlyChart.destroy();

  monthlyChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
      datasets: [{
        label: "Monthly Water Intake (ml)",
        data: monthlyTotals,
        backgroundColor: "rgba(0,123,255,0.6)"
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

// Init
renderCalendar();