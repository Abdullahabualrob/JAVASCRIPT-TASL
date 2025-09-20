


document.getElementById("addTaskBtn").addEventListener("click", () => {
    /////////////////////// Validation ///////////////////////////////
    
    const input = document.getElementById("newToDo");
    const taskName = document.getElementById("newToDo").value.trim();
    let taskValidation = document.getElementById("taskValidation");
    taskValidation.textContent = "";
    taskValidation.style.display = "none";
    if(taskName === "")
    {
        taskValidation.textContent = "Task name cannot be empty";
        taskValidation.style.display = "block";
        return;
    }
    else if (/^\d/.test(taskName))
    {
        taskValidation.textContent = "Task name cannot start with a number";
        taskValidation.style.display = "block";
        return;
    }
    else if (taskName.length < 5)
    {
        taskValidation.textContent = "Task name cannot be less than 5 characters";
        taskValidation.style.display = "block";
        return;
    }
    ////////////////////////////////////////////////////////////////
    

    ///////////////////// Addition ////////////////////////////////////////
    let tasks = document.getElementById("Tasks");
    SavedTasks.push(taskName);
    // console.log(SavedTasks);
    localStorage.setItem("Tasks", JSON.stringify(SavedTasks));
    console.log(localStorage.getItem("Tasks"));
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
///////////////////////////// page load /////////////////////////////////////
 let SavedTasks = JSON.parse(localStorage.getItem("Tasks")) || [];

  document.addEventListener("DOMContentLoaded", () => {
    
    let Tasks = document.getElementById("Tasks");
    console.log(SavedTasks);
    SavedTasks.forEach(task => {
        Tasks.innerHTML += `
    <div class="Task">
        <p>${task}</p>
        <div class="Operations">
          <input type="checkbox">
          <button><i class="fa fa-pencil" aria-hidden="true"></i></button>
          <button><i class="fa fa-trash" aria-hidden="true"></i></button>
        </div>
      </div>
    `;
    });
});
