import postgres from 'postgres';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const sql = postgres(process.env.DATABASE_URL);

async function main() {
  const statements = [
    'ALTER TABLE "vehicles" ADD COLUMN IF NOT EXISTS "patente" text;',
    'ALTER TABLE "vehicles" ADD COLUMN IF NOT EXISTS "chasis" text;',
    'ALTER TABLE "vehicles" ADD COLUMN IF NOT EXISTS "pin_code" text;',
    'ALTER TABLE "vehicles" ADD COLUMN IF NOT EXISTS "codigo_corte" text;',
    'ALTER TABLE "vehicles" ADD COLUMN IF NOT EXISTS "control_generado" text;'
  ];
  for (const statement of statements) {
    console.log('Executing:', statement);
    try {
      await sql.unsafe(statement);
    } catch (e) {
      console.log('Error (ignored):', e.message);
    }
  }
  console.log('Done');
  process.exit(0);
}
main().catch(console.error);
