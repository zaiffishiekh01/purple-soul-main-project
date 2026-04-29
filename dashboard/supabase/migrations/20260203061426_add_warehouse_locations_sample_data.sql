/*
  # Add Warehouse Location Sample Data

  ## Purpose
  Generate sample warehouse locations for the main warehouse
  Creates a realistic bin-level location system:
  - 4 zones (A, B, C, D)
  - 10 aisles per zone
  - 8 racks per aisle
  - 5 shelf levels per rack
  - Total: ~1,600 locations

  ## Location Code Format
  Format: ZONE-AISLE-RACK-SHELF
  Example: A-01-03-C (Zone A, Aisle 1, Rack 3, Shelf C)

  ## Features
  - Climate-controlled zones (B, D)
  - Fast-pick zones (first 3 aisles)
  - Mixed location types (shelf, pallet, bin)
*/

DO $$
DECLARE
  zone_letters text[] := ARRAY['A', 'B', 'C', 'D'];
  zone text;
  aisle int;
  rack int;
  shelf_levels text[] := ARRAY['A', 'B', 'C', 'D', 'E'];
  shelf text;
  loc_code text;
BEGIN
  FOREACH zone IN ARRAY zone_letters
  LOOP
    FOR aisle IN 1..10 LOOP
      FOR rack IN 1..8 LOOP
        FOREACH shelf IN ARRAY shelf_levels
        LOOP
          loc_code := zone || '-' || LPAD(aisle::text, 2, '0') || '-' || LPAD(rack::text, 2, '0') || '-' || shelf;

          INSERT INTO warehouse_locations (
            warehouse_code,
            zone_code,
            aisle_number,
            rack_number,
            shelf_level,
            location_code,
            location_type,
            max_weight_lbs,
            is_climate_controlled,
            is_fast_pick_zone
          ) VALUES (
            'PSC-MAIN-01',
            zone,
            LPAD(aisle::text, 2, '0'),
            LPAD(rack::text, 2, '0'),
            shelf,
            loc_code,
            CASE
              WHEN shelf IN ('A', 'B') THEN 'shelf'
              WHEN shelf = 'C' THEN 'pallet'
              ELSE 'bin'
            END,
            500.00,
            zone IN ('B', 'D'),
            aisle <= 3
          )
          ON CONFLICT (warehouse_code, location_code) DO NOTHING;
        END LOOP;
      END LOOP;
    END LOOP;
  END LOOP;
END $$;
