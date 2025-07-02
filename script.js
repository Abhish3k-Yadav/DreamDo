const addBtn = document.getElementById("addBtn");
const todoList = document.getElementById("todoList");
const taskInput = document.getElementById("taskInput");
const clearAll = document.getElementById("clearAll");
const toggleMode = document.getElementById("toggleMode");
const taskCount = document.getElementById("taskCount");
const quoteEl = document.getElementById("quote");

const quotes = [
  "Push yourself, because no one else is going to do it for you.",
  "Great things never come from comfort zones.",
  "Success doesn’t just find you. You have to go out and get it.",
  "Dream it. Believe it. Build it.",
  "Do something today that your future self will thank you for.",
  "Small progress is still progress. Keep going!",
];

quoteEl.textContent = quotes[Math.floor(Math.random() * quotes.length)];

function updateTaskCount() {
  const count = document.querySelectorAll("#todoList li").length;
  taskCount.textContent = `${count} mission${count !== 1 ? "s" : ""} to conquer`;
}

function createTask(text) {
  const li = document.createElement("li");

  const leftDiv = document.createElement("div");
  leftDiv.className = "left";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";

  const span = document.createElement("span");
  span.textContent = text;

  checkbox.addEventListener("change", () => {
    span.classList.toggle("completed");
  });

  leftDiv.appendChild(checkbox);
  leftDiv.appendChild(span);

  const delBtn = document.createElement("button");
  delBtn.textContent = "❌";
  delBtn.className = "delete";

  delBtn.addEventListener("click", () => {
    li.style.opacity = "0";
    setTimeout(() => {
      li.remove();
      updateTaskCount();
    }, 300);
  });

  li.appendChild(leftDiv);
  li.appendChild(delBtn);
  todoList.appendChild(li);
  updateTaskCount();
}

function addTask() {
  const task = taskInput.value.trim();
  if (task !== "") {
    createTask(task);
    taskInput.value = "";
  }
}

addBtn.addEventListener("click", addTask);

taskInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addTask();
});

clearAll.addEventListener("click", () => {
  todoList.innerHTML = "";
  updateTaskCount();
});

toggleMode.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  toggleMode.textContent = document.body.classList.contains("dark-mode") ? "☀️" : "🌙";
});
