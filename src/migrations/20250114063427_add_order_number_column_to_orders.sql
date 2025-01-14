ALTER TABLE
  orders
ADD COLUMN IF NOT EXISTS
  order_number UUID
NOT NULL
DEFAULT gen_random_uuid()
UNIQUE;
