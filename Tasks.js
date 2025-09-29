///////////////////////////// page load /////////////////////////////////////
let SavedTasks = JSON.parse(localStorage.getItem("Tasks")) || [];

document.addEventListener("DOMContentLoaded", () => {
  let Tasks = document.getElementById("Tasks");
  SavedTasks.forEach((task) => {
    Tasks.innerHTML += `
    <div class="Task ${task.done ? "Done" : ""}">
        <p>${task.name}</p>
        <div class="Operations">
          <input type="checkbox" ${task.done ? "checked" : ""}>
          <button><i class="fa fa-pencil" aria-hidden="true"></i></button>
          <button><i class="fa fa-trash" aria-hidden="true"></i></button>
        </div>
      </div>
    `;
  });
});

///////////////////////////// add task /////////////////////////////////////
document.getElementById("addTaskBtn").addEventListener("click", () => {
  const input = document.getElementById("newToDo");
  const taskName = input.value.trim();
  let taskValidation = document.getElementById("taskValidation");

  taskValidation.textContent = "";
  taskValidation.style.display = "none";

  if (taskName === "") {
    taskValidation.textContent = "Task name cannot be empty";
    taskValidation.style.display = "block";
    return;
  } else if (/^\d/.test(taskName)) {
    taskValidation.textContent = "Task name cannot start with a number";
    taskValidation.style.display = "block";
    return;
  } else if (taskName.length < 5) {
    taskValidation.textContent = "Task name cannot be less than 5 characters";
    taskValidation.style.display = "block";
    return;
  }

  let tasks = document.getElementById("Tasks");
  SavedTasks.push({ name: taskName, done: false });
  localStorage.setItem("Tasks", JSON.stringify(SavedTasks));
  tasks.innerHTML += `
    <div class="Task">
        <p>${taskName}</p>
        <div class="Operations">
          <input type="checkbox">
          <button><i class="fa fa-pencil" aria-hidden="true"></i></button>
          <button><i class="fa fa-trash" aria-hidden="true"></i></button>
        </div>
      </div>
    `;
  input.value = "";
});

///////////////////////////// checkbox event /////////////////////////////////////
document.getElementById("Tasks").addEventListener("change", (event) => {
  if (event.target.type === "checkbox") {
    const check = event.target;
    const taskDiv = check.closest(".Task");
    if (check.checked) {
      taskDiv.classList.add("Done");
    } else {
      taskDiv.classList.remove("Done");
    }
    SavedTasks = SavedTasks.map((task) =>
      task.name === taskDiv.querySelector("p").textContent
        ? { ...task, done: check.checked }
        : task
    );
    localStorage.setItem("Tasks", JSON.stringify(SavedTasks));
  }
});

///////////////////////////// Filtring /////////////////////////////////////
//All
document.getElementById("allTasks").addEventListener("click", () => {
  const tasks = document.querySelectorAll(".Task");
  tasks.forEach((task) => (task.style.display = "flex"));
});
//Done
document.getElementById("doneTasks").addEventListener("click", () => {
  const tasks = document.querySelectorAll(".Task");
  tasks.forEach((task) => {
    task.style.display = task.classList.contains("Done") ? "flex" : "none";
  });
});
//Todo
document.getElementById("todoTasks").addEventListener("click", () => {
  const tasks = document.querySelectorAll(".Task");
  tasks.forEach((task) => {
    task.style.display = task.classList.contains("Done") ? "none" : "flex";
  });
});

///////////////////////////// Popups /////////////////////////////////////


const editPopup = document.getElementById("editPopup");
const editInput = document.getElementById("editInput");
const saveEditBtn = document.getElementById("saveEdit");
const cancelEditBtn = document.getElementById("cancelEdit");

const confirmPopup = document.getElementById("confirmPopup");
const confirmMessage = document.getElementById("confirmMessage");
const confirmDeleteBtn = document.getElementById("confirmDelete");
const cancelDeleteBtn = document.getElementById("cancelDelete");

let taskToEdit = null;
let taskToDelete = null;

///////////////////////////// Edit popup /////////////////////////////////////
document.getElementById("Tasks").addEventListener("click", (event) => {
  const editBtn = event.target.closest("button")?.querySelector("i.fa-pencil");
  if (editBtn) {
    const taskDiv = event.target.closest(".Task");
    const taskNameElem = taskDiv.querySelector("p");
    taskToEdit = { elem: taskNameElem, oldName: taskNameElem.textContent };

    editInput.value = taskToEdit.oldName;
    editPopup.style.display = "flex";
  }
});

saveEditBtn.addEventListener("click", () => {
  const newName = editInput.value.trim();
  if (newName !== "") {
    taskToEdit.elem.textContent = newName;
   SavedTasks=SavedTasks.map((task)=>
    task.name===taskToEdit.oldName? {...task,name: newName} :task);

    localStorage.setItem("Tasks", JSON.stringify(SavedTasks));
  }
  editPopup.style.display = "none";
});

cancelEditBtn.addEventListener("click", () => {
  editPopup.style.display = "none";
  taskToEdit = null;
});

///////////////////////////// Delete popup /////////////////////////////////////

document.getElementById("Tasks").addEventListener("click", (event) => {
  if (
    event.target.closest("button") &&
    event.target.closest("button").querySelector("i.fa-trash")
  ) {
    const taskDiv = event.target.closest(".Task");
    const taskName = taskDiv.querySelector("p").textContent;
    taskToDelete = { elem: taskDiv, name: taskName };

    confirmMessage.textContent = `Are you sure you want to delete "${taskName}"?`;
    confirmPopup.style.display = "flex";
  }
});


document.getElementById("deleteDone").addEventListener("click", () => {
  taskToDelete = "done";
  confirmMessage.textContent = "Are you sure you want to delete all DONE tasks?";
  confirmPopup.style.display = "flex";
});


document.getElementById("deleteAll").addEventListener("click", () => {
  taskToDelete = "all";
  confirmMessage.textContent = "Are you sure you want to delete ALL tasks?";
  confirmPopup.style.display = "flex";
});

confirmDeleteBtn.addEventListener("click", () => {
  if (taskToDelete === "done") {
    const tasks = document.querySelectorAll(".Task");
    tasks.forEach((taskElem) => {
      const checkbox = taskElem.querySelector('input[type="checkbox"]');
      if (checkbox && checkbox.checked) {
        const name = taskElem.querySelector("p").textContent;
        const idx = SavedTasks.findIndex((t) => t.name === name);
        if (idx > -1) SavedTasks.splice(idx, 1);
        taskElem.remove();
      }
    });
    localStorage.setItem("Tasks", JSON.stringify(SavedTasks));
  } else if (taskToDelete === "all") {
    SavedTasks = [];
    localStorage.setItem("Tasks", JSON.stringify(SavedTasks));
    document.getElementById("Tasks").innerHTML = "";
  } else if (taskToDelete && typeof taskToDelete === "object") {
    taskToDelete.elem.remove();
    SavedTasks = SavedTasks.filter((task) => task.name !== taskToDelete.name);
    localStorage.setItem("Tasks", JSON.stringify(SavedTasks));
  }

  taskToDelete = null;
  confirmPopup.style.display = "none";
});


cancelDeleteBtn.addEventListener("click", () => {
  confirmPopup.style.display = "none";
  taskToDelete = null;
});
