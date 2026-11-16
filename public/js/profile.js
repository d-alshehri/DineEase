'use strict';
document.addEventListener('DOMContentLoaded', async () => {
  const id = sessionStorage.getItem('dineeaseUserId');
  if (!id) { window.location.replace('login.html'); return; }

  const setText = (elId, value) => {
    const el = document.getElementById(elId);
    if (el) el.textContent = value;
  };
  const select = document.getElementById('plan-select');
  const planMsg = document.getElementById('plan-message');
  let user;

  function showPlan() {
    setText('plan-name', user.plan_name || 'No plan yet');
    setText('plan-price', user.plan_name
      ? `- ${Number(user.plan_price).toFixed(2)} SAR / ${user.plan_duration === 'Yearly' ? 'year' : 'month'}`
      : '');
  }

  try {
    const res = await fetch('/api/profiles/' + encodeURIComponent(id));
    if (!res.ok) throw new Error('not found');
    user = await res.json();
  } catch (err) {
    sessionStorage.removeItem('dineeaseUserId');
    window.location.replace('login.html');
    return;
  }

  setText('user-name', user.full_name || '-');
  setText('user-email', user.email || '-');
  setText('user-phone', user.phone || '-');
  showPlan();

  try {
    const res = await fetch('/api/plans');
    const plans = await res.json();
    select.replaceChildren(new Option('No plan', ''));
    plans.forEach(p => select.appendChild(
      new Option(`${p.name} - ${Number(p.price).toFixed(2)} SAR`, p.id)
    ));
    select.value = user.plan_id === null ? '' : String(user.plan_id);
  } catch (err) {
    planMsg.style.color = 'crimson';
    planMsg.textContent = 'Could not load plans.';
  }

  document.getElementById('plan-save').addEventListener('click', async () => {
    const body = {
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      dob: user.dob,
      restaurant_name: user.restaurant_name,
      plan_id: select.value
    };
    try {
      const res = await fetch('/api/profiles/' + encodeURIComponent(id), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (res.ok) {
        user = data;
        showPlan();
        planMsg.style.color = 'green';
        planMsg.textContent = 'Plan updated!';
      } else {
        planMsg.style.color = 'crimson';
        planMsg.textContent = (data.errors || [data.error]).join(' | ');
      }
    } catch (err) {
      planMsg.style.color = 'crimson';
      planMsg.textContent = 'Could not reach the server.';
    }
  });

  document.getElementById('logout-btn').addEventListener('click', () => {
    sessionStorage.removeItem('dineeaseUserId');
    window.location.assign('login.html');
  });
});