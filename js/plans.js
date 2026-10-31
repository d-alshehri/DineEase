'use strict';
// Student 2: Plan Details + Add Plan. Data is stored locally in this browser.
const STORAGE_KEY = 'menew-plans-v1';
const starterPlans = [
  { id: 'starter', name: 'Starter', price: 0, category: 'Starter', startDate: '2026-01-01', duration: 'Monthly', menuLimit: 25, description: 'A simple digital menu for small cafés getting started.', reservations: false },
  { id: 'growth', name: 'Growth', price: 49, category: 'Growth', startDate: '2026-01-01', duration: 'Monthly', menuLimit: 100, description: 'More flexibility for growing restaurants and cafés.', reservations: true },
  { id: 'premium', name: 'Premium', price: 99, category: 'Premium', startDate: '2026-01-01', duration: 'Monthly', menuLimit: 500, description: 'An expanded menu and online bookings for busy venues.', reservations: true }
];
function getPlans() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : starterPlans;
  } catch (error) {
    console.warn('Could not load saved plans:', error);
    return starterPlans;
  }
}
function savePlans(plans) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(plans)); return true; }
  catch (error) { console.error('Could not save plan:', error); return false; }
}
function el(tag, className, content) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (content !== undefined) node.textContent = String(content);
  return node;
}
function renderPlans() {
  const grid = document.getElementById('plan-list');
  if (!grid) return;
  const plans = getPlans();
  grid.replaceChildren();
  document.getElementById('plan-empty').hidden = plans.length !== 0;
  plans.forEach(plan => {
    const card = el('article', `plan-card${plan.category === 'Premium' ? ' featured' : ''}`);
    card.appendChild(el('span', 'plan-tag', plan.category));
    card.appendChild(el('h3', '', plan.name));
    const price = el('p', 'price', `${Number(plan.price).toFixed(2)} SAR `);
    price.appendChild(el('small', '', `/ ${String(plan.duration).toLowerCase() === 'yearly' ? 'year' : 'month'}`));
    card.appendChild(price);
    card.appendChild(el('p', 'plan-description', plan.description));
    const list = el('ul', 'plan-features');
    [`Up to ${Number(plan.menuLimit)} menu items`, plan.reservations ? 'Online table reservations included' : 'Digital menu display', 'Easy price updates'].forEach(feature => list.appendChild(el('li', '', feature)));
    card.appendChild(list);
    card.appendChild(el('p', 'plan-meta', `Available from: ${plan.startDate}`));
    grid.appendChild(card);
  });
}
function initializeForm() {
  const form = document.getElementById('add-plan-form');
  if (!form) return;
  const status = document.getElementById('form-message');
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return; // Built-in HTML5 validation.
    const data = new FormData(form);
    const plan = {
      id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `plan-${Date.now()}`,
      name: String(data.get('name')).trim(),
      price: Number(data.get('price')),
      category: String(data.get('category')),
      startDate: String(data.get('startDate')),
      duration: String(data.get('duration')),
      menuLimit: Number(data.get('menuLimit')),
      description: String(data.get('description')).trim(),
      reservations: data.has('reservations')
    };
    if (plan.name.length < 3 || plan.description.length < 10 || !Number.isFinite(plan.price) || !Number.isInteger(plan.menuLimit)) {
      status.textContent = 'Please review the form fields.';
      status.className = 'form-message error';
      return;
    }
    if (!savePlans([...getPlans(), plan])) {
      status.textContent = 'Could not save the plan in this browser. Check storage settings and try again.';
      status.className = 'form-message error';
      return;
    }
    form.reset();
    status.className = 'form-message';
    status.textContent = 'Plan saved! Opening Plan Details…';
    window.location.assign('plan-details.html');
  });
}
document.addEventListener('DOMContentLoaded', () => {
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
  renderPlans();
  initializeForm();
});
