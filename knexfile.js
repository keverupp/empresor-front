/** @type {import('knex').Knex.Config} */
const config = {
  client: 'pg',
  connection: process.env.DATABASE_URL,
  migrations: {
    directory: './migrations',
  },
};

module.exports = config;
