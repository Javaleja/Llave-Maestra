import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { db } from "./src/db/index.js";
import { jobs, vehicles } from "./src/db/schema.js";
import { eq, or, like } from "drizzle-orm";

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());

  // Search API
  app.get("/api/search", async (req, res) => {
    const q = req.query.q as string;
    if (!q) {
      return res.json([]);
    }

    try {
      const searchPattern = `%${q}%`;
      // Search in vehicles and jobs
      const results = await db
        .select()
        .from(vehicles)
        .where(
          or(
            like(vehicles.make, searchPattern),
            like(vehicles.model, searchPattern),
            like(vehicles.engine, searchPattern),
            like(vehicles.ecu, searchPattern),
            like(vehicles.bcm, searchPattern)
          )
        )
        .limit(10);
      
      res.json(results);
    } catch (error) {
      console.error("Search error:", error);
      res.status(500).json({ error: "Search failed" });
    }
  });

  // Get all vehicles (Admin)
  app.get("/api/vehicles", async (req, res) => {
    try {
      const results = await db.select().from(vehicles);
      res.json(results);
    } catch (error) {
      console.error("Fetch vehicles error:", error);
      res.status(500).json({ error: "Failed to fetch vehicles" });
    }
  });

  // Create vehicle (Admin)
  app.post("/api/vehicles", async (req, res) => {
    try {
      const newV = await db.insert(vehicles).values(req.body).returning();
      res.json(newV[0]);
    } catch (error) {
      console.error("Create vehicle error:", error);
      res.status(500).json({ error: "Failed to create vehicle" });
    }
  });

  // Update vehicle (Admin)
  app.put("/api/vehicles/:id", async (req, res) => {
    try {
      const vehicleId = parseInt(req.params.id);
      const updated = await db.update(vehicles).set(req.body).where(eq(vehicles.id, vehicleId)).returning();
      res.json(updated[0]);
    } catch (error) {
      console.error("Update vehicle error:", error);
      res.status(500).json({ error: "Failed to update vehicle" });
    }
  });

  // Delete vehicle (Admin)
  app.delete("/api/vehicles/:id", async (req, res) => {
    try {
      const vehicleId = parseInt(req.params.id);
      await db.delete(jobs).where(eq(jobs.vehicleId, vehicleId));
      await db.delete(vehicles).where(eq(vehicles.id, vehicleId));
      res.json({ success: true });
    } catch (error) {
      console.error("Delete vehicle error:", error);
      res.status(500).json({ error: "Failed to delete vehicle" });
    }
  });

  // Get specific vehicle and its jobs
  app.get("/api/vehicles/:id", async (req, res) => {
    try {
      const vehicleId = parseInt(req.params.id);
      const vehicleResults = await db.select().from(vehicles).where(eq(vehicles.id, vehicleId));
      
      if (vehicleResults.length === 0) {
        return res.status(404).json({ error: "Vehicle not found" });
      }

      const vehicleJobs = await db.select().from(jobs).where(eq(jobs.vehicleId, vehicleId));
      
      res.json({
        ...vehicleResults[0],
        jobs: vehicleJobs
      });
    } catch (error) {
      console.error("Fetch vehicle error:", error);
      res.status(500).json({ error: "Failed to fetch vehicle" });
    }
  });

  // Create job
  app.post("/api/jobs", async (req, res) => {
    try {
      const { 
        vehicleId, 
        jobType, 
        tipoServicio,
        methods, 
        scanner, 
        controlGenerado,
        notes, 
        photos,
        newVehicleInfo 
      } = req.body;
      
      let vId = vehicleId;

      // Create vehicle if not exists
      if (!vId && newVehicleInfo) {
        const newV = await db.insert(vehicles).values(newVehicleInfo).returning();
        vId = newV[0].id;
      } else if (vId && newVehicleInfo) {
        // Optionally update vehicle (e.g. chip, frequency) if they changed
        const updateData: any = {};
        if (newVehicleInfo.chip !== undefined) updateData.chip = newVehicleInfo.chip;
        if (newVehicleInfo.frequency !== undefined) updateData.frequency = newVehicleInfo.frequency;
        if (newVehicleInfo.ecu !== undefined) updateData.ecu = newVehicleInfo.ecu;
        if (newVehicleInfo.bcm !== undefined) updateData.bcm = newVehicleInfo.bcm;
        if (newVehicleInfo.clavesPuerta !== undefined) updateData.clavesPuerta = newVehicleInfo.clavesPuerta;
        if (newVehicleInfo.clavesContacto !== undefined) updateData.clavesContacto = newVehicleInfo.clavesContacto;
        if (newVehicleInfo.mismasClaves !== undefined) updateData.mismasClaves = newVehicleInfo.mismasClaves;
        
        if (Object.keys(updateData).length > 0) {
          await db.update(vehicles).set(updateData).where(eq(vehicles.id, vId));
        }
      }

      const finalJobType = jobType || tipoServicio || "Duplicado de llave";
      const finalTipoServicio = tipoServicio || jobType || "Duplicado de llave";

      const newJob = await db.insert(jobs).values({
        vehicleId: vId,
        jobType: finalJobType,
        tipoServicio: finalTipoServicio,
        methods,
        scanner,
        controlGenerado,
        notes,
        photos
      }).returning();

      res.json(newJob[0]);
    } catch (error) {
      console.error("Create job error:", error);
      res.status(500).json({ error: "Failed to create job" });
    }
  });

  // Get all jobs
  app.get("/api/jobs", async (req, res) => {
    try {
      const allJobs = await db.select().from(jobs);
      res.json(allJobs);
    } catch (error) {
      console.error("Fetch all jobs error:", error);
      res.status(500).json({ error: "Failed to fetch jobs" });
    }
  });

  // Get job
  app.get("/api/jobs/:id", async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      const jobResults = await db.select().from(jobs).where(eq(jobs.id, jobId));
      if (jobResults.length === 0) {
        return res.status(404).json({ error: "Job not found" });
      }
      res.json(jobResults[0]);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch job" });
    }
  });

  // Update job
  app.put("/api/jobs/:id", async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      const { 
        jobType, tipoServicio, methods, scanner, controlGenerado, notes, photos, newVehicleInfo
      } = req.body;
      
      const jobResults = await db.select().from(jobs).where(eq(jobs.id, jobId));
      if (jobResults.length === 0) {
        return res.status(404).json({ error: "Job not found" });
      }
      const vId = jobResults[0].vehicleId;

      if (newVehicleInfo) {
        const updateData: any = {};
        if (newVehicleInfo.chip !== undefined) updateData.chip = newVehicleInfo.chip;
        if (newVehicleInfo.frequency !== undefined) updateData.frequency = newVehicleInfo.frequency;
        if (newVehicleInfo.ecu !== undefined) updateData.ecu = newVehicleInfo.ecu;
        if (newVehicleInfo.bcm !== undefined) updateData.bcm = newVehicleInfo.bcm;
        if (newVehicleInfo.clavesPuerta !== undefined) updateData.clavesPuerta = newVehicleInfo.clavesPuerta;
        if (newVehicleInfo.clavesContacto !== undefined) updateData.clavesContacto = newVehicleInfo.clavesContacto;
        if (newVehicleInfo.mismasClaves !== undefined) updateData.mismasClaves = newVehicleInfo.mismasClaves;
        if (Object.keys(updateData).length > 0) {
          await db.update(vehicles).set(updateData).where(eq(vehicles.id, vId));
        }
      }

      const finalJobType = jobType || tipoServicio || "Duplicado de llave";
      const finalTipoServicio = tipoServicio || jobType || "Duplicado de llave";

      const updatedJob = await db.update(jobs).set({
        jobType: finalJobType,
        tipoServicio: finalTipoServicio,
        methods,
        scanner,
        controlGenerado,
        notes,
        photos
      }).where(eq(jobs.id, jobId)).returning();

      res.json(updatedJob[0]);
    } catch (error) {
      console.error("Update job error:", error);
      res.status(500).json({ error: "Failed to update job" });
    }
  });

  // Delete job
  app.delete("/api/jobs/:id", async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      await db.delete(jobs).where(eq(jobs.id, jobId));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete job" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
