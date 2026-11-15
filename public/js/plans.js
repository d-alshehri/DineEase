'use strict';
// Plan Details (/plans) + Add Plan (/plans/add).
// Phase 2: the plans are stored in the MySQL database and loaded / saved
// through the web API (routes/plans.js):
//   GET  /api/plans  -> list of all plans (JSON)
//   POST /api/plans  -> create a new plan
// (In Phase 1 they were only saved in this browser's localStorage.)

// Small helper: create an element with a class and text
function el(tag, className, content) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (content !== undefined) node.textContent = String(content); // textContent = safe, no HTML runs
  return node;
}

// ---------- Plan Details page: show all plans from the database ----------
async function renderPlans() {
  const grid = document.getElementById('plan-list');
  if (!grid) return; // we are not on the Plan Details page
  const empty = document.getElementById('plan-empty');

  let plans = [];
  try {
    const res = await fetch('/api/plans');
    if (!res.ok) throw new Error('Server answered ' + res.status);
    plans = await res.json();
  } catch (error) {
    console.error('Could not load plans:', error);
    empty.textContent = 'Could not load the plans from the server. Please try again later.';
    empty.hidden = false;
    return;
  }

  grid.replaceChildren();
  empty.hidden = plans.length !== 0;

  // The API uses database column names: menu_limit, start_date
  plans.forEach(plan => {
    const card = el('article', `plan-card${plan.category === 'Premium' ? ' featured' : ''}`);
    card.appendChild(el('span', 'plan-tag', plan.category));
    card.appendChild(el('h3', '', plan.name));
    const price = el('p', 'price', `${Number(plan.price).toFixed(2)} SAR `);
    price.appendChild(el('small', '', `/ ${String(plan.duration).toLowerCase() === 'yearly' ? 'year' : 'month'}`));
    card.appendChild(price);
    card.appendChild(el('p', 'plan-description', plan.description));
    const list = el('ul', 'plan-features');
    [`Up to ${Number(plan.menu_limit)} menu items`, plan.reservations ? 'Online table reservations included' : 'Digital menu display', 'Easy price updates'].forEach(feature => list.appendChild(el('li', '', feature)));
    card.appendChild(list);
    card.appendChild(el('p', 'plan-meta', `Available from: ${plan.start_date}`));
    grid.appendChild(card);
  });
}

// ---------- Add Plan page: send the form to the database ----------
function initializeForm() {
  const form = document.getElementById('add-plan-form');
  if (!form) return; // we are not on the Add Plan page
  const status = document.getElementById('form-message');

  form.addEventListener('submit', async event => {
    event.preventDefault();               // stop the normal form submit (page reload)
    if (!form.reportValidity()) return;   // built-in HTML5 validation

    const data = new FormData(form);
    // Field names the API expects (same as the database columns)
    const plan = {
      name: String(data.get('name')).trim(),
      price: Number(data.get('price')),
      category: String(data.get('category')),
      start_date: String(data.get('startDate')),
      duration: String(data.get('duration')),
      menu_limit: Number(data.get('menuLimit')),
      description: String(data.get('description')).trim(),
      reservations: data.has('reservations')  // checkbox: true if ticked
    };

    try {
      const res = await fetch('/api/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(plan)
      });
      const result = await res.json();

      if (!res.ok) {
        // 400 -> { errors: [...] } (invalid fields), 409 -> { error: '...' } (name already used)
        status.textContent = (result.errors || [result.error]).join(' | ');
        status.className = 'form-message error';
        return;
      }

      form.reset();
      status.className = 'form-message';
      status.textContent = 'Plan saved! Opening Plan Details…';
      window.location.assign('/plans');
    } catch (error) {
      status.textContent = 'Could not reach the server. Run "npm start" and open http://localhost:3000.';
      status.className = 'form-message error';
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderPlans();
  initializeForm();
});
