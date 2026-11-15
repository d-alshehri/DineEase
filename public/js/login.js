'use strict';
// Login page (views/profile/login.ejs).
// Sends the email and password to the web API with fetch(). If they are correct,
// it opens that user's profile page. If not, it shows the error message.

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('login-form');
  const msg = document.getElementById('form-message');
  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();                 // stop the browser's normal form submit (page reload)
    if (!form.reportValidity()) return;     // use the HTML5 validation (required, minlength ...)

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
        // 200 OK -> the API sends back the user's profile (including the id)
        msg.style.color = 'green';
        msg.textContent = 'Logged in! Redirecting...';
        window.location.assign('/profile?id=' + data.id);
      } else {
        // 401 -> wrong email or password
        msg.style.color = 'crimson';
        msg.textContent = data.error || 'Login failed';
      }
    } catch (err) {
      msg.style.color = 'crimson';
      msg.textContent = 'Could not reach the server. Run "npm start" and open http://localhost:3000.';
    }
  });
});
