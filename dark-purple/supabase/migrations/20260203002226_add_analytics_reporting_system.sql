/*
  # Analytics & Reporting System

  ## Overview
  Comprehensive analytics system for tracking sales performance, customer behavior,
  product metrics, and vendor performance. Includes pre-aggregated data for fast
  dashboard queries and detailed drill-down capabilities.

  ## New Tables
  
  ### `daily_sales_stats`
  Daily aggregated sales metrics
  - `id` (uuid, primary key)
  - `date` (date, unique) - The date for these stats
  - `total_orders` (integer) - Number of orders
  - `total_revenue` (decimal) - Total sales amount
  - `total_items_sold` (integer) - Total quantity sold
  - `average_order_value` (decimal) - Average per order
  - `new_customers` (integer) - First-time buyers
  - `returning_customers` (integer) - Repeat buyers
  - `created_at` (timestamptz)
  
  ### `vendor_performance`
  Vendor-specific performance metrics
  - `id` (uuid, primary key)
  - `vendor_id` (uuid) - References vendors
  - `period_start` (date) - Start of period
  - `period_end` (date) - End of period
  - `total_sales` (decimal) - Revenue in period
  - `total_orders` (integer) - Orders in period
  - `total_items` (integer) - Items sold
  - `average_rating` (decimal) - Product rating average
  - `review_count` (integer) - Total reviews
  - `fulfillment_time_avg` (interval) - Avg time to ship
  - `return_rate` (decimal) - Percentage of returns
  - `created_at` (timestamptz)
  
  ### `product_analytics`
  Product performance tracking
  - `id` (uuid, primary key)
  - `product_id` (uuid) - References products
  - `views` (integer) - Page views
  - `cart_adds` (integer) - Times added to cart
  - `purchases` (integer) - Times purchased
  - `revenue` (decimal) - Total revenue
  - `conversion_rate` (decimal) - Purchase/view ratio
  - `last_updated` (timestamptz)
  
  ### `customer_lifetime_value`
  Customer value metrics
  - `id` (uuid, primary key)
  - `user_id` (uuid, unique) - References auth.users
  - `total_orders` (integer) - Lifetime orders
  - `total_spent` (decimal) - Lifetime revenue
  - `average_order_value` (decimal)
  - `first_order_date` (timestamptz)
  - `last_order_date` (timestamptz)
  - `customer_segment` (text) - vip, regular, at_risk, dormant
  - `updated_at` (timestamptz)

  ## Views
  - `vendor_dashboard_stats` - Real-time vendor metrics
  - `admin_dashboard_stats` - Platform-wide metrics
  - `product_performance_report` - Top/bottom performers
  
  ## Functions
  - `update_daily_stats()` - Aggregate daily sales data
  - `calculate_customer_ltv()` - Update customer value metrics
  - `generate_vendor_report()` - Create vendor performance report
  - `track_product_view()` - Increment product view count
  - `track_cart_add()` - Increment cart add count
  
  ## Indexes
  - Date indexes for time-series queries
  - Foreign key indexes for joins
  - Composite indexes for common filter combinations
  
  ## Security
  - Enable RLS on all tables
  - Vendors can only see their own metrics
  - Admins have full access to all analytics
*/

-- Create daily_sales_stats table
CREATE TABLE IF NOT EXISTS daily_sales_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date UNIQUE NOT NULL,
  total_orders integer DEFAULT 0 NOT NULL,
  total_revenue decimal(12,2) DEFAULT 0 NOT NULL,
  total_items_sold integer DEFAULT 0 NOT NULL,
  average_order_value decimal(10,2) DEFAULT 0 NOT NULL,
  new_customers integer DEFAULT 0 NOT NULL,
  returning_customers integer DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create vendor_performance table
CREATE TABLE IF NOT EXISTS vendor_performance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  period_start date NOT NULL,
  period_end date NOT NULL,
  total_sales decimal(12,2) DEFAULT 0 NOT NULL,
  total_orders integer DEFAULT 0 NOT NULL,
  total_items integer DEFAULT 0 NOT NULL,
  average_rating decimal(3,2),
  review_count integer DEFAULT 0 NOT NULL,
  fulfillment_time_avg interval,
  return_rate decimal(5,2) DEFAULT 0,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(vendor_id, period_start, period_end)
);

-- Create product_analytics table
CREATE TABLE IF NOT EXISTS product_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid UNIQUE NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  views integer DEFAULT 0 NOT NULL,
  cart_adds integer DEFAULT 0 NOT NULL,
  purchases integer DEFAULT 0 NOT NULL,
  revenue decimal(12,2) DEFAULT 0 NOT NULL,
  conversion_rate decimal(5,4) DEFAULT 0,
  last_updated timestamptz DEFAULT now() NOT NULL
);

