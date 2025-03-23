const pool = require('../db');

const createUsersTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS users (
      email VARCHAR(255) UNIQUE NOT NULL,
      password TEXT NOT NULL
    );
  `;

  try {
    await pool.query(query);
    console.log('✅ Users table created');
  } catch (err) {
    console.error('❌ Error creating users table:', err);
  }
};

createUsersTable();  // Run table creation on server start
