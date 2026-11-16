'use strict';
// Delete buttons on /plans/manage and /support.
// Clicking Delete shows an "are you sure?" box in the page (instead of window.confirm),
// then "Yes, delete" sends DELETE to the data-delete-url of that item.

document.addEventListener('click', async (event) => {
  const item = event.target.closest('[data-item]');
  if (!item) return;

  const actions = item.querySelector('[data-actions]');
  const confirmBox = item.querySelector('[data-confirm]');
  const status = document.getElementById('list-status');

  // Delete: show the confirm box
  if (event.target.closest('[data-show-confirm]')) {
    actions.hidden = true;
    confirmBox.hidden = false;
    return;
  }

  // Cancel
  if (event.target.closest('[data-cancel]')) {
    confirmBox.hidden = true;
    actions.hidden = false;
    return;
  }

  // Yes, delete
  const deleteButton = event.target.closest('[data-delete-url]');
  if (!deleteButton) return;

  deleteButton.disabled = true; // so it can't be sent twice
  try {
    const response = await fetch(deleteButton.dataset.deleteUrl, { method: 'DELETE' });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Could not delete it.');

    item.remove();
    status.textContent = 'Deleted successfully.';
    status.className = 'form-message';

    // list is empty now: reload so the server shows the "no items" message
    if (!document.querySelector('[data-item]')) window.location.reload();
  } catch (error) {
    deleteButton.disabled = false;
    status.textContent = error.message;
    status.className = 'form-message error';
  }
});
