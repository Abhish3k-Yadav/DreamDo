// DOM Elements
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const taskInput = document.getElementById('taskInput');
const clearAll = document.getElementById('clearAll');
const toggleMode = document.getElementById('toggleMode');
const quoteEl = document.getElementById('quote');
const totalTasksEl = document.getElementById('totalTasks');
const completedTasksEl = document.getElementById('completedTasks');
const pendingTasksEl = document.getElementById('pendingTasks');
const emptyState = document.getElementById('emptyState');
const toastContainer = document.getElementById('toastContainer');

// State Management
let tasks = JSON.parse(localStorage.getItem('dreamdo-tasks')) || [];
let currentFilter = 'all';
let taskIdCounter = parseInt(localStorage.getItem('dreamdo-task-counter')) || 1;

// Inspirational Quotes
const quotes = [
  'Push yourself, because no one else is going to do it for you.',
  'Great things never come from comfort zones.',
  "Success doesn't just find you. You have to go out and get it.",
  'Dream it. Believe it. Build it.',
  'Do something today that your future self will thank you for.',
  'Small progress is still progress. Keep going!',
  'The future depends on what you do today.',
  "Your limitation—it's only your imagination.",
  'Dream bigger. Do bigger.',
  "The harder you work for something, the greater you'll feel when you achieve it.",
  'Dream it. Wish it. Do it.',
  'Success is what happens after you have survived all your failures.',
  "Don't stop when you're tired. Stop when you're done.",
];

// Initialize App
function init() {
  displayRandomQuote();
  loadTheme();
  setupEventListeners();
  renderTasks();
  updateStats();
}

// Display Random Quote
function displayRandomQuote() {
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  quoteEl.textContent = randomQuote;
}

