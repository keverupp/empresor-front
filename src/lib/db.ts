import "server-only";
import knexInit from "knex";

export const db = knexInit({
  client: "pg",
  connection: process.env.DATABASE_URL,
  pool: { min: 0, max: 10 },
});
