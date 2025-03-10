import { Request, Response } from 'express';
import Joi from 'joi';
import * as dbOrders from '../db/orders';
import { UserOrder, VerifyParams } from '../types';
import { calculateOrderSummary, checkOrderValidity } from '../utils/order';
import { fetchOrderData } from '../services/orders';
import { serializeOrder, serializeOrderVerification } from '../serializers/order';
import { NextFunction } from 'express';

const orderRequestSchema = Joi.object({
  count: Joi.number().integer().min(1).required(),
  latitude: Joi.number().required(),
  longitude: Joi.number().required(),
}).prefs({ convert: true });

export const verify = async (req: Request<VerifyParams>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { error, value: validation } = orderRequestSchema.validate(req.query);
    if (error) {
      res.status(400).json({
        errors: [
          {
            status: 400,
            source: { pointer: error.details[0].path[0] },
            title: 'Validation Error',
            detail: error.details[0].message,
          },
        ],
      });
      return;
    }

    const { product, discountRule, warehouses } = await fetchOrderData(validation.count);

    const { subtotal, total } = calculateOrderSummary(
      validation.count,
      product.price,
      discountRule?.discount_value,
    );

    const userOrder: UserOrder = {
      subtotal,
      total,
      quantity: validation.count,
      weightPerUnit: product.weight,
      latitude: validation.latitude,
      longitude: validation.longitude,
    };

    const validity = checkOrderValidity(userOrder, warehouses);
    res.status(200).json(serializeOrderVerification(userOrder, validity));
  }
  catch (error) {
    next(error);
  }
};

export const create = async (req: Request<VerifyParams>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { error, value: validation } = orderRequestSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        errors: [
          {
            status: 400,
            source: { pointer: error.details[0].path[0] },
            title: 'Validation Error',
            detail: error.details[0].message,
          },
        ],
      });
      return;
    }

    const { product, discountRule, warehouses } = await fetchOrderData(validation.count);
    const { subtotal, total } = calculateOrderSummary(
      validation.count,
      product.price,
      discountRule?.discount_value,
    );

    const userOrder: UserOrder = {
      subtotal,
      total,
      quantity: validation.count,
      weightPerUnit: product.weight,
      latitude: validation.latitude,
      longitude: validation.longitude,
    };

    const validity = checkOrderValidity(userOrder, warehouses);
    if (!validity.isValid) {
      res.status(400).json({
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
      return;
    }

    const order = await dbOrders.create(userOrder, discountRule, validity.shipments);
    res.status(200).json(await serializeOrder(order));
  }
  catch (error) {
    next(error);
  }
};
