'use strict';

function el(tag, className, content) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (content !== undefined) node.textContent = String(content);
  return node;
}

async function loadUser() {
  const id = sessionStorage.getItem('dineeaseUserId');
  if (!id) return null;
  try {
    const res = await fetch('/api/profiles/' + encodeURIComponent(id));
    return res.ok ? await res.json() : null;
  } catch (err) {
    return null;
  }
}

async function choosePlan(user, planId, msg) {
  const body = {
    full_name: user.full_name,
    email: user.email,
    phone: user.phone,
    dob: user.dob,
    restaurant_name: user.restaurant_name,
    plan_id: planId
  };
  try {
    const res = await fetch('/api/profiles/' + encodeURIComponent(user.id), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (res.ok) {
      window.location.assign('../user-profile/Profile.html');
    } else {
      msg.style.color = 'crimson';
      msg.textContent = (data.errors || [data.error]).join(' | ');
    }
  } catch (err) {
    msg.style.color = 'crimson';
    msg.textContent = 'Could not reach the server.';
  }
}

async function renderPlans() {
  const grid = document.getElementById('plan-list');
  if (!grid) return;
  const empty = document.getElementById('plan-empty');

  let msg = document.getElementById('choose-message');
  if (!msg) {
    msg = el('p', '');
    msg.id = 'choose-message';
    msg.setAttribute('role', 'alert');
    grid.insertAdjacentElement('beforebegin', msg);
  }

  let plans = [];
  try {
    const res = await fetch('/api/plans');
    if (!res.ok) throw new Error('Request failed');
    plans = await res.json();
  } catch (err) {
    empty.textContent = 'Could not load plans. Run "npm start" and open http://localhost:3000.';
    empty.hidden = false;
    return;
  }

  const user = await loadUser();

  grid.replaceChildren();
  empty.hidden = plans.length !== 0;

  plans.forEach(plan => {
    const card = el('article', `plan-card${plan.category === 'Premium' ? ' featured' : ''}`);
    card.appendChild(el('span', 'plan-tag', plan.category));
    card.appendChild(el('h3', '', plan.name));
    const price = el('p', 'price', `${Number(plan.price).toFixed(2)} SAR `);
    price.appendChild(el('small', '', `/ ${String(plan.duration).toLowerCase() === 'yearly' ? 'year' : 'month'}`));
    card.appendChild(price);
    card.appendChild(el('p', 'plan-description', plan.description));
    const list = el('ul', 'plan-features');
    [`Up to ${Number(plan.menu_limit)} menu items`,
     plan.reservations ? 'Online table reservations included' : 'Digital menu display',
     'Easy price updates'].forEach(feature => list.appendChild(el('li', '', feature)));
    card.appendChild(list);
    card.appendChild(el('p', 'plan-meta', `Available from: ${String(plan.start_date).slice(0, 10)}`));
        const edit = el('a', 'button button-secondary', 'Edit plan');
    edit.href = 'add-plan.html?id=' + plan.id;
    card.appendChild(edit);
  
    if (!user) {
      const login = el('a', 'button button-secondary', 'Log in to choose this plan');
      login.href = '../user-profile/login.html';
      card.appendChild(login);
    } else if (Number(user.plan_id) === Number(plan.id)) {
      const current = el('button', 'button button-secondary', 'Current plan');
      current.type = 'button';
      current.disabled = true;
      card.appendChild(current);
    } else {
      const choose = el('button', 'button button-primary', 'Choose this plan');
      choose.type = 'button';
      choose.addEventListener('click', () => choosePlan(user, plan.id, msg));
      card.appendChild(choose);
    }

    grid.appendChild(card);
  });
}
function initializeForm() {
  const form = document.getElementById('add-plan-form');
  if (!form) return;
  const status = document.getElementById('form-message');
  const editId = new URLSearchParams(window.location.search).get('id');
 if (editId) {
    const title = document.getElementById('page-title');
    if (title) title.textContent = 'Edit plan.';
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.textContent = 'Save changes';

    fetch('/api/plans/' + encodeURIComponent(editId))
      .then(res => { if (!res.ok) throw new Error('not found'); return res.json(); })
      .then(plan => {
        form.elements['name'].value = plan.name;
        form.elements['price'].value = plan.price;
        form.elements['category'].value = plan.category;
        form.elements['startDate'].value = String(plan.start_date).slice(0, 10);
        form.elements['duration'].value = plan.duration;
        form.elements['menuLimit'].value = plan.menu_limit;
        form.elements['description'].value = plan.description;
        form.elements['reservations'].checked = !!plan.reservations;
      })
      .catch(() => {
        status.className = 'form-message error';
        status.textContent = 'Could not load this plan.';
      });
  }

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const data = new FormData(form);
    const body = {
      name: String(data.get('name')).trim(),
      price: Number(data.get('price')),
      category: String(data.get('category')),
      start_date: String(data.get('startDate')),
      duration: String(data.get('duration')),
      menu_limit: Number(data.get('menuLimit')),
      description: String(data.get('description')).trim(),
      reservations: data.has('reservations')
    };

    try {
      const res = await fetch(editId ? '/api/plans/' + encodeURIComponent(editId) : '/api/plans', {
        method: editId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const result = await res.json();
      if (res.ok) {
        status.className = 'form-message';
        status.textContent = editId ? 'Plan updated! Opening Plan Details…' : 'Plan saved! Opening Plan Details…';
        window.location.assign('plan-details.html');
      } else {
        status.className = 'form-message error';
        status.textContent = (result.errors || [result.error]).join(' | ');
      }
    } catch (err) {
      status.className = 'form-message error';
      status.textContent = 'Could not reach the server. Run "npm start" and open http://localhost:3000.';
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
  renderPlans();
  initializeForm();
});