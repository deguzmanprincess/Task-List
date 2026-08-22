const SUPABASE_URL = "https://hdizscggbjqpuhivhqta.supabase.co";

const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_dNIC3-xihIq87cH18rqEvQ_P8khT80E";

const db = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);


document.addEventListener("DOMContentLoaded", () => {

    const newTaskBtn = document.getElementById("newTaskBtn");
    const modal = document.getElementById("modal");
    const closeModal = document.getElementById("closeModal");
    const taskForm = document.getElementById("taskForm");

    const taskNameInput = document.getElementById("taskName");
    const taskSectionInput = document.getElementById("taskSection");
    const taskPriorityInput = document.getElementById("taskPriority");
    const taskTeamInput = document.getElementById("taskTeam");

    const searchInput = document.getElementById("searchInput");


    /* =========================
       OPEN MODAL
    ========================= */

    newTaskBtn.addEventListener("click", () => {

        modal.classList.add("show");

        taskNameInput.focus();

    });


    /* =========================
       CLOSE MODAL
    ========================= */

    closeModal.addEventListener("click", () => {

        modal.classList.remove("show");

    });


    modal.addEventListener("click", (event) => {

        if (event.target === modal) {

            modal.classList.remove("show");

        }

    });


    /* =========================
       LOAD TASKS
    ========================= */

    async function loadTasks() {

        const { data, error } = await db
            .from("tasks")
            .select("*")
            .order("created_at", {
                ascending: true
            });


        if (error) {

            console.error("LOAD ERROR:", error);

            alert(
                "Could not load tasks:\n\n" +
                error.message
            );

            return;

        }


        document.querySelectorAll(".tasks").forEach((container) => {

            container.innerHTML = "";

        });


        data.forEach((task) => {

            renderTask(task);

        });


        setupCheckboxes();

        setupDeleteButtons();

    }


    /* =========================
       DISPLAY TASK
    ========================= */

    function renderTask(task) {

        const container = document.querySelector(
            `.tasks[data-section="${task.section}"]`
        );


        if (!container) {

            console.error(
                "Section not found:",
                task.section
            );

            return;

        }


        const row = document.createElement("div");

        row.className = "task-row";

        row.dataset.id = task.id;

        row.dataset.task = task.name;


        let priorityText = "Medium";


        if (task.priority === "high") {

            priorityText = "High";

        }

        if (task.priority === "low") {

            priorityText = "Low";

        }


        if (task.completed) {

            row.classList.add("completed");

        }


        row.innerHTML = `

            <div class="task-name">

                <input
                    type="checkbox"
                    class="task-checkbox"
                    ${task.completed ? "checked" : ""}
                >

                <span>
                    ${escapeHTML(task.name)}
                </span>

            </div>


            <span class="due-date">
                ${escapeHTML(task.due_date || task.section)}
            </span>


            <span class="badge not-started">
                Not started
            </span>


            <span class="badge ${task.priority}">
                ${priorityText}
            </span>


            <span class="team">
                ${escapeHTML(task.team || "General")}
            </span>


            <div class="assignee">
                👤
            </div>


            <button
                type="button"
                class="delete-task"
            >
                ×
            </button>

        `;


        container.appendChild(row);

    }


    /* =========================
       ADD TASK
    ========================= */

    taskForm.addEventListener("submit", async (event) => {

        event.preventDefault();


        const name = taskNameInput.value.trim();

        const section = taskSectionInput.value;

        const priority = taskPriorityInput.value;

        const team =
            taskTeamInput.value.trim() || "General";


        if (!name) {

            alert("Please enter a task name.");

            return;

        }


        const { data, error } = await db
            .from("tasks")
            .insert([
                {
                    name: name,
                    section: section,
                    due_date: section,
                    priority: priority,
                    team: team,
                    completed: false
                }
            ])
            .select()
            .single();


        if (error) {

            console.error("INSERT ERROR:", error);

            alert(
                "Could not add task:\n\n" +
                error.message
            );

            return;

        }


        renderTask(data);


        taskForm.reset();

        modal.classList.remove("show");


        setupCheckboxes();

        setupDeleteButtons();

    });


    /* =========================
       CHECKBOXES
    ========================= */

    function setupCheckboxes() {

        document
            .querySelectorAll(".task-checkbox")
            .forEach((checkbox) => {


                if (checkbox.dataset.listener) {

                    return;

                }


                checkbox.dataset.listener = "true";


                checkbox.addEventListener(
                    "change",
                    async () => {

                        const row =
                            checkbox.closest(".task-row");


                        const id =
                            row.dataset.id;


                        const completed =
                            checkbox.checked;


                        if (completed) {

                            row.classList.add(
                                "completed"
                            );

                        } else {

                            row.classList.remove(
                                "completed"
                            );

                        }


                        const { error } = await db
                            .from("tasks")
                            .update({
                                completed: completed
                            })
                            .eq("id", id);


                        if (error) {

                            console.error(
                                "UPDATE ERROR:",
                                error
                            );

                            alert(
                                "Could not update task:\n\n" +
                                error.message
                            );

                        }

                    }
                );

            });

    }


    /* =========================
       DELETE TASK
    ========================= */

    function setupDeleteButtons() {

        document
            .querySelectorAll(".delete-task")
            .forEach((button) => {


                if (button.dataset.listener) {

                    return;

                }


                button.dataset.listener = "true";


                button.addEventListener(
                    "click",
                    async () => {

                        const row =
                            button.closest(".task-row");


                        const id =
                            row.dataset.id;


                        const { error } = await db
                            .from("tasks")
                            .delete()
                            .eq("id", id);


                        if (error) {

                            console.error(
                                "DELETE ERROR:",
                                error
                            );

                            alert(
                                "Could not delete task:\n\n" +
                                error.message
                            );

                            return;

                        }


                        row.remove();

                    }
                );

            });

    }


    /* =========================
       SEARCH
    ========================= */

    searchInput.addEventListener("input", () => {

        const search =
            searchInput.value
                .toLowerCase()
                .trim();


        document
            .querySelectorAll(".task-row")
            .forEach((row) => {

                const text =
                    row.innerText.toLowerCase();


                row.style.display =
                    text.includes(search)
                        ? "grid"
                        : "none";

            });

    });


    /* =========================
       ESCAPE HTML
    ========================= */

    function escapeHTML(text) {

        const div =
            document.createElement("div");

        div.textContent = text;

        return div.innerHTML;

    }


    /* =========================
       START
    ========================= */

    loadTasks();

});
