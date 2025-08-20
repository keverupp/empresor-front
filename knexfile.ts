import "dotenv/config";
import type { Knex } from "knex";

const config: Knex.Config = {
  client: "pg",
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: false, // ou { rejectUnauthorized: false } se precisar
  },
  migrations: {
    directory: "./migrations",
  },
};

export default config;
