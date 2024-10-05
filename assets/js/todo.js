// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-storage.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDw09H2-C61eCXH1F8QV6vCuba2HHXUNEY",
  authDomain: "fir-auth-8375a.firebaseapp.com",
  projectId: "fir-auth-8375a",
  storageBucket: "fir-auth-8375a.appspot.com",
  messagingSenderId: "127672083049",
  appId: "1:127672083049:web:2c6c7a40e430857eff38f8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const provider = new GoogleAuthProvider();

// ==============================================================================================================================
// ==============================================================================================================================
const todoForm = document.querySelector('form');
const todoInput = document.getElementById('todo-input');
const todoListUL = document.getElementById('todo-list');
const dateInput = document.querySelector('input[type="date"]'); // Reference to the date input\

const labels = document.querySelectorAll('.label');

// Load active labels from localStorage
document.addEventListener('DOMContentLoaded', () => {
  const savedActiveLabels = JSON.parse(localStorage.getItem('activeLabels')) || [];

  // Restore the active class based on saved data
  labels.forEach((label, index) => {
    if (savedActiveLabels.includes(index)) {
      label.classList.add('active');
    }
  });

});


// Add event listener to save the state when a label is clicked
labels.forEach((label, index) => {
  label.addEventListener('click', () => {
    if (label.classList.contains('active')) {
      label.classList.remove('active');
    } else {
      label.classList.add('active');
    }

    // Save the state of active labels
    saveActiveLabels();
  });
});

function saveActiveLabels() {
  const activeLabels = [];

  labels.forEach((label, index) => {
    if (label.classList.contains('active')) {
      activeLabels.push(index);
    }
  });

  localStorage.setItem('activeLabels', JSON.stringify(activeLabels));
}

// Set initial date to today
const today = new Date();
dateInput.value = today.toISOString().split('T')[0]; // Set the date input to today's date

// Variables and Chart.js setup
const ctx = document.getElementById('todo-chart').getContext('2d');
const chart = new Chart(ctx, {
  type: 'bar',
  data: {
    labels: [], // Dates will be added here
    datasets: [
      {
        label: 'Todo Progress (%)',
        data: [], // Progress percentages will be added here
        backgroundColor: 'rgba(217, 134, 131, 0.3)',
        borderColor: '#593d3b',
        borderWidth: 1,
      }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        title: {
          display: false,
          text: 'Date',
          font: { size: 18 }
        }
      },
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          stepSize: 20, // Set the interval to 20
        },
        title: {
          display: false,
          text: 'Progress (%)',
          font: { size: 18 }
        }
      }
    }
  }
});

function updateChart(date, progressPercentage) {
  const dateIndex = chart.data.labels.indexOf(date);
  if (dateIndex !== -1) {
    chart.data.datasets[0].data[dateIndex] = progressPercentage;
  } else {
    chart.data.labels.push(date);
    chart.data.datasets[0].data.push(progressPercentage);
  }

  // Sort the dates and corresponding data
  const combined = chart.data.labels.map((label, index) => ({
    label,
    data: chart.data.datasets[0].data[index]
  }));

  combined.sort((a, b) => new Date(a.label) - new Date(b.label));

  // Update the chart data after sorting
  chart.data.labels = combined.map(item => item.label);
  chart.data.datasets[0].data = combined.map(item => item.data);

  chart.update();

  // Save the updated chart data to localStorage
  saveChartData();
}

function saveChartData() {
  const chartData = {
    labels: chart.data.labels,
    data: chart.data.datasets[0].data
  };
  localStorage.setItem('chartData', JSON.stringify(chartData));
}

document.addEventListener('DOMContentLoaded', () => {
  // Load saved todos and render them
  allTodos = getTodos();
  updateTodoList();

  // Load chart data from localStorage
  loadChartData();
});

function loadChartData() {
  const savedChartData = JSON.parse(localStorage.getItem('chartData'));

  if (savedChartData) {
    chart.data.labels = savedChartData.labels;
    chart.data.datasets[0].data = savedChartData.data;
    chart.update();
  }
}


let allTodos = getTodos();
updateTodoList();

todoForm.addEventListener('submit', function (e) {
  e.preventDefault();
  addTodo();
});

