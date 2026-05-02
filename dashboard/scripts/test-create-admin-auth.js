/**
 * Browser-console diagnostic for the create-admin API route.
 *
 * Usage: open the admin dashboard (signed in as super admin), DevTools → Console,
 * paste this file’s contents and press Enter.
 *
 * Expects same-origin session cookies (NextAuth) and POST /api/functions/create-admin.
 */
(async function testCreateAdminAuth() {
  console.log('Testing create-admin (Next.js API route)…\n');

  const sessionRes = await fetch('/api/auth/session', { credentials: 'include' });
  const sessionText = await sessionRes.text();
  let sessionJson = null;
  try {
    sessionJson = sessionText && sessionText !== 'null' ? JSON.parse(sessionText) : null;
  } catch (e) {
    console.error('Failed to parse /api/auth/session:', e);
    return;
  }

  const user = sessionJson?.user;
  console.log('1) Session');
  console.log('   Signed in:', !!(user?.id && user?.email));
  console.log('   User id:', user?.id ?? '(none)');
  console.log('   Email:', user?.email ?? '(none)');

  if (!user?.id) {
    console.error('No session. Sign in as a super admin first.');
    return;
  }

  const url = '/api/functions/create-admin';
  const body = {
    email: `test-diagnostic-${Date.now()}@example.com`,
    password: 'TempPass123!ChangeMe',
    roleName: 'admin',
    permissions: {
      vendor_management: false,
      order_management: false,
      product_management: false,
      finance_management: false,
      analytics_monitoring: false,
    },
  };

  console.log('\n2) POST', url);
  try {
    const response = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const text = await response.text();
    console.log('   Status:', response.status, response.statusText);
    console.log('   Body:', text);
    if (response.ok) {
      console.log('\nOK: route responded successfully (check DB for the new user).');
    } else if (response.status === 401 || response.status === 403) {
      console.error('\nAuth/permission issue: must be super admin; route may also enforce server-side checks.');
    } else {
      console.error('\nRequest failed; see body above.');
    }
  } catch (err) {
    console.error('Fetch error:', err);
  }
})();
