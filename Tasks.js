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

// ========================= Load Tasks =========================
async function loadTasks() {
  const tasksContainer = document.getElementById("Tasks");
  tasksContainer.innerHTML = "";

  const querySnapshot = await getDocs(collection(db, "tasks"));

  if (querySnapshot.empty) {
    tasksContainer.innerHTML = `
    <div class="no-tasks-message">
      <i class="fa fa-tasks" aria-hidden="true"></i>
      <p>Please insert tasks</p>
    </div>
  `;

    document.getElementById("deleteAll").style.display = "none";
    document.getElementById("deleteDone").style.display = "none";
    return;
  }
  querySnapshot.forEach((docItem) => {
    const task = docItem.data();
    tasksContainer.innerHTML += `
      <div class="Task ${task.done ? "Done" : ""}" data-id="${docItem.id}">
        <p>${task.name}</p>
        <div class="Operations">
          <input type="checkbox" ${task.done ? "checked" : ""}>
          <button><i class="fa fa-pencil" aria-hidden="true"></i></button>
          <button><i class="fa fa-trash" aria-hidden="true"></i></button>
        </div>
      </div>
    `;
  });

  document.getElementById("deleteAll").style.display = "inline-block";
  document.getElementById("deleteDone").style.display = "inline-block";
}

document.addEventListener("DOMContentLoaded", loadTasks);

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
document.getElementById("addTaskBtn").addEventListener("click", async () => {
  const input = document.getElementById("newToDo");
  const addBtn = document.getElementById("addTaskBtn");
  const taskName = input.value.trim();
  const taskValidation = document.getElementById("taskValidation");
  const tasks = document.querySelectorAll("#Tasks .Task");

  console.log(tasks);
  let isDublicated = false;
  tasks.forEach((task) => {
    const name = task.querySelector("p").textContent.trim().toLocaleLowerCase();

    if (name === taskName.toLocaleLowerCase()) {
      Swal.fire("This task is already added");
      isDublicated = true;
    }
  });
  if (isDublicated == false) {
    taskValidation.textContent = "";
    taskValidation.style.display = "none";
    const docRef = await addDoc(collection(db, "tasks"), {
      name: taskName,
      done: false,
    });
    console.log("Task added with ID:", docRef.id);
    input.value = "";
    await loadTasks();
    Swal.fire({
      toast: true,
      position: "bottom",
      icon: "success",
      title: "Task added succussfully ✅",
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
    });
    addBtn.style.backgroundColor = "gray";
    addBtn.disabled = true;
  }
});

// ========================= Checkbox Event =========================
document.getElementById("Tasks").addEventListener("change", async (event) => {
  if (event.target.type === "checkbox") {
    const check = event.target;
    const taskDiv = check.closest(".Task");
    const taskId = taskDiv.getAttribute("data-id");

    await updateDoc(doc(db, "tasks", taskId), { done: check.checked });

    if (check.checked) {
      taskDiv.classList.add("Done");
    } else {
      taskDiv.classList.remove("Done");
    }
  }
});
// ========================= Edit Task =========================
const editPopup = document.getElementById("editPopup");
const editInput = document.getElementById("editInput");
const saveEditBtn = document.getElementById("saveEdit");
const cancelEditBtn = document.getElementById("cancelEdit");

let taskToEdit = null;

document.getElementById("Tasks").addEventListener("click", (event) => {
  if (event.target.closest("i.fa-pencil")) {
    const taskDiv = event.target.closest(".Task");
    const taskId = taskDiv.getAttribute("data-id");
    const taskNameElem = taskDiv.querySelector("p");

    taskToEdit = { elem: taskNameElem, id: taskId };
    editInput.value = taskNameElem.textContent;
    editPopup.style.display = "flex";
  }
});

saveEditBtn.addEventListener("click", async () => {
  const newName = editInput.value.trim();
  if (newName !== "" && taskToEdit) {
    await updateDoc(doc(db, "tasks", taskToEdit.id), { name: newName });
    taskToEdit.elem.textContent = newName;
  }
  editPopup.style.display = "none";
  taskToEdit = null;
});

cancelEditBtn.addEventListener("click", () => {
  editPopup.style.display = "none";
  taskToEdit = null;
});

// ========================= Delete Task =========================
const confirmPopup = document.getElementById("confirmPopup");
const confirmMessage = document.getElementById("confirmMessage");
const confirmDeleteBtn = document.getElementById("confirmDelete");
const cancelDeleteBtn = document.getElementById("cancelDelete");

let taskToDelete = null;

document.getElementById("Tasks").addEventListener("click", (event) => {
  if (event.target.closest("i.fa-trash")) {
    const taskDiv = event.target.closest(".Task");
    const taskId = taskDiv.getAttribute("data-id");
    taskToDelete = { elem: taskDiv, id: taskId };

    confirmMessage.textContent = "Are you sure you want to delete this task?";
    confirmPopup.style.display = "flex";
  }
});

document.getElementById("deleteDone").addEventListener("click", () => {
  taskToDelete = "done";
  confirmMessage.textContent =
    "Are you sure you want to delete all DONE tasks?";
  confirmPopup.style.display = "flex";
});

document.getElementById("deleteAll").addEventListener("click", () => {
  taskToDelete = "all";
  confirmMessage.textContent = "Are you sure you want to delete ALL tasks?";
  confirmPopup.style.display = "flex";
});

confirmDeleteBtn.addEventListener("click", async () => {
  if (taskToDelete === "done") {
    const q = query(collection(db, "tasks"), where("done", "==", true));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(async (docItem) => {
      await deleteDoc(doc(db, "tasks", docItem.id));
    });
    await loadTasks();
  } else if (taskToDelete === "all") {
    const querySnapshot = await getDocs(collection(db, "tasks"));
    querySnapshot.forEach(async (docItem) => {
      await deleteDoc(doc(db, "tasks", docItem.id));
    });
    await loadTasks();
  } else if (taskToDelete?.id) {
    await deleteDoc(doc(db, "tasks", taskToDelete.id));
    await loadTasks();
  }

  taskToDelete = null;
  confirmPopup.style.display = "none";
});

cancelDeleteBtn.addEventListener("click", () => {
  taskToDelete = null;
  confirmPopup.style.display = "none";
});

// ========================= Filtering =========================
document.getElementById("allTasks").addEventListener("click", () => {
  document.querySelectorAll(".Task").forEach((t) => (t.style.display = "flex"));
});

document.getElementById("doneTasks").addEventListener("click", () => {
  document.querySelectorAll(".Task").forEach((t) => {
    t.style.display = t.classList.contains("Done") ? "flex" : "none";
  });
});

document.getElementById("todoTasks").addEventListener("click", () => {
  document.querySelectorAll(".Task").forEach((t) => {
    t.style.display = t.classList.contains("Done") ? "none" : "flex";
  });
});
