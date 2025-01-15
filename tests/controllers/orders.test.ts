import { describe, expect, test, jest } from '@jest/globals';
import { expressMock } from '../helpers/express';

import { verify, create } from '../../src/controllers/orders';
import { VerifyParams, Warehouse } from '../../src/types';
import { Request } from 'express';

import { fetchOrderData } from '../../src/services/orders';
jest.mock('../../src/services/orders');

import { calculateOrderSummary, checkOrderValidity } from '../../src/utils/order';
jest.mock('../../src/utils/order');

import { serializeOrder, serializeOrderVerification } from '../../src/serializers/order';
jest.mock('../../src/serializers/order');

import * as dbOrders from '../../src/db/orders';
jest.mock('../../src/db/orders');

const res = expressMock.mockResponse();
const next = expressMock.mockNext();

const mockProduct = { id: 1, name: 'SCOS', created_at: new Date(), updated_at: new Date(), price: 100, weight: 200 };
const mockDiscountRule = { id: 1, promotion_id: 1, min_quantity: 1, max_quantity: 100, discount_value: 0.1, is_active: true, created_at: new Date(), updated_at: new Date() };
const mockWarehouses: Warehouse[] = [
  {
    id: 1,
    name: 'New York',
    rate_id: 1,
    cost_per_kg_km: 0.01,
    stock: 200,
    latitude: 1,
    longitude: 1,
    created_at: new Date(),
    updated_at: new Date()
  }
];
const mockOrder = {
  id: 1,
  location_id: 1,
  order_number: 'ORD-123',
  created_at: new Date(),
  updated_at: new Date()
};
const mockValidation = { isValid: true, totalShippingCost: 50, shipments: [] };
const mockInValidOrder = { isValid: false, totalShippingCost: 50, shipments: [] };
const query = {
  count: '1',
  latitude: '12.12',
  longitude: '23.34',
};
const serializedOrderVerification = {
  meta: { timestamp: new Date().toISOString() },
  data: {
    type: 'orderVerification',
    attributes: {
      isValid: true,
      subtotal: +query.count * mockProduct.price,
      discount: mockDiscountRule.discount_value * (+query.count * mockProduct.price),
      total: +query.count * mockProduct.price - (mockDiscountRule.discount_value * (+query.count * mockProduct.price)),
      quantity: +query.count,
      totalShippingCost: 1,
    },
    relationships: {
      shipments: [],
    },
  },
};

const serializedOrder = {
  meta: { timestamp: new Date().toISOString() },
  data: {
    type: 'orders',
    id: mockOrder.id,
    attributes: {
      order_number: mockOrder.order_number,
      subtotal: +query.count * mockProduct.price,
      discount: mockDiscountRule.discount_value * (+query.count * mockProduct.price),
      total: +query.count * mockProduct.price - (mockDiscountRule.discount_value * (+query.count * mockProduct.price)),
      quantity: +query.count,
      total_shipment_cost: 1,
    },
    relationships: {
      shipments: {
        data: []
      },
    },
  },
};

