import { Pool, PoolClient, QueryConfig, QueryResult } from 'pg';

let pool: Pool;

const initPool = (): void => {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 10, // Adjust pool size
      idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
    });

    pool.on('error', (err: Error) => {
      console.error('Unexpected error on the database pool:', err);
      process.exit(-1); // Exit if the database connection fails
    });
  }
};

export const getClient = async (): Promise<PoolClient> => {
  try {
    initPool();
    const client = await pool.connect();
    return client;
  }
  catch (error) {
    console.error('Error connecting to the database pool:', error);
    throw new Error('Failed to connect to the database pool.');
  }
};

export const query = async (
  query: string | QueryConfig,
  values?: (string | number | boolean | null)[],
): Promise<QueryResult> => {
  initPool();
  try {
    return await pool.query(query, values);
  }
  catch (error) {
    console.error('Error executing query:', error);
    throw error;
  }
};

export const runTransaction = async (
  callback: (client: PoolClient) => Promise<QueryResult>,
): Promise<QueryResult> => {
  const client = await getClient();
  let result: QueryResult;

  try {
    await client.query('BEGIN');
    result = await callback(client);
    await client.query('COMMIT');
  }
  catch (error) {
    await client.query('ROLLBACK');
    console.error('Transaction failed:', error);
    throw error;
  }
  finally {
    client.release();
  }

  return result;
};
