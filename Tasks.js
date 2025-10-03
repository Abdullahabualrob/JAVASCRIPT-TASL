// ========================= Firebase Initialization =========================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBnOw9Z4NE1k9AgU6GVlhR7-v3hevE5NO0",
  authDomain: "mytodoapp-c330a.firebaseapp.com",
  projectId: "mytodoapp-c330a",
  storageBucket: "mytodoapp-c330a.firebasestorage.app",
  messagingSenderId: "274283322203",
  appId: "1:274283322203:web:3f44acb0c26e4c3c8e587e",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ========================= Elements =========================
const tasksContainer = document.getElementById("Tasks");
const deleteDoneBtn = document.getElementById("deleteDone");
const deleteAllBtn = document.getElementById("deleteAll");
const addBtn = document.getElementById("addTaskBtn");
const newToDoInput = document.getElementById("newToDo");
const taskValidation = document.getElementById("taskValidation");
const editPopup = document.getElementById("editPopup");
const editInput = document.getElementById("editInput");
const saveEditBtn = document.getElementById("saveEdit");
const cancelEditBtn = document.getElementById("cancelEdit");
const confirmPopup = document.getElementById("confirmPopup");
const confirmMessage = document.getElementById("confirmMessage");
const confirmDeleteBtn = document.getElementById("confirmDelete");
const cancelDeleteBtn = document.getElementById("cancelDelete");