// Theme Management
function loadTheme() {
  const savedTheme = localStorage.getItem('dreamdo-theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  // Add sparkles if dark theme
  setTimeout(() => {
    addSparkles();
  }, 100);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';

  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('dreamdo-theme', newTheme);
  updateThemeIcon(newTheme);

  // Add sparkles for dark theme
  setTimeout(() => {
    addSparkles();
  }, 300);

  showToast(`Switched to ${newTheme} mode`, 'success');
}

function updateThemeIcon(theme) {
  const icon = toggleMode.querySelector('i');
  icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
}

// Toast Notifications
function showToast(message, type = 'info') {
  // Remove any existing toasts first
  const existingToasts = toastContainer.querySelectorAll('.toast');
  existingToasts.forEach((existingToast) => {
    existingToast.style.animation = 'slideInRight 0.3s ease-out reverse';
    setTimeout(() => {
      if (existingToast.parentNode) {
        existingToast.parentNode.removeChild(existingToast);
      }
    }, 300);
  });

  // Create new toast after a brief delay to ensure smooth transition
  setTimeout(
    () => {
      const toast = document.createElement('div');
      toast.className = `toast ${type}`;
      toast.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px;">
        <i class="fas ${getToastIcon(type)}"></i>
        <span>${message}</span>
      </div>
    `;

      toastContainer.appendChild(toast);

      // Auto remove after 3 seconds
      setTimeout(() => {
        toast.style.animation = 'slideInRight 0.3s ease-out reverse';
        setTimeout(() => {
          if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
          }
        }, 300);
      }, 3000);
    },
    existingToasts.length > 0 ? 350 : 0
  );
}

function getToastIcon(type) {
  switch (type) {
    case 'success':
      return 'fa-check-circle';
    case 'error':
      return 'fa-exclamation-circle';
    case 'warning':
      return 'fa-exclamation-triangle';
    default:
      return 'fa-info-circle';
  }
}

// Task Management
function createTask(text) {
  if (!text.trim()) {
    showToast('Please enter a task!', 'warning');
    return;
  }

  const task = {
    id: taskIdCounter++,
    text: text.trim(),
    completed: false,
    createdAt: new Date().toISOString(),
  };

  tasks.unshift(task);
  saveTasks();
  renderTasks();
  updateStats();
  taskInput.value = '';

  showToast('Task added successfully!', 'success');
}

function toggleTaskComplete(taskId) {
  const task = tasks.find((t) => t.id === taskId);
  if (task) {
    task.completed = !task.completed;
    saveTasks();
    renderTasks();
    updateStats();

    const message = task.completed
      ? 'Task completed! 🎉'
      : 'Task marked as pending';
    showToast(message, task.completed ? 'success' : 'info');
  }
}

function deleteTask(taskId) {
  const taskIndex = tasks.findIndex((t) => t.id === taskId);
  if (taskIndex !== -1) {
    const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);

    // Animate removal
    if (taskElement) {
      taskElement.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => {
        tasks.splice(taskIndex, 1);
        saveTasks();
        renderTasks();
        updateStats();
        showToast('Task deleted', 'info');
      }, 300);
    } else {
      tasks.splice(taskIndex, 1);
      saveTasks();
      renderTasks();
      updateStats();
      showToast('Task deleted', 'info');
    }
  }
}

function clearAllTasks() {
  if (tasks.length === 0) {
    showToast('No tasks to clear!', 'warning');
    return;
  }

  if (
    confirm(
      'Are you sure you want to delete all tasks? This action cannot be undone.'
    )
  ) {
    tasks = [];
    saveTasks();
    renderTasks();
    updateStats();
    showToast('All tasks cleared!', 'success');
  }
}

// Filtering
function setFilter(filter) {
  currentFilter = filter;
  renderTasks();

  // Update filter buttons
  document.querySelectorAll('.filter-tab').forEach((btn) => {
    btn.classList.remove('active');
  });
  document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
}

function getFilteredTasks() {
  switch (currentFilter) {
    case 'completed':
      return tasks.filter((task) => task.completed);
    case 'pending':
      return tasks.filter((task) => !task.completed);
    default:
      return tasks;
  }
}

// Rendering
function renderTasks() {
  const filteredTasks = getFilteredTasks();

  if (filteredTasks.length === 0) {
    todoList.style.display = 'none';
    emptyState.style.display = 'block';
    updateEmptyStateMessage();
  } else {
    todoList.style.display = 'block';
    emptyState.style.display = 'none';

    todoList.innerHTML = filteredTasks
      .map((task) => createTaskHTML(task))
      .join('');
  }
}

function updateEmptyStateMessage() {
  const emptyIcon = emptyState.querySelector('.empty-icon i');
  const emptyTitle = emptyState.querySelector('h3');
  const emptyText = emptyState.querySelector('p');

  switch (currentFilter) {
    case 'completed':
      emptyIcon.className = 'fas fa-check-circle';
      emptyTitle.textContent = 'No completed tasks';
      emptyText.textContent = 'Complete some tasks to see them here!';
      break;
    case 'pending':
      emptyIcon.className = 'fas fa-clock';
      emptyTitle.textContent = 'No pending tasks';
      emptyText.textContent = "Great! You're all caught up!";
      break;
    default:
      emptyIcon.className = 'fas fa-clipboard-list';
      emptyTitle.textContent = 'No tasks yet';
      emptyText.textContent = 'Add your first task to get started!';
  }
}

function createTaskHTML(task) {
  return `
    <li class="task-item ${task.completed ? 'completed' : ''}" data-task-id="${
    task.id
  }">
      <div class="task-checkbox ${task.completed ? 'checked' : ''}" 
           onclick="toggleTaskComplete(${task.id})"></div>
      <span class="task-text">${escapeHtml(task.text)}</span>
      <div class="task-actions">
        <button class="task-action-btn delete" onclick="deleteTask(${
          task.id
        })" title="Delete task">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </li>
  `;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Statistics
function updateStats() {
  const total = tasks.length;
  const completed = tasks.filter((task) => task.completed).length;
  const pending = total - completed;

  totalTasksEl.textContent = total;
  completedTasksEl.textContent = completed;
  pendingTasksEl.textContent = pending;
}

// Data Persistence
function saveTasks() {
  localStorage.setItem('dreamdo-tasks', JSON.stringify(tasks));
  localStorage.setItem('dreamdo-task-counter', taskIdCounter.toString());
}

// Event Listeners
function setupEventListeners() {
  // Add task
  addBtn.addEventListener('click', () => createTask(taskInput.value));

  // Enter key to add task
  taskInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      createTask(taskInput.value);
    }
  });

  // Clear all tasks
  clearAll.addEventListener('click', clearAllTasks);

  // Toggle theme
  toggleMode.addEventListener('click', toggleTheme);

  // Filter tabs
  document.querySelectorAll('.filter-tab').forEach((btn) => {
    btn.addEventListener('click', () => {
      setFilter(btn.dataset.filter);
    });
  });

  // Auto-focus input
  taskInput.focus();

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K to focus input
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      taskInput.focus();
      taskInput.select();
    }

    // Ctrl/Cmd + Shift + D to toggle theme
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
      e.preventDefault();
      toggleTheme();
    }
  });
}

// CSS Animation for task removal
const style = document.createElement('style');
style.textContent = `
  @keyframes slideOut {
    from {
      opacity: 1;
      transform: translateX(0);
    }
    to {
      opacity: 0;
      transform: translateX(-100%);
    }
  }
  
  /* Additional sparkle animation for dark theme */
  [data-theme="dark"] .floating-shapes .sparkle {
    position: absolute;
    width: 4px;
    height: 4px;
    background: #667eea;
    border-radius: 50%;
    animation: sparkle 3s ease-in-out infinite;
    box-shadow: 0 0 6px #667eea;
  }
  
  .sparkle:nth-child(5) { top: 15%; left: 25%; animation-delay: 0s; }
  .sparkle:nth-child(6) { top: 45%; left: 75%; animation-delay: 1s; }
  .sparkle:nth-child(7) { top: 75%; left: 35%; animation-delay: 2s; }
  .sparkle:nth-child(8) { top: 25%; left: 85%; animation-delay: 0.5s; }
  .sparkle:nth-child(9) { top: 65%; left: 15%; animation-delay: 1.5s; }
`;
document.head.appendChild(style);

// Add sparkle elements for dark theme
function addSparkles() {
  const floatingShapes = document.querySelector('.floating-shapes');
  if (
    floatingShapes &&
    document.documentElement.getAttribute('data-theme') === 'dark'
  ) {
    // Remove existing sparkles
    const existingSparkles = floatingShapes.querySelectorAll('.sparkle');
    existingSparkles.forEach((sparkle) => sparkle.remove());

    // Add new sparkles
    for (let i = 0; i < 5; i++) {
      const sparkle = document.createElement('div');
      sparkle.className = 'sparkle';
      sparkle.style.top = Math.random() * 100 + '%';
      sparkle.style.left = Math.random() * 100 + '%';
      sparkle.style.animationDelay = Math.random() * 3 + 's';
      floatingShapes.appendChild(sparkle);
    }
  } else if (floatingShapes) {
    // Remove sparkles in light theme
    const existingSparkles = floatingShapes.querySelectorAll('.sparkle');
    existingSparkles.forEach((sparkle) => sparkle.remove());
  }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Initialize immediately if DOM is already loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
