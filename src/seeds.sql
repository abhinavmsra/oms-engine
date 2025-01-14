BEGIN;
  -- Create shipping rates
  INSERT INTO warehouse_shipping_rates (id, cost_per_kg_km) VALUES (1, 0.01);

  -- Create locations
  INSERT INTO locations (id, latitude, longitude) VALUES
    (1, 33.9425, -118.408056), -- Los Angeles
    (2, 40.639722, -73.778889), -- New York
    (3, -23.435556, -46.473056), -- São Paulo
    (4, 49.009722, 2.547778), -- Paris
    (5, 52.165833, 20.967222), -- Warsaw
    (6, 22.308889, 113.914444); -- Hong Kong

  -- Create warehouses
  INSERT INTO warehouses (location_id, name, warehouse_shipping_rate_id) VALUES
    (1, 'Los Angeles', 1),
    (2, 'New York', 1),
    (3, 'São Paulo', 1),
    (4, 'Paris', 1),
    (5, 'Warsaw', 1),
    (6, 'Hong Kong', 1);

  -- Create product
  INSERT INTO products (id, name, price, weight) VALUES
    (1, 'SCOS Device', 150, 365);

  -- Create stocks
  INSERT INTO stocks (id, warehouse_id, product_id, amount) VALUES
    (1, 1, 1, 355),
    (2, 2, 1, 578),
    (3, 3, 1, 265),
    (4, 4, 1, 694),
    (5, 5, 1, 245),
    (6, 6, 1, 419);

  -- Create promotions
  INSERT INTO promotions (id, name, description, is_active) VALUES
    (1, 'Volume discount', 'Volume discount', true);

  INSERT INTO promotion_rules (id, promotion_id, min_quantity, discount_value, is_active) VALUES
    (1, 1, 25, 0.05, true),
    (2, 1, 50, 0.1, true),
    (3, 1, 100, 0.15, true),
    (4, 1, 250, 0.2, true);

  SELECT setval('warehouse_shipping_rates_id_seq', (SELECT MAX(id) FROM warehouse_shipping_rates));
  SELECT setval('locations_id_seq', (SELECT MAX(id) FROM locations));
  SELECT setval('warehouses_id_seq', (SELECT MAX(id) FROM warehouses));
  SELECT setval('products_id_seq', (SELECT MAX(id) FROM products));
  SELECT setval('stocks_id_seq', (SELECT MAX(id) FROM stocks));
  SELECT setval('promotions_id_seq', (SELECT MAX(id) FROM promotions));
  SELECT setval('promotion_rules_id_seq', (SELECT MAX(id) FROM promotion_rules));
END;
