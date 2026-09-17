const STORAGE_KEY = "fall2026-assignment-progress";

/* =========================================
   START APP
========================================= */

document.addEventListener("DOMContentLoaded", () => {
    initializeTracker();
});


function initializeTracker() {

    const assignments =
        document.querySelectorAll(".assignment");

    /*
     * Load saved checkbox states
     */
    loadProgress(assignments);

    /*
     * Make each assignment clickable
     */
    assignments.forEach((assignment) => {

        const checkbox =
            assignment.querySelector(".checkbox");

        /*
         * Clicking the checkbox
         */
        if (checkbox) {

            checkbox.addEventListener("click", (event) => {

                event.stopPropagation();

                toggleAssignment(assignment);

            });

        }

        /*
         * Clicking anywhere else on the assignment
         */
        assignment.addEventListener("click", (event) => {

            /*
             * Don't toggle twice when the checkbox
             * itself was clicked.
             */
            if (event.target.closest(".checkbox")) {
                return;
            }

            toggleAssignment(assignment);

        });

        /*
         * Keyboard accessibility
         */
        assignment.setAttribute("tabindex", "0");

        assignment.addEventListener("keydown", (event) => {

            if (
                event.key === "Enter" ||
                event.key === " "
            ) {

                event.preventDefault();

                toggleAssignment(assignment);

            }

        });

    });


    /*
     * Filter buttons
     */
    setupFilters();


    /*
     * Reset button
     */
    const resetButton =
        document.getElementById("reset-button");

    if (resetButton) {

        resetButton.addEventListener(
            "click",
            resetChecklist
        );

    }


    /*
     * Initial dashboard update
     */
    updateDashboard();

    updateUpcoming();

}


/* =========================================
   TOGGLE ASSIGNMENT
========================================= */

function toggleAssignment(assignment) {

    assignment.classList.toggle("completed");

    saveProgress();

    updateDashboard();

    updateUpcoming();

}


/* =========================================
   SAVE PROGRESS
========================================= */

function saveProgress() {

    const assignments =
        document.querySelectorAll(".assignment");

    const completed = {};

    assignments.forEach((assignment) => {

        const id =
            assignment.dataset.id;

        completed[id] =
            assignment.classList.contains(
                "completed"
            );

    });

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(completed)
    );

}


/* =========================================
   LOAD PROGRESS
========================================= */

function loadProgress(assignments) {

    const saved =
        localStorage.getItem(STORAGE_KEY);

    if (!saved) {
        return;
    }

    try {

        const completed =
            JSON.parse(saved);

        assignments.forEach((assignment) => {

            const id =
                assignment.dataset.id;

            if (completed[id] === true) {

                assignment.classList.add(
                    "completed"
                );

            }

        });

    } catch (error) {

        console.error(
            "Could not load saved progress:",
            error
        );

    }

}


/* =========================================
   DASHBOARD
========================================= */

function updateDashboard() {

    const assignments =
        document.querySelectorAll(".assignment");

    const completed =
        document.querySelectorAll(
            ".assignment.completed"
        );

    const total =
        assignments.length;

    const completedCount =
        completed.length;

    const remainingCount =
        total - completedCount;


    /*
     * Percentage
     */
    const percentage =
        total === 0
            ? 0
            : Math.round(
                (completedCount / total) * 100
            );


    /*
     * Completed count
     */
    const completedElement =
        document.getElementById(
            "completed-count"
        );

    if (completedElement) {

        completedElement.textContent =
            completedCount;

    }


    /*
     * Remaining count
     */
    const remainingElement =
        document.getElementById(
            "remaining-count"
        );

    if (remainingElement) {

        remainingElement.textContent =
            remainingCount;

    }


    /*
     * Progress percentage
     */
    const percentageElement =
        document.getElementById(
            "progress-percentage"
        );

    if (percentageElement) {

        percentageElement.textContent =
            percentage + "%";

    }


    /*
     * Progress bar
     */
    const progressFill =
        document.getElementById(
            "progress-fill"
        );

    if (progressFill) {

        progressFill.style.width =
            percentage + "%";

    }


    /*
     * Progress message
     */
    const progressMessage =
        document.getElementById(
            "progress-message"
        );

    if (progressMessage) {

        if (percentage === 0) {

            progressMessage.textContent =
                "Let's get started.";

        }

        else if (percentage < 25) {

            progressMessage.textContent =
                "Good start. Keep working through your assignments.";

        }

        else if (percentage < 50) {

            progressMessage.textContent =
                "You're making progress. Keep it going.";

        }

        else if (percentage < 75) {

            progressMessage.textContent =
                "You're more than halfway there.";

        }

        else if (percentage < 100) {

            progressMessage.textContent =
                "Almost there. Finish strong.";

        }

        else {

            progressMessage.textContent =
                "🎉 Everything is complete!";

        }

    }


    /*
     * Next due date on dashboard
     */
    updateNextDue();

}


