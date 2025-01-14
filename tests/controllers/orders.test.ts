import { describe, expect, test } from '@jest/globals';
import { expressMock } from '../helpers/express';

import { verify } from '../../src/controllers/orders';
import { VerifyParams } from '../../src/types';
import { Request } from 'express';

describe('orders#verify', () => {
  describe('validations', () => {
    test('should validate presence of count', async () => {
      const req = expressMock.mockRequest({
        query: {
          latitude: '12.12',
          longitude: '23.34',
        },
      });
      const res = expressMock.mockResponse();

      await verify(req as Request<VerifyParams>, res);
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
      const res = expressMock.mockResponse();

      await verify(req as Request<VerifyParams>, res);
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
      const res = expressMock.mockResponse();

      await verify(req as Request<VerifyParams>, res);
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
});
