import * as dbProducts from '../db/products';
import * as dbPromotionRules from '../db/promotionRules';
import * as dbWarehouses from '../db/warehouses';

export const fetchOrderData = async (count: number) => {
  const product = await dbProducts.findByID(1); // FIXME: Consider making product dynamic later
  const discountRule = await dbPromotionRules.findByNearestMinQty(count);
  const warehouses = await dbWarehouses.findAll();

  return { product, discountRule, warehouses };
};

export const calculateOrderSummary = (count: number, price: number, discountValue?: number): { subtotal: number; discount: number; total: number } => {
  const subtotal = count * price;
  const discount = discountValue ? subtotal * discountValue : 0;
  const total = subtotal - discount;
  return { subtotal, discount, total };
};
