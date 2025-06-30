// backend/config/database.js
const {Pool} = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// If logging for the first time, uncomment the following lines to create the users table

// const createTableQuery = `
//   CREATE TABLE IF NOT EXISTS users (
//     id SERIAL PRIMARY KEY,
//     name VARCHAR(100),
//     email VARCHAR(100) UNIQUE NOT NULL,
//     password VARCHAR(100) NOT NULL,
//     university VARCHAR(100),
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//   );
// `;

// pool.query(createTableQuery)
//     .then(() => console.log('Users table created successfully'))
//     .catch((err) => console.error('Error creating users table:', err));

// pool.on('connect', () => {
//     console.log('Connected to the database');
// });

// pool.on('error', (err) => {
//     console.error('Error connecting to the database:', err);
// });

module.exports = pool;