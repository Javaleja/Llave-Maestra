import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";

export const vehicles = pgTable("vehicles", {
  id: serial("id").primaryKey(),
  make: text("make").notNull(),
  model: text("model").notNull(),
  year: text("year").notNull(),
  patente: text("patente"),
  chasis: text("chasis"),
  pinCode: text("pin_code"),
  codigoCorte: text("codigo_corte"),
  engine: text("engine"),
  ecu: text("ecu"),
  bcm: text("bcm"),
  immoSystem: text("immo_system"),
  chip: text("chip"),
  frequency: text("frequency"),
  keyBlade: text("key_blade"),
  warnings: text("warnings"),
  clavesPuerta: integer("claves_puerta"),
  clavesContacto: integer("claves_contacto"),
  mismasClaves: text("mismas_claves"),
  controlGenerado: text("control_generado"),
  photos: text("photos"),
});

export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  vehicleId: integer("vehicle_id").notNull().references(() => vehicles.id),
  jobType: text("job_type").notNull(),
  tipoServicio: text("tipo_servicio"),
  methods: text("methods"),
  scanner: text("scanner"),
  controlGenerado: text("control_generado"),
  macAddress: text("mac_address"),
  notes: text("notes"),
  photos: text("photos"),
  date: timestamp("date").notNull().defaultNow(),
});
