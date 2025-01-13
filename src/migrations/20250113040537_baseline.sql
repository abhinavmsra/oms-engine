BEGIN;

  CREATE TABLE IF NOT EXISTS public.products
  (
      id serial NOT NULL,
      name character varying NOT NULL,
      price numeric NOT NULL DEFAULT 0,
      weight numeric NOT NULL DEFAULT 0,
      created_at timestamp without time zone NOT NULL DEFAULT NOW(),
      updated_at timestamp without time zone NOT NULL DEFAULT NOW(),
      CONSTRAINT products_primary_key PRIMARY KEY (id),
      CONSTRAINT products_name_unique UNIQUE (name)
  );

  CREATE TABLE IF NOT EXISTS public.promotions
  (
      id serial NOT NULL,
      name character varying NOT NULL,
      promotion_type integer,
      description text,
      start_date timestamp without time zone,
      end_date timestamp without time zone,
      is_active boolean NOT NULL DEFAULT false,
      created_at timestamp without time zone NOT NULL DEFAULT NOW(),
      updated_at timestamp without time zone DEFAULT NOW(),
      PRIMARY KEY (id),
      CONSTRAINT promotions_name_unique UNIQUE (name)
  );

  CREATE TABLE IF NOT EXISTS public.promotion_rules
  (
      id serial NOT NULL,
      promotion_id integer NOT NULL,
      min_quantity numeric DEFAULT 0,
      max_quantity numeric DEFAULT 0,
      discount_value numeric NOT NULL DEFAULT 0,
      code character varying,
      created_at timestamp without time zone NOT NULL DEFAULT NOW(),
      updated_at timestamp without time zone NOT NULL DEFAULT NOW(),
      is_active boolean NOT NULL DEFAULT false,
      PRIMARY KEY (id)
  );

  CREATE TABLE IF NOT EXISTS public.locations
  (
      id serial NOT NULL,
      lattitude double precision NOT NULL,
      longitude double precision NOT NULL,
      created_at timestamp without time zone NOT NULL DEFAULT NOW(),
      PRIMARY KEY (id),
      UNIQUE (lattitude, longitude)
  );

  CREATE TABLE IF NOT EXISTS public.warehouse_shipping_rates
  (
      id serial NOT NULL,
      cost_per_kg_km numeric NOT NULL DEFAULT 0.01,
      created_at timestamp without time zone NOT NULL DEFAULT NOW(),
      PRIMARY KEY (id)
  );

  CREATE TABLE IF NOT EXISTS public.warehouses
  (
      id serial NOT NULL,
      location_id integer NOT NULL,
      name character varying NOT NULL,
      created_at timestamp without time zone NOT NULL DEFAULT NOW(),
      updated_at timestamp without time zone NOT NULL DEFAULT NOW(),
      warehouse_shipping_rate_id integer NOT NULL,
      PRIMARY KEY (id),
      CONSTRAINT warehouses_name_unique UNIQUE (name)
          INCLUDE(name)
  );

  CREATE TABLE IF NOT EXISTS public.stocks
  (
      id serial NOT NULL,
      warehouse_id integer NOT NULL,
      product_id integer NOT NULL,
      amount integer NOT NULL DEFAULT 0,
      created_at timestamp without time zone NOT NULL DEFAULT NOW(),
      updated_at timestamp without time zone NOT NULL DEFAULT NOW(),
      PRIMARY KEY (id),
      UNIQUE (warehouse_id, product_id)
  );

  CREATE TABLE IF NOT EXISTS public.orders
  (
      id serial NOT NULL,
      created_at timestamp without time zone NOT NULL DEFAULT NOW(),
      updated_at timestamp without time zone NOT NULL DEFAULT NOW(),
      location_id integer NOT NULL,
      PRIMARY KEY (id)
  );

  CREATE TABLE IF NOT EXISTS public.order_items
  (
      id integer NOT NULL,
      created_at timestamp without time zone NOT NULL DEFAULT NOW(),
      updated_at timestamp without time zone NOT NULL DEFAULT NOW(),
      product_id integer NOT NULL,
      quantity integer NOT NULL DEFAULT 1,
      order_id integer NOT NULL,
      subtotal numeric NOT NULL DEFAULT 0,
      promotion_rule_id integer,
      total numeric NOT NULL DEFAULT 0,
      PRIMARY KEY (id),
      UNIQUE (order_id, product_id)
  );

  CREATE TABLE IF NOT EXISTS public.shipments
  (
      id serial NOT NULL,
      order_item_id integer NOT NULL,
      warehouse_id integer,
      total_shipment_cost numeric NOT NULL DEFAULT 0,
      created_at timestamp without time zone NOT NULL DEFAULT NOW(),
      updated_at timestamp without time zone NOT NULL DEFAULT NOW(),
      quantity integer NOT NULL DEFAULT 0,
      warehouse_shipping_rate_id integer NOT NULL,
      PRIMARY KEY (id),
      UNIQUE (warehouse_id, order_item_id)
  );

  ALTER TABLE IF EXISTS public.promotion_rules
      ADD CONSTRAINT promotion_rules_references_promotions FOREIGN KEY (promotion_id)
      REFERENCES public.promotions (id) MATCH SIMPLE
      ON UPDATE NO ACTION
      ON DELETE CASCADE
      NOT VALID;


  ALTER TABLE IF EXISTS public.warehouses
      ADD CONSTRAINT warehouses_references_locations FOREIGN KEY (location_id)
      REFERENCES public.locations (id) MATCH SIMPLE
      ON UPDATE NO ACTION
      ON DELETE NO ACTION
      NOT VALID;


  ALTER TABLE IF EXISTS public.warehouses
      ADD CONSTRAINT warehouses_references_warehouse_shipping_rates FOREIGN KEY (warehouse_shipping_rate_id)
      REFERENCES public.warehouse_shipping_rates (id) MATCH SIMPLE
      ON UPDATE NO ACTION
      ON DELETE NO ACTION
      NOT VALID;


  ALTER TABLE IF EXISTS public.stocks
      ADD CONSTRAINT warehouse_stocks_references_products FOREIGN KEY (product_id)
      REFERENCES public.products (id) MATCH SIMPLE
      ON UPDATE NO ACTION
      ON DELETE NO ACTION
      NOT VALID;


  ALTER TABLE IF EXISTS public.stocks
      ADD CONSTRAINT warehouse_stocks_references_warehouses FOREIGN KEY (warehouse_id)
      REFERENCES public.warehouses (id) MATCH SIMPLE
      ON UPDATE NO ACTION
      ON DELETE NO ACTION
      NOT VALID;


  ALTER TABLE IF EXISTS public.orders
      ADD CONSTRAINT orders_references_locations FOREIGN KEY (location_id)
      REFERENCES public.locations (id) MATCH SIMPLE
      ON UPDATE NO ACTION
      ON DELETE NO ACTION
      NOT VALID;


  ALTER TABLE IF EXISTS public.order_items
      ADD CONSTRAINT order_items_references_products FOREIGN KEY (product_id)
      REFERENCES public.products (id) MATCH SIMPLE
      ON UPDATE NO ACTION
      ON DELETE NO ACTION
      NOT VALID;


  ALTER TABLE IF EXISTS public.order_items
      ADD CONSTRAINT order_items_references_orders FOREIGN KEY (order_id)
      REFERENCES public.orders (id) MATCH SIMPLE
      ON UPDATE NO ACTION
      ON DELETE NO ACTION
      NOT VALID;


  ALTER TABLE IF EXISTS public.order_items
      ADD CONSTRAINT order_items_references_promotion_rules FOREIGN KEY (promotion_rule_id)
      REFERENCES public.promotion_rules (id) MATCH SIMPLE
      ON UPDATE NO ACTION
      ON DELETE NO ACTION
      NOT VALID;


  ALTER TABLE IF EXISTS public.shipments
      ADD CONSTRAINT shipments_references_order_items FOREIGN KEY (order_item_id)
      REFERENCES public.order_items (id) MATCH SIMPLE
      ON UPDATE NO ACTION
      ON DELETE NO ACTION
      NOT VALID;


  ALTER TABLE IF EXISTS public.shipments
      ADD CONSTRAINT shipments_references_warehouses FOREIGN KEY (warehouse_id)
      REFERENCES public.warehouses (id) MATCH SIMPLE
      ON UPDATE NO ACTION
      ON DELETE NO ACTION
      NOT VALID;


  ALTER TABLE IF EXISTS public.shipments
      ADD CONSTRAINT shipments_references_warehouse_shipping_rates FOREIGN KEY (warehouse_shipping_rate_id)
      REFERENCES public.warehouse_shipping_rates (id) MATCH SIMPLE
      ON UPDATE NO ACTION
      ON DELETE NO ACTION
      NOT VALID;

END;
