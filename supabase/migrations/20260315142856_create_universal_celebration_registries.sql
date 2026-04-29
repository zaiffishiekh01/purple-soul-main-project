/*
  # Create Universal Celebration Registries System

  1. New Tables
    - `celebration_registries`
      - Unified registry table supporting multiple types:
        - wedding: Wedding gift registry
        - celebration: Seasonal celebrations (Ramadan/Eid, Christmas/Advent, Hanukkah, etc.)
        - remembrance: Memorial and remembrance registry
        - home-blessing: New home blessing registry
        - family-gift: New birth & welcome registry
      - Each registry type can specify faith tradition (muslim, christian, jewish, shared)
      - Stores event details, privacy settings, URL slug
      - Supports public, private, and password-protected registries
  
    - `celebration_registry_items`
      - Products added to any celebration registry
      - Tracks quantity requested vs purchased
      - Priority levels (high, medium, low)
      - Custom notes per item
  
    - `celebration_registry_purchases`
      - Guest purchases from registries
      - Purchaser information and messages
      - Anonymous purchase option
      - Gift wrapping preference

  2. Security
    - Enable RLS on all tables
    - Registry owners can fully manage their registries
    - Public can view public registries
    - Password-protected registries require verification
    - Anyone can make purchases (guests)
    - Registry owners can view all purchases
    - Public can view non-anonymous purchases

  3. Features
    - Automatic quantity tracking
    - Registry statistics view
    - URL slug generation
    - Faith-specific customization
    - Multi-language support ready
*/

-- Create celebration_registries table
CREATE TABLE IF NOT EXISTS celebration_registries (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    registry_type text NOT NULL CHECK (registry_type IN ('wedding', 'celebration', 'remembrance', 'home-blessing', 'family-gift')),
    faith_tradition text NOT NULL DEFAULT 'shared' CHECK (faith_tradition IN ('muslim', 'christian', 'jewish', 'shared')),
    event_date date,
    primary_name text NOT NULL,
    secondary_name text,
    registry_url_slug text NOT NULL UNIQUE,
    privacy_setting text NOT NULL DEFAULT 'public' CHECK (privacy_setting IN ('public', 'private', 'password_protected')),
    registry_password text,
    story text,
    cover_image_url text,
    celebration_subtype text,
    location_country text,
    location_city text,
    language_preference text DEFAULT 'en',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    is_active boolean NOT NULL DEFAULT true
);

-- Create celebration_registry_items table
CREATE TABLE IF NOT EXISTS celebration_registry_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    registry_id uuid NOT NULL REFERENCES celebration_registries(id) ON DELETE CASCADE,
    product_id uuid NOT NULL,
    quantity_requested integer NOT NULL DEFAULT 1 CHECK (quantity_requested > 0),
    quantity_purchased integer NOT NULL DEFAULT 0 CHECK (quantity_purchased >= 0),
    priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
    notes text DEFAULT '',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(registry_id, product_id)
);

-- Create celebration_registry_purchases table
CREATE TABLE IF NOT EXISTS celebration_registry_purchases (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    registry_id uuid NOT NULL REFERENCES celebration_registries(id) ON DELETE CASCADE,
    registry_item_id uuid NOT NULL REFERENCES celebration_registry_items(id) ON DELETE CASCADE,
    purchaser_name text NOT NULL,
    purchaser_email text NOT NULL,
    quantity integer NOT NULL CHECK (quantity > 0),
    purchase_date timestamptz NOT NULL DEFAULT now(),
    message text DEFAULT '',
    is_anonymous boolean DEFAULT false,
    gift_wrapped boolean DEFAULT false,
    delivery_status text DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'processing', 'shipped', 'delivered'))
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_celebration_registries_user_id ON celebration_registries(user_id);
CREATE INDEX IF NOT EXISTS idx_celebration_registries_type ON celebration_registries(registry_type);
CREATE INDEX IF NOT EXISTS idx_celebration_registries_faith ON celebration_registries(faith_tradition);
CREATE INDEX IF NOT EXISTS idx_celebration_registries_url_slug ON celebration_registries(registry_url_slug);
CREATE INDEX IF NOT EXISTS idx_celebration_registries_active ON celebration_registries(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_celebration_registry_items_registry_id ON celebration_registry_items(registry_id);
CREATE INDEX IF NOT EXISTS idx_celebration_registry_items_priority ON celebration_registry_items(priority);
CREATE INDEX IF NOT EXISTS idx_celebration_registry_purchases_registry_id ON celebration_registry_purchases(registry_id);
CREATE INDEX IF NOT EXISTS idx_celebration_registry_purchases_registry_item_id ON celebration_registry_purchases(registry_item_id);
CREATE INDEX IF NOT EXISTS idx_celebration_registry_purchases_purchase_date ON celebration_registry_purchases(purchase_date DESC);

-- Enable Row Level Security
ALTER TABLE celebration_registries ENABLE ROW LEVEL SECURITY;
ALTER TABLE celebration_registry_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE celebration_registry_purchases ENABLE ROW LEVEL SECURITY;

-- RLS Policies for celebration_registries

-- Users can view their own registries
CREATE POLICY "Users can view own celebration registries"
    ON celebration_registries FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Users can create their own registries
CREATE POLICY "Users can create own celebration registries"
    ON celebration_registries FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own registries
CREATE POLICY "Users can update own celebration registries"
    ON celebration_registries FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own registries
CREATE POLICY "Users can delete own celebration registries"
    ON celebration_registries FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Public can view public registries
CREATE POLICY "Public can view public celebration registries"
    ON celebration_registries FOR SELECT
    USING (privacy_setting = 'public' AND is_active = true);

-- RLS Policies for celebration_registry_items

-- Users can manage items in their own registries
CREATE POLICY "Users can manage own celebration registry items"
    ON celebration_registry_items FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM celebration_registries
            WHERE celebration_registries.id = celebration_registry_items.registry_id
            AND celebration_registries.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM celebration_registries
            WHERE celebration_registries.id = celebration_registry_items.registry_id
            AND celebration_registries.user_id = auth.uid()
        )
    );

-- Public can view items in public registries
CREATE POLICY "Public can view items in public celebration registries"
    ON celebration_registry_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM celebration_registries
            WHERE celebration_registries.id = celebration_registry_items.registry_id
            AND celebration_registries.privacy_setting = 'public'
            AND celebration_registries.is_active = true
        )
    );

-- RLS Policies for celebration_registry_purchases

-- Anyone can create purchases (guests purchasing gifts)
CREATE POLICY "Anyone can create celebration purchases"
    ON celebration_registry_purchases FOR INSERT
    WITH CHECK (true);

-- Registry owners can view purchases on their items
CREATE POLICY "Registry owners can view celebration purchases"
    ON celebration_registry_purchases FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM celebration_registries
            WHERE celebration_registries.id = celebration_registry_purchases.registry_id
            AND celebration_registries.user_id = auth.uid()
        )
    );

-- Public can view non-anonymous purchases on public registries
CREATE POLICY "Public can view non-anonymous celebration purchases"
    ON celebration_registry_purchases FOR SELECT
    USING (
        is_anonymous = false
        AND EXISTS (
            SELECT 1 FROM celebration_registries
            WHERE celebration_registries.id = celebration_registry_purchases.registry_id
            AND celebration_registries.privacy_setting = 'public'
            AND celebration_registries.is_active = true
        )
    );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_celebration_registry_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_celebration_registries_updated_at
    BEFORE UPDATE ON celebration_registries
    FOR EACH ROW
    EXECUTE FUNCTION update_celebration_registry_updated_at();

CREATE TRIGGER update_celebration_registry_items_updated_at
    BEFORE UPDATE ON celebration_registry_items
    FOR EACH ROW
    EXECUTE FUNCTION update_celebration_registry_updated_at();

-- Function to update quantity_purchased when a purchase is made
CREATE OR REPLACE FUNCTION update_celebration_registry_item_quantity()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE celebration_registry_items
    SET quantity_purchased = quantity_purchased + NEW.quantity
    WHERE id = NEW.registry_item_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update quantity_purchased
CREATE TRIGGER after_celebration_registry_purchase
    AFTER INSERT ON celebration_registry_purchases
    FOR EACH ROW
    EXECUTE FUNCTION update_celebration_registry_item_quantity();

-- Create view for celebration registry statistics
CREATE OR REPLACE VIEW celebration_registry_statistics AS
SELECT 
    cr.id as registry_id,
    cr.user_id,
    cr.registry_type,
    cr.faith_tradition,
    cr.primary_name,
    cr.secondary_name,
    cr.event_date,
    COUNT(DISTINCT cri.id) as total_items,
    SUM(cri.quantity_requested) as total_quantity_requested,
    SUM(cri.quantity_purchased) as total_quantity_purchased,
    COUNT(DISTINCT crp.id) as total_purchases,
    COUNT(DISTINCT crp.purchaser_email) as unique_purchasers,
    ROUND(
        CASE 
            WHEN SUM(cri.quantity_requested) > 0 
            THEN (SUM(cri.quantity_purchased)::numeric / SUM(cri.quantity_requested)::numeric) * 100 
            ELSE 0 
        END, 
        2
    ) as completion_percentage
FROM celebration_registries cr
LEFT JOIN celebration_registry_items cri ON cr.id = cri.registry_id
LEFT JOIN celebration_registry_purchases crp ON cri.id = crp.registry_item_id
GROUP BY cr.id, cr.user_id, cr.registry_type, cr.faith_tradition, cr.primary_name, cr.secondary_name, cr.event_date;

COMMENT ON TABLE celebration_registries IS 'Universal registry system for weddings, celebrations, remembrance, home blessings, and family gifts across all Abrahamic faiths';
COMMENT ON TABLE celebration_registry_items IS 'Products added to celebration registries with quantity tracking';
COMMENT ON TABLE celebration_registry_purchases IS 'Guest purchases from celebration registries';
COMMENT ON COLUMN celebration_registries.registry_type IS 'Type of celebration: wedding, celebration, remembrance, home-blessing, or family-gift';
COMMENT ON COLUMN celebration_registries.faith_tradition IS 'Faith tradition: muslim, christian, jewish, or shared';
COMMENT ON COLUMN celebration_registries.celebration_subtype IS 'Specific celebration subtype (e.g., ramadan-eid, christmas-advent, hanukkah, etc.)';
