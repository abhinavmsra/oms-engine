import { Warehouse } from '../types';
import { query } from './db';

export const findAll = async (): Promise<Warehouse[]> => {
  const rawQuery = `
    SELECT
      warehouses.id,
      warehouses.name,
      locations.latitude,
      locations.longitude,
      warehouse_shipping_rates.cost_per_kg_km,
      stocks.amount AS stock
    FROM warehouses
    INNER JOIN locations ON warehouses.location_id = locations.id
    INNER JOIN warehouse_shipping_rates ON warehouses.warehouse_shipping_rate_id = warehouse_shipping_rates.id
    INNER JOIN stocks ON warehouses.id = stocks.warehouse_id AND stocks.product_id = 1
  `;

  const result = await query(rawQuery, []);
  return result.rows as Warehouse[];
};
