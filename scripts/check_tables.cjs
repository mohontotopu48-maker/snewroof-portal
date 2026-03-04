const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

async function main() {
    const tables = await sql`SELECT table_schema, table_name FROM information_schema.tables WHERE table_type='BASE TABLE' ORDER BY table_schema, table_name`;
    console.log('ALL TABLES:');
    tables.forEach(t => console.log(` ${t.table_schema}.${t.table_name}`));
}
main().catch(e => console.error('ERR:', e.message));
