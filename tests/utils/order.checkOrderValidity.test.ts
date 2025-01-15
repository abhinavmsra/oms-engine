import { describe, expect, test } from '@jest/globals';
import { checkOrderValidity } from '../../src/utils/order';
import { OrderValidity, UserOrder, Warehouse } from '../../src/types';

describe('checkOrderValidity', () => {
  const warehouses: Warehouse[] = [
    {
      id: 1,
      name: 'Los Angeles',
      cost_per_kg_km: 0.01,
      stock: 30,
      latitude: 33.9425,
      longitude: -118.408056,
      rate_id: 1,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 2,
      name: 'New York',
      cost_per_kg_km: 0.01,
      stock: 50,
      latitude: 40.639722,
      longitude: -73.778889,
      rate_id: 1,
      created_at: new Date(),
      updated_at: new Date()
    },
  ];

  test('should return valid order when shipping cost is below threshold and stock is sufficient', () => {
    const order: UserOrder = {
      subtotal: 1000,
      total: 900,
      quantity: 50,
      weightPerUnit: 2000, // in grams
      latitude: 40.7128,
      longitude: -74.006,
    };
    const result: OrderValidity = checkOrderValidity(order, warehouses);

    expect(result.isValid).toBe(true);
    expect(result.totalShippingCost).toBe(20.804944855875842);
  });

  test('should return invalid order when stock is insufficient', () => {
    const order: UserOrder = {
      subtotal: 1000,
      total: 900,
      quantity: 100, // insufficient stock
      weightPerUnit: 2000, // in grams
      latitude: 40.7128,
      longitude: -74.006,
    };
    const result: OrderValidity = checkOrderValidity(order, warehouses);

    expect(result.isValid).toBe(false);
    expect(result.totalShippingCost).toBe(0);
  });

  test('should return invalid order when shipping cost exceeds threshold', () => {
    const order: UserOrder = {
      subtotal: 1000,
      total: 900,
      quantity: 52,
      weightPerUnit: 2000, // in grams
      latitude: 40.7128,
      longitude: -74.006,
    };
    const result: OrderValidity = checkOrderValidity(order, warehouses);

    expect(result.isValid).toBe(false);
    expect(result.totalShippingCost).toBe(178.98746536877914);
  });

  test('should return invalid order if quantity is zero', () => {
    const order: UserOrder = {
      subtotal: 1000,
      total: 900,
      quantity: 0,
      weightPerUnit: 2000, // in grams
      latitude: 40.7128,
      longitude: -74.006,
    };

    const result: OrderValidity = checkOrderValidity(order, warehouses);

    expect(result.isValid).toBe(false);
    expect(result.totalShippingCost).toBe(0);
  });

  test('should handle empty warehouse list gracefully', () => {
    const order: UserOrder = {
      subtotal: 1000,
      total: 900,
      quantity: 50,
      weightPerUnit: 2000, // in grams
      latitude: 40.7128,
      longitude: -74.006,
    };

    const result: OrderValidity = checkOrderValidity(order, []);

    expect(result.isValid).toBe(false);
    expect(result.totalShippingCost).toBe(0);
  });

  test('should not fulfill from warehouses with zero stock', () => {
    const order: UserOrder = {
      subtotal: 1000,
      total: 900,
      quantity: 50,
      weightPerUnit: 2000, // in grams
      latitude: 40.7128,
      longitude: -74.006,
    };
    const warehouses = [
      {
        id: 1,
        name: 'Los Angeles',
        cost_per_kg_km: 0.01,
        stock: 0,
        latitude: 33.9425,
        longitude: -118.408056,
        rate_id: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 2,
        name: 'New York',
        cost_per_kg_km: 0.01,
        stock: 0,
        latitude: 40.639722,
        longitude: -73.778889,
        rate_id: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
    ];

    const result: OrderValidity = checkOrderValidity(order, warehouses);

    expect(result.isValid).toBe(false);
    expect(result.totalShippingCost).toBe(0);
  });
});
