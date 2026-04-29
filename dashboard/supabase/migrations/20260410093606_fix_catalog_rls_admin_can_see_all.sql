/*
  # Fix Catalog RLS Policies - Admins Must See All Records

  ## Problem:
  The previous migration created two SELECT policies:
  1. Admins can manage (FOR ALL) 
  2. Anyone can view active (FOR SELECT with is_active = true)

  In Postgres RLS, multiple SELECT policies are OR'd together.
  So even admins were limited to only active records when using both policies.
  
  ## Fix:
  Drop the restrictive "active only" SELECT policies and let the admin FOR ALL policy
  handle admin access. Create a separate policy for non-admins to see only active records.
  
  ## Changes:
  - category_groups: admins see all, non-admins see active only
  - categories: admins see all, non-admins see active only  
  - facet_groups: admins see all, non-admins see active only
  - facet_values: admins see all, non-admins see active only
*/

-- Drop and recreate category_groups policies
DROP POLICY IF EXISTS "Admins can manage category groups" ON category_groups;
DROP POLICY IF EXISTS "Anyone can view active category groups" ON category_groups;

CREATE POLICY "Admins can select all category groups"
  ON category_groups FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()));

CREATE POLICY "Admins can insert category groups"
  ON category_groups FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()));

CREATE POLICY "Admins can update category groups"
  ON category_groups FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()));

CREATE POLICY "Admins can delete category groups"
  ON category_groups FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()));

CREATE POLICY "Vendors can view active category groups"
  ON category_groups FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Drop and recreate categories policies
DROP POLICY IF EXISTS "Admins can manage categories" ON categories;
DROP POLICY IF EXISTS "Vendors and public can view active categories" ON categories;

CREATE POLICY "Admins can select all categories"
  ON categories FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()));

CREATE POLICY "Admins can insert categories"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()));

CREATE POLICY "Admins can update categories"
  ON categories FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()));

CREATE POLICY "Admins can delete categories"
  ON categories FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()));

CREATE POLICY "Vendors can view active categories"
  ON categories FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Drop and recreate facet_groups policies
DROP POLICY IF EXISTS "Admins can manage facet groups" ON facet_groups;
DROP POLICY IF EXISTS "Vendors and public can view active facet groups" ON facet_groups;

CREATE POLICY "Admins can select all facet groups"
  ON facet_groups FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()));

CREATE POLICY "Admins can insert facet groups"
  ON facet_groups FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()));

CREATE POLICY "Admins can update facet groups"
  ON facet_groups FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()));

CREATE POLICY "Admins can delete facet groups"
  ON facet_groups FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()));

CREATE POLICY "Vendors can view active facet groups"
  ON facet_groups FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Drop and recreate facet_values policies
DROP POLICY IF EXISTS "Admins can manage facet values" ON facet_values;
DROP POLICY IF EXISTS "Vendors and public can view active facet values" ON facet_values;

CREATE POLICY "Admins can select all facet values"
  ON facet_values FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()));

CREATE POLICY "Admins can insert facet values"
  ON facet_values FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()));

CREATE POLICY "Admins can update facet values"
  ON facet_values FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()));

CREATE POLICY "Admins can delete facet values"
  ON facet_values FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()));

CREATE POLICY "Vendors can view active facet values"
  ON facet_values FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Drop and recreate carrier_integrations policies
DROP POLICY IF EXISTS "Admins can manage carrier integrations" ON carrier_integrations;
DROP POLICY IF EXISTS "Vendors can view active carriers" ON carrier_integrations;

CREATE POLICY "Admins can select all carriers"
  ON carrier_integrations FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()));

CREATE POLICY "Admins can insert carriers"
  ON carrier_integrations FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()));

CREATE POLICY "Admins can update carriers"
  ON carrier_integrations FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()));

CREATE POLICY "Admins can delete carriers"
  ON carrier_integrations FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()));

CREATE POLICY "Vendors can view active carrier integrations"
  ON carrier_integrations FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Fix category_facets policies
DROP POLICY IF EXISTS "Admins can manage category facets" ON category_facets;
DROP POLICY IF EXISTS "Vendors can view category facet mappings" ON category_facets;

CREATE POLICY "Admins can select all category facets"
  ON category_facets FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()));

CREATE POLICY "Admins can insert category facets"
  ON category_facets FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()));

CREATE POLICY "Admins can update category facets"
  ON category_facets FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()));

CREATE POLICY "Admins can delete category facets"
  ON category_facets FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()));

CREATE POLICY "Vendors can view all category facets"
  ON category_facets FOR SELECT
  TO authenticated
  USING (true);
