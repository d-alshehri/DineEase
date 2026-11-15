'use strict';
// Login form: checks the email and password with the API, then opens the profile page

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('login-form');
  const msg = document.getElementById('form-message');
  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const f = new FormData(form);
    const body = {
      email: f.get('email'),
      password: f.get('password')
    };

    try {
      const res = await fetch('/api/profiles/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();

      if (res.ok) {
        msg.className = 'form-message';
        msg.textContent = 'Logged in! Redirecting...';
        window.location.assign('/profile?id=' + data.id);
      } else {
        // 401 = wrong email or password
        msg.className = 'form-message error';
        msg.textContent = data.error || 'Login failed';
      }
    } catch (err) {
      msg.className = 'form-message error';
      msg.textContent = 'Could not reach the server. Run "npm start" and open http://localhost:3000.';
    }
  });
});