/* =========================================
   NEXT DUE
========================================= */

function updateNextDue() {

    const assignments =
        document.querySelectorAll(
            ".assignment:not(.completed)"
        );


    const nextDueElement =
        document.getElementById(
            "next-due"
        );

    const nextNameElement =
        document.getElementById(
            "next-due-name"
        );


    if (
        !nextDueElement ||
        !nextNameElement
    ) {
        return;
    }


    if (assignments.length === 0) {

        nextDueElement.textContent =
            "✓";

        nextNameElement.textContent =
            "Everything completed";

        return;

    }


    const upcoming = [];


    assignments.forEach((assignment) => {

        const date =
            getAssignmentDate(
                assignment
            );

        const name =
            getAssignmentName(
                assignment
            );


        if (date) {

            upcoming.push({
                assignment,
                date,
                name
            });

        }

    });


    if (upcoming.length === 0) {

        nextDueElement.textContent =
            "—";

        nextNameElement.textContent =
            "No dates found";

        return;

    }


    upcoming.sort(
        (a, b) =>
            a.date.getTime() -
            b.date.getTime()
    );


    const next =
        upcoming[0];


    nextDueElement.textContent =
        formatShortDate(next.date);

    nextNameElement.textContent =
        next.name;

}


/* =========================================
   UPCOMING CARD
========================================= */

function updateUpcoming() {

    const title =
        document.getElementById(
            "upcoming-title"
        );

    const description =
        document.getElementById(
            "upcoming-description"
        );


    if (!title || !description) {
        return;
    }


    const assignments =
        document.querySelectorAll(
            ".assignment:not(.completed)"
        );


    /*
     * Everything completed
     */
    if (assignments.length === 0) {

        title.textContent =
            "🎉 All caught up!";

        description.textContent =
            "You've completed every assignment.";

        return;

    }


    const upcoming = [];


    assignments.forEach((assignment) => {

        const date =
            getAssignmentDate(
                assignment
            );

        const name =
            getAssignmentName(
                assignment
            );


        if (date) {

            upcoming.push({
                assignment,
                date,
                name
            });

        }

    });


    if (upcoming.length === 0) {

        title.textContent =
            "No upcoming deadlines";

        description.textContent =
            "Check your assignment dates.";

        return;

    }


    /*
     * Sort earliest first
     */
    upcoming.sort(
        (a, b) =>
            a.date.getTime() -
            b.date.getTime()
    );


    const next =
        upcoming[0];


    title.textContent =
        next.name;


    /*
     * Compare against today
     */
    const today =
        new Date();

    today.setHours(
        0,
        0,
        0,
        0
    );


    const daysAway =
        differenceInDays(
            today,
            next.date
        );


    if (daysAway < 0) {

        description.textContent =
            `Overdue — ${formatLongDate(next.date)}.`;

    }

    else if (daysAway === 0) {

        description.textContent =
            "Due today.";

    }

    else if (daysAway === 1) {

        description.textContent =
            "Due tomorrow.";

    }

    else if (daysAway <= 7) {

        description.textContent =
            `Due in ${daysAway} days — ${formatLongDate(next.date)}.`;

    }

    else {

        description.textContent =
            `Due ${formatLongDate(next.date)}.`;

    }

}


