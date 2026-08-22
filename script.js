/* =====================================================
   SUPABASE CONNECTION
===================================================== */

const SUPABASE_URL = "https://hdizscggbjqpuhivhqta.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_dNIC3-xihIq87cH18rqEvQ_P8khT80E";

const supabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);


/* =====================================================
   MAIN APP
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

    const newTaskBtn = document.getElementById("newTaskBtn");
    const modal = document.getElementById("modal");
    const closeModal = document.getElementById("closeModal");
    const taskForm = document.getElementById("taskForm");
    const searchInput = document.getElementById("searchInput");

    const taskNameInput = document.getElementById("taskName");
    const taskSectionInput = document.getElementById("taskSection");
    const taskPriorityInput = document.getElementById("taskPriority");
    const taskTeamInput = document.getElementById("taskTeam");


    /* =====================================================
       OPEN MODAL
    ===================================================== */

    newTaskBtn.addEventListener("click", () => {

        modal.classList.add("show");

        taskNameInput.focus();

    });


    /* =====================================================
       CLOSE MODAL
    ===================================================== */

    closeModal.addEventListener("click", () => {

        modal.classList.remove("show");

    });


    modal.addEventListener("click", (event) => {

        if (event.target === modal) {

            modal.classList.remove("show");

        }

    });


    /* =====================================================
       LOAD TASKS FROM SUPABASE
    ===================================================== */

    async function loadTasks() {

        console.log("Loading tasks from Supabase...");


        const { data, error } = await supabase
            .from("tasks")
            .select("*")
            .order("created_at", {
                ascending: true
            });


        if (error) {

            console.error("SUPABASE LOAD ERROR:", error);

            alert(
                "Error loading tasks:\n\n" +
                error.message
            );

            return;

        }


        console.log("Tasks loaded:", data);


        /*
         * Clear existing tasks
         */

        document.querySelectorAll(".tasks").forEach((container) => {

            container.innerHTML = "";

        });


        /*
         * Display tasks
         */

        data.forEach((task) => {

            renderTask(task);

        });


        setupCheckboxes();

        setupDeleteButtons();

    }


    /* =====================================================
       RENDER TASK
    ===================================================== */

    function renderTask(task) {

        const sectionContainer = document.querySelector(
            `.tasks[data-section="${task.section}"]`
        );


        if (!sectionContainer) {

            console.error(
                "Section not found:",
                task.section
            );

            return;

        }


        const taskRow = document.createElement("div");

        taskRow.className = "task-row";

        taskRow.dataset.task = task.name;

        taskRow.dataset.id = task.id;


        /*
         * Priority
         */

        let priorityText = "Medium";

        if (task.priority === "high") {

            priorityText = "High";

        }

        if (task.priority === "low") {

            priorityText = "Low";

        }


        /*
         * Completed
         */

        if (task.completed) {

            taskRow.classList.add("completed");

        }


        taskRow.innerHTML = `

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
                class="delete-task"
                title="Delete task"
            >
                ×
            </button>

        `;


        sectionContainer.appendChild(taskRow);

    }


    /* =====================================================
       ADD NEW TASK
    ===================================================== */

    taskForm.addEventListener("submit", async (event) => {

        event.preventDefault();


        const name =
            taskNameInput.value.trim();


        const section =
            taskSectionInput.value;


        const priority =
            taskPriorityInput.value;


        const team =
            taskTeamInput.value.trim() || "General";


        console.log("Adding task:", {
            name,
            section,
            priority,
            team
        });


        /*
         * Make sure task name isn't empty
         */

        if (!name) {

            alert("Please enter a task name.");

            return;

        }


        /*
         * Make sure section exists
         */

        const sectionContainer = document.querySelector(
            `.tasks[data-section="${section}"]`
        );


        if (!sectionContainer) {

            alert(
                "The selected task section does not exist."
            );

            return;

        }


        /*
         * Due date
         */

        let dueDate = section;


        if (section === "Today") {

            dueDate = "Today";

        }


        if (section === "Tomorrow") {

            dueDate = "Tomorrow";

        }


        if (section === "This week") {

            dueDate = "This week";

        }


        /*
         * SEND TASK TO SUPABASE
         */

        const { data, error } = await supabase
            .from("tasks")
            .insert([
                {
                    name: name,
                    section: section,
                    due_date: dueDate,
                    priority: priority,
                    team: team,
                    completed: false
                }
            ])
            .select()
            .single();


        /*
         * Check for database error
         */

        if (error) {

            console.error(
                "SUPABASE INSERT ERROR:",
                error
            );

            alert(
                "Could not add task:\n\n" +
                error.message
            );

            return;

        }


        console.log(
            "Task successfully added:",
            data
        );


        /*
         * Display the new task
         */

        renderTask(data);


        /*
         * Reset form
         */

        taskForm.reset();


        /*
         * Close modal
         */

        modal.classList.remove("show");


        /*
         * Activate buttons
         */

        setupCheckboxes();

        setupDeleteButtons();

    });


    /* =====================================================
       CHECKBOXES
    ===================================================== */

    function setupCheckboxes() {

        const checkboxes =
            document.querySelectorAll(".task-checkbox");


        checkboxes.forEach((checkbox) => {

            /*
             * Prevent duplicate listeners
             */

            if (checkbox.dataset.listener === "true") {

                return;

            }


            checkbox.dataset.listener = "true";


            checkbox.addEventListener(
                "change",
                async () => {

                    const row =
                        checkbox.closest(".task-row");


                    const taskId =
                        row.dataset.id;


                    const completed =
                        checkbox.checked;


                    /*
                     * Update appearance
                     */

                    if (completed) {

                        row.classList.add("completed");

                    } else {

                        row.classList.remove("completed");

                    }


                    /*
                     * Update Supabase
                     */

                    const { error } =
                        await supabase
                            .from("tasks")
                            .update({
                                completed: completed
                            })
                            .eq("id", taskId);


                    if (error) {

                        console.error(
                            "SUPABASE UPDATE ERROR:",
                            error
                        );


                        /*
                         * Revert UI
                         */

                        checkbox.checked =
                            !completed;


                        if (checkbox.checked) {

                            row.classList.add(
                                "completed"
                            );

                        } else {

                            row.classList.remove(
                                "completed"
                            );

                        }


                        alert(
                            "Could not update task:\n\n" +
                            error.message
                        );

                    }

                }
            );

        });

    }


    /* =====================================================
       DELETE TASKS
    ===================================================== */

    function setupDeleteButtons() {

        const deleteButtons =
            document.querySelectorAll(".delete-task");


        deleteButtons.forEach((button) => {

            /*
             * Prevent duplicate listeners
             */

            if (button.dataset.listener === "true") {

                return;

            }


            button.dataset.listener = "true";


            button.addEventListener(
                "click",
                async () => {

                    const row =
                        button.closest(".task-row");


                    const taskId =
                        row.dataset.id;


                    const confirmed =
                        confirm(
                            "Are you sure you want to delete this task?"
                        );


                    if (!confirmed) {

                        return;

                    }


                    /*
                     * Delete from Supabase
                     */

                    const { error } =
                        await supabase
                            .from("tasks")
                            .delete()
                            .eq("id", taskId);


                    if (error) {

                        console.error(
                            "SUPABASE DELETE ERROR:",
                            error
                        );

                        alert(
                            "Could not delete task:\n\n" +
                            error.message
                        );

                        return;

                    }


                    /*
                     * Remove from website
                     */

                    row.remove();

                }
            );

        });

    }


    /* =====================================================
       SEARCH
    ===================================================== */

    searchInput.addEventListener("input", () => {

        const searchTerm =
            searchInput.value
                .toLowerCase()
                .trim();


        const taskRows =
            document.querySelectorAll(".task-row");


        taskRows.forEach((row) => {

            const taskText =
                row.innerText.toLowerCase();


            if (
                taskText.includes(searchTerm)
            ) {

                row.style.display = "grid";

            } else {

                row.style.display = "none";

            }

        });

    });


    /* =====================================================
       HTML SECURITY
    ===================================================== */

    function escapeHTML(text) {

        const div =
            document.createElement("div");


        div.textContent = text;


        return div.innerHTML;

    }


    /* =====================================================
       INITIALIZE
    ===================================================== */

    loadTasks();

});
