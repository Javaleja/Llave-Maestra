import { db } from './src/db/index.js';
import { vehicles, jobs } from './src/db/schema.js';
import { eq } from 'drizzle-orm';

async function seed() {
  const existingVehicle = await db.select().from(vehicles).where(eq(vehicles.model, 'Golf VII')).limit(1);
  if (existingVehicle.length > 0) {
    console.log('Seed data already exists. Skipping...');
    process.exit(0);
  }

  const v = await db.insert(vehicles).values({
    make: 'Volkswagen',
    model: 'Golf VII',
    year: '2018',
    engine: '1.4 TSI',
    ecu: 'Bosch EDC17C64',
    bcm: 'PQ35 / MQB Entry',
    immoSystem: 'IMMO 5 (MQB)',
    chip: 'Megamos AES (ID88)',
    frequency: '433.92 MHz',
    keyBlade: 'HU66',
    warnings: 'No forzar lectura de EEPROM si el voltaje cae debajo de 12.5V.',
  }).returning();

  await db.insert(jobs).values({
    vehicleId: v[0].id,
    jobType: 'Add Key',
    methods: JSON.stringify(['Conectar VCI al puerto OBD.', 'Seleccionar VW -> Sistema MQB.', 'Usar llave original para leer Immo Data.', 'Generar dealer key.', 'Aprender llaves.']),
    scanner: 'Autel IM608 Pro',
    controlGenerado: 'Xhorse Universal',
    notes: 'El sistema fue rápido, pero requirió mantener un cargador de batería conectado.',
  });
  
  console.log('Seed completed successfully.');
  process.exit(0);
}
seed();
