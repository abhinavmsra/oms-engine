import { bool } from 'joi';

export type Product = {
  id: number;
  name: string;
  price: number;
  weight: number;
  created_at: Date;
  updated_at: Date;
};

export type PromotionRule = {
  id: number;
  promotion_id: number;
  min_quantity: number;
  max_quantity: number;
  discount_value: number;
  is_active: bool;
  created_at: Date;
  updated_at: Date;
};

export type WarehouseShippingRate = {
  id: number;
  cost_per_kg_km: number;
  created_at: Date;
};

export type GeoLocation = {
  latitude: number;
  longitude: number;
};

export type Location = {
  id: number;
  created_at: Date;
} & GeoLocation;

export type Warehouse = {
  id: number;
  name: string;
  rate_id: number;
  cost_per_kg_km: number;
  stock: number;
  created_at: Date;
  updated_at: Date;
} & GeoLocation;

export type Stock = {
  id: number;
  warehouse_id: number;
  product_id: number;
  amount: number;
  created_at: Date;
  updated_at: Date;
};

export type Order = {
  id: number;
  location_id: number;
  order_number: string;
  created_at: Date;
  updated_at: Date;
};

export type OrderItem = {
  id: number;
  product_id: number;
  location_id: number;
  order_id: number;
  quantity: number;
  subtotal: number;
  total: number;
  created_at: Date;
  updated_at: Date;
};

export type UserOrder = {
  subtotal: number;
  total: number;
  quantity: number;
  weightPerUnit: number; // in gms
} & GeoLocation;

export type UserShipment = {
  origin: GeoLocation;
  destination: GeoLocation;
  quantity: number;
  weightPerUnit: number; // in gms
  ratePerKgPerKm: number;
};

export type Shipment = {
  id: number;
  quantity: number;
  total_shipment_cost: number;
  order_item_id: number;
  warehouse_id: number;
  warehouse_shipping_rate_id: number;
  created_at: Date;
  updated_at: Date;
};

export type ShipmentBreakdown = {
  warehouseId: number;
  warehouseName: string;
  rateId: number;
  rate: number;
  quantity: number;
  cost: number;
};

export type OrderValidity = {
  isValid: boolean;
  totalShippingCost: number;
  shipments: ShipmentBreakdown[];
};

export type VerifyParams = {
  count: string;
  latitude: string;
  longitude: string;
};

export type OrderSummary = {
  subtotal: number;
  total: number;
  quantity: number;
};

export type OrderSummaryWithShipments = OrderSummary & {
  shipments: OrderSummaryShipmentItem[];
};

export type OrderSummaryShipmentItem = {
  id: number;
  total_shipment_cost: number;
  quantity: number;
  warehouse_name: string;
  cost_per_kg_km: number;
};