function addTodo() {
  const todoText = todoInput.value.trim();
  const date = dateInput.value; // Get date from the input


  if (todoText.length > 0) {
    const todoObject = {
      text: todoText,
      completed: false
    }
    allTodos.push(todoObject);
    updateTodoList();
    saveTodos();
    todoInput.value = "";
  }
}

function updateTodoList() {
  todoListUL.innerHTML = "";
  allTodos.forEach((todo, todoIndex) => {
    const todoItem = createTodoItem(todo, todoIndex);
    todoListUL.append(todoItem);
  });

  updateTodoStats();
}

function updateTodoStats() {
  const totalTodos = allTodos.length;
  const completedTodos = allTodos.filter(todo => todo.completed).length;

  document.getElementById('total-todos').textContent = totalTodos;
  document.getElementById('completed-todos').textContent = completedTodos;
}

function createTodoItem(todo, todoIndex) {
  const todoId = "todo-" + todoIndex;
  const todoLI = document.createElement("li");
  const todoText = todo.text;
  todoLI.className = "todo";
  todoLI.innerHTML = `
        <input type="checkbox" id="${todoId}">
        <label class="custom-checkbox" for="${todoId}">
            <svg fill="var(--input-color)" xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 -960 960 960" width="18"><path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/></svg>
        </label>
        <label for="${todoId}" class="todo-text">${todoText}</label>
        <dialog id="edit-dialog-${todoIndex}" class="edit-dialog">
            <div class="wrapper">
                <h2>Edit content</h2>
                <input type="text" class="edit-input" value="${todoText}">
                <button class="edit-button">Save</button>
            </div>
        </dialog>
        <button class="edit-todo-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M19.045 7.401c.378-.378.586-.88.586-1.414s-.208-1.036-.586-1.414l-1.586-1.586c-.378-.378-.88-.586-1.414-.586s-1.036.208-1.413.585L4 13.585V18h4.413L19.045 7.401zm-3-3 1.587 1.585-1.59 1.584-1.586-1.585 1.589-1.584zM6 16v-1.585l7.04-7.018 1.586 1.586L7.587 16H6zm-2 4h16v2H4z"></path></svg>
        </button>
        <button class="delete-button">
            <svg fill="var(--secondary-color)" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg>
        </button>
    `;

  const deleteButton = todoLI.querySelector(".delete-button");
  deleteButton.addEventListener("click", () => {
    deleteTodoItem(todoIndex);
  });

  const checkbox = todoLI.querySelector("input");
  checkbox.addEventListener("change", () => {
    allTodos[todoIndex].completed = checkbox.checked;
    saveTodos();
    updateTodoList();
    updatePieChart();

    // Calculate and update the chart when checkbox changes
    const date = dateInput.value; // Get the date from the input
    const progressPercentage = calculateCompletionPercentage(); // Calculate completion percentage
    updateChart(date, progressPercentage); // Update chart with current date and progress
  });
  checkbox.checked = todo.completed;

  const editButton = todoLI.querySelector(".edit-todo-button");
  const editDialog = todoLI.querySelector(`#edit-dialog-${todoIndex}`);
  const editInput = editDialog.querySelector(".edit-input");
  const saveButton = editDialog.querySelector(".edit-button");

  editButton.addEventListener("click", () => {
    editDialog.showModal();
  });

  editDialog.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      const newText = editInput.value.trim();
      if (newText.length > 0) {
        allTodos[todoIndex].text = newText;
        saveTodos();
        updateTodoList();
      }
      editDialog.close();
    }
  });

  saveButton.addEventListener("click", () => {
    const newText = editInput.value.trim();
    if (newText.length > 0) {
      allTodos[todoIndex].text = newText;
      saveTodos();
      updateTodoList();
    }
    editDialog.close();
  });

  editDialog.addEventListener("click", (e) => {
    const wrapper = editDialog.querySelector(".wrapper");
    if (!wrapper.contains(e.target)) {
      editDialog.close();
      editInput.value = "";
    }
  });

  return todoLI;
}

function deleteTodoItem(todoIndex) {
  allTodos = allTodos.filter((_, i) => i !== todoIndex);
  saveTodos();
  updateTodoList();
  updatePieChart();

  // Update the chart when a todo item is deleted
  const date = dateInput.value; // Get the date from the input
  const progressPercentage = calculateCompletionPercentage(); // Calculate completion percentage
  updateChart(date, progressPercentage); // Update chart with current date and progress
}

