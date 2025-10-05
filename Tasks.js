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
const escapeHtml = (text) => {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return String(text).replace(/[&<>"']/g, (m) => map[m]);
};

const createTaskElement = (docItem) => {
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
};

const updateDeleteDoneButton = () => {
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
};

// ========================= Render App =========================
const renderApp = async (snapshot) => {
  window.tasksContainer = document.getElementById("Tasks");
  window.deleteDoneBtn = document.getElementById("deleteDone");
  window.deleteAllBtn = document.getElementById("deleteAll");
  window.addBtn = document.getElementById("addTaskBtn");
  window.newToDoInput = document.getElementById("newToDo");
  window.taskValidation = document.getElementById("taskValidation");
  window.allTasksBtn = document.getElementById("allTasks");
  window.doneTasksBtn = document.getElementById("doneTasks");
  window.todoTasksBtn = document.getElementById("todoTasks");

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
    snapshot.forEach(docItem => tasksContainer.appendChild(createTaskElement(docItem)));
    deleteAllBtn.style.display = "inline-block";
    deleteDoneBtn.style.display = "inline-block";
    updateDeleteDoneButton();
  }

  initializeAppEvents();
};

// ========================= Load Tasks from Firebase =========================
onSnapshot(collection(db, "tasks"), async snapshot => {
  await renderApp(snapshot);
});

// ========================= Initialize Events =========================
const initializeAppEvents = () => {
  addBtn.disabled = true;
  addBtn.style.backgroundColor = "gray";

  newToDoInput.addEventListener("input", () => {
    const taskName = newToDoInput.value.trim();
    taskValidation.textContent = "";
    taskValidation.style.display = "none";

    const tasks = document.querySelectorAll("#Tasks .Task");
    const normalizedTaskName = taskName.toLowerCase();
    tasks.forEach(task => {
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

  addBtn.addEventListener("click", async () => {
    const taskName = newToDoInput.value.trim();
    const tasks = document.querySelectorAll(".Task p");
    for (let t of tasks) if (t.textContent.trim().toLowerCase() === taskName.toLowerCase()) return;

    await addDoc(collection(db, "tasks"), { name: taskName, done: false });
    newToDoInput.value = "";
    addBtn.disabled = true;
    addBtn.style.backgroundColor = "gray";
  });

  tasksContainer.addEventListener("click", async event => {
    const taskDiv = event.target.closest(".Task");
    if (!taskDiv) return;
    const taskId = taskDiv.dataset.id;

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
        inputValidator: value => {
          if (!value.trim()) return "Task name cannot be empty";
          if (/^\d/.test(value.trim())) return "Task name cannot start with a number";
          if (value.trim().length < 5) return "Task name must be at least 5 characters";
        }
      });
      if (newName) await updateDoc(doc(db, "tasks", taskId), { name: newName.trim() });
    }

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

  tasksContainer.addEventListener("change", async event => {
    if (event.target.type === "checkbox") {
      const taskDiv = event.target.closest(".Task");
      if (!taskDiv) return;
      const taskId = taskDiv.dataset.id;
      await updateDoc(doc(db, "tasks", taskId), { done: event.target.checked });
      taskDiv.classList.toggle("Done", event.target.checked);
      updateDeleteDoneButton();
    }
  });

  deleteDoneBtn.addEventListener("click", async () => {
    const doneTasks = document.querySelectorAll(".Task.Done");
    for (let t of doneTasks) await deleteDoc(doc(db, "tasks", t.dataset.id));
  });

  deleteAllBtn.addEventListener("click", async () => {
    const allTasks = document.querySelectorAll(".Task");
    for (let t of allTasks) await deleteDoc(doc(db, "tasks", t.dataset.id));
  });

  if (allTasksBtn) allTasksBtn.addEventListener("click", () => document.querySelectorAll(".Task").forEach(t => t.style.display = "flex"));
  if (doneTasksBtn) doneTasksBtn.addEventListener("click", () => document.querySelectorAll(".Task").forEach(t => t.style.display = t.classList.contains("Done") ? "flex" : "none"));
  if (todoTasksBtn) todoTasksBtn.addEventListener("click", () => document.querySelectorAll(".Task").forEach(t => t.style.display = !t.classList.contains("Done") ? "flex" : "none"));
};
