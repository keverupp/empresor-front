// knexfile.ts
import "dotenv/config";
import type { Knex } from "knex";

const config: Knex.Config = {
  client: "pg",
  connection: {
    connectionString: process.env.DATABASE_URL,
    // Em prod (Render/Neon/Vercel PG, etc.) quase sempre precisa SSL:
    ssl: process.env.PGSSL === "true" ? { rejectUnauthorized: false } : false,
  },
  pool: { min: 0, max: 10 },
  // Suas migrations podem continuar em TS
  migrations: {
    directory: "./migrations",
    extension: "ts",
    loadExtensions: [".ts"], // para o CLI enxergar .ts
    tableName: "knex_migrations",
  },
  // (opcional) searchPath: ['public'],
};

export default config;
