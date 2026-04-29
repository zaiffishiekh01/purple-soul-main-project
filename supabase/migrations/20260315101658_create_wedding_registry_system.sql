-- Create wedding_registries table
CREATE TABLE wedding_registries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    wedding_date DATE,
    couple_name_1 TEXT NOT NULL,
    couple_name_2 TEXT NOT NULL,
    registry_url_slug TEXT NOT NULL UNIQUE,
    privacy_setting TEXT NOT NULL DEFAULT 'public' CHECK (privacy_setting IN ('public', 'private', 'password_protected')),
    registry_password TEXT,
    story TEXT,
    cover_image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    is_active BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT valid_wedding_date CHECK (wedding_date IS NULL OR wedding_date >= CURRENT_DATE)
);

-- Create registry_items table
CREATE TABLE registry_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registry_id UUID NOT NULL REFERENCES wedding_registries(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity_requested INTEGER NOT NULL DEFAULT 1 CHECK (quantity_requested > 0),
    quantity_purchased INTEGER NOT NULL DEFAULT 0 CHECK (quantity_purchased >= 0),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
    notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(registry_id, product_id)
);

-- Create registry_purchases table
CREATE TABLE registry_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registry_item_id UUID NOT NULL REFERENCES registry_items(id) ON DELETE CASCADE,
    purchaser_name TEXT NOT NULL,
    purchaser_email TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    purchase_date TIMESTAMPTZ NOT NULL DEFAULT now(),
    message TEXT DEFAULT '',
    is_anonymous BOOLEAN DEFAULT false,
    gift_wrapped BOOLEAN DEFAULT false
);

-- Create indexes for performance
CREATE INDEX idx_wedding_registries_user_id ON wedding_registries(user_id);
CREATE INDEX idx_wedding_registries_url_slug ON wedding_registries(registry_url_slug);
CREATE INDEX idx_wedding_registries_active ON wedding_registries(is_active) WHERE is_active = true;
CREATE INDEX idx_registry_items_registry_id ON registry_items(registry_id);
CREATE INDEX idx_registry_items_product_id ON registry_items(product_id);
CREATE INDEX idx_registry_items_priority ON registry_items(priority);
CREATE INDEX idx_registry_purchases_registry_item_id ON registry_purchases(registry_item_id);
CREATE INDEX idx_registry_purchases_purchase_date ON registry_purchases(purchase_date DESC);

-- Enable Row Level Security
ALTER TABLE wedding_registries ENABLE ROW LEVEL SECURITY;
ALTER TABLE registry_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE registry_purchases ENABLE ROW LEVEL SECURITY;

-- RLS Policies for wedding_registries

-- Users can view their own registries
CREATE POLICY "Users can view own registries"
    ON wedding_registries FOR SELECT
    USING (auth.uid() = user_id);

-- Users can create their own registries
CREATE POLICY "Users can create own registries"
    ON wedding_registries FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own registries
CREATE POLICY "Users can update own registries"
    ON wedding_registries FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own registries
CREATE POLICY "Users can delete own registries"
    ON wedding_registries FOR DELETE
    USING (auth.uid() = user_id);

-- Public can view public registries
CREATE POLICY "Public can view public registries"
    ON wedding_registries FOR SELECT
    USING (privacy_setting = 'public' AND is_active = true);

-- RLS Policies for registry_items

-- Users can manage items in their own registries
CREATE POLICY "Users can manage own registry items"
    ON registry_items FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM wedding_registries
            WHERE wedding_registries.id = registry_items.registry_id
            AND wedding_registries.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM wedding_registries
            WHERE wedding_registries.id = registry_items.registry_id
            AND wedding_registries.user_id = auth.uid()
        )
    );

-- Public can view items in public registries
CREATE POLICY "Public can view items in public registries"
    ON registry_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM wedding_registries
            WHERE wedding_registries.id = registry_items.registry_id
            AND wedding_registries.privacy_setting = 'public'
            AND wedding_registries.is_active = true
        )
    );

-- RLS Policies for registry_purchases

-- Anyone can create purchases (guests purchasing gifts)
CREATE POLICY "Anyone can create purchases"
    ON registry_purchases FOR INSERT
    WITH CHECK (true);

