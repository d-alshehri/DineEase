// =========================
// Phase 1 requirement: search DUMMY data stored in this JavaScript file
// and show the results in a styled table.
// Used by the "Sample Plans Search (Phase 1 demo)" box on /support.
// (The real plans search, which uses the database, is in feedback-api.js.)
// =========================

// =========================
// DineEase Dummy Plan Data
// =========================

const samplePlans = [
    {
        name: "Starter",
        price: "SAR 49",
        duration: "Monthly"
    },
    {
        name: "Professional",
        price: "SAR 99",
        duration: "Monthly"
    },
    {
        name: "Premium",
        price: "SAR 149",
        duration: "Monthly"
    }
];


// =========================
// Search Sample Plans Function
// =========================

const demoSearchForm = document.getElementById("demoSearchForm");
const demoSearchInput = document.getElementById("demoSearchInput");
const demoResults = document.getElementById("demoResults");

if (demoSearchForm) {

    demoSearchForm.addEventListener("submit", function(event) {

        event.preventDefault();

        const searchValue = demoSearchInput.value.trim().toLowerCase();

        // Keep only the sample plans whose name contains the search text
        const filteredPlans = samplePlans.filter(function(plan) {

            return plan.name.toLowerCase().includes(searchValue);

        });

        // Clear previous results
        demoResults.innerHTML = "";

        // Check if no plans were found
        if (filteredPlans.length === 0) {

            demoResults.innerHTML = `
                <tr>
                    <td colspan="3">No results found.</td>
                </tr>
            `;

            return;
        }

        // Display matching plans, one table row per plan
        filteredPlans.forEach(function(plan) {

            const row = document.createElement("tr");

            [plan.name, plan.price, plan.duration].forEach(function(value) {

                const cell = document.createElement("td");

                cell.textContent = value;

                row.appendChild(cell);

            });

            demoResults.appendChild(row);

        });

    });

}
