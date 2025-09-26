///////////////////////////// page load /////////////////////////////////////
let SavedTasks = JSON.parse(localStorage.getItem("Tasks")) || [];

document.addEventListener("DOMContentLoaded", () => {
  let Tasks = document.getElementById("Tasks");
  console.log(SavedTasks);
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

document.getElementById("addTaskBtn").addEventListener("click", () => {
  /////////////////////// Validation ///////////////////////////////

  const input = document.getElementById("newToDo");
  const taskName = document.getElementById("newToDo").value.trim();
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


  ///////////////////// Addition ////////////////////////////////////////
  let tasks = document.getElementById("Tasks");
  SavedTasks.push({name: taskName, done: false});
  console.log(SavedTasks);
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
    // console.log(SavedTasks);
  }
});
///////////////////////////// Filtring /////////////////////////////////////
//All
document.getElementById("allTasks").addEventListener("click", () => {
  const tasksDiv = document.getElementById("Tasks");
  const tasks = tasksDiv.querySelectorAll(".Task");
  tasks.forEach((task) => {
    task.style.display = "flex";
  });
});
//Done
document.getElementById("doneTasks").addEventListener("click", () => {
  const tasksDiv = document.getElementById("Tasks");
  const tasks = tasksDiv.querySelectorAll(".Task");
  tasks.forEach((task) => {
    if (!task.classList.contains("Done")) {
      task.style.display = "none";
    }
    else{
      task.style.display = "flex";
    }
  });
});
//Todo
document.getElementById("todoTasks").addEventListener("click", () => {
  const tasksDiv = document.getElementById("Tasks");
  const tasks = tasksDiv.querySelectorAll(".Task");
  tasks.forEach((task) => {
    if (task.classList.contains("Done")) {
      task.style.display = "none";
    }
    else{
      task.style.display = "flex";
    }
  });
});

//delete all task done\\\\\\\\\\\\\\\\\\\\\\\\
// زر حذف المهام المنجزة فقط (يقرأ الحالة من DOM ويحذفها)
document.getElementById("deleteDone").addEventListener("click", () => {
  const tasksDiv = document.getElementById("Tasks");
  const taskElems = Array.from(tasksDiv.querySelectorAll(".Task"));
  
  taskElems.forEach((taskElem) => {
    const checkbox = taskElem.querySelector('input[type="checkbox"]');
    if (checkbox && checkbox.checked) {
      const name = taskElem.querySelector("p").textContent;
      const idx = SavedTasks.findIndex(t => t.name === name);
      if (idx > -1) SavedTasks.splice(idx, 1);
      taskElem.remove();
    }
  });
  localStorage.setItem("Tasks", JSON.stringify(SavedTasks));
});






// Delete all task\\\\\\\\\
document.getElementById("deleteAll").addEventListener("click", () => {
  SavedTasks = [];
  localStorage.setItem("Tasks", JSON.stringify(SavedTasks));
  document.getElementById("Tasks").innerHTML = "";
});

//Delete icon 
document.getElementById("Tasks").addEventListener("click", (event) => {
  if (event.target.closest("button") && event.target.closest("button").querySelector("i.fa-trash")) {
    const taskDiv = event.target.closest(".Task");
    const taskName = taskDiv.querySelector("p").textContent;

    // إزالة من DOM
    taskDiv.remove();

    // إزالة من SavedTasks و localStorage
    SavedTasks = SavedTasks.filter(task => task.name !== taskName);
    localStorage.setItem("Tasks", JSON.stringify(SavedTasks));
  }
});


