// backend/config/database.test.js
const pool = require('./database');
const { Pool } = require('pg');
require('dotenv').config();

describe('Database Connection', () => {
    beforeAll(() => {
        jest.setTimeout(process.env.JEST_TIMEOUT); // Set timeout to 20 seconds
    });

    afterAll(async () => {
        await pool.end();
    });

  it('should connect to the database', async () => {
    
    try {
      const client = await pool.connect();
      expect(client).toBeDefined();
      client.release();
    } catch (error) {
      console.error(error);
      expect(error).toBeUndefined();
    }
  });

  it('should execute a simple query', async () => {
    try {
      const result = await pool.query('SELECT 1 + 1 AS solution');
      expect(result.rows[0].solution).toBe(2);
    } catch (error) {
      console.error(error);
      expect(error).toBeUndefined();
    }
  });

  it('should fail to connect with invalid credentials', async () => {
    DB_USER = 'wrong_user';
    const invalidPool = new Pool({
      user: DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,
    });

    try {
      await invalidPool.connect();
    } catch (error) {
      console.log(error);
      
      expect(error).toBeDefined();
    }
  });
});
