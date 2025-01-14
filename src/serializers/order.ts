import { query } from '../db/db';
import { Order, OrderValidity, UserOrder } from '../types';

export const serializeOrderVerification = (userOrder: UserOrder, validity: OrderValidity) => ({
  meta: { timestamp: new Date().toISOString() },
  data: {
    type: 'orderVerification',
    attributes: {
      isValid: validity.isValid,
      subtotal: userOrder.subtotal,
      discount: userOrder.subtotal - userOrder.total,
      total: userOrder.total,
      quantity: userOrder.quantity,
      totalShippingCost: validity.totalShippingCost || 0,
    },
    relationships: {
      shipments: validity.isValid
        ? validity.shipments.map(shipment => ({
            cost_per_kg_km: shipment.rate,
            total_shipment_cost: shipment.cost,
            quantity: shipment.quantity,
            warehouse: shipment.warehouseName,
          }))
        : [],
    },
  },
});

export const serializeOrder = async (order: Order) => {
  const orderItemSQL = `
    SELECT
      order_items.subtotal
    FROM order_items
    LEFT JOIN promotion_rules ON order_items.promotion_rule_id = promotion_rules.id
    INNER JOIN shipments ON order_items.id = shipments.order_item_id
    WHERE order_id = $1
  `;
  const orderItemRecords = await query(orderItemSQL, [order.id]);
  const { subtotal, total, quantity, discount, total_shipment_cost } = orderItemRecords.rows[0];

  const shipmentsResults = `
    SELECT
      shipments.id,
      shipments.total_shipment_cost,
      shipments.quantity,
      warehouses.name as warehouse_name,
      warehouse_shipping_rates.cost_per_kg_km
    FROM shipments
    INNER JOIN order_items ON shipments.order_item_id = order_items.id
    INNER JOIN orders ON orders.id = order_items.order_id
    INNER JOIN warehouses on warehouses.id = shipments.warehouse_id
    INNER JOIN warehouse_shipping_rates ON warehouse_shipping_rates.id = shipments.warehouse_shipping_rate_id
    WHERE orders.id = $1
  `;
  const shipmentResult = await query(shipmentsResults, [order.id]);
  const shipments = shipmentResult.rows;

  return {
    data: {
      type: 'order',
      id: order.id,
      attributes: {
        order_number: order.order_number,
        subtotal,
        discount,
        total,
        quantity,
        total_shipment_cost,
      },
      relationships: {
        shipments: {
          data: shipments.map((shipment) => {
            return {
              type: 'shipments',
              id: shipment.id,
              attributes: {
                cost_per_kg_km: shipment.cost_per_kg_km,
                total_shipment_cost: shipment.total_shipment_cost,
                quantity: shipment.quantity,
                warehouse: shipment.warehouse_name,
              },
            };
          }),
        },
      },
    },
  };
};
