// awsdb.js

const mysql = require('mysql2');
const util = require('util');

/**
 * Creates and returns a promisified MySQL connection pool.
 * @param {object} config - The application configuration object.
 * @returns {object} The configured and promisified database pool.
 */
module.exports = function createDbPool(config) {
  // Create the pool using credentials from the passed-in config object
  const pool = mysql.createPool({
    host: config.DB_HOST,
    user: config.DB_USER,
    password: config.DB_PASSWORD,
    database: config.DB_NAME,
    connectionLimit: 10,
    waitForConnections: true,
    dateStrings: true
  });

  // Promisify the pool for async/await support
  pool.query = util.promisify(pool.query);

  console.log('✅ Database pool created successfully.');
  return pool;
};