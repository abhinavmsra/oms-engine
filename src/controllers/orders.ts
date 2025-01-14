import { Request, Response } from 'express';
import Joi from 'joi';
import * as dbProducts from '../db/products';
import * as dbPromotionRules from '../db/promotionRules';
import * as dbWarehouses from '../db/warehouses';
import { UserOrder } from '../types';
import { checkOrderValidity } from '../utils/order';

interface VerifyParams {
  count: string;
  latitude: string;
  longitude: string;
}

const verifyRequestSchema = Joi.object({
  count: Joi.number().integer().required(),
  latitude: Joi.number().required(),
  longitude: Joi.number().required(),
});

export const verify = async (req: Request<VerifyParams>, res: Response): Promise<void> => {
  const { error, value: validation } = verifyRequestSchema.validate(req.query);
  if (error) {
    res.status(400).json({ error: error.details });
    return;
  }

  const product = await dbProducts.findByID(1); // FIXME: Hard Code the ProductID for now
  const discountRule = await dbPromotionRules.findByNearestMinQty(validation.count);
  const warehouses = await dbWarehouses.findAll();
  const subtotal = validation.count * product.price;
  let discount = 0;
  if (discountRule) {
    discount = subtotal * discountRule.discount_value;
  }
  const total = subtotal - discount;
  const userOrder: UserOrder = {
    subtotal,
    total,
    quantity: validation.count,
    weightPerUnit: product.weight,
    latitude: validation.latitude,
    longitude: validation.longitude,
  };

  const validity = checkOrderValidity(userOrder, warehouses);
  res.status(200).json({
    data: {
      type: 'orderVerification',
      attributes: {
        isValid: validity.isValid,
        subtotal,
        discount,
        total,
        quantity: validation.count,
        totalShippingCost: validity.totalShippingCost,
      },
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  });
};