function saveTodos() {
  const todosJson = JSON.stringify(allTodos);
  localStorage.setItem("todos", todosJson);
}

function getTodos() {
  const todos = localStorage.getItem("todos") || "[]";
  return JSON.parse(todos);
}

function calculateCompletionPercentage() {
  if (allTodos.length === 0) return 0;
  const completedTodos = allTodos.filter(todo => todo.completed).length;
  return Math.round((completedTodos / allTodos.length) * 100);
}

function updatePieChart() {
  const percentage = calculateCompletionPercentage();
  const pieChart = document.querySelector('.pie');

  // Get the current percentage value
  const currentPercentage = getComputedStyle(pieChart).getPropertyValue('--p').trim();

  // Update the CSS variables
  pieChart.style.setProperty('--p-from', currentPercentage);
  pieChart.style.setProperty('--p', percentage);

  // Reset animation by removing and re-adding the class
  pieChart.classList.remove('animate');
  void pieChart.offsetWidth;  // Trigger reflow
  pieChart.classList.add('animate');

  // Update the displayed percentage
  pieChart.textContent = `${percentage}%`;
}


dateInput.addEventListener('change', () => {
  // Uncheck all tasks when the date changes
  allTodos.forEach(todo => {
    todo.completed = false; // Set completed status to false
  });

  // Update the UI and save the todos
  updateTodoList();
  saveTodos();

  const date = dateInput.value;
  updateChart(date, 0);
});

// Function to format the date
function formatDate(date) {
  const options = { weekday: 'short' }; // Get short day name
  const dayName = new Intl.DateTimeFormat('en-US', options).format(date);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
  return `${dayName} <br> <p>${day}-${month}</p>`;
}


// Calculate the dates for two days before and two days after
const dayBefore2 = new Date(today);
dayBefore2.setDate(today.getDate() - 2);
const dayBefore1 = new Date(today);
dayBefore1.setDate(today.getDate() - 1);
const dayAfter1 = new Date(today);
dayAfter1.setDate(today.getDate() + 1);
const dayAfter2 = new Date(today);
dayAfter2.setDate(today.getDate() + 2);

// Update the HTML content of the divs
document.querySelector('.day-before-2').innerHTML = formatDate(dayBefore2);
document.querySelector('.day-before-1').innerHTML = formatDate(dayBefore1);
document.querySelector('.box-cal-today.today').innerHTML = formatDate(today);
document.querySelector('.day-after-1').innerHTML = formatDate(dayAfter1);
document.querySelector('.day-after-2').innerHTML = formatDate(dayAfter2);


const currentDate = new Date();
const year = currentDate.getFullYear();
const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
const day = String(currentDate.getDate()).padStart(2, '0');

const formattedDate = `${year}-${month}-${day}`;
console.log(formattedDate);

function getDayNameForDate(dateString) {
  const date = new Date(dateString);
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return dayNames[date.getDay()];
}

const dateInputd = formattedDate;
const dayName = getDayNameForDate(dateInputd);

document.querySelectorAll('.checklist').forEach(checklist => {
  checklist.addEventListener('change', (event) => {
    if (event.target.classList.contains('task')) {
      updateProgress(checklist);
      saveChecklistProgress();
      updateChecklistChart();
    }
  });

  const checkboxes = checklist.querySelectorAll('.task');
  checkboxes.forEach(checkbox => {
    checkbox.addEventListener("change", () => {
      updateChecklistChart(); // Update the chart whenever a checkbox is changed
    });
  });
});

function updateProgress(checklist) {
  const totalTasks = checklist.querySelectorAll('.task').length;
  const checkedTasks = checklist.querySelectorAll('.task:checked').length;
  const progressValue = (checkedTasks / totalTasks) * 100;

  const progressContainerId = checklist.getAttribute('data-progress-id');
  const progressContainer = document.getElementById(progressContainerId);
  const progressBar = progressContainer.querySelector('.progress-value');
  const progressStats = progressContainer.querySelector('.progress-stats');

  progressBar.style.setProperty('--progress-value', `${progressValue}%`);
  progressBar.style.animation = 'none';
  progressBar.offsetHeight;
  progressBar.style.animation = '';

  progressStats.textContent = `${Math.round(progressValue)}%`;
}

