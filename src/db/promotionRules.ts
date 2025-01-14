import { PromotionRule } from '../types';
import { query } from './db';

export const findByNearestMinQty = async (quantity: number): Promise<PromotionRule> => {
  const result = await query(
    'SELECT * FROM promotion_rules WHERE is_active = true AND min_quantity <= $1 ORDER BY min_quantity DESC LIMIT 1',
    [quantity],
  );

  return result.rows[0] as PromotionRule;
};
