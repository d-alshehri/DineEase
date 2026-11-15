// =========================
// Search Plans Function
// Phase 2: the plans come from the database through the web API
// (GET /api/plans), so plans added on the Add Plan page are found too.
// (In Phase 1 this file had a fixed list of 3 dummy plans.)
// =========================

const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const results = document.getElementById("results");

searchForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    const searchValue = searchInput.value.trim().toLowerCase();

    // Get the current list of plans from the server
    let plans = [];
    try {
        const res = await fetch("/api/plans");
        if (!res.ok) throw new Error("Server answered " + res.status);
        plans = await res.json();
    } catch (error) {
        results.innerHTML = `
            <tr>
                <td colspan="3">Could not load the plans from the server. Please try again.</td>
            </tr>
        `;
        return;
    }

    // Keep only the plans whose name contains the search text
    const filteredPlans = plans.filter(function(plan) {

        return plan.name.toLowerCase().includes(searchValue);

    });

    // Clear previous results
    results.innerHTML = "";

    // Check if no plans were found
    if (filteredPlans.length === 0) {

        results.innerHTML = `
            <tr>
                <td colspan="3">No results found.</td>
            </tr>
        `;

        return;
    }

    // Display matching plans
    filteredPlans.forEach(function(plan) {

        const row = document.createElement("tr");

        // The API sends price as a number (e.g. 49), so we add "SAR" in front
        [plan.name, "SAR " + plan.price, plan.duration].forEach(function(value) {

            const cell = document.createElement("td");

            cell.textContent = value;

            row.appendChild(cell);

        });

        results.appendChild(row);

    });

});


// =========================
// Feedback Form Function
// =========================

const feedbackForm = document.getElementById("feedbackForm");

feedbackForm.addEventListener("submit", function(event) {

    event.preventDefault();

    alert("Thank you! Your feedback has been submitted successfully.");

    feedbackForm.reset();

});
