/**
 * Quick diagnostic test for create-admin edge function
 * Paste this in your browser console when on the admin dashboard page
 */

async function testCreateAdminAuth() {
  console.log('🔍 Testing create-admin authentication...\n');
  
  // Test 1: Check session
  const { data: { session }, error: sessionError } = await window.supabase.auth.getSession();
  
  console.log('1️⃣ Session Check:');
  console.log('   Has session:', !!session);
  console.log('   Has token:', !!session?.access_token);
  console.log('   Session error:', sessionError);
  console.log('   Token expiry:', session?.expires_at ? new Date(session.expires_at * 1000).toLocaleString() : 'N/A');
  console.log('   Is expired:', session?.expires_at ? Date.now() > session.expires_at * 1000 : 'N/A');
  
  if (!session?.access_token) {
    console.error('❌ No valid session. Please sign in.');
    return;
  }
  
  console.log('\n2️⃣ Token Validation:');
  const token = session.access_token;
  console.log('   Token length:', token.length);
  console.log('   Token preview:', token.substring(0, 50) + '...');
  
  // Decode JWT to check expiry
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const isExpired = Date.now() / 1000 > payload.exp;
    console.log('   Token issued at:', new Date(payload.iat * 1000).toLocaleString());
    console.log('   Token expires at:', new Date(payload.exp * 1000).toLocaleString());
    console.log('   Is expired:', isExpired);
    console.log('   User ID:', payload.sub);
  } catch (e) {
    console.error('   ❌ Failed to decode token:', e);
  }
  
  // Test 3: Try edge function with explicit headers
  console.log('\n3️⃣ Testing Edge Function Call:');
  console.log('   URL:', `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-admin`);
  
  try {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-admin`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: 'test-diagnostic@example.com',
          password: 'test123456',
          roleName: 'admin',
          permissions: {
            vendor_management: false,
            order_management: false,
            product_management: false,
            finance_management: false,
            analytics_monitoring: false,
          }
        })
      }
    );
    
    console.log('   Response status:', response.status);
    console.log('   Response status text:', response.statusText);
    
    const responseText = await response.text();
    console.log('   Response body:', responseText);
    
    if (response.ok) {
      console.log('✅ Edge function call succeeded!');
    } else {
      console.error('❌ Edge function failed with status:', response.status);
      
      if (response.status === 401) {
        console.error('\n🔑 AUTHENTICATION ISSUE DETECTED');
        console.error('Possible causes:');
        console.error('  1. Edge function not deployed');
        console.error('  2. SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set in edge function secrets');
        console.error('  3. Token is valid but edge function can\'t validate it');
        console.error('\nRun these commands to fix:');
        console.error('  cd dashboard');
        console.error('  supabase functions deploy create-admin');
        console.error('  supabase secrets set SUPABASE_URL=<your_url> SUPABASE_SERVICE_ROLE_KEY=<your_key>');
      }
    }
  } catch (error) {
    console.error('❌ Fetch error:', error);
  }
}

// Run the test
testCreateAdminAuth();