-- Create customer_lifetime_value table
CREATE TABLE IF NOT EXISTS customer_lifetime_value (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_orders integer DEFAULT 0 NOT NULL,
  total_spent decimal(12,2) DEFAULT 0 NOT NULL,
  average_order_value decimal(10,2) DEFAULT 0 NOT NULL,
  first_order_date timestamptz,
  last_order_date timestamptz,
  customer_segment text DEFAULT 'regular' CHECK (customer_segment IN ('vip', 'regular', 'at_risk', 'dormant')),
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Function to update daily stats
CREATE OR REPLACE FUNCTION update_daily_stats(p_date date DEFAULT CURRENT_DATE)
RETURNS void AS $$
DECLARE
  v_stats RECORD;
BEGIN
  SELECT 
    COUNT(DISTINCT o.id) as order_count,
    COALESCE(SUM(o.total), 0) as revenue,
    COALESCE(SUM((SELECT SUM(oi.quantity) FROM order_items oi WHERE oi.order_id = o.id)), 0) as items_sold,
    COALESCE(AVG(o.total), 0) as avg_order,
    COUNT(DISTINCT CASE WHEN (SELECT COUNT(*) FROM orders o2 WHERE o2.customer_id = o.customer_id AND o2.created_at < o.created_at) = 0 THEN o.customer_id END) as new_cust,
    COUNT(DISTINCT CASE WHEN (SELECT COUNT(*) FROM orders o2 WHERE o2.customer_id = o.customer_id AND o2.created_at < o.created_at) > 0 THEN o.customer_id END) as returning_cust
  INTO v_stats
  FROM orders o
  WHERE DATE(o.created_at) = p_date;
  
  INSERT INTO daily_sales_stats (date, total_orders, total_revenue, total_items_sold, average_order_value, new_customers, returning_customers)
  VALUES (p_date, v_stats.order_count, v_stats.revenue, v_stats.items_sold, v_stats.avg_order, v_stats.new_cust, v_stats.returning_cust)
  ON CONFLICT (date) DO UPDATE SET
    total_orders = EXCLUDED.total_orders,
    total_revenue = EXCLUDED.total_revenue,
    total_items_sold = EXCLUDED.total_items_sold,
    average_order_value = EXCLUDED.average_order_value,
    new_customers = EXCLUDED.new_customers,
    returning_customers = EXCLUDED.returning_customers;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate customer LTV
CREATE OR REPLACE FUNCTION calculate_customer_ltv(p_user_id uuid)
RETURNS void AS $$
DECLARE
  v_stats RECORD;
  v_segment text;
  v_days_since_last integer;
BEGIN
  SELECT 
    COUNT(*) as order_count,
    COALESCE(SUM(total), 0) as total_spent,
    COALESCE(AVG(total), 0) as avg_order,
    MIN(created_at) as first_order,
    MAX(created_at) as last_order
  INTO v_stats
  FROM orders
  WHERE customer_id = p_user_id AND status != 'cancelled';
  
  -- Calculate segment
  v_days_since_last := EXTRACT(DAY FROM (now() - v_stats.last_order));
  
  IF v_stats.total_spent > 1000 THEN
    v_segment := 'vip';
  ELSIF v_days_since_last > 180 THEN
    v_segment := 'dormant';
  ELSIF v_days_since_last > 90 THEN
    v_segment := 'at_risk';
  ELSE
    v_segment := 'regular';
  END IF;
  
  INSERT INTO customer_lifetime_value (user_id, total_orders, total_spent, average_order_value, first_order_date, last_order_date, customer_segment)
  VALUES (p_user_id, v_stats.order_count, v_stats.total_spent, v_stats.avg_order, v_stats.first_order, v_stats.last_order, v_segment)
  ON CONFLICT (user_id) DO UPDATE SET
    total_orders = EXCLUDED.total_orders,
    total_spent = EXCLUDED.total_spent,
    average_order_value = EXCLUDED.average_order_value,
    first_order_date = EXCLUDED.first_order_date,
    last_order_date = EXCLUDED.last_order_date,
    customer_segment = EXCLUDED.customer_segment,
    updated_at = now();
END;
$$ LANGUAGE plpgsql;

-- Function to track product view
CREATE OR REPLACE FUNCTION track_product_view(p_product_id uuid)
RETURNS void AS $$
BEGIN
  INSERT INTO product_analytics (product_id, views, last_updated)
  VALUES (p_product_id, 1, now())
  ON CONFLICT (product_id) DO UPDATE SET
    views = product_analytics.views + 1,
    conversion_rate = CASE 
      WHEN product_analytics.views + 1 > 0 
      THEN CAST(product_analytics.purchases AS decimal) / (product_analytics.views + 1)
      ELSE 0
    END,
    last_updated = now();
END;
$$ LANGUAGE plpgsql;

-- Function to track cart add
CREATE OR REPLACE FUNCTION track_cart_add(p_product_id uuid)
RETURNS void AS $$
BEGIN
  INSERT INTO product_analytics (product_id, cart_adds, last_updated)
  VALUES (p_product_id, 1, now())
  ON CONFLICT (product_id) DO UPDATE SET
    cart_adds = product_analytics.cart_adds + 1,
    last_updated = now();
END;
$$ LANGUAGE plpgsql;

-- Create vendor dashboard view
CREATE OR REPLACE VIEW vendor_dashboard_stats AS
SELECT 
  v.id as vendor_id,
  v.business_name,
  COUNT(DISTINCT o.id) as total_orders,
  COALESCE(SUM(oi.total), 0) as total_revenue,
  COALESCE(SUM(oi.quantity), 0) as total_items_sold,
  COALESCE(AVG(oi.total), 0) as average_order_value,
  COUNT(DISTINCT p.id) as total_products,
  COALESCE(AVG(pr.rating), 0) as average_rating,
  COUNT(pr.id) as total_reviews
FROM vendors v
LEFT JOIN products p ON p.vendor_id = v.id
LEFT JOIN order_items oi ON oi.vendor_id = v.id
LEFT JOIN orders o ON o.id = oi.order_id
LEFT JOIN product_reviews pr ON pr.product_id = p.id AND pr.status = 'approved'
GROUP BY v.id, v.business_name;

-- Create admin dashboard view
CREATE OR REPLACE VIEW admin_dashboard_stats AS
SELECT 
  (SELECT COUNT(*) FROM orders WHERE DATE(created_at) = CURRENT_DATE) as orders_today,
  (SELECT COALESCE(SUM(total), 0) FROM orders WHERE DATE(created_at) = CURRENT_DATE) as revenue_today,
  (SELECT COUNT(*) FROM users WHERE DATE(created_at) = CURRENT_DATE) as new_users_today,
  (SELECT COUNT(*) FROM products WHERE is_active = true) as active_products,
  (SELECT COUNT(*) FROM vendors WHERE status = 'active') as active_vendors,
  (SELECT COALESCE(AVG(rating), 0) FROM product_reviews WHERE status = 'approved') as average_rating,
  (SELECT COUNT(*) FROM product_reviews WHERE status = 'pending') as pending_reviews;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_daily_sales_date ON daily_sales_stats(date DESC);

CREATE INDEX IF NOT EXISTS idx_vendor_performance_vendor ON vendor_performance(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_performance_period ON vendor_performance(period_start, period_end);

CREATE INDEX IF NOT EXISTS idx_product_analytics_product ON product_analytics(product_id);
CREATE INDEX IF NOT EXISTS idx_product_analytics_views ON product_analytics(views DESC);
CREATE INDEX IF NOT EXISTS idx_product_analytics_conversion ON product_analytics(conversion_rate DESC);

CREATE INDEX IF NOT EXISTS idx_customer_ltv_user ON customer_lifetime_value(user_id);
CREATE INDEX IF NOT EXISTS idx_customer_ltv_segment ON customer_lifetime_value(customer_segment);
CREATE INDEX IF NOT EXISTS idx_customer_ltv_spent ON customer_lifetime_value(total_spent DESC);

-- Enable RLS
ALTER TABLE daily_sales_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_lifetime_value ENABLE ROW LEVEL SECURITY;

-- RLS Policies for daily_sales_stats
CREATE POLICY "Admins can view daily sales stats" ON daily_sales_stats FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- RLS Policies for vendor_performance
CREATE POLICY "Vendors can view own performance" ON vendor_performance FOR SELECT TO authenticated
  USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()));

CREATE POLICY "Admins can view all vendor performance" ON vendor_performance FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- RLS Policies for product_analytics
CREATE POLICY "Vendors can view own product analytics" ON product_analytics FOR SELECT TO authenticated
  USING (
    product_id IN (
      SELECT p.id FROM products p
      JOIN vendors v ON v.id = p.vendor_id
      WHERE v.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all product analytics" ON product_analytics FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- RLS Policies for customer_lifetime_value
CREATE POLICY "Users can view own LTV" ON customer_lifetime_value FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all LTV data" ON customer_lifetime_value FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));
