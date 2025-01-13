import { Request, Response, NextFunction } from 'express';
import { jest } from '@jest/globals';

/**
 * Type-safe mockRequest for Express
 */
export const expressMock = {
    /**
     * Mock Express Request Object
     * @param overrides - Partial request properties to override default behavior
     */
    mockRequest: (overrides: Partial<Request> = {}): Request => {
        const req: Partial<Request> = {
            body: {},
            params: {},
            query: {},
            headers: {},
            ...overrides
        };
        return req as Request;
    },

    /**
     * Mock Express Response Object with Jest Spy Methods
     * @param overrides - Partial response properties to override default behavior
     */
    mockResponse: (overrides: Partial<Response> = {}): Response => {
        const res: Partial<Response> = {
            status: jest.fn().mockReturnThis() as jest.MockedFunction<(code: number) => Response>,
            send: jest.fn().mockReturnThis() as jest.MockedFunction<(body?: any) => Response>,
            json: jest.fn().mockReturnThis() as jest.MockedFunction<(body?: any) => Response>,
            set: jest.fn().mockReturnThis() as jest.MockedFunction<(field: any, value?: any) => Response>,
            cookie: jest.fn().mockReturnThis() as jest.MockedFunction<(name: string, val: any, options?: any) => Response>,
            setHeader: jest.fn().mockReturnThis() as jest.MockedFunction<(name: string, value: any) => Response>,
            ...overrides
        };
        return res as Response;
    },

    /**
     * Mock Express Next Function
     */
    mockNext: (): NextFunction => {
        return jest.fn();
    }
};

export default expressMock;
