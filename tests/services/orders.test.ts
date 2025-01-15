import { jest, describe, expect, test } from '@jest/globals';

import { fetchOrderData } from '../../src/services/orders';

import { findByID } from '../../src/db/products';
jest.mock('../../src/db/products');

import { findByNearestMinQty } from '../../src/db/promotionRules';
jest.mock('../../src/db/promotionRules');

import { findAll } from '../../src/db/warehouses';
jest.mock('../../src/db/warehouses');

describe('fetchOrderData', () => {
  test('should fetch product, discount rule, and warehouses successfully', async () => {
    const mockedProduct = {
      id: 1,
      name: 'SCOS',
      price: 150,
      weight: 100,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const mockedDiscountRule = {
      id: 1,
      promotion_id: 1,
      min_quantity: 10,
      max_quantity: 0,
      discount_value: 0.01,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const mockedWarehouses = [
      {
        id: 1,
        name: 'New York',
        rate_id: 1,
        cost_per_kg_km: 0.01,
        stock: 100,
        latitude: 12.34,
        longitude: 12.34,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    jest.mocked(findByID).mockResolvedValue(mockedProduct);
    jest.mocked(findByNearestMinQty).mockResolvedValue(mockedDiscountRule);
    jest.mocked(findAll).mockResolvedValue(mockedWarehouses);

    const result = await fetchOrderData(1);

    expect(result).toEqual({
      product: mockedProduct,
      discountRule: mockedDiscountRule,
      warehouses: mockedWarehouses,
    });

    expect(findByID).toHaveBeenCalledWith(1);
    expect(findByNearestMinQty).toHaveBeenCalledWith(1);
    expect(findAll).toHaveBeenCalledTimes(1);
  });
});
