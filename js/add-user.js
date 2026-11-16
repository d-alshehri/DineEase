'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('add-user-form');
  const msg = document.getElementById('form-message');
  if (!form) return;

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!form.reportValidity()) return;        
    const f = new FormData(form);
    const body = {
      full_name: f.get('fullname'),
      email: f.get('email'),
      phone: f.get('phone'),
      dob: f.get('dob'),
      password: f.get('password')
    };
    try {
      const res = await fetch('/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (res.ok) {
        msg.style.color = 'green';
        msg.textContent = 'Account created! Redirecting...';
        window.location.assign('Profile.html?id=' + data.id);
      } else {
        msg.style.color = 'crimson';
        msg.textContent = (data.errors || [data.error]).join(' | ');
      }
    } catch (err) {
      msg.style.color = 'crimson';
      msg.textContent = 'Could not reach the server. Run "npm start" and open http://localhost:3000.';
    }
  });
});