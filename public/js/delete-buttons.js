'use strict';
// Delete buttons with a confirmation step, used on /plans and /support.
//
// How the HTML looks (see views/plans/plan-details.ejs and views/support.ejs):
//   <article data-item>                            <- the thing that gets removed
//     <div data-actions> ... <button data-show-confirm>Delete</button> </div>
//     <div data-confirm hidden>                    <- "Are you sure?" box, hidden at first
//       <button data-cancel>Cancel</button>
//       <button data-delete-url="/api/plans/5">Yes, delete</button>
//     </div>
//   </article>
//
// We ask "are you sure?" inside the page instead of using window.confirm(),
// so it looks like the rest of the site.

document.addEventListener('click', async (event) => {
  // Which part of the item was clicked? (closest() also works when you click inside the button)
  const item = event.target.closest('[data-item]');
  if (!item) return;

  const actions = item.querySelector('[data-actions]');
  const confirmBox = item.querySelector('[data-confirm]');
  const status = document.getElementById('list-status');

  // 1) "Delete" -> show the confirmation box
  if (event.target.closest('[data-show-confirm]')) {
    actions.hidden = true;
    confirmBox.hidden = false;
    return;
  }

  // 2) "Cancel" -> hide it again
  if (event.target.closest('[data-cancel]')) {
    confirmBox.hidden = true;
    actions.hidden = false;
    return;
  }

  // 3) "Yes, delete" -> send DELETE to the web API
  const deleteButton = event.target.closest('[data-delete-url]');
  if (!deleteButton) return;

  deleteButton.disabled = true; // avoid sending the request twice
  try {
    const response = await fetch(deleteButton.dataset.deleteUrl, { method: 'DELETE' });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Could not delete it.');

    item.remove(); // take it off the page
    status.textContent = 'Deleted successfully.';
    status.className = 'form-message';

    // Nothing left in the list? Reload, so the server shows the "empty" message.
    if (!document.querySelector('[data-item]')) window.location.reload();
  } catch (error) {
    deleteButton.disabled = false;
    status.textContent = error.message;
    status.className = 'form-message error';
  }
});
