import { fetchOrderSummary } from '../db/orders';
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
      totalShippingCost: validity.totalShippingCost,
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
  const orderSummary = await fetchOrderSummary(order.id);
  const total_shipment_cost = orderSummary.shipments.reduce(
    (acc, shipment) => { return acc + +shipment.total_shipment_cost; },
    0,
  );

  return {
    data: {
      type: 'order',
      id: order.id,
      attributes: {
        order_number: order.order_number,
        subtotal: +orderSummary.subtotal,
        discount: (+orderSummary.subtotal) - (+orderSummary.total),
        total: +orderSummary.total,
        quantity: +orderSummary.quantity,
        total_shipment_cost,
      },
      relationships: {
        shipments: {
          data: orderSummary.shipments.map((shipment) => {
            return {
              type: 'shipments',
              id: shipment.id,
              attributes: {
                cost_per_kg_km: +shipment.cost_per_kg_km,
                total_shipment_cost: +shipment.total_shipment_cost,
                quantity: +shipment.quantity,
                warehouse: shipment.warehouse_name,
              },
            };
          }),
        },
      },
    },
  };
};
