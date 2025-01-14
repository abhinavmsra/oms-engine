import { PoolClient, QueryResult } from 'pg';
import { Location } from '../types';
import { query } from './db';

export const findByLatitudeAndLongitude = async (latitude: number, longitude: number, client?: PoolClient | null): Promise<Location> => {
  const rawQuery = 'SELECT * FROM locations WHERE latitude = $1 AND longitude = $2';

  const result: QueryResult<Location> = client
    ? await client.query(rawQuery, [latitude, longitude])
    : await query(rawQuery, [latitude, longitude]);

  return result.rows[0];
};

export const create = async (latitude: number, longitude: number, client?: PoolClient | null): Promise<Location> => {
  const rawQuery = 'INSERT INTO locations (latitude, longitude) VALUES ($1, $2) RETURNING *';
  const result: QueryResult<Location> = client
    ? await client.query(rawQuery, [latitude, longitude])
    : await query(rawQuery, [latitude, longitude]);

  return result.rows[0];
};

export const findOrInsert = async (latitude: number, longitude: number, client?: PoolClient | null): Promise<Location> => {
  let record = await findByLatitudeAndLongitude(latitude, longitude, client);
  if (!record) {
    record = await create(latitude, longitude, client);
  }

  return record;
};
