const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://qvzeptnrikucdpabizev.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2emVwdG5yaWt1Y2RwYWJpemV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4ODczOTMsImV4cCI6MjA4NTQ2MzM5M30.B8AR3udsqM7XtRKenHG6dmZAbKUeA_nhEVorGenGZhY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestAccount() {
  console.log('Creating test account...');

  const testEmail = 'demo@purplesoul.com';
  const testPassword = 'SecurePass123!';
  const testName = 'Demo User';

  try {
    // Sign up the test user
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: testName,
        },
        emailRedirectTo: undefined,
      },
    });

    if (error) {
      if (error.message.includes('already registered')) {
        console.log('✓ Test account already exists!');
        console.log('\nYou can sign in with:');
        console.log('Email: demo@purplesoul.com');
        console.log('Password: SecurePass123!');
      } else {
        console.error('Error creating account:', error.message);
      }
    } else {
      console.log('✓ Test account created successfully!');
      console.log('\nSign in with these credentials:');
      console.log('Email: demo@purplesoul.com');
      console.log('Password: SecurePass123!');
      console.log('Name: Demo User');
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

createTestAccount();