describe('orders#verify', () => {
  describe('validations', () => {
    test('should validate presence of count', async () => {
      const req = expressMock.mockRequest({
        query: {
          latitude: '12.12',
          longitude: '23.34',
        },
      });

      await verify(req as Request<VerifyParams>, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        errors: [
          {
            status: 400,
            source: { pointer: 'count' },
            title: 'Validation Error',
            detail: '"count" is required',
          },
        ],
      });
    });

    test('should validate presence of latitude', async () => {
      const req = expressMock.mockRequest({
        query: {
          count: '1',
          longitude: '23.34',
        },
      });

      await verify(req as Request<VerifyParams>, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        errors: [
          {
            status: 400,
            source: { pointer: 'latitude' },
            title: 'Validation Error',
            detail: '"latitude" is required',
          },
        ],
      });
    });

    test('should validate presence of longitude', async () => {
      const req = expressMock.mockRequest({
        query: {
          latitude: '12.12',
          count: '2',
        },
      });

      await verify(req as Request<VerifyParams>, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        errors: [
          {
            status: 400,
            source: { pointer: 'longitude' },
            title: 'Validation Error',
            detail: '"longitude" is required',
          },
        ],
      });
    });
  });

  describe('responses', () => {
    test('should return 200 with serialized order data on success', async () => {
      const req = expressMock.mockRequest({ query });

      jest.mocked(fetchOrderData).mockResolvedValue({ product: mockProduct, discountRule: mockDiscountRule, warehouses: mockWarehouses });
      jest.mocked(calculateOrderSummary).mockReturnValue({ subtotal: 500, discount: 50, total: 450 });
      jest.mocked(checkOrderValidity).mockReturnValue(mockValidation);
      jest.mocked(serializeOrderVerification).mockReturnValue(serializedOrderVerification);

      await verify(req as Request<VerifyParams>, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(serializedOrderVerification);
    });
  });
});

describe('orders#create', () => {
  describe('validations', () => {
    test('should validate presence of count', async () => {
      const req = expressMock.mockRequest({
        body: {
          latitude: '12.12',
          longitude: '23.34',
        },
      });

      await create(req as Request<VerifyParams>, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        errors: [
          {
            status: 400,
            source: { pointer: 'count' },
            title: 'Validation Error',
            detail: '"count" is required',
          },
        ],
      });
    });

    test('should validate presence of latitude', async () => {
      const req = expressMock.mockRequest({
        body: {
          count: '1',
          longitude: '23.34',
        },
      });

      await create(req as Request<VerifyParams>, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        errors: [
          {
            status: 400,
            source: { pointer: 'latitude' },
            title: 'Validation Error',
            detail: '"latitude" is required',
          },
        ],
      });
    });

    test('should validate presence of longitude', async () => {
      const req = expressMock.mockRequest({
        body: {
          latitude: '12.12',
          count: '2',
        },
      });

      await create(req as Request<VerifyParams>, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        errors: [
          {
            status: 400,
            source: { pointer: 'longitude' },
            title: 'Validation Error',
            detail: '"longitude" is required',
          },
        ],
      });
    });
  });

  describe('responses', () => {
    test('should return 200 with serialized order data on success', async () => {
      const req = expressMock.mockRequest({ body: query });

      jest.mocked(dbOrders.create).mockResolvedValue(mockOrder);
      jest.mocked(fetchOrderData).mockResolvedValue({ product: mockProduct, discountRule: mockDiscountRule, warehouses: mockWarehouses });
      jest.mocked(calculateOrderSummary).mockReturnValue({ subtotal: 500, discount: 50, total: 450 });
      jest.mocked(checkOrderValidity).mockReturnValue(mockValidation);
      jest.mocked(serializeOrder).mockResolvedValue(serializedOrder);

      await create(req as Request<VerifyParams>, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(serializedOrder);
    });

    test('should return 400 with serialized error data on failure', async () => {
      const req = expressMock.mockRequest({ body: query });

      jest.mocked(dbOrders.create).mockResolvedValue(mockOrder);
      jest.mocked(fetchOrderData).mockResolvedValue({ product: mockProduct, discountRule: mockDiscountRule, warehouses: mockWarehouses });
      jest.mocked(calculateOrderSummary).mockReturnValue({ subtotal: 500, discount: 50, total: 450 });
      jest.mocked(checkOrderValidity).mockReturnValue(mockInValidOrder);
      jest.mocked(serializeOrder).mockResolvedValue(serializedOrder);

      await create(req as Request<VerifyParams>, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        errors: [
          {
            status: 400,
            title: 'Invalid Order',
            detail: 'The provided order details are invalid.',
            source: {
              pointer: ''
            }
          }
        ]
      });
    });
  });
});
