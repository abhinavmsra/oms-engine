import haversine from 'haversine';
import { OrderValidity, ShipmentBreakdown, UserOrder, UserShipment, Warehouse } from '../types';

const MAX_SHIPPING_COST_THRESHOLD = 0.15;

export const calculateShippingCost = (shipment: UserShipment): number => {
  const distance = haversine(shipment.destination, shipment.origin, { unit: 'km' });
  return shipment.quantity * (shipment.weightPerUnit / 1_000) * Math.abs(distance) * shipment.ratePerKgPerKm;
};

export const checkOrderValidity = (order: UserOrder, warehouses: Warehouse[]): OrderValidity => {
  if (order.quantity === 0) {
    return { isValid: false, totalShippingCost: 0, shipments: [] };
  }

  const destination = { latitude: order.latitude, longitude: order.longitude };
  const shipments: ShipmentBreakdown[] = [];
  let remainingQuantity = order.quantity;
  let totalShippingCost = 0;

  const sortedWarehouses = warehouses.sort((a, b) => {
    const distA = haversine(destination, { latitude: a.latitude, longitude: a.longitude }, { unit: 'km' });
    const distB = haversine(destination, { latitude: b.latitude, longitude: b.longitude }, { unit: 'km' });
    return distA - distB;
  });

  for (const warehouse of sortedWarehouses) {
    if (remainingQuantity <= 0) {
      break;
    }

    const origin = { latitude: warehouse.latitude, longitude: warehouse.longitude };
    const quantity = Math.min(warehouse.stock, remainingQuantity);
    if (quantity <= 0) {
      continue;
    }

    const shipment: UserShipment = {
      origin,
      destination,
      quantity,
      weightPerUnit: order.weightPerUnit,
      ratePerKgPerKm: warehouse.cost_per_kg_km,
    };

    const shippingCost = calculateShippingCost(shipment);
    shipments.push({
      warehouseId: warehouse.id,
      warehouseName: warehouse.name,
      rateId: warehouse.rate_id,
      rate: warehouse.cost_per_kg_km,
      quantity,
      cost: shippingCost,
    });
    totalShippingCost += shippingCost;
    remainingQuantity -= quantity;
  }

  // If there is still unfulfilled quantity, the order is invalid
  if (remainingQuantity > 0) {
    return { isValid: false, totalShippingCost: 0, shipments: [] };
  }

  const maxAllowedShippingCost = order.total * MAX_SHIPPING_COST_THRESHOLD;
  return { isValid: totalShippingCost <= maxAllowedShippingCost, totalShippingCost, shipments };
};
