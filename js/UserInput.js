document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("userInfoForm");
  const output = document.getElementById("estimateOutput");

  // --- Restore saved values into the form ---
  document.getElementById("name").value = localStorage.getItem("userName") || "";
  document.getElementById("weight").value = localStorage.getItem("userWeight") || "";
  document.getElementById("age").value = localStorage.getItem("userAge") || "";
  document.getElementById("activity").value = localStorage.getItem("userActivity") || "";
  document.getElementById("climate").value = localStorage.getItem("userClimate") || "";

  const savedGoal = localStorage.getItem("waterGoal");
  if (savedGoal) {
    output.textContent = `Recommended Daily Goal: ${savedGoal} ml`;
  }

  // --- Handle form submission ---
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const weight = parseFloat(document.getElementById("weight").value);
    const age = parseInt(document.getElementById("age").value);
    const activity = document.getElementById("activity").value;
    const climate = document.getElementById("climate").value;

    if (!weight || weight <= 0) {
      output.textContent = "Please enter a valid weight.";
      return;
    }

    // Base formula: weight × 35 ml
    let intake = weight * 35;

    // Adjustments
    if (age && age > 55) intake *= 0.9;
    if (activity === "moderate") intake *= 1.1;
    if (activity === "high") intake *= 1.2;
    if (climate === "warm") intake *= 1.1;
    if (climate === "hot") intake *= 1.2;

    const recommended = Math.round(intake);

    output.textContent = `Recommended Daily Goal: ${recommended} ml`;

    // Save everything consistently
    localStorage.setItem("userName", name); // <-- always save, even if empty
    localStorage.setItem("userWeight", weight);
    localStorage.setItem("userAge", age || "");
    localStorage.setItem("userActivity", activity || "");
    localStorage.setItem("userClimate", climate || "");
    localStorage.setItem("waterGoal", recommended);

    // Redirect to tracker page
    window.location.href = "index.html";
  });
});
