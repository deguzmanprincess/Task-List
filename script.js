const SUPABASE_URL = "https://hdizscggbjqpuhivhqta.supabase.co";

const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_dNIC3-xihIq87cH18rqEvQ_P8khT80E";

const supabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);
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


    /* =========================
       OPEN / CLOSE MODAL
    ========================= */

    newTaskBtn.addEventListener("click", () => {
        modal.classList.add("show");
        taskNameInput.focus();
    });


    closeModal.addEventListener("click", () => {
        modal.classList.remove("show");
    });


    modal.addEventListener("click", (event) => {

        if (event.target === modal) {
            modal.classList.remove("show");
        }

    });


    /* =========================
       TASK CHECKBOXES
    ========================= */

    function setupCheckboxes() {

        const checkboxes = document.querySelectorAll(".task-checkbox");

        checkboxes.forEach((checkbox) => {

            checkbox.addEventListener("change", () => {

                const row = checkbox.closest(".task-row");

                if (checkbox.checked) {
                    row.classList.add("completed");
                } else {
                    row.classList.remove("completed");
                }

                saveTasks();

            });

        });

    }


    /* =========================
       DELETE TASKS
    ========================= */

    function setupDeleteButtons() {

        const deleteButtons = document.querySelectorAll(".delete-task");

        deleteButtons.forEach((button) => {

            button.addEventListener("click", () => {

                const row = button.closest(".task-row");

                row.remove();

                saveTasks();

            });

        });

    }


    /* =========================
       ADD NEW TASK
    ========================= */

    taskForm.addEventListener("submit", (event) => {

        event.preventDefault();

        const name = taskNameInput.value.trim();
        const section = taskSectionInput.value;
        const priority = taskPriorityInput.value;
        const team = taskTeamInput.value.trim() || "General";


        if (!name) {
            return;
        }


        // Find the correct section
        const sectionContainer = document.querySelector(
            `.tasks[data-section="${section}"]`
        );


        if (!sectionContainer) {
            return;
        }


        // Create task row
        const taskRow = document.createElement("div");

        taskRow.className = "task-row";

        taskRow.dataset.task = name;


        // Determine due date text
        let dueDate = section;

        if (section === "This week") {
            dueDate = "This week";
        }


        // Create priority badge
        let priorityText = "Medium";

        if (priority === "high") {
            priorityText = "High";
        }

        if (priority === "low") {
            priorityText = "Low";
        }


        taskRow.innerHTML = `
            <div class="task-name">
                <input type="checkbox" class="task-checkbox">
                <span>${escapeHTML(name)}</span>
            </div>

            <span class="due-date">${dueDate}</span>

            <span class="badge not-started">
                Not started
            </span>

            <span class="badge ${priority}">
                ${priorityText}
            </span>

            <span class="team">
                ${escapeHTML(team)}
            </span>

            <div class="assignee">
                👤
            </div>

            <button class="delete-task">×</button>
        `;


        sectionContainer.appendChild(taskRow);


        // Clear form
        taskForm.reset();


        // Close modal
        modal.classList.remove("show");


        // Activate new controls
        setupCheckboxes();
        setupDeleteButtons();

        saveTasks();

    });


    /* =========================
       SEARCH
    ========================= */

    searchInput.addEventListener("input", () => {

        const searchTerm = searchInput.value
            .toLowerCase()
            .trim();


        const taskRows = document.querySelectorAll(".task-row");


        taskRows.forEach((row) => {

            const taskText = row.innerText.toLowerCase();

            if (taskText.includes(searchTerm)) {
                row.style.display = "grid";
            } else {
                row.style.display = "none";
            }

        });

    });


    /* =========================
       LOCAL STORAGE
    ========================= */

    function saveTasks() {

        const allTasks = [];


        document.querySelectorAll(".task-section").forEach((section) => {

            const sectionName =
                section.querySelector(".tasks").dataset.section;


            section.querySelectorAll(".task-row").forEach((row) => {

                const checkbox =
                    row.querySelector(".task-checkbox");

                const taskName =
                    row.querySelector(".task-name span").textContent;

                const dueDate =
                    row.querySelector(".due-date").textContent;

                const priorityBadge =
                    row.querySelectorAll(".badge")[1];

                const team =
                    row.querySelector(".team").textContent.trim();


                let priority = "medium";

                if (priorityBadge.classList.contains("high")) {
                    priority = "high";
                }

                if (priorityBadge.classList.contains("low")) {
                    priority = "low";
                }


                allTasks.push({
                    name: taskName,
                    section: sectionName,
                    dueDate: dueDate,
                    priority: priority,
                    team: team,
                    completed: checkbox.checked
                });

            });

        });


        localStorage.setItem(
            "organizoTasks",
            JSON.stringify(allTasks)
        );

    }


    /* =========================
       HTML SECURITY HELPER
    ========================= */

    function escapeHTML(text) {

        const div = document.createElement("div");

        div.textContent = text;

        return div.innerHTML;

    }


    /* =========================
       INITIALIZE
    ========================= */

    setupCheckboxes();
    setupDeleteButtons();

});