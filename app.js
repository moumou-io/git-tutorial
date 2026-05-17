const STORAGE_KEY = "todo-app-items";

const todoForm = document.getElementById("todoForm");
const todoInput = document.getElementById("todoInput");
const todoList = document.getElementById("todoList");
const toolbar = document.getElementById("toolbar");
const footer = document.getElementById("footer");
const emptyState = document.getElementById("emptyState");
const itemsLeft = document.getElementById("itemsLeft");
const clearCompleted = document.getElementById("clearCompleted");
const filterButtons = document.querySelectorAll(".filter-btn");

let todos = loadTodos();
let currentFilter = "all";

function loadTodos() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function createId() {
  return crypto.randomUUID?.() ?? String(Date.now() + Math.random());
}

function getFilteredTodos() {
  if (currentFilter === "active") {
    return todos.filter((t) => !t.completed);
  }
  if (currentFilter === "completed") {
    return todos.filter((t) => t.completed);
  }
  return todos;
}

function render() {
  const filtered = getFilteredTodos();
  const activeCount = todos.filter((t) => !t.completed).length;
  const completedCount = todos.length - activeCount;

  todoList.innerHTML = "";

  filtered.forEach((todo) => {
    const li = document.createElement("li");
    li.className = `todo-item${todo.completed ? " completed" : ""}`;
    li.dataset.id = todo.id;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "todo-checkbox";
    checkbox.checked = todo.completed;
    checkbox.setAttribute("aria-label", "标记完成");

    const span = document.createElement("span");
    span.className = "todo-text";
    span.textContent = todo.text;

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "btn-delete";
    deleteBtn.setAttribute("aria-label", "删除任务");
    deleteBtn.textContent = "×";

    checkbox.addEventListener("change", () => toggleTodo(todo.id));
    deleteBtn.addEventListener("click", () => deleteTodo(todo.id));

    li.append(checkbox, span, deleteBtn);
    todoList.appendChild(li);
  });

  const hasTodos = todos.length > 0;
  toolbar.hidden = !hasTodos;
  footer.hidden = !hasTodos;
  emptyState.classList.toggle("hidden", hasTodos);
  clearCompleted.hidden = completedCount === 0;

  itemsLeft.textContent =
    activeCount === 0
      ? "全部完成"
      : `${activeCount} 项待完成`;
}

function addTodo(text) {
  const trimmed = text.trim();
  if (!trimmed) return;

  todos.unshift({
    id: createId(),
    text: trimmed,
    completed: false,
  });

  saveTodos();
  render();
}

function toggleTodo(id) {
  const todo = todos.find((t) => t.id === id);
  if (todo) {
    todo.completed = !todo.completed;
    saveTodos();
    render();
  }
}

function deleteTodo(id) {
  todos = todos.filter((t) => t.id !== id);
  saveTodos();
  render();
}

function clearCompletedTodos() {
  todos = todos.filter((t) => !t.completed);
  saveTodos();
  render();
}

todoForm.addEventListener("submit", (e) => {
  e.preventDefault();
  addTodo(todoInput.value);
  todoInput.value = "";
  todoInput.focus();
});

filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    render();
  });
});

clearCompleted.addEventListener("click", clearCompletedTodos);

render();
