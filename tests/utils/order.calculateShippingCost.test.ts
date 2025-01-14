// Mock the haversine library
jest.mock('haversine', () => {
  return jest.fn(() => 100); // Always return a mock distance of 100 km
});

import { describe, expect, test, jest } from '@jest/globals';
import { calculateShippingCost } from '../../src/utils/order';

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
