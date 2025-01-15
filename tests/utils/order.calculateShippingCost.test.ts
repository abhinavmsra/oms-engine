// Mock the haversine library
jest.mock('haversine', () => {
  return jest.fn(() => 100); // Always return a mock distance of 100 km
});

import { describe, expect, test, jest } from '@jest/globals';
import { calculateShippingCost, calculateOrderSummary } from '../../src/utils/order';

describe('calculateShippingCost', () => {
  test('should calculate the shipping cost correctly', () => {
    const shipment = {
      destination: { latitude: 40.7128, longitude: -74.006 },
      origin: { latitude: 34.0522, longitude: -118.2437 },
      quantity: 10,
      weightPerUnit: 2_000, // in grams
      ratePerKgPerKm: 0.01,
    };
    const result = calculateShippingCost(shipment);

    expect(result).toEqual(20);
  });

  test('should return zero cost for zero quantity', () => {
    const shipment = {
      destination: { latitude: 40.7128, longitude: -74.006 },
      origin: { latitude: 34.0522, longitude: -118.2437 },
      quantity: 0,
      weightPerUnit: 2_000, // in grams
      ratePerKgPerKm: 0.01,
    };

    const result = calculateShippingCost(shipment);
    expect(result).toBe(0);
  });

  test('should return zero cost for zero weight per unit', () => {
    const shipment = {
      destination: { latitude: 40.7128, longitude: -74.006 },
      origin: { latitude: 34.0522, longitude: -118.2437 },
      quantity: 10,
      weightPerUnit: 0, // in grams
      ratePerKgPerKm: 0.01,
    };
    const result = calculateShippingCost(shipment);
    expect(result).toBe(0);
  });

  test('should return zero cost for zero rate per kg per km', () => {
    const shipment = {
      destination: { latitude: 40.7128, longitude: -74.006 },
      origin: { latitude: 34.0522, longitude: -118.2437 },
      quantity: 10,
      weightPerUnit: 2_000, // in grams
      ratePerKgPerKm: 0,
    };
    const result = calculateShippingCost(shipment);
    expect(result).toBe(0);
  });
});

describe('calculateOrderSummary', () => {
  test('should calculate subtotal, discount, and total correctly with discount', () => {
    const count = 5;
    const price = 100;
    const discountValue = 0.1;

    const result = calculateOrderSummary(count, price, discountValue);

    expect(result).toEqual({
      subtotal: 500, // 5 * 100
      discount: 50, // 500 * 0.1
      total: 450, // 500 - 50
    });
  });

  test('should calculate subtotal and total correctly without discount', () => {
    const count = 5;
    const price = 100;

    const result = calculateOrderSummary(count, price);

    expect(result).toEqual({
      subtotal: 500, // 5 * 100
      discount: 0, // No discount applied
      total: 500, // Subtotal - Discount
    });
  });

  test('should handle zero count correctly', () => {
    const count = 0;
    const price = 100;
    const discountValue = 0.1;

    const result = calculateOrderSummary(count, price, discountValue);

    expect(result).toEqual({
      subtotal: 0, // 0 * 100
      discount: 0, // No discount since subtotal is 0
      total: 0, // 0 - 0
    });
  });

  test('should handle zero price correctly', () => {
    const count = 5;
    const price = 0;
    const discountValue = 0.1;

    const result = calculateOrderSummary(count, price, discountValue);

    expect(result).toEqual({
      subtotal: 0, // 5 * 0
      discount: 0, // No discount since subtotal is 0
      total: 0, // 0 - 0
    });
  });

  test('should handle zero discount value correctly', () => {
    const count = 5;
    const price = 100;
    const discountValue = 0;

    const result = calculateOrderSummary(count, price, discountValue);

    expect(result).toEqual({
      subtotal: 500, // 5 * 100
      discount: 0, // 0% discount
      total: 500, // 500 - 0
    });
  });
});
