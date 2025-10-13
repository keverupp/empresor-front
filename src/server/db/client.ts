import knex, { Knex } from "knex";

const { DATABASE_URL, PGSSL } = process.env;

if (!DATABASE_URL) {
  console.warn("DATABASE_URL is not defined. API routes that require the database will fail.");
}

export const db: Knex = knex({
  client: "pg",
  connection: DATABASE_URL,
  pool: { min: 0, max: 10 },
  ssl: PGSSL === "true" ? { rejectUnauthorized: false } : undefined,
});
