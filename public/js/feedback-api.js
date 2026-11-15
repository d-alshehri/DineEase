'use strict';

// Feedback form -> POST /api/feedback
const feedbackForm = document.getElementById('feedbackForm');

if (feedbackForm) {
  const feedbackMessage = document.getElementById('feedback-message');

  feedbackForm.addEventListener('submit', async event => {
    event.preventDefault();
    if (!feedbackForm.reportValidity()) return;

    const feedback = {
      name: feedbackForm.elements.namedItem('name').value.trim(),
      email: feedbackForm.elements.namedItem('email').value.trim(),
      subject: feedbackForm.elements.namedItem('subject').value.trim(),
      message: feedbackForm.elements.namedItem('message').value.trim()
    };

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedback)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not submit feedback.');

      feedbackMessage.textContent = 'Sending...';
      feedbackMessage.className = 'form-message';
      // reload so the new feedback shows in the list, ?sent=1 shows the thank-you message
      window.location.href = '/support?sent=1';
    } catch (error) {
      feedbackMessage.textContent = error.message;
      feedbackMessage.className = 'form-message error';
    }
  });
}

// "Search Plans": searches the real plans from GET /api/plans (the sample-data search is in search.js)
const searchForm = document.getElementById('searchForm');

if (searchForm) {
  const searchInput = document.getElementById('searchInput');
  const results = document.getElementById('results');

  searchForm.addEventListener('submit', async event => {
    event.preventDefault();
    const keyword = searchInput.value.trim().toLowerCase();

    try {
      const response = await fetch('/api/plans');
      if (!response.ok) throw new Error('Could not search plans.');
      const plans = await response.json();
      const matches = plans.filter(plan => plan.name.toLowerCase().includes(keyword));

      results.replaceChildren();
      if (matches.length === 0) {
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.colSpan = 3;
        cell.textContent = 'No results found.';
        row.appendChild(cell);
        results.appendChild(row);
        return;
      }

      matches.forEach(plan => {
        const row = document.createElement('tr');
        [plan.name, `SAR ${plan.price}`, plan.duration].forEach(value => {
          const cell = document.createElement('td');
          cell.textContent = value;
          row.appendChild(cell);
        });
        results.appendChild(row);
      });
    } catch (error) {
      console.error(error);
      results.replaceChildren();
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.colSpan = 3;
      cell.textContent = error.message;
      row.appendChild(cell);
      results.appendChild(row);
    }
  });
}