function saveChecklistProgress() {
  const checklistProgress = {};
  document.querySelectorAll('.checklist').forEach((checklist, checklistIndex) => {
    const tasks = checklist.querySelectorAll('.task');
    checklistProgress[`checklist-${checklistIndex}`] = Array.from(tasks).map(task => task.checked);
  });
  console.log("Saved Progress:", checklistProgress); // Debugging
  localStorage.setItem('checklistProgress', JSON.stringify(checklistProgress));
}

function loadChecklistProgress() {
  const checklistProgress = JSON.parse(localStorage.getItem('checklistProgress')) || {};
  console.log("Loaded Progress:", checklistProgress); // Debugging
  document.querySelectorAll('.checklist').forEach((checklist, checklistIndex) => {
    const tasks = checklist.querySelectorAll('.task');
    const savedTasks = checklistProgress[`checklist-${checklistIndex}`] || [];
    tasks.forEach((task, taskIndex) => {
      task.checked = savedTasks[taskIndex] || false;
    });
    updateProgress(checklist);
  });
}


updatePieChart();

const checklistCtx = document.getElementById('checklist-chart').getContext('2d');
const checklistChart = new Chart(checklistCtx, {
  type: 'line',
  data: {
    labels: [],
    datasets: []
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { title: { display: false, text: 'Date' } },
      y: {
        beginAtZero: true,
        max: 100,
        ticks: { stepSize: 50 },
        title: { display: false, text: 'Progress (%)' }
      }
    }
  }
});

function loadChecklistChartData() {
  const chartData = JSON.parse(localStorage.getItem('checklistChartData')) || { labels: [], datasets: [] };
  console.log("Loaded Chart Data:", chartData); // Debugging

  checklistChart.data.labels = chartData.labels;
  checklistChart.data.datasets = chartData.datasets.map(dataset => ({
    ...dataset,
    data: dataset.data
  }));

  checklistChart.update();
}
function calculateChecklistProgress(checklistIndex) {
  const checklist = document.querySelectorAll('.checklist')[checklistIndex];
  const totalTasks = checklist.querySelectorAll('.task').length;
  const checkedTasks = checklist.querySelectorAll('.task:checked').length;
  return totalTasks > 0 ? (checkedTasks / totalTasks) * 100 : 0;
}

function saveChecklistChartData() {
  const chartData = {
    labels: checklistChart.data.labels, // Save the dates
    datasets: checklistChart.data.datasets.map(dataset => ({
      label: dataset.label,
      data: dataset.data
    })) // Save the progress data for each checklist
  };
  localStorage.setItem('checklistChartData', JSON.stringify(chartData));
}


function updateChecklistChart() {
  const date = dateInput.value;
  console.log("Updating checklist for date:", date);

  const dateIndex = checklistChart.data.labels.indexOf(date);

  if (dateIndex === -1) {
    checklistChart.data.labels.push(date);
  }

  const checklists = document.querySelectorAll('.checklist');
  checklists.forEach((checklist, index) => {
    const progress = calculateChecklistProgress(index);
    console.log(`Progress for checklist ${index + 1}:`, progress);

    if (!checklistChart.data.datasets[index]) {
      checklistChart.data.datasets[index] = {
        label: `Checklist ${index + 1}`,
        data: Array(checklistChart.data.labels.length).fill(0),
        fill: false,
        borderColor: `hsl(${index * 60}, 70%, 50%)`,
        tension: 0.1
      };
    }

    if (dateIndex !== -1) {
      checklistChart.data.datasets[index].data[dateIndex] = progress;
    } else {
      const newDateIndex = checklistChart.data.labels.indexOf(date);
      checklistChart.data.datasets[index].data[newDateIndex] = progress;
    }
  });

  checklistChart.update(); // Update the chart
  saveChecklistChartData(); // Save updated data to localStorage
}


window.onload = function () {
  loadChecklistProgress();
  updatePieChart(); // Optionally, update the pie chart on load
  loadChecklistChartData(); // Load chart data from localStorage
  updateChecklistChart();
};


