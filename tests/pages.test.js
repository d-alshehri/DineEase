// Page route tests: every page loads, shows the shared navigation,
// highlights the right link, and shows REAL data from MySQL (rendered with EJS).
// Run from the DineEase root while the server is running (npm start):
//   npm run test:pages
// This test only READS data (no rows are created or deleted).

const BASE = process.env.BASE_URL || 'http://localhost:3000';
let passed = 0, failed = 0;

function check(name, cond) {
  cond ? passed++ : failed++;
  console.log(cond ? '  PASS' : '  FAIL', name);
}

// Get a page without following redirects, so we can check 301 / 302 too
async function page(url) {
  const res = await fetch(BASE + url, { redirect: 'manual' });
  return { status: res.status, location: res.headers.get('location'), html: await res.text() };
}

// The shared nav (views/partials/nav.ejs) is on the page
const hasNav = html => html.includes('class="site-header"') && html.includes('aria-label="Main navigation"');

// Text of the highlighted nav link (class="active")
const activeLink = html => (html.match(/class="active" aria-current="page">([^<]+)</) || [])[1];

// EJS escapes text, so compare with the escaped version of a name
const escapeHtml = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&#34;').replace(/'/g, '&#39;');

(async () => {
  const plans = await (await fetch(BASE + '/api/plans')).json();
  const firstId = plans.length ? plans[0].id : 1;

  console.log('\nPAGES: status 200 + shared nav + highlighted link');
  const pages = [
    ['/', 'Home'],
    ['/plans', 'Plans'],
    [`/plans/${firstId}`, 'Plans'],
    ['/plans/manage', 'Manage Plans'],
    ['/plans/add', 'Manage Plans'],
    [`/plans/${firstId}/edit`, 'Manage Plans'],
    ['/support', 'Support'],
    ['/login', 'Profile'],
    ['/signup', 'Profile']
  ];
  for (const [url, link] of pages) {
    const r = await page(url);
    check(`GET ${url} -> 200, nav, "${link}" highlighted`, r.status === 200 && hasNav(r.html) && activeLink(r.html) === link);
  }

  console.log('\nREAL DATA FROM MYSQL (EJS)');
  const home = await page('/');
  const list = await page('/plans');
  const manage = await page('/plans/manage');
  check('home pricing shows every plan from the database', plans.every(p => home.html.includes(escapeHtml(p.name))));
  check('/plans shows every plan from the database', plans.every(p => list.html.includes(escapeHtml(p.name))));
  check('/plans has no Edit / Delete buttons (customers)', !list.html.includes('data-delete-url') && !list.html.includes('/edit"'));
  check('/plans/manage has Edit / Delete buttons', manage.html.includes('data-delete-url') && manage.html.includes('/edit"'));
  const feedback = await (await fetch(BASE + '/api/feedback')).json();
  const support = await page('/support');
  check('/support lists every feedback row from the database',
    (support.html.match(/class="feedback-item"/g) || []).length === feedback.length);
  const none = await page('/support?keyword=no-such-word-12345');
  check('/support?keyword=... with no match shows the "No feedback matches" message',
    none.status === 200 && none.html.includes('No feedback matches'));

  console.log('\nERRORS AND REDIRECTS');
  let r = await page('/nope');
  check('unknown page -> 404 page with nav', r.status === 404 && hasNav(r.html));
  r = await page('/plans/999999');
  check('missing plan -> 404', r.status === 404);
  r = await page('/api/nope');
  check('unknown API URL -> JSON 404', r.status === 404 && r.html.includes('"error"'));
  r = await page('/profile');
  check('/profile without id -> redirect to /login', r.status === 302 && r.location === '/login');
  r = await page('/index.html');
  check('old Phase 1 URL /index.html -> 301 to /', r.status === 301 && r.location === '/');
  r = await page('/plans/plan-details.html');
  check('old Phase 1 URL /plans/plan-details.html -> 301 to /plans', r.status === 301 && r.location === '/plans');

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error('Could not reach the server. Is it running?', e.message); process.exit(1); });
