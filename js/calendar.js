let currentDate = new Date();

function getTimeGroup(timeStr) {
  const [hourMin, period] = timeStr.split(" ");
  let [hour, minute] = hourMin.split(":").map(Number);
  if (period === "PM" && hour !== 12) hour += 12;
  if (period === "AM" && hour === 12) hour = 0;
  if (hour < 12) return "morning";
  else if (hour < 18) return "noon";
  else return "evening";
}

function renderCalendar() {
  let calendar = document.getElementById("calendar");
  calendar.innerHTML = "";

  let year = currentDate.getFullYear();
  let month = currentDate.getMonth();
  let firstDay = new Date(year, month, 1).getDay();
  let daysInMonth = new Date(year, month+1,0).getDate();

  let monthNames = ["January","February","March","April","May","June",
                    "July","August","September","October","November","December"];
  document.getElementById("monthYear").innerText = monthNames[month] + " " + year;

  let logs = JSON.parse(localStorage.getItem("waterLogs")) || {};

  for(let i=0; i<firstDay; i++){
    calendar.appendChild(document.createElement("div"));
  }

  for(let day=1; day<=daysInMonth; day++){
    let cell = document.createElement("div");
    cell.classList.add("day");
    cell.innerText = day;

    let monthStr = (month+1).toString().padStart(2,'0');
    let dayStr = day.toString().padStart(2,'0');
    let dateKey = year + "-" + monthStr + "-" + dayStr;

    if(logs[dateKey]){
      let total = logs[dateKey].reduce((sum,e)=>sum+e.amount,0);
      cell.title = "💧 " + total + " ml";
      cell.classList.add("has-water");
    }

    cell.onclick = () => viewDay(dateKey);
    calendar.appendChild(cell);
  }
}

function changeMonth(direction){
  currentDate.setMonth(currentDate.getMonth() + direction);
  renderCalendar();
}

function viewDay(dateKey){
  document.getElementById("selectedDate").innerText = "Date: "+dateKey;

  let logs = JSON.parse(localStorage.getItem("waterLogs")) || {};
  const morningEl = document.getElementById("morningLogs");
  const noonEl = document.getElementById("noonLogs");
  const eveningEl = document.getElementById("eveningLogs");

  morningEl.innerHTML = "";
  noonEl.innerHTML = "";
  eveningEl.innerHTML = "";

  let total = 0;
  if(logs[dateKey]){
    logs[dateKey].forEach((entry, idx) => {
      const li = document.createElement("li");
      li.textContent = `${entry.time} — ${entry.amount} ml`;

      const delBtn = document.createElement("button");
      delBtn.textContent = "🗑️";
      delBtn.className = "delete-btn";
      delBtn.onclick = () => {
        logs[dateKey].splice(idx,1);
        localStorage.setItem("waterLogs", JSON.stringify(logs));
        viewDay(dateKey);
      }
      li.appendChild(delBtn);

      const group = getTimeGroup(entry.time);
      if(group === "morning") morningEl.appendChild(li);
      else if(group === "noon") noonEl.appendChild(li);
      else eveningEl.appendChild(li);

      total += entry.amount;
    });
  }
  document.getElementById("dailyTotal").innerText = "Total: "+total+" ml";
}

// Init
renderCalendar();