// === Sidebar Toggle ===
document.addEventListener('DOMContentLoaded', () => {
 const hamburger = document.getElementById('hamburgerMenu');
  const sidebar = document.getElementById('sidebar');
  const closeSidebar = document.getElementById("closeSidebar");

  if (hamburger && sidebar) {
    hamburger.addEventListener("click", () => {
      sidebar.classList.add("open");
    });
  }

  if (closeSidebar && sidebar) {
    closeSidebar.addEventListener("click", () => {
      sidebar.classList.remove("open");
    });
  }

  // === Date and Day Display ===
  const today = new Date();
  const highlight = document.querySelector(".highlight");
  if (highlight) highlight.textContent = today.toLocaleDateString();

  const dayName = document.querySelector(".day-name");
  if (dayName) {
    const options = { weekday: 'long' };
    dayName.textContent = today.toLocaleDateString(undefined, options);
  }

  // === Task Data from Local Storage ===
  let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

  // === Utility Functions ===
  function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }

  function getRandomAvatar() {
    const pics = [
      'https://picsum.photos/40?random=1',
      'https://picsum.photos/40?random=2',
      'https://picsum.photos/40?random=3',
      'https://picsum.photos/40?random=4',
      'https://picsum.photos/40?random=5',
      'https://picsum.photos/40?random=6',
      'https://picsum.photos/40?random=7',
      'https://picsum.photos/40?random=8',
      'https://picsum.photos/40?random=9',
      'https://picsum.photos/40?random=10'
    ];
    return pics[Math.floor(Math.random() * pics.length)];
  }

  function showSnackbar(message) {
    const snackbar = document.createElement('div');
    snackbar.className = 'snackbar';
    snackbar.textContent = message;
    document.body.appendChild(snackbar);
    setTimeout(() => snackbar.classList.add('show'), 10);
    setTimeout(() => {
      snackbar.classList.remove('show');
      setTimeout(() => snackbar.remove(), 300);
    }, 2500);
  }

  // === Modal Elements ===
  const modal = document.getElementById('taskModal');
  const closeModal = document.querySelector('.modal .close');
  const addTaskBtn = document.getElementById('addTaskBtn');
  const taskForm = document.getElementById('taskForm');

  if (addTaskBtn && modal) {
    addTaskBtn.addEventListener('click', () => {
      modal.style.display = 'flex';
    });
  }

  if (closeModal && modal) {
    closeModal.addEventListener('click', () => {
      modal.style.display = 'none';
    });
  }

  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });

  // === DOM Elements for Task Lists ===
  const todoList = document.getElementById('todoList');
  const completedList = document.getElementById('completedList');
  const taskList = document.getElementById("taskContainer");// For search-based view
 const searchInput = document.getElementById("taskSearchInput");


  // === Unified Render Function ===
  function renderTasks(taskArray = tasks) {
    if (todoList && completedList) {
      // Advanced UI rendering (card style)
      todoList.innerHTML = '';
      completedList.innerHTML = '';

      taskArray.forEach((task, index) => {
        const taskCard = document.createElement('div');
        taskCard.className = 'task-card';

        const avatar = document.createElement('img');
        avatar.className = 'task-avatar';
        avatar.src = task.avatar || getRandomAvatar();
        avatar.onerror = () => {
          avatar.src = 'https://picsum.photos/40?grayscale&random=' + Math.floor(Math.random() * 100);
        };

        task.avatar = avatar.src;

        const info = document.createElement('div');
        info.className = 'task-info';
        info.innerHTML = `
          <h4>${task.title || task.name}</h4>
          <p>${task.desc || ''}</p>
          <small>${task.date || task.due || ''} | Priority: ${task.priority || 'Normal'}</small>
        `;

        const actions = document.createElement('div');
        actions.className = 'task-actions';
        actions.innerHTML = `
          <button class="complete" title="${task.completed ? 'Undo Task' : 'Complete Task'}">
            <i class="fas fa-${task.completed ? 'undo' : 'check-circle'}"></i>
          </button>
          <button class="delete" title="Delete Task">
            <i class="fas fa-trash"></i>
          </button>
        `;

        taskCard.appendChild(avatar);
        taskCard.appendChild(info);
        taskCard.appendChild(actions);

        const targetList = task.completed ? completedList : todoList;
        targetList.appendChild(taskCard);

        actions.querySelector('.complete').addEventListener('click', () => {
          tasks[index].completed = !tasks[index].completed;
          saveTasks();
          renderTasks();
          showSnackbar(tasks[index].completed ? 'Task completed' : 'Task marked undone');
        });

        actions.querySelector('.delete').addEventListener('click', () => {
          tasks.splice(index, 1);
          saveTasks();
          renderTasks();
          showSnackbar('Task deleted');
        });
      });
    }

    // Basic list (search) rendering
    if (taskList) {
      taskList.innerHTML = "";
      if (taskArray.length === 0) {
        taskList.innerHTML = "<p style='text-align:center;color:#aaa;'>No tasks yet</p>";
        return;
      }

      taskArray.forEach((task) => {
        const li = document.createElement("li");
        li.className = task.completed ? "completed" : "";

        const taskInfo = document.createElement("div");
        taskInfo.className = "task-info";

        const nameSpan = document.createElement("span");
        nameSpan.className = "task-name";
        nameSpan.textContent = task.name || task.title;

        const dateSpan = document.createElement("span");
        dateSpan.className = "task-date";
        dateSpan.textContent = task.due || task.date ? `Due: ${task.due || task.date}` : "";

        taskInfo.appendChild(nameSpan);
        if (task.due || task.date) taskInfo.appendChild(dateSpan);

        const actions = document.createElement("div");
        actions.className = "actions";

        const completeBtn = document.createElement("button");
        completeBtn.textContent = task.completed ? "Undo" : "Done";
        completeBtn.onclick = () => toggleComplete(task.id);

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.onclick = () => deleteTask(task.id);

        actions.appendChild(completeBtn);
        actions.appendChild(deleteBtn);

        li.appendChild(taskInfo);
        li.appendChild(actions);

        taskList.appendChild(li);
      });
    }

    saveTasks();
  }

  // === Task Form Submission ===
  if (taskForm) {
    taskForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('taskTitle').value.trim();
      const desc = document.getElementById('taskDesc').value.trim();
      const date = document.getElementById('taskDate').value;
      const priority = document.getElementById('taskPriority').value;

      if (!title) return;

      tasks.push({ title, desc, date, priority, completed: false, avatar: getRandomAvatar(), id: Date.now() });
      saveTasks();
      renderTasks();
      taskForm.reset();
      modal.style.display = 'none';
      showSnackbar('New task added');
    });
  }

  // === Extra Functions ===
  function toggleComplete(id) {
    tasks = tasks.map((task) =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    renderTasks();
  }

  function deleteTask(id) {
    tasks = tasks.filter((task) => task.id !== id);
    renderTasks();
  }


  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const searchTerm = searchInput.value.toLowerCase();
      const filtered = tasks.filter((task) =>
        (task.title || task.name || '').toLowerCase().includes(searchTerm)
      );
      renderTasks(filtered);
    });
  }

  // Initial Render
  renderTasks();
});
