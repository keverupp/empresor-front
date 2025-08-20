/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  await knex.schema.createTable('pdf_jobs', (table) => {
    table.uuid('id').primary();
    table.string('quote_id').notNullable();
    table.string('status').notNullable().defaultTo('pending');
    table.string('s3_key');
    table.timestamps(true, true);
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists('pdf_jobs');
};
