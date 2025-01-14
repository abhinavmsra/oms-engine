import { PoolClient, QueryResult } from 'pg';
import { Order, OrderItem, PromotionRule, Shipment, ShipmentBreakdown, UserOrder } from '../types';
import { query, runTransaction } from './db';

import * as dbLocation from './locations';

export const create = async (userOrder: UserOrder, promotionRule: PromotionRule | null, shipments: ShipmentBreakdown[]): Promise<Order> => {
  const orderRecord = await runTransaction(async (client: PoolClient): Promise<QueryResult<Order>> => {
    const location = await dbLocation.findOrInsert(userOrder.latitude, userOrder.longitude, client);

    const orderRecord: QueryResult<Order> = await client.query('INSERT INTO orders (location_id) VALUES ($1) RETURNING *', [location.id]);
    const order = orderRecord.rows[0];

    const orderItemRecord: QueryResult<OrderItem> = await client.query(
      'INSERT INTO order_items (product_id, quantity, order_id, subtotal, promotion_rule_id, total) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [
        1,
        userOrder.quantity,
        order.id,
        userOrder.subtotal,
        promotionRule?.id,
        userOrder.total,
      ],
    );
    const orderItem = orderItemRecord.rows[0];

    await Promise.all(
      shipments.map(async (shipment): Promise<Shipment> => {
        const result: QueryResult<Shipment> = await client.query(
          'INSERT INTO shipments (order_item_id, warehouse_id, total_shipment_cost, quantity, warehouse_shipping_rate_id) VALUES ($1, $2, $3, $4, $5)',
          [
            orderItem.id,
            shipment.warehouseId,
            shipment.cost,
            shipment.quantity,
            shipment.rateId,
          ],
        );

        return result.rows[0];
      }),
    );

    // update stock
    await Promise.all(
      shipments.map(async (shipment): Promise<void> => {
        await client.query(
          'UPDATE stocks SET amount = amount - $1 WHERE warehouse_id = $2 AND product_id = $3',
          [
            shipment.quantity,
            shipment.warehouseId,
            1,
          ],
        );
      }),
    );

    return orderRecord;
  });

  return orderRecord.rows[0];
};

export const findByID = async (id: number): Promise<Order> => {
  const rawSQL = 'SELECT * FROM orders WHERE id = $1';
  const result: QueryResult<Order> = await query(rawSQL, [id]);
  return result.rows[0];
};