/* =========================================
   GET ASSIGNMENT DATE
========================================= */

function getAssignmentDate(assignment) {

    /*
     * Your HTML already has:
     *
     * data-date="2026-09-17"
     *
     * So use that instead of trying to
     * guess the year from "Sept. 17".
     */

    const dateString =
        assignment.dataset.date;


    if (!dateString) {
        return null;
    }


    const parts =
        dateString
            .split("-")
            .map(Number);


    if (parts.length !== 3) {
        return null;
    }


    const [
        year,
        month,
        day
    ] = parts;


    const date =
        new Date(
            year,
            month - 1,
            day
        );


    date.setHours(
        0,
        0,
        0,
        0
    );


    return date;

}


/* =========================================
   GET ASSIGNMENT NAME
========================================= */

function getAssignmentName(assignment) {

    const name =
        assignment.querySelector(
            ".assignment-name"
        );


    if (!name) {
        return "Assignment";
    }


    return name.textContent.trim();

}


/* =========================================
   DATE DIFFERENCE
========================================= */

function differenceInDays(
    firstDate,
    secondDate
) {

    const millisecondsPerDay =
        1000 *
        60 *
        60 *
        24;


    return Math.round(
        (
            secondDate.getTime() -
            firstDate.getTime()
        ) /
        millisecondsPerDay
    );

}


/* =========================================
   SHORT DATE
========================================= */

function formatShortDate(date) {

    return date.toLocaleDateString(
        "en-US",
        {
            month: "short",
            day: "numeric"
        }
    );

}


/* =========================================
   LONG DATE
========================================= */

function formatLongDate(date) {

    return date.toLocaleDateString(
        "en-US",
        {
            month: "long",
            day: "numeric",
            year: "numeric"
        }
    );

}


/* =========================================
   FILTERS
========================================= */

function setupFilters() {

    const filterButtons =
        document.querySelectorAll(
            ".filter-button"
        );


    const assignments =
        document.querySelectorAll(
            ".assignment"
        );


    filterButtons.forEach((button) => {

        button.addEventListener(
            "click",
            () => {

                const filter =
                    button.dataset.filter;


                /*
                 * Update active button
                 */
                filterButtons.forEach(
                    (otherButton) => {

                        otherButton.classList.toggle(
                            "active",
                            otherButton === button
                        );

                    }
                );


                /*
                 * Apply filter
                 */
                assignments.forEach(
                    (assignment) => {

                        const completed =
                            assignment.classList.contains(
                                "completed"
                            );


                        let show =
                            true;


                        if (
                            filter === "completed"
                        ) {

                            show =
                                completed;

                        }

                        else if (
                            filter === "remaining"
                        ) {

                            show =
                                !completed;

                        }


                        assignment.classList.toggle(
                            "hidden",
                            !show
                        );

                    }
                );

            }
        );

    });

}


/* =========================================
   RESET
========================================= */

function resetChecklist() {

    const confirmed =
        window.confirm(
            "Are you sure you want to clear all completed assignments?"
        );


    if (!confirmed) {
        return;
    }


    const assignments =
        document.querySelectorAll(
            ".assignment"
        );


    assignments.forEach((assignment) => {

        assignment.classList.remove(
            "completed"
        );

    });


    localStorage.removeItem(
        STORAGE_KEY
    );


    /*
     * Return to "All"
     */
    const filterButtons =
        document.querySelectorAll(
            ".filter-button"
        );


    filterButtons.forEach((button) => {

        button.classList.toggle(
            "active",
            button.dataset.filter === "all"
        );

    });


    assignments.forEach((assignment) => {

        assignment.classList.remove(
            "hidden"
        );

    });


    updateDashboard();

    updateUpcoming();

}