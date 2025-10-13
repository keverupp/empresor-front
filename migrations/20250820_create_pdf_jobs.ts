import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("pdf_jobs", (table) => {
    table.uuid("id").primary();
    table.string("quote_id").notNullable();
    table.string("status").notNullable().defaultTo("pending");
    table.string("s3_key");
    table.string("created_by").notNullable();
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("pdf_jobs");
}
