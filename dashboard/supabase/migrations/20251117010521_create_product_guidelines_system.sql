/*
  # Create Product Upload Guidelines System

  1. New Tables
    - `product_guidelines`
      - `id` (uuid, primary key)
      - `title` (text) - Section title
      - `content` (text) - Guideline content
      - `section_order` (integer) - Display order
      - `is_active` (boolean) - Whether to show this section
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `updated_by` (uuid) - Admin who last updated

  2. Security
    - Enable RLS
    - Vendors can only read active guidelines
    - Admins can read and update all guidelines

  3. Initial Data
    - Pre-populate with guidelines from the PDF
*/

-- Create product_guidelines table
CREATE TABLE IF NOT EXISTS product_guidelines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  section_order integer NOT NULL DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE product_guidelines ENABLE ROW LEVEL SECURITY;

-- Vendors can read active guidelines
CREATE POLICY "Vendors can view active guidelines"
  ON product_guidelines
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Admins can read all guidelines
CREATE POLICY "Admins can view all guidelines"
  ON product_guidelines
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- Admins can update guidelines
CREATE POLICY "Admins can update guidelines"
  ON product_guidelines
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- Admins can insert guidelines
CREATE POLICY "Admins can insert guidelines"
  ON product_guidelines
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- Create index for ordering
CREATE INDEX IF NOT EXISTS idx_product_guidelines_order ON product_guidelines (section_order);

-- Insert initial guidelines content
INSERT INTO product_guidelines (title, content, section_order, is_active) VALUES
('Introduction', E'# Purpose of the Gift Shop\nServing seekers with authentic, sacred products.\n\n# Role of Vendors\nEnsuring authenticity, compliance, and smooth e-commerce operations.\n\n# Upload Modes\n1. **Bulk Product Upload** (CSV, with/without image URLs)\n2. **Individual Vendor Upload** (Manual entry through Single product upload section)', 1, true),

('General Rules for All Uploads', E'## Product Authenticity\nMust be verified.\n\n## Image Quality\nClear and high resolution.\n\n## File Naming\nNo spaces; use underscores (e.g., sufi_beads_red.jpg).\n\n## Content Compliance\nNo prohibited, plagiarized, or misleading content.\n\n## Metadata Standards\n- **Title**: 4-5 words\n- **Description**: Short description of 10 words maximum\n- **Tags**: Maximum 10, separated by commas (while uploading through CSV file)\n- **SKU**: Unique code per product', 2, true),

('Bulk Product Upload (CSV)', E'## Uploading with Image URLs\n- Prepare CSV/Excel file with required fields (you can download the template)\n- Ensure all image URLs are valid (JPG, PNG, WebP)\n- Go to bulk uploader, add your CSV file and click on upload CSV\n\n## Uploading without Image URLs\n- Same CSV/Excel format, but leave Image URL column empty\n- After upload CSV, scroll down bulk uploader section where you will see SKU and image uploader\n- Upload image there by adding corresponding SKU and click on upload image\n\n## Common Errors to Avoid\n- Missing SKU (causes duplicates)\n- Existing SKU\n- Invalid characters in price or quantity\n- Broken image links\n- Long product titles (>60 chars)\n- Long descriptions (>10 words)', 3, true),

('Individual Vendor Upload', E'## Access\n- Vendors log in via Vendor Dashboard\n- Navigate to Products > Add New Product\n\n## Required Fields\n- Product Title\n- Description\n- Category (choose from dropdown)\n- Price (USD)\n- Stock (stock available)\n- SKU (unique)\n- Images (upload minimum 4 per product)\n\n## Optional Fields\n- Name\n- Color\n- Care Instructions\n- Material\n- Shipping Time\n- Tags\n\n## Vendor Responsibilities\n- Keep inventory updated\n- Ensure prices reflect real value', 4, true),

('Quality & Compliance Checks', E'## Automated Checks\n- SKU duplication\n- Broken image URLs\n- Missing fields\n\n## Manual Review\n- Sacred authenticity review\n- Storytelling quality\n- Ethical compliance', 5, true),

('Support & Escalation', E'## Contact Information\n- **Bulk upload support**: bulk@sufisciencecenter.shop\n- **Individual vendor queries**: vendorsupport@sufisciencecenter.shop\n\nFor urgent matters, please contact support with your vendor ID and detailed description of the issue.', 6, true)

ON CONFLICT DO NOTHING;
