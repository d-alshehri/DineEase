'use strict';
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('login-form');
  const msg = document.getElementById('form-message');
  if (!form) return;

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const f = new FormData(form);
    try {
      const res = await fetch('/api/profiles/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: f.get('email'), password: f.get('password') })
      });
      const data = await res.json();
      if (res.ok) {
        sessionStorage.setItem('dineeaseUserId', data.id);
        window.location.assign('Profile.html');
      } else {
        msg.style.color = 'crimson';
        msg.textContent = data.error || 'Login failed.';
      }
    } catch (err) {
      msg.style.color = 'crimson';
      msg.textContent = 'Could not reach the server. Run "npm start" and open http://localhost:3000.';
    }
  });
});