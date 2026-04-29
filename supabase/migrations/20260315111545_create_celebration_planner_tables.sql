/*
  # Create Tables for All Celebration Planners

  1. New Tables
    - `birth_planners`
      - User's birth/welcome celebration planning data
      - Stores dates, names, budget, checklist progress

    - `seasonal_planners`
      - Ramadan, Christmas, Hanukkah, and seasonal celebration planning
      - Tracks celebration type, dates, family size, budget

    - `remembrance_planners`
      - Memorial and funeral service planning
      - Stores passing date, deceased info, service details

    - `home_blessing_planners`
      - New home blessing and housewarming planning
      - Tracks move-in date, home type, blessing ceremonies

    - `celebration_checklists`
      - Checklist items for all planner types
      - Allows users to track completion of tasks

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Birth & Welcome Planners
CREATE TABLE IF NOT EXISTS birth_planners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tradition text NOT NULL,
  baby_name text DEFAULT '',
  birth_date date,
  gender text,
  budget numeric DEFAULT 3000,
  checklist_progress jsonb DEFAULT '[]',
  selected_products jsonb DEFAULT '[]',
  country_id uuid REFERENCES countries(id),
  state_id uuid REFERENCES states(id),
  city_id uuid REFERENCES cities(id),
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE birth_planners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own birth planners"
  ON birth_planners FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own birth planners"
  ON birth_planners FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own birth planners"
  ON birth_planners FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own birth planners"
  ON birth_planners FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Seasonal Celebration Planners
CREATE TABLE IF NOT EXISTS seasonal_planners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  celebration_type text NOT NULL,
  tradition text NOT NULL,
  start_date date,
  end_date date,
  family_size integer DEFAULT 4,
  budget numeric DEFAULT 2000,
  checklist_progress jsonb DEFAULT '[]',
  selected_products jsonb DEFAULT '[]',
  country_id uuid REFERENCES countries(id),
  state_id uuid REFERENCES states(id),
  city_id uuid REFERENCES cities(id),
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE seasonal_planners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own seasonal planners"
  ON seasonal_planners FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own seasonal planners"
  ON seasonal_planners FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own seasonal planners"
  ON seasonal_planners FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own seasonal planners"
  ON seasonal_planners FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Remembrance & Memorial Planners
CREATE TABLE IF NOT EXISTS remembrance_planners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tradition text NOT NULL,
  name_of_deceased text NOT NULL,
  hebrew_name text,
  relationship text DEFAULT '',
  passing_date date,
  service_date date,
  service_location text DEFAULT '',
  budget numeric DEFAULT 5000,
  checklist_progress jsonb DEFAULT '[]',
  selected_products jsonb DEFAULT '[]',
  country_id uuid REFERENCES countries(id),
  state_id uuid REFERENCES states(id),
  city_id uuid REFERENCES cities(id),
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE remembrance_planners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own remembrance planners"
  ON remembrance_planners FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own remembrance planners"
  ON remembrance_planners FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own remembrance planners"
  ON remembrance_planners FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own remembrance planners"
  ON remembrance_planners FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Home Blessing Planners
CREATE TABLE IF NOT EXISTS home_blessing_planners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tradition text NOT NULL,
  move_in_date date,
  home_type text DEFAULT 'apartment',
  family_size integer DEFAULT 2,
  budget numeric DEFAULT 2000,
  blessing_date date,
  checklist_progress jsonb DEFAULT '[]',
  selected_products jsonb DEFAULT '[]',
  country_id uuid REFERENCES countries(id),
  state_id uuid REFERENCES states(id),
  city_id uuid REFERENCES cities(id),
  address text DEFAULT '',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE home_blessing_planners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own home blessing planners"
  ON home_blessing_planners FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own home blessing planners"
  ON home_blessing_planners FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own home blessing planners"
  ON home_blessing_planners FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own home blessing planners"
  ON home_blessing_planners FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Celebration Checklist Items
CREATE TABLE IF NOT EXISTS celebration_checklists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  planner_type text NOT NULL,
  planner_id uuid NOT NULL,
  item_text text NOT NULL,
  category text NOT NULL,
  completed boolean DEFAULT false,
  due_date date,
  priority text DEFAULT 'medium',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE celebration_checklists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own checklist items"
  ON celebration_checklists FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own checklist items"
  ON celebration_checklists FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own checklist items"
  ON celebration_checklists FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own checklist items"
  ON celebration_checklists FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_birth_planners_user_id ON birth_planners(user_id);
CREATE INDEX IF NOT EXISTS idx_birth_planners_tradition ON birth_planners(tradition);
CREATE INDEX IF NOT EXISTS idx_seasonal_planners_user_id ON seasonal_planners(user_id);
CREATE INDEX IF NOT EXISTS idx_seasonal_planners_celebration_type ON seasonal_planners(celebration_type);
CREATE INDEX IF NOT EXISTS idx_remembrance_planners_user_id ON remembrance_planners(user_id);
CREATE INDEX IF NOT EXISTS idx_home_blessing_planners_user_id ON home_blessing_planners(user_id);
CREATE INDEX IF NOT EXISTS idx_celebration_checklists_user_id ON celebration_checklists(user_id);
CREATE INDEX IF NOT EXISTS idx_celebration_checklists_planner_type ON celebration_checklists(planner_type);
CREATE INDEX IF NOT EXISTS idx_celebration_checklists_planner_id ON celebration_checklists(planner_id);
