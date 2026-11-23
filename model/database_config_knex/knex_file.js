require('dotenv').config();

module.exports = {
  development: {
    client: 'mysql2',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'bcd127',
      database: process.env.DB_NAME || 'db_vibeEco_2026',
      port: Number(process.env.DB_PORT) || 3306,
      charset: 'utf8mb4'
    },
    migrations: { tableName: 'knex_migrations', directory: './db/migrations' },
    seeds: { directory: './db/seeds' }
  }
};