-- Registry owners can view purchases on their items
CREATE POLICY "Registry owners can view purchases"
    ON registry_purchases FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM registry_items
            JOIN wedding_registries ON wedding_registries.id = registry_items.registry_id
            WHERE registry_items.id = registry_purchases.registry_item_id
            AND wedding_registries.user_id = auth.uid()
        )
    );

-- Public can view non-anonymous purchases on public registries
CREATE POLICY "Public can view non-anonymous purchases"
    ON registry_purchases FOR SELECT
    USING (
        is_anonymous = false
        AND EXISTS (
            SELECT 1 FROM registry_items
            JOIN wedding_registries ON wedding_registries.id = registry_items.registry_id
            WHERE registry_items.id = registry_purchases.registry_item_id
            AND wedding_registries.privacy_setting = 'public'
            AND wedding_registries.is_active = true
        )
    );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_wedding_registries_updated_at
    BEFORE UPDATE ON wedding_registries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_registry_items_updated_at
    BEFORE UPDATE ON registry_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to update quantity_purchased when a purchase is made
CREATE OR REPLACE FUNCTION update_registry_item_quantity()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE registry_items
    SET quantity_purchased = quantity_purchased + NEW.quantity
    WHERE id = NEW.registry_item_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update quantity_purchased
CREATE TRIGGER after_registry_purchase
    AFTER INSERT ON registry_purchases
    FOR EACH ROW
    EXECUTE FUNCTION update_registry_item_quantity();

-- Function to generate unique registry URL slug
CREATE OR REPLACE FUNCTION generate_registry_slug(couple1 TEXT, couple2 TEXT)
RETURNS TEXT AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 0;
BEGIN
    -- Create base slug from couple names
    base_slug := lower(
        regexp_replace(
            couple1 || '-' || couple2,
            '[^a-zA-Z0-9]+',
            '-',
            'g'
        )
    );
    
    final_slug := base_slug;
    
    -- Ensure uniqueness
    WHILE EXISTS (SELECT 1 FROM wedding_registries WHERE registry_url_slug = final_slug) LOOP
        counter := counter + 1;
        final_slug := base_slug || '-' || counter;
    END LOOP;
    
    RETURN final_slug;
END;
$$ language 'plpgsql';

-- Create view for registry statistics
CREATE OR REPLACE VIEW registry_statistics AS
SELECT 
    wr.id as registry_id,
    wr.user_id,
    wr.couple_name_1,
    wr.couple_name_2,
    wr.wedding_date,
    COUNT(DISTINCT ri.id) as total_items,
    SUM(ri.quantity_requested) as total_quantity_requested,
    SUM(ri.quantity_purchased) as total_quantity_purchased,
    COUNT(DISTINCT rp.id) as total_purchases,
    COUNT(DISTINCT rp.purchaser_email) as unique_purchasers,
    ROUND(
        CASE 
            WHEN SUM(ri.quantity_requested) > 0 
            THEN (SUM(ri.quantity_purchased)::numeric / SUM(ri.quantity_requested)::numeric) * 100 
            ELSE 0 
        END, 
        2
    ) as completion_percentage
FROM wedding_registries wr
LEFT JOIN registry_items ri ON wr.id = ri.registry_id
LEFT JOIN registry_purchases rp ON ri.id = rp.registry_item_id
GROUP BY wr.id, wr.user_id, wr.couple_name_1, wr.couple_name_2, wr.wedding_date;

COMMENT ON TABLE wedding_registries IS 'Stores wedding registry information for couples';
COMMENT ON TABLE registry_items IS 'Stores products added to wedding registries';
COMMENT ON TABLE registry_purchases IS 'Tracks purchases made from wedding registries by guests';
COMMENT ON COLUMN wedding_registries.registry_url_slug IS 'Unique URL-friendly identifier for sharing the registry';
COMMENT ON COLUMN wedding_registries.privacy_setting IS 'Controls who can view the registry: public, private, or password_protected';
COMMENT ON COLUMN registry_items.priority IS 'Priority level of the item: high, medium, or low';
COMMENT ON COLUMN registry_purchases.is_anonymous IS 'Whether the purchaser wants to remain anonymous to other guests';
