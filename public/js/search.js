// Sample plans search on /support (Phase 1 requirement: search dummy data
// stored in a JS file and show the results in a table). Not from the database.

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


const demoSearchForm = document.getElementById("demoSearchForm");
const demoSearchInput = document.getElementById("demoSearchInput");
const demoResults = document.getElementById("demoResults");

if (demoSearchForm) {

    demoSearchForm.addEventListener("submit", function(event) {

        event.preventDefault();

        const searchValue = demoSearchInput.value.trim().toLowerCase();

        const filteredPlans = samplePlans.filter(function(plan) {

            return plan.name.toLowerCase().includes(searchValue);

        });

        demoResults.innerHTML = "";

        if (filteredPlans.length === 0) {

            demoResults.innerHTML = `
                <tr>
                    <td colspan="3">No results found.</td>
                </tr>
            `;

            return;
        }

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
