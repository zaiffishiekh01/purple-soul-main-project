/*
  # Fix Function Search Paths to be Immutable (Correct Signatures)

  1. Problem
    - Functions have role-mutable search_path
    - This is a security risk as users could manipulate the search path
    - Can lead to privilege escalation attacks

  2. Solution
    - Set explicit search_path for all functions
    - This makes them immune to search_path manipulation
*/

-- Set search_path for all affected functions
ALTER FUNCTION cleanup_expired_rates() SET search_path = public, pg_temp;
ALTER FUNCTION update_carrier_integrations_timestamp() SET search_path = public, pg_temp;
ALTER FUNCTION generate_license_key() SET search_path = public, pg_temp;
ALTER FUNCTION get_admin_permissions(uuid) SET search_path = public, pg_temp;
ALTER FUNCTION generate_proxy_email(text) SET search_path = public, pg_temp;
ALTER FUNCTION set_order_proxy_contacts() SET search_path = public, pg_temp;
ALTER FUNCTION calculate_display_price(numeric, uuid, text, uuid, text, text, text) SET search_path = public, pg_temp;
ALTER FUNCTION update_fee_waiver_requests_updated_at() SET search_path = public, pg_temp;
ALTER FUNCTION update_categories_updated_at() SET search_path = public, pg_temp;
ALTER FUNCTION generate_batch_number() SET search_path = public, pg_temp;
ALTER FUNCTION update_test_offer_updated_at() SET search_path = public, pg_temp;