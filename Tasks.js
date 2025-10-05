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
    onSnapshot 
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
        deleteDoneBtn.style.backgroundColor = "#E94343";
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
    const addBtn = document.getElementById("addTaskBtn");
    taskValidation.textContent = "";
    taskValidation.style.display = "none";

    const normalizedTaskName = taskName.toLowerCase();
    const tasks = document.querySelectorAll("#Tasks .Task");
    tasks.forEach((task) => {
        const name = task.querySelector("p").textContent.trim().toLowerCase();
        task.style.display = name.includes(normalizedTaskName) ? "flex" : "none";
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
    Swal.fire({
        toast: true,
        position: "bottom",
        icon: "success",
        title: "Task added successfully ✅",
        showConfirmButton: false,
        timer: 3000
    });
});

// ========================= Task Container Events =========================
tasksContainer.addEventListener("click", async (event) => {
    const taskDiv = event.target.closest(".Task");
    if (!taskDiv) return;
    const taskId = taskDiv.dataset.id;

    // Edit
    if (event.target.closest("i.fa-pencil")) {
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
            },
        });
        if (newName) {
            await updateDoc(doc(db, "tasks", taskId), { name: newName.trim() });
            Swal.fire({
                icon: "success",
                title: "Task updated ✅",
                timer: 2000,
                showConfirmButton: false
            });
        }
        return;
    }

    // Delete
    if (event.target.closest("i.fa-trash")) {
        const confirm = await Swal.fire({
            title: "🗑️ Delete Task",
            text: "Are you sure you want to delete this task?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#E94343",
            cancelButtonColor: "gray",
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "Cancel",
        });
        if (confirm.isConfirmed) {
            await deleteDoc(doc(db, "tasks", taskId));
            Swal.fire({
                icon: "success",
                title: "Task deleted 🗑️",
                timer: 2000,
                showConfirmButton: false
            });
        }
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

// ========================= Delete Done Tasks =========================
deleteDoneBtn.addEventListener("click", async () => {
    const confirm = await Swal.fire({
        title: "🗑️ Delete All DONE Tasks",
        text: "Are you sure you want to delete all completed tasks?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#E94343",
        cancelButtonColor: "gray",
        confirmButtonText: "Yes, delete them!",
    });
    if (confirm.isConfirmed) {
        const doneTasks = document.querySelectorAll(".Task.Done");
        for (let t of doneTasks) await deleteDoc(doc(db, "tasks", t.dataset.id));
        Swal.fire({
            icon: "success",
            title: "All done tasks deleted ✅",
            timer: 2000,
            showConfirmButton: false
        });
    }
});

// ========================= Delete All Tasks =========================
deleteAllBtn.addEventListener("click", async () => {
    const confirm = await Swal.fire({
        title: "🗑️ Delete ALL Tasks",
        text: "This will delete ALL tasks, are you sure?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#E94343",
        cancelButtonColor: "gray",
        confirmButtonText: "Yes, delete everything!",
    });
    if (confirm.isConfirmed) {
        const allTasks = document.querySelectorAll(".Task");
        for (let t of allTasks) await deleteDoc(doc(db, "tasks", t.dataset.id));
        Swal.fire({
            icon: "success",
            title: "All tasks deleted 🗑️",
            timer: 2000,
            showConfirmButton: false
        });
    }
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
