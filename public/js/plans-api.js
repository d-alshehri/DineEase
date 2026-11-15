'use strict';

// Load plans from the backend and display them on the Plans page.
async function loadPlans() {
  const grid = document.getElementById('plan-list');
  if (!grid) return;

  const emptyMessage = document.getElementById('plan-empty');

  try {
    const response = await fetch('/api/plans');
    if (!response.ok) throw new Error('Could not load plans.');

    const plans = await response.json();
    grid.replaceChildren();
    emptyMessage.hidden = plans.length !== 0;

    plans.forEach(plan => {
      const card = document.createElement('article');
      card.className = `plan-card${plan.category === 'Premium' ? ' featured' : ''}`;

      const tag = document.createElement('span');
      tag.className = 'plan-tag';
      tag.textContent = plan.category;

      const name = document.createElement('h3');
      name.textContent = plan.name;

      const price = document.createElement('p');
      price.className = 'price';
      price.textContent = `${Number(plan.price).toFixed(2)} SAR `;
      const period = document.createElement('small');
      period.textContent = `/ ${String(plan.duration).toLowerCase() === 'yearly' ? 'year' : 'month'}`;
      price.appendChild(period);

      const description = document.createElement('p');
      description.className = 'plan-description';
      description.textContent = plan.description;

      const features = document.createElement('ul');
      features.className = 'plan-features';
      [
        `Up to ${Number(plan.menu_limit)} menu items`,
        plan.reservations ? 'Online table reservations included' : 'Digital menu display',
        'Easy price updates'
      ].forEach(text => {
        const item = document.createElement('li');
        item.textContent = text;
        features.appendChild(item);
      });

      const meta = document.createElement('p');
      meta.className = 'plan-meta';
      meta.textContent = `Available from: ${plan.start_date}`;

      card.append(tag, name, price, description, features, meta);
      grid.appendChild(card);
    });
  } catch (error) {
    console.error(error);
    emptyMessage.hidden = false;
    emptyMessage.textContent = 'Could not load plans. Please try again.';
  }
}

// Send the Add Plan form to POST /api/plans.
function connectPlanForm() {
  const form = document.getElementById('add-plan-form');
  if (!form) return;

  const status = document.getElementById('form-message');

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const data = new FormData(form);
    const plan = {
      name: String(data.get('name') || '').trim(),
      price: Number(data.get('price')),
      category: data.get('category'),
      start_date: data.get('startDate'),
      duration: data.get('duration'),
      menu_limit: Number(data.get('menuLimit')),
      description: String(data.get('description') || '').trim(),
      reservations: data.has('reservations')
    };

    try {
      const response = await fetch('/api/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(plan)
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.errors ? result.errors.join(', ') : (result.error || 'Could not save plan.'));
      }

      status.textContent = 'Plan saved successfully!';
      status.className = 'form-message';
      form.reset();
      setTimeout(() => { window.location.href = '/plans'; }, 800);
    } catch (error) {
      status.textContent = error.message;
      status.className = 'form-message error';
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
  loadPlans();
  connectPlanForm();
});
