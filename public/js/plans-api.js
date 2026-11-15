'use strict';

// Add / Edit Plan form: POST /api/plans for a new plan, PUT /api/plans/:id when editing
function connectPlanForm() {
  const form = document.getElementById('add-plan-form');
  if (!form) return;

  const status = document.getElementById('form-message');
  const isEdit = form.dataset.mode === 'edit';   // data-mode and data-plan-id are set in add-plan.ejs
  const planId = form.dataset.planId;

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
      const response = await fetch(isEdit ? `/api/plans/${planId}` : '/api/plans', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(plan)
      });
      const result = await response.json();

      if (!response.ok) {
        // 400 sends { errors: [...] }, 404 and 409 send { error }
        throw new Error(result.errors ? result.errors.join(', ') : (result.error || 'Could not save plan.'));
      }

      status.textContent = isEdit ? 'Changes saved successfully!' : 'Plan saved successfully!';
      status.className = 'form-message';
      if (!isEdit) form.reset();
      setTimeout(() => { window.location.href = '/plans/manage'; }, 800);
    } catch (error) {
      status.textContent = error.message;
      status.className = 'form-message error';
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  connectPlanForm();
});
