// =========================
// DineEase Dummy Plan Data
// =========================

const plans = [
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
// Search Plans Function
// =========================

const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const results = document.getElementById("results");

searchForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const searchValue = searchInput.value.trim().toLowerCase();

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

        [plan.name, plan.price, plan.duration].forEach(function(value) {

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
