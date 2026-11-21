// ---------- 1. Data ----------
// Every task is an object like: { id: 1700000000000, text: "Study Java", done: false }
const STORAGE_KEY = "focus-list-tasks";
let tasks = loadTasks();
let currentFilter = "all"; // "all", "active" or "done"

// ---------- 2. Grab the elements from the page ----------
const form = document.getElementById("task-form");
const input = document.getElementById("task-input");
const list = document.getElementById("task-list");
const emptyMessage = document.getElementById("empty-message");
const countLabel = document.getElementById("count");
const clearButton = document.getElementById("clear-done");
const filterButtons = document.querySelectorAll(".filters button");

// ---------- 3. Saving and loading (so tasks stay after you close the page) ----------
function loadTasks() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch (error) {
    return []; // if saved data is broken, start fresh
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// ---------- 4. Actions ----------
function addTask(text) {
  tasks.push({ id: Date.now(), text: text, done: false });
  update();
}

function toggleTask(id) {
  const task = tasks.find((t) => t.id === id);
  task.done = !task.done;
  update();
}

function deleteTask(id) {
  tasks = tasks.filter((t) => t.id !== id);
  update();
}

function clearCompleted() {
  tasks = tasks.filter((t) => !t.done);
  update();
}

// Save, then redraw the screen
function update() {
  saveTasks();
  render();
}

// ---------- 5. Drawing the list on the screen ----------
function render() {
  list.innerHTML = ""; // empty the list, then rebuild it

  // Choose which tasks to show based on the selected filter
  const visibleTasks = tasks.filter((t) => {
    if (currentFilter === "active") return !t.done;
    if (currentFilter === "done") return t.done;
    return true;
  });

  visibleTasks.forEach((task) => {
    const item = document.createElement("li");
    item.className = "task" + (task.done ? " done" : "");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.done;
    checkbox.setAttribute("aria-label", "Mark done: " + task.text);
    checkbox.addEventListener("change", () => toggleTask(task.id));

    const label = document.createElement("span");
    label.textContent = task.text; // textContent is safe: it never runs typed code

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "Delete";
    deleteBtn.setAttribute("aria-label", "Delete task: " + task.text);
    deleteBtn.addEventListener("click", () => deleteTask(task.id));

    item.append(checkbox, label, deleteBtn);
    list.appendChild(item);
  });

  // Show the "empty" message when there is nothing to display
  emptyMessage.hidden = visibleTasks.length > 0;

  // Footer: how many tasks are left
  const remaining = tasks.filter((t) => !t.done).length;
  countLabel.textContent = remaining === 1 ? "1 task left" : remaining + " tasks left";
  clearButton.hidden = !tasks.some((t) => t.done);
}

// ---------- 6. Listening for what the user does ----------
form.addEventListener("submit", (event) => {
  event.preventDefault(); // stop the page from reloading
  const text = input.value.trim();
  if (text === "") return; // ignore empty tasks
  addTask(text);
  input.value = "";
  input.focus();
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    filterButtons.forEach((b) => b.classList.toggle("active", b === button));
    render();
  });
});

clearButton.addEventListener("click", clearCompleted);

// ---------- 7. Start ----------
render();
