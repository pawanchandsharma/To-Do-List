const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const clearBtn = document.getElementById("clearBtn");
const taskList = document.getElementById("taskList");
const counter = document.getElementById("counter");
const prioritySelect = document.getElementById("prioritySelect");
const dueDateInput = document.getElementById("dueDate");
const searchInput = document.getElementById("searchInput");
const filterSelect = document.getElementById("filterSelect");

let tasks = [];

// Load tasks from localStorage
if (localStorage.getItem("tasks")) {
    tasks = JSON.parse(localStorage.getItem("tasks"));
    tasks.forEach(task => renderTask(task));
}
updateCounter();


// Set minimum date to today
const today = new Date();
const yyyy = today.getFullYear();
const mm = String(today.getMonth() + 1).padStart(2, "0");
const dd = String(today.getDate()).padStart(2, "0");
dueDateInput.min = `${yyyy}-${mm}-${dd}`;

// Counter update
function updateCounter() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;
    counter.textContent = `Total: ${total} | Completed: ${completed} | Pending: ${pending}`;
}

// Save tasks
function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Get background color
function getPriorityColor(priority) {
    return priority === "high" ? "#ffcdd2" : priority === "medium" ? "#fff9c4" : "#c8e6c9";
}

// Render a task
function renderTask(task) {
    const li = document.createElement("li");
    li.classList.add(task.priority);

    // Task text
    const span = document.createElement("span");
    span.textContent = task.text;
    if (task.completed) span.classList.add("completed");

    span.addEventListener("click", () => {
        task.completed = !task.completed;
        span.classList.toggle("completed");
        updateCounter();
        saveTasks();
        applyFilters();
    });

    // Edit priority dropdown
    const priorityDropdown = document.createElement("select");
    ["low","medium","high"].forEach(p => {
        const option = document.createElement("option");
        option.value = p;
        option.textContent = p.charAt(0).toUpperCase() + p.slice(1);
        if (task.priority === p) option.selected = true;
        priorityDropdown.appendChild(option);
    });
    priorityDropdown.addEventListener("change", () => {
        li.classList.remove(task.priority);
        task.priority = priorityDropdown.value;
        li.classList.add(task.priority);
        saveTasks();
    });

    // Due date input
    const dateInput = document.createElement("input");
    dateInput.type = "date";
    dateInput.value = task.dueDate || "";
    dateInput.addEventListener("change", () => {
        task.dueDate = dateInput.value;
        saveTasks();
    });

    // Delete button
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "X";
    deleteBtn.addEventListener("click", () => {
        tasks = tasks.filter(t => t !== task);
        li.remove();
        updateCounter();
        saveTasks();
    });

    li.appendChild(span);
    li.appendChild(priorityDropdown);
    li.appendChild(dateInput);
    li.appendChild(deleteBtn);
    taskList.appendChild(li);
}

// Add task
function addTask() {
    const text = taskInput.value.trim();
    const priority = prioritySelect.value;
    const dueDate = dueDateInput.value;

    if (!text) return;

    const task = { text, priority, completed: false, dueDate };
    tasks.push(task);
    renderTask(task);
    taskInput.value = "";
    dueDateInput.value = "";
    updateCounter();
    saveTasks();
    applyFilters();
}

// Clear all tasks
clearBtn.addEventListener("click", () => {
    tasks = [];
    taskList.innerHTML = "";
    updateCounter();
    localStorage.removeItem("tasks");
});

// Filter & Search
function applyFilters() {
    const searchText = searchInput.value.toLowerCase();
    const filter = filterSelect.value;

    Array.from(taskList.children).forEach((li, index) => {
        const task = tasks[index];
        let matchesSearch = task.text.toLowerCase().includes(searchText);
        let matchesFilter = (filter === "all") ||
                            (filter === "completed" && task.completed) ||
                            (filter === "pending" && !task.completed);
        li.style.display = (matchesSearch && matchesFilter) ? "flex" : "none";
    });
}

searchInput.addEventListener("input", applyFilters);
filterSelect.addEventListener("change", applyFilters);

// Add task on click or Enter
addBtn.addEventListener("click", addTask);
taskInput.addEventListener("keypress", e => { if(e.key === "Enter") addTask(); });
