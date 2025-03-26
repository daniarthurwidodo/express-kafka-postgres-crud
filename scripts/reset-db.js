const { Pool } = require('pg');

const pool = new Pool({
  user: 'user',
  host: 'localhost',
  database: 'mydb',
  password: 'password',
  port: 5432,
});

async function resetDatabase() {
  try {
    // Drop existing table if it exists
    await pool.query(`
      DROP TABLE IF EXISTS messages CASCADE;
    `);

    // Recreate the table
    await pool.query(`
      CREATE TABLE messages (
        id VARCHAR(26) PRIMARY KEY,
        topic VARCHAR(255) NOT NULL,
        message JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Database reset successfully!');
  } catch (error) {
    console.error('Error resetting database:', error);
  } finally {
    await pool.end();
  }
}

resetDatabase();