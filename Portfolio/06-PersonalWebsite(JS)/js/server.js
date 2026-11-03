const scheduleForm = document.getElementById("schedule-form");
const scheduleBody = document.getElementById("schedule-body");

scheduleForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(scheduleForm);

  const row = document.createElement("tr");
  const fields = [
    "date",
    "start",
    "end",
    "description",
    "place",
    "type",
    "notes"
  ];

  fields.forEach((field) => {
    const cell = document.createElement("td");
    cell.textContent = formData.get(field) || "";
    row.appendChild(cell);
  });

  scheduleBody.appendChild(row);
  scheduleForm.reset();
});

