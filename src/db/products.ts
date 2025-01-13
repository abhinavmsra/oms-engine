import { Product } from '../types';
import { query } from './db';

export const findByID = async (id: number): Promise<Product> => {
  const result = await query(
    'SELECT * FROM products WHERE id = $1',
    [id],
  );

  const product = result.rows[0];
  if (!product) {
    throw new Error(`Product with id: ${id} not found`);
  }

  return product;
};
