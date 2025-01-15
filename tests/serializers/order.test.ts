import { jest, describe, expect, test } from '@jest/globals';

import { serializeOrderVerification, serializeOrder } from '../../src/serializers/order';
import { Order, UserOrder } from '../../src/types';

const ISO_DATE_FORMAT = /^\d{4}-\d{2}-\d{2}T\d{2}:/;

import { fetchOrderSummary } from '../../src/db/orders';
jest.mock('../../src/db/orders');

const createUserOrder = (): UserOrder => ({
  subtotal: 1000,
  total: 900,
  quantity: 5,
  weightPerUnit: 2000,
  latitude: 40.7128,
  longitude: -74.0060,
});

const createValidOrder = (totalShippingCost = 100) => ({
  isValid: true,
  totalShippingCost,
  shipments: [
    {
      warehouseId: 1,
      warehouseName: 'Warehouse A',
      rateId: 101,
      rate: 0.01,
      quantity: 5,
      cost: 100,
    },
  ],
});

const createInvalidOrder = (totalShippingCost = 100) => ({
  isValid: false,
  totalShippingCost,
  shipments: [],
});

describe('serializeOrderVerification', () => {
  test('should return a valid JSON:API compliant response for a valid order', () => {
    const mockOrder = createUserOrder();
    const mockValidity = createValidOrder();
    const result = serializeOrderVerification(mockOrder, mockValidity);

    expect(result.meta).toBeDefined();
    expect(result.meta.timestamp).toMatch(ISO_DATE_FORMAT);
    expect(result.data.type).toBe('orderVerification');
    expect(result.data.attributes.isValid).toBe(true);
    expect(result.data.attributes.subtotal).toBe(mockOrder.subtotal);
    expect(result.data.attributes.discount).toBe(mockOrder.subtotal - mockOrder.total);
    expect(result.data.attributes.total).toBe(mockOrder.total);
    expect(result.data.attributes.quantity).toBe(mockOrder.quantity);
    expect(result.data.attributes.totalShippingCost).toBe(mockValidity.totalShippingCost);

    expect(result.data.relationships.shipments.length).toBe(1);
    expect(result.data.relationships.shipments[0]).toMatchObject({
      cost_per_kg_km: mockValidity.shipments[0].rate,
      total_shipment_cost: mockValidity.shipments[0].cost,
      quantity: mockValidity.shipments[0].quantity,
      warehouse: mockValidity.shipments[0].warehouseName,
    });
  });

  test('should return an empty shipments array when order is invalid', () => {
    const mockOrder = createUserOrder();
    const invalidValidity = createInvalidOrder();
    const result = serializeOrderVerification(mockOrder, invalidValidity);

    expect(result.data.attributes.isValid).toBe(false);
    expect(result.data.relationships.shipments).toEqual([]);
  });

  test('should correctly calculate discount', () => {
    const mockOrder = createUserOrder();
    const mockValidity = createValidOrder();
    const result = serializeOrderVerification(mockOrder, mockValidity);

    expect(result.data.attributes.discount).toBe(mockOrder.subtotal - mockOrder.total);
  });
});

describe('serializeOrder', () => {
  test('should serialize order data correctly with shipments', async () => {
    const mockOrder: Order = {
      id: 1,
      location_id: 1,
      order_number: 'ORD12345',
      created_at: new Date(),
      updated_at: new Date(),
    };

    const mockOrderSummary = {
      subtotal: 1000,
      total: 900,
      quantity: 5,
      shipments: [
        {
          id: 1,
          cost_per_kg_km: 0.01,
          total_shipment_cost: 100,
          quantity: 3,
          warehouse_name: 'Warehouse A',
        },
        {
          id: 2,
          cost_per_kg_km: 0.02,
          total_shipment_cost: 200,
          quantity: 2,
          warehouse_name: 'Warehouse B',
        },
      ],
    };

    jest.mocked(fetchOrderSummary).mockResolvedValue(mockOrderSummary);

    const response = await serializeOrder(mockOrder);
    expect(response).toMatchObject({
      data: {
        type: 'orders',
        id: mockOrder.id,
        attributes: {
          order_number: mockOrder.order_number,
          subtotal: mockOrderSummary.subtotal,
          discount: mockOrderSummary.subtotal - mockOrderSummary.total,
          total: mockOrderSummary.total,
          quantity: mockOrderSummary.quantity,
          total_shipment_cost: 300,
        },
        relationships: {
          shipments: {
            data: [
              {
                type: 'shipments',
                id: 1,
                attributes: {
                  cost_per_kg_km: 0.01,
                  total_shipment_cost: 100,
                  quantity: 3,
                  warehouse: 'Warehouse A',
                },
              },
              {
                type: 'shipments',
                id: 2,
                attributes: {
                  cost_per_kg_km: 0.02,
                  total_shipment_cost: 200,
                  quantity: 2,
                  warehouse: 'Warehouse B',
                },
              },
            ],
          },
        },
      },
    });
  });
});
