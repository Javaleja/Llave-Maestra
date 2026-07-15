CREATE TABLE "jobs" (
	"id" serial PRIMARY KEY NOT NULL,
	"vehicle_id" integer NOT NULL,
	"job_type" text NOT NULL,
	"methods" text,
	"scanner" text,
	"control_generado" text,
	"mac_address" text,
	"notes" text,
	"photos" text,
	"date" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vehicles" (
	"id" serial PRIMARY KEY NOT NULL,
	"make" text NOT NULL,
	"model" text NOT NULL,
	"year" text NOT NULL,
	"engine" text,
	"ecu" text,
	"bcm" text,
	"immo_system" text,
	"chip" text,
	"frequency" text,
	"key_blade" text,
	"warnings" text
);
--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;