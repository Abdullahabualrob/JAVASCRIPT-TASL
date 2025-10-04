// ========================= Firebase Initialization =========================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBnOw9Z4NE1k9AgU6GVlhR7-v3hevE5NO0",
  authDomain: "mytodoapp-c330a.firebaseapp.com",
  projectId: "mytodoapp-c330a",
  storageBucket: "mytodoapp-c330a.firebasestorage.app",
  messagingSenderId: "274283322203",
  appId: "1:274283322203:web:3f44acb0c26e4c8e587e",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ========================= Utility Functions =========================
function escapeHtml(text) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return String(text).replace(/[&<>"']/g, (m) => map[m]);
}

function createTaskElement(docItem) {
  const task = docItem.data();
  const div = document.createElement("div");
  div.className = `Task ${task.done ? "Done" : ""}`;
  div.dataset.id = docItem.id;
  div.innerHTML = `
    <p>${escapeHtml(task.name)}</p>
    <div class="Operations">
      <input type="checkbox" ${task.done ? "checked" : ""}>
      <button class="edit-btn" title="Edit"><i class="fa fa-pencil"></i></button>
      <button class="delete-btn" title="Delete"><i class="fa fa-trash"></i></button>
    </div>
  `;
  return div;
}

function updateDeleteDoneButton() {
  const doneTasks = document.querySelectorAll(".Task.Done");
  if (doneTasks.length === 0) {
    deleteDoneBtn.style.backgroundColor = "gray";
    deleteDoneBtn.disabled = true;
    deleteDoneBtn.style.cursor = "not-allowed";
  } else {
    deleteDoneBtn.style.backgroundColor = "#E94343";
    deleteDoneBtn.disabled = false;
    deleteDoneBtn.style.cursor = "pointer";
  }
}

// ========================= Skeleton Loader =========================
function showSkeletonOverlay(taskCount = 5) {
  const skeletonDiv = document.createElement("div");
  skeletonDiv.id = "skeleton-overlay";
  skeletonDiv.innerHTML = `
    <div class="skeleton-header skeleton"></div>
    <div style="display:flex;">
      <div class="skeleton-sidebar skeleton"></div>
      <div class="skeleton-main">
        ${Array(taskCount).fill(0).map(() => `
          <div class="skeleton-task skeleton">
            <p></p>
            <div class="Operations">
              <div></div><div></div><div></div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
    <div style="text-align:center; margin-top:20px; font-size:14px; color:gray;">
      Loading... <span id="skeleton-timer">3</span>s
    </div>
  `;
  document.body.prepend(skeletonDiv);

  let seconds = 3;
  const timerElem = document.getElementById("skeleton-timer");
  const interval = setInterval(() => {
    seconds--;
    if (seconds >= 0) timerElem.textContent = seconds;
    if (seconds <= 0) clearInterval(interval);
  }, 1000);

  return skeletonDiv;
}

// ========================= Main App =========================
const skeletonOverlay = showSkeletonOverlay(7);

async function renderApp(snapshot) {
  // إنشاء DOM التطبيق إذا لم يكن موجود
  if (!document.getElementById("Tasks")) {
    const appHTML = `
      <header>
        <h1>My To-Do App</h1>
      </header>
      <main style="display:flex;">
        <aside id="sidebar">
          <button id="allTasks">All</button>
          <button id="doneTasks">Done</button>
          <button id="todoTasks">To-Do</button>
        </aside>
        <section style="flex:1;">
          <div id="Tasks"></div>
          <input type="text" id="newToDo" placeholder="New Task">
          <div id="taskValidation"></div>
          <button id="addTaskBtn">Add Task</button>
          <button id="deleteDone">Delete Done</button>
          <button id="deleteAll">Delete All</button>
        </section>
      </main>
    `;
    document.body.innerHTML += appHTML;
  }

  // تعريف المتغيرات بعد إنشاء DOM
  window.tasksContainer = document.getElementById("Tasks");
  window.deleteDoneBtn = document.getElementById("deleteDone");
  window.deleteAllBtn = document.getElementById("deleteAll");
  window.addBtn = document.getElementById("addTaskBtn");
  window.newToDoInput = document.getElementById("newToDo");
  window.taskValidation = document.getElementById("taskValidation");
  window.allTasksBtn = document.getElementById("allTasks");
  window.doneTasksBtn = document.getElementById("doneTasks");
  window.todoTasksBtn = document.getElementById("todoTasks");

  // عرض المهام
  tasksContainer.innerHTML = "";
  if (snapshot.empty) {
    tasksContainer.innerHTML = `
      <div class="no-tasks-message">
        <i class="fa fa-tasks" style="font-size:24px; display:block; margin-bottom:8px;"></i>
        <p>Please insert tasks</p>
      </div>
    `;
    deleteAllBtn.style.display = "none";
    deleteDoneBtn.style.display = "none";
  } else {
    snapshot.forEach((docItem) => {
      tasksContainer.appendChild(createTaskElement(docItem));
    });
    deleteAllBtn.style.display = "inline-block";
    deleteDoneBtn.style.display = "inline-block";
    updateDeleteDoneButton();
  }

  initializeAppEvents(); // إضافة كل الأحداث
}

// ========================= Load Tasks من Firebase =========================
onSnapshot(collection(db, "tasks"), async (snapshot) => {
  await renderApp(snapshot);

  // إزالة السكليتون بعد 3 ثواني
  setTimeout(() => {
    if (skeletonOverlay) skeletonOverlay.remove();
  }, 3000);
});

// ========================= Initialize Events =========================
function initializeAppEvents() {
  // تفعيل الزر بشكل افتراضي
  addBtn.disabled = true;
  addBtn.style.backgroundColor = "gray";

  // ===== Input Validation & Search =====
  newToDoInput.addEventListener("input", () => {
    const taskName = newToDoInput.value.trim();
    taskValidation.textContent = "";
    taskValidation.style.display = "none";

    const tasks = document.querySelectorAll("#Tasks .Task");
    const normalizedTaskName = taskName.toLowerCase();
    tasks.forEach((task) => {
      const name = task.querySelector("p").textContent.trim().toLowerCase();
      task.style.display = name.includes(normalizedTaskName) ? "flex" : "none";
    });

    if (taskName === "") taskValidation.textContent = "Task name cannot be empty";
    else if (/^\d/.test(taskName)) taskValidation.textContent = "Task name cannot start with a number";
    else if (taskName.length < 5) taskValidation.textContent = "Task name cannot be less than 5 characters";

    if (taskValidation.textContent !== "") {
      taskValidation.style.display = "block";
      addBtn.style.backgroundColor = "gray";
      addBtn.disabled = true;
    } else {
      taskValidation.style.display = "none";
      addBtn.style.backgroundColor = "rgb(0, 140, 186)";
      addBtn.disabled = false;
    }
  });

  // ===== Add Task =====
  addBtn.addEventListener("click", async () => {
    const taskName = newToDoInput.value.trim();
    const tasks = document.querySelectorAll(".Task p");
    for (let t of tasks) {
      if (t.textContent.trim().toLowerCase() === taskName.toLowerCase()) {
        await Swal.fire({ icon: "info", title: "This task is already added", timer: 2000, showConfirmButton: false });
        return;
      }
    }
    await addDoc(collection(db, "tasks"), { name: taskName, done: false });
    newToDoInput.value = "";
    addBtn.disabled = true;
    addBtn.style.backgroundColor = "gray";
    await Swal.fire({ toast: true, position: "bottom", icon: "success", title: "Task added successfully ✅", showConfirmButton: false, timer: 2000 });
  });

  // ===== Task Events (Edit / Delete / Checkbox) =====
  tasksContainer.addEventListener("click", async (event) => {
    const taskDiv = event.target.closest(".Task");
    if (!taskDiv) return;
    const taskId = taskDiv.dataset.id;

    // Edit
    if (event.target.closest(".edit-btn") || event.target.closest("i.fa-pencil")) {
      const taskNameElem = taskDiv.querySelector("p");
      const { value: newName } = await Swal.fire({
        title: "✏️ Edit Task",
        input: "text",
        inputValue: taskNameElem.textContent,
        showCancelButton: true,
        confirmButtonText: "Save",
        cancelButtonText: "Cancel",
        confirmButtonColor: "rgb(0, 140, 186)",
        cancelButtonColor: "gray",
        inputValidator: (value) => {
          if (!value.trim()) return "Task name cannot be empty";
          if (/^\d/.test(value.trim())) return "Task name cannot start with a number";
          if (value.trim().length < 5) return "Task name must be at least 5 characters";
        }
      });
      if (newName) await updateDoc(doc(db, "tasks", taskId), { name: newName.trim() });
    }

    // Delete
    if (event.target.closest(".delete-btn") || event.target.closest("i.fa-trash")) {
      const confirm = await Swal.fire({
        title: "🗑️ Delete Task",
        text: "Are you sure you want to delete this task?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#E94343",
        cancelButtonColor: "gray",
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "Cancel"
      });
      if (confirm.isConfirmed) await deleteDoc(doc(db, "tasks", taskId));
    }
  });

  // Checkbox toggle
  tasksContainer.addEventListener("change", async (event) => {
    if (event.target.type === "checkbox") {
      const taskDiv = event.target.closest(".Task");
      if (!taskDiv) return;
      const taskId = taskDiv.dataset.id;
      await updateDoc(doc(db, "tasks", taskId), { done: event.target.checked });
      taskDiv.classList.toggle("Done", event.target.checked);
      updateDeleteDoneButton();
    }
  });

  // ===== Delete Done Tasks =====
  deleteDoneBtn.addEventListener("click", async () => {
    const confirm = await Swal.fire({
      title: "🗑️ Delete All DONE Tasks",
      text: "Are you sure you want to delete all completed tasks?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#E94343",
      cancelButtonColor: "gray",
      confirmButtonText: "Yes, delete them!"
    });
    if (confirm.isConfirmed) {
      const doneTasks = document.querySelectorAll(".Task.Done");
      for (let t of doneTasks) await deleteDoc(doc(db, "tasks", t.dataset.id));
    }
  });

  // ===== Delete All Tasks =====
  deleteAllBtn.addEventListener("click", async () => {
    const confirm = await Swal.fire({
      title: "🗑️ Delete ALL Tasks",
      text: "This will delete ALL tasks, are you sure?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#E94343",
      cancelButtonColor: "gray",
      confirmButtonText: "Yes, delete everything!"
    });
    if (confirm.isConfirmed) {
      const allTasks = document.querySelectorAll(".Task");
      for (let t of allTasks) await deleteDoc(doc(db, "tasks", t.dataset.id));
    }
  });

  // ===== Filter Buttons =====
  if (allTasksBtn) allTasksBtn.addEventListener("click", () => document.querySelectorAll(".Task").forEach(t => t.style.display = "flex"));
  if (doneTasksBtn) doneTasksBtn.addEventListener("click", () => document.querySelectorAll(".Task").forEach(t => t.style.display = t.classList.contains("Done") ? "flex" : "none"));
  if (todoTasksBtn) todoTasksBtn.addEventListener("click", () => document.querySelectorAll(".Task").forEach(t => t.style.display = !t.classList.contains("Done") ? "flex" : "none"));
}
