// Run from DineEase root: node tests/feedback-smoke.js
// Requires server running on localhost:3000 and Feedback table already created.
const base = process.env.API_BASE || 'http://localhost:3000/api/feedback';
(async () => {
  const email = `test${Date.now()}@example.com`;
  const created = await fetch(base, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'Feedback Test', email, subject: 'API smoke test', message: 'Testing DineEase search' }) });
  const obj = await created.json();
  if (created.status !== 201 || !obj.id) throw Error('CREATE failed: ' + JSON.stringify(obj));
  const all = await fetch(base); if (!all.ok || !(await all.json()).some(x => x.id === obj.id)) throw Error('READ failed');
  const search = await fetch(base + '?keyword=API%20smoke%20test'); if (!search.ok || !(await search.json()).some(x => x.id === obj.id)) throw Error('SEARCH failed');
  const removed = await fetch(base + '/' + obj.id, {method:'DELETE'}); if (!removed.ok) throw Error('DELETE failed');
  const check = await fetch(base + '/' + obj.id); if (check.status !== 404) throw Error('DELETE verification failed');
  console.log('PASS: Create, Read, keyword Search, Delete');
})().catch(e => { console.error(e); process.exitCode = 1; });
