'use strict';
<<<<<<< HEAD:js/login.js
=======
// Login form: checks the email and password with the API, then opens the profile page

>>>>>>> 48bbe23022a19a35347d6501817120552bcbc1a9:public/js/login.js
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('login-form');
  const msg = document.getElementById('form-message');
  if (!form) return;

<<<<<<< HEAD:js/login.js
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const f = new FormData(form);
=======
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const f = new FormData(form);
    const body = {
      email: f.get('email'),
      password: f.get('password')
    };

>>>>>>> 48bbe23022a19a35347d6501817120552bcbc1a9:public/js/login.js
    try {
      const res = await fetch('/api/profiles/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
<<<<<<< HEAD:js/login.js
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
=======
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
>>>>>>> 48bbe23022a19a35347d6501817120552bcbc1a9:public/js/login.js
