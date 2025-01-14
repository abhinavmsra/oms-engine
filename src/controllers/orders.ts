import { Request, Response } from 'express';
import Joi from 'joi';
import * as dbOrders from '../db/orders';
import { UserOrder, ValidatedVerifyParams, VerifyParams } from '../types';
import { checkOrderValidity } from '../utils/order';
import { calculateOrderSummary, fetchOrderData } from '../services/orders';
import { serializeOrder, serializeOrderVerification } from '../serializers/order';

const orderRequestSchema = Joi.object({
  count: Joi.number().integer().min(1).required(),
  latitude: Joi.number().required(),
  longitude: Joi.number().required(),
}).prefs({ convert: true });

const validateOrderRequest = (data: VerifyParams): ValidatedVerifyParams => {
  const { error, value } = orderRequestSchema.validate(data);
  if (error) {
    throw new Error(`Validation Error: ${error.details.map(d => d.message).join(', ')}`);
  }
  return value;
};

export const verify = async (req: Request<VerifyParams>, res: Response): Promise<void> => {
  const validation = validateOrderRequest(req.query as VerifyParams);

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
};

export const create = async (req: Request<VerifyParams>, res: Response): Promise<void> => {
  const validation = validateOrderRequest(req.body as VerifyParams);

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
    res.status(400).json({ error: 'Order is invalid' });
    return;
  }

  const order = await dbOrders.create(userOrder, discountRule, validity.shipments);
  res.status(200).json(await serializeOrder(order));
};
