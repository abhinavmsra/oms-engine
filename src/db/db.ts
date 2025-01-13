import { Pool, PoolClient, QueryConfig, QueryResult } from 'pg';

let pool: Pool;

/**
 * Initialize a single database pool connection
 */
const initPool = (): void => {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 10, // Adjust pool size based on your needs
      idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
    });

    pool.on('error', (err: Error) => {
      console.error('Unexpected error on the database pool:', err);
      process.exit(-1); // Exit if the database connection fails
    });
  }
};

/**
 * Get a pool client
 */
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

/**
 * Run a query with automatic pool management
 * @param query - SQL query as string or prepared statement object
 * @param values - Optional values for parameterized queries
 */
export const query = async (
  query: string | QueryConfig,
  values?: any[],
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
