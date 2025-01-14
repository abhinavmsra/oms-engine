import { Request, Response, NextFunction } from 'express';
import { jest } from '@jest/globals';

export const expressMock = {
  mockRequest: (overrides: Partial<Request> = {}): Request => {
    const req: Partial<Request> = {
      body: {},
      params: {},
      query: {},
      headers: {},
      ...overrides,
    };
    return req as Request;
  },

  /* eslint-disable @typescript-eslint/no-explicit-any */
  mockResponse: (overrides: Partial<Response> = {}): Response => {
    const res: Partial<Response> = {
      status: jest.fn().mockReturnThis() as jest.MockedFunction<(code: number) => Response>,
      send: jest.fn().mockReturnThis() as jest.MockedFunction<(body?: any) => Response>,
      json: jest.fn().mockReturnThis() as jest.MockedFunction<(body?: any) => Response>,
      set: jest.fn().mockReturnThis() as jest.MockedFunction<(field: any, value?: any) => Response>,
      cookie: jest.fn().mockReturnThis() as jest.MockedFunction<(name: string, val: any, options?: any) => Response>,
      setHeader: jest.fn().mockReturnThis() as jest.MockedFunction<(name: string, value: any) => Response>,
      ...overrides,
    };
    return res as Response;
  },
  /* eslint-enable @typescript-eslint/no-explicit-any */

  mockNext: (): NextFunction => {
    return jest.fn();
  },
};

export default expressMock;
