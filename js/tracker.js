let today = new Date().toISOString().split('T')[0];
let logs = JSON.parse(localStorage.getItem('waterLogs')) || {};
if (!logs[today]) logs[today] = [];

const morningLogsEl = document.getElementById('morningLogs');
const noonLogsEl = document.getElementById('noonLogs');
const eveningLogsEl = document.getElementById('eveningLogs');

const goalInput = document.getElementById('goalInput');
let goal = parseInt(goalInput.value) || 2000;

// Load saved goal
let savedGoal = localStorage.getItem('waterGoal');
if(savedGoal){
  goal = parseInt(savedGoal);
  goalInput.value = goal;
}

// Update goal on change
goalInput.addEventListener('change', ()=>{
  let val = parseInt(goalInput.value);
  if(isNaN(val) || val<100) val=100;
  goal=val;
  localStorage.setItem('waterGoal', goal);
  goalInput.value = goal;
  updateCircle();
});

// Determine time group
function getTimeGroup(timeStr){
  let [hour, minute] = timeStr.split(":").map(Number);
  if(hour<12) return "morning";
  else if(hour<18) return "noon";
  else return "evening";
}

// Render logs
function renderLogs(){
  morningLogsEl.innerHTML="";
  noonLogsEl.innerHTML="";
  eveningLogsEl.innerHTML="";

  let total = 0;
  logs[today].forEach((entry, idx)=>{
    const li = document.createElement('li');
    li.textContent = `${entry.time} — ${entry.amount} ml`;

    const delBtn = document.createElement('button');
    delBtn.textContent="🗑️";
    delBtn.className="delete-btn";
    delBtn.onclick=()=>{
      logs[today].splice(idx,1);
      localStorage.setItem('waterLogs', JSON.stringify(logs));
      renderLogs();
      updateCircle();
    }
    li.appendChild(delBtn);

    const group=getTimeGroup(entry.time);
    if(group==="morning") morningLogsEl.appendChild(li);
    else if(group==="noon") noonLogsEl.appendChild(li);
    else eveningLogsEl.appendChild(li);

    total+=entry.amount;
  });

  document.getElementById('dailyTotal').innerText="Total: "+total+" ml";
}

// Update circular progress
function updateCircle(){
  let total = logs[today].reduce((sum,e)=>sum+e.amount,0);
  let percent=Math.min(100, Math.round((total/goal)*100));
  document.getElementById('current').innerText=total+" ml";
  document.getElementById('percent').innerText=percent+"% of goal";
  document.querySelector('.circle').style.background=`conic-gradient(#3a86ff ${percent*3.6}deg, #e0f0ff ${percent*3.6}deg)`;
}

// Add water
function addWater(amount){
  let time = new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
  logs[today].push({time, amount});
  localStorage.setItem('waterLogs', JSON.stringify(logs));
  renderLogs();
  updateCircle();
}

// Quick-add buttons
document.querySelectorAll('.quick-add button').forEach(btn=>{
  btn.addEventListener('click', ()=>addWater(parseInt(btn.dataset.amount)));
});

// Reset today
document.getElementById('resetBtn').addEventListener('click', ()=>{
  if(confirm("Reset today's intake?")){
    logs[today]=[];
    localStorage.setItem('waterLogs', JSON.stringify(logs));
    renderLogs();
    updateCircle();
  }
});

// Initial render
renderLogs();
updateCircle();