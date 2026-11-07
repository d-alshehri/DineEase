
const BASE = process.env.BASE_URL || 'http://localhost:3000';
let passed = 0, failed = 0;

async function call(method, url, body) {
  const res = await fetch(BASE + url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined
  });
  return { status: res.status, body: await res.json().catch(() => null) };
}
function check(name, cond) {
  cond ? passed++ : failed++;
  console.log(cond ? '  PASS' : '  FAIL', name);
}

(async () => {
  const u = Date.now();
  const plan = { name: 'Test' + u, price: 25.5, category: 'Growth', start_date: '2026-11-01',
                 duration: 'Yearly', menu_limit: 40, description: 'A plan created by the test script.', reservations: true };

  console.log('\nPLANS');
  let r = await call('POST', '/api/plans', plan);
  check('POST /plans -> 201, price is a number, reservations boolean',
        r.status === 201 && r.body.price === 25.5 && r.body.reservations === true);
  const planId = r.body && r.body.id;

  r = await call('POST', '/api/plans', { ...plan, name: 'x', price: -5, category: 'Gold' });
  check('POST invalid plan -> 400', r.status === 400 && r.body.errors.length >= 3);

  r = await call('POST', '/api/plans', plan);
  check('POST duplicate name -> 409', r.status === 409);

  r = await call('GET', '/api/plans');
  check('GET /plans -> array containing seed + new plan',
        r.status === 200 && Array.isArray(r.body) && r.body.some(p => p.id === planId));

  r = await call('GET', `/api/plans/${planId}`);
  check('GET /plans/:id', r.status === 200 && r.body.name === plan.name);

  r = await call('PUT', `/api/plans/${planId}`, { ...plan, price: 30, menu_limit: 80, reservations: false });
  check('PUT /plans/:id updates fields',
        r.status === 200 && r.body.price === 30 && r.body.menu_limit === 80 && r.body.reservations === false);

  r = await call('PUT', '/api/plans/999999', plan);
  check('PUT missing plan -> 404', r.status === 404);
  r = await call('GET', '/api/plans/999999');
  check('GET missing plan -> 404', r.status === 404);

  console.log('\nPROFILES');
  const email = `test${u}@example.com`;
  const user = { full_name: 'Test User', email, phone: '0501234567', dob: '2000-01-31',
                 password: 'abc12345', restaurant_name: 'Test Cafe', plan_id: planId };

  r = await call('POST', '/api/profiles', user);
  check('POST /profiles -> 201 with plan_name joined, no password in response',
        r.status === 201 && r.body.plan_name === plan.name && !('password' in r.body) && !('password_hash' in r.body));
  const userId = r.body && r.body.id;

  r = await call('POST', '/api/profiles', user);
  check('POST duplicate email -> 409', r.status === 409);

  r = await call('POST', '/api/profiles', { ...user, email: 'bad', phone: '123', password: 'short' });
  check('POST invalid data -> 400', r.status === 400 && r.body.errors.length >= 3);

  r = await call('POST', '/api/profiles', { ...user, email: `x${u}@example.com`, plan_id: 999999 });
  check('POST non-existent plan_id -> 400', r.status === 400);

  r = await call('GET', '/api/profiles');
  check('GET /profiles -> array', r.status === 200 && Array.isArray(r.body));
  r = await call('GET', `/api/profiles/${userId}`);
  check('GET /profiles/:id', r.status === 200 && r.body.email === email);

  r = await call('POST', '/api/profiles/login', { email, password: 'abc12345' });
  check('login with correct password -> 200', r.status === 200 && r.body.id === userId);
  r = await call('POST', '/api/profiles/login', { email, password: 'wrongpass1' });
  check('login with wrong password -> 401', r.status === 401);

  const { password, ...noPass } = user;
  r = await call('PUT', `/api/profiles/${userId}`, { ...noPass, full_name: 'Updated Name', restaurant_name: 'New Cafe' });
  check('PUT /profiles/:id updates fields', r.status === 200 && r.body.full_name === 'Updated Name' && r.body.restaurant_name === 'New Cafe');
  r = await call('POST', '/api/profiles/login', { email, password: 'abc12345' });
  check('old password still works after PUT without password', r.status === 200);

  r = await call('PUT', `/api/profiles/${userId}`, { ...user, password: 'newpass123' });
  r = await call('POST', '/api/profiles/login', { email, password: 'newpass123' });
  check('PUT with password changes it', r.status === 200);

  console.log('\nDELETE + cleanup');
  r = await call('DELETE', `/api/plans/${planId}`);
  check('DELETE plan', r.status === 200);
  r = await call('GET', `/api/profiles/${userId}`);
  check('user survives plan deletion with plan_id = null', r.status === 200 && r.body.plan_id === null);

  r = await call('DELETE', `/api/profiles/${userId}`);
  check('DELETE profile', r.status === 200);
  r = await call('GET', `/api/profiles/${userId}`);
  check('deleted profile -> 404', r.status === 404);
  r = await call('DELETE', `/api/profiles/${userId}`);
  check('DELETE again -> 404', r.status === 404);

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error('Could not reach the server. Is it running?', e.message); process.exit(1); });