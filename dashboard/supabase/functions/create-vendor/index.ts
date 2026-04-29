import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const {
      email,
      password,
      businessName,
      businessType = 'E-commerce',
      contactPhone = '+1-555-0100',
      address = {
        street: '123 Business St',
        city: 'New York',
        state: 'NY',
        zip: '10001',
        country: 'United States'
      },
      taxId = 'TAX-DEFAULT',
      status = 'pending'
    } = await req.json();

    if (!email || !password || !businessName) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: email, password, businessName' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Create auth user
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (createError) {
      return new Response(
        JSON.stringify({ error: createError.message }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Insert into vendors table
    const { data: newVendor, error: insertVendorError } = await supabaseAdmin
      .from('vendors')
      .insert({
        user_id: newUser.user.id,
        business_name: businessName,
        business_type: businessType,
        contact_email: email,
        contact_phone: contactPhone,
        address: address,
        tax_id: taxId,
        status: status,
      })
      .select()
      .maybeSingle();

    if (insertVendorError || !newVendor) {
      // Rollback: delete the auth user
      await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
      return new Response(
        JSON.stringify({ error: `Failed to create vendor: ${insertVendorError?.message || 'Unknown error'}` }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        vendor: {
          id: newVendor.id,
          user_id: newVendor.user_id,
          business_name: newVendor.business_name,
          email: email,
          status: newVendor.status,
        }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error creating vendor:', error);
    return new Response(
      JSON.stringify({ error: `Internal server error: ${error.message}` }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