// ========================= Utility Functions =========================
function createTaskElement(docItem) {
  const task = docItem.data();
  const div = document.createElement("div");
  div.className = `Task ${task.done ? "Done" : ""}`;
  div.dataset.id = docItem.id;
  div.innerHTML = `
    <p>${task.name}</p>
    <div class="Operations">
      <input type="checkbox" ${task.done ? "checked" : ""}>
      <button><i class="fa fa-pencil"></i></button>
      <button><i class="fa fa-trash"></i></button>
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
    deleteDoneBtn.style.backgroundColor ="#E94343";
    deleteDoneBtn.disabled = false;
    deleteDoneBtn.style.cursor = "pointer";
  }
}

// ========================= Load Tasks =========================
onSnapshot(collection(db, "tasks"), (snapshot) => {
  tasksContainer.innerHTML = "";

  if (snapshot.empty) {
    tasksContainer.innerHTML = `
      <div class="no-tasks-message">
        <i class="fa fa-tasks"></i>
        <p>Please insert tasks</p>
      </div>
    `;
    deleteAllBtn.style.display = "none";
    deleteDoneBtn.style.display = "none";
    return;
  }

  snapshot.forEach((docItem) => {
    tasksContainer.appendChild(createTaskElement(docItem));
  });

  deleteAllBtn.style.display = "inline-block";
  deleteDoneBtn.style.display = "inline-block";
  updateDeleteDoneButton();
});


// ========================= Validation on input =========================
document.getElementById("newToDo").addEventListener("input", () => {
  const taskName = document.getElementById("newToDo").value.trim();
  let taskValidation = document.getElementById("taskValidation");
  const addBtn = document.getElementById("addTaskBtn");
  taskValidation.textContent = "";
  taskValidation.style.display = "none";

  const normalizedTaskName = taskName.toLowerCase();
  const tasks = document.querySelectorAll("#Tasks .Task");
  tasks.forEach((task) => {
    const name = task.querySelector("p").textContent.trim().toLowerCase();
    if (name.includes(normalizedTaskName)) {
      task.style.display = "flex";
    } else {
      task.style.display = "none";
    }
  });
  if (taskName === "") {
    taskValidation.textContent = "Task name cannot be empty";
    taskValidation.style.display = "block";
    addBtn.style.backgroundColor = "gray";
    addBtn.disabled = true;
    return;
  } else if (/^\d/.test(taskName)) {
    taskValidation.textContent = "Task name cannot start with a number";
    taskValidation.style.display = "block";
    addBtn.style.backgroundColor = "gray";
    addBtn.disabled = true;
    return;
  } else if (taskName.length < 5) {
    taskValidation.textContent = "Task name cannot be less than 5 characters";
    taskValidation.style.display = "block";
    addBtn.style.backgroundColor = "gray";
    addBtn.disabled = true;
    return;
  } else {
    taskValidation.style.display = "none";
    addBtn.style.backgroundColor = "rgb(0, 140, 186)";
    addBtn.disabled = false;
  }
});

// ========================= Add Task =========================
addBtn.addEventListener("click", async () => {
  const taskName = newToDoInput.value.trim();
  const tasks = document.querySelectorAll(".Task p");

  for (let t of tasks) {
    if (t.textContent.trim().toLowerCase() === taskName.toLowerCase()) {
      Swal.fire("This task is already added");
      return;
    }
  }

  await addDoc(collection(db, "tasks"), { name: taskName, done: false });
  newToDoInput.value = "";
  addBtn.disabled = true;
  addBtn.style.backgroundColor = "gray";
  Swal.fire({ toast: true, position: "bottom", icon: "success", title: "Task added successfully ✅", showConfirmButton: false, timer: 3000 });
});

// ========================= Task Container Event =========================
let taskToEdit = null;
let taskToDelete = null;

tasksContainer.addEventListener("click", (event) => {
  const taskDiv = event.target.closest(".Task");
  if (!taskDiv) return;
  const taskId = taskDiv.dataset.id;

  // Edit
  if (event.target.closest("i.fa-pencil")) {
    const taskNameElem = taskDiv.querySelector("p");
    taskToEdit = { elem: taskNameElem, id: taskId };
    editInput.value = taskNameElem.textContent;
    editPopup.style.display = "flex";
    event.stopPropagation();
    return;
  }

  // Delete
  if (event.target.closest("i.fa-trash")) {
    taskToDelete = { elem: taskDiv, id: taskId };
    confirmMessage.textContent = "Are you sure you want to delete this task?";
    confirmPopup.style.display = "flex";
    event.stopPropagation();
    return;
  }
});

// ========================= Checkbox Event =========================
tasksContainer.addEventListener("change", async (event) => {
  if (event.target.type === "checkbox") {
    const taskDiv = event.target.closest(".Task");
    const taskId = taskDiv.dataset.id;
    await updateDoc(doc(db, "tasks", taskId), { done: event.target.checked });
    taskDiv.classList.toggle("Done", event.target.checked);
    updateDeleteDoneButton();
  }
});

// ========================= Edit Popup Buttons =========================
saveEditBtn.addEventListener("click", async (event) => {
  event.stopPropagation();
  if (taskToEdit && editInput.value.trim() !== "") {
    await updateDoc(doc(db, "tasks", taskToEdit.id), { name: editInput.value.trim() });
  }
  taskToEdit = null;
  editPopup.style.display = "none";
});

cancelEditBtn.addEventListener("click", (event) => {
  event.stopPropagation();
  taskToEdit = null;
  editPopup.style.display = "none";
});

// ========================= Delete Confirm Buttons =========================
deleteDoneBtn.addEventListener("click", () => {
  taskToDelete = "done";
  confirmMessage.textContent = "Are you sure you want to delete all DONE tasks?";
  confirmPopup.style.display = "flex";
});

deleteAllBtn.addEventListener("click", () => {
  taskToDelete = "all";
  confirmMessage.textContent = "Are you sure you want to delete ALL tasks?";
  confirmPopup.style.display = "flex";
});

confirmDeleteBtn.addEventListener("click", async (event) => {
  event.stopPropagation();
  if (taskToDelete === "done") {
    const doneTasks = document.querySelectorAll(".Task.Done");
    for (let t of doneTasks) await deleteDoc(doc(db, "tasks", t.dataset.id));
  } else if (taskToDelete === "all") {
    const allTasks = document.querySelectorAll(".Task");
    for (let t of allTasks) await deleteDoc(doc(db, "tasks", t.dataset.id));
  } else if (taskToDelete?.id) {
    await deleteDoc(doc(db, "tasks", taskToDelete.id));
  }
  taskToDelete = null;
  confirmPopup.style.display = "none";
});

cancelDeleteBtn.addEventListener("click", (event) => {
  event.stopPropagation();
  taskToDelete = null;
  confirmPopup.style.display = "none";
});

// ========================= Filtering =========================
document.getElementById("allTasks").addEventListener("click", () => {
  document.querySelectorAll(".Task").forEach(t => t.style.display = "flex");
});
document.getElementById("doneTasks").addEventListener("click", () => {
  document.querySelectorAll(".Task").forEach(t => t.style.display = t.classList.contains("Done") ? "flex" : "none");
});
document.getElementById("todoTasks").addEventListener("click", () => {
  document.querySelectorAll(".Task").forEach(t => t.style.display = !t.classList.contains("Done") ? "flex" : "none");
});
