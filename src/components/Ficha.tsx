import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AlertTriangle, Clock, ChevronRight, FileText, Camera, Trash2, Edit2, X } from "lucide-react";

interface FichaProps {
  vehicleId: number;
  onEditJob?: (jobId: number) => void;
}

const safeJsonParse = (str: string | null) => {
  if (!str) return [];
  try {
    return JSON.parse(str);
  } catch {
    return [];
  }
};

import EditJobModal from "./EditJobModal";

export default function Ficha({ vehicleId }: FichaProps) {
  const [data, setData] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [editingJob, setEditingJob] = useState<any>(null);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/vehicles/${vehicleId}`);
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, [vehicleId]);

  const handleDeleteJob = async (jobId: number) => {
    if (confirm("¿Estás seguro de que quieres eliminar este trabajo?")) {
      try {
        const res = await fetch(`/api/jobs/${jobId}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          fetchData();
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-5 h-5 border-2 border-[#111111] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const SpecItem = ({ label, value }: { label: string, value: any }) => {
    if (!value) return null;
    return (
      <div className="flex flex-col py-3 border-b border-[#F3F4F6] last:border-0">
        <span className="text-[13px] text-[#6B7280] mb-1">{label}</span>
        <span className="text-[15px] font-medium text-[#111111]">{value}</span>
      </div>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 px-8 py-16 md:py-24 bg-white min-h-[calc(100vh-5rem)]"
    >
      <div className="max-w-[700px] mx-auto flex flex-col h-full">
        {/* Breadcrumb / Kicker */}
        <div className="flex items-center gap-2 text-[13px] text-[#6B7280] mb-6 font-medium">
          <span>{data.make}</span>
          <span className="text-[#D1D5DB]">/</span>
          <span>{data.model}</span>
          <span className="text-[#D1D5DB]">/</span>
          <span>{data.year}</span>
        </div>

        {/* Title */}
        <h1 className="text-[48px] font-bold tracking-tight text-[#111111] leading-[1.1] mb-8">
          {data.make} {data.model}
        </h1>

        {/* Critical Warnings */}
        {data.warnings && (
          <div className="mb-12 p-6 bg-[#FFFBEB] rounded-xl flex items-start gap-4">
            <AlertTriangle className="text-[#F59E0B] shrink-0 w-5 h-5 mt-0.5" />
            <div>
              <h3 className="text-[13px] font-bold text-[#92400E] mb-1">Aviso Crítico</h3>
              <p className="text-[#B45309] leading-relaxed text-[15px]">
                {data.warnings}
              </p>
            </div>
          </div>
        )}

        {/* Properties (Notion Style Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2 mb-12">
          <SpecItem label="ECU" value={data.ecu} />
          <SpecItem label="BCM / Cuadro" value={data.bcm} />
          <SpecItem label="Sistema Inmovilizador" value={data.immoSystem} />
          <SpecItem label="Transponder (Chip)" value={data.chip} />
          <SpecItem label="Frecuencia" value={data.frequency} />
          <SpecItem label="Espada" value={data.keyBlade} />
          <SpecItem label="ID Control VVDI" value={data.controlGenerado} />
        </div>

        {/* Especificaciones del Cilindro (Análisis de Pérdida Total) */}
        {(data.clavesPuerta !== null || data.clavesContacto !== null || data.mismasClaves) && (
          <div className="mb-16 p-6 bg-[#F9FAFB] rounded-2xl border border-[#E5E7EB]">
            <h3 className="text-[12px] font-bold text-[#111111] uppercase tracking-wider mb-4">
              Especificaciones del Cilindro (Análisis para Pérdida Total)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="flex flex-col">
                <span className="text-[11px] text-[#6B7280] uppercase tracking-wider font-semibold mb-1">Claves en Puerta</span>
                <span className="text-[20px] font-bold text-[#111111]">{data.clavesPuerta !== null && data.clavesPuerta !== undefined ? data.clavesPuerta : "N/A"}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] text-[#6B7280] uppercase tracking-wider font-semibold mb-1">Claves en Contacto</span>
                <span className="text-[20px] font-bold text-[#111111]">{data.clavesContacto !== null && data.clavesContacto !== undefined ? data.clavesContacto : "N/A"}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] text-[#6B7280] uppercase tracking-wider font-semibold mb-1">¿Misma Cantidad?</span>
                <span className={`text-[16px] font-bold inline-flex items-center gap-1.5 ${
                  data.mismasClaves === "Sí" ? "text-green-600" : data.mismasClaves === "No" ? "text-amber-600" : "text-[#111111]"
                }`}>
                  {data.mismasClaves || "N/A"}
                </span>
              </div>
            </div>
            
            {data.mismasClaves && (
              <div className="mt-4 pt-4 border-t border-[#E5E7EB] text-[13px] text-[#4B5563]">
                {data.mismasClaves === "Sí" ? (
                  <span className="text-green-700 font-medium bg-green-50/50 border border-green-100 px-3 py-1.5 rounded-lg inline-block w-full">
                    ✓ **Información para Cerrajero:** Se puede fabricar la llave recuperando el desgaste directamente desde la cerradura de la puerta.
                  </span>
                ) : (
                  <span className="text-amber-700 font-medium bg-amber-50/50 border border-amber-100 px-3 py-1.5 rounded-lg inline-block w-full">
                    ⚠ **Información para Cerrajero:** Obligatorio extraer la chapa de contacto (encendido) para confeccionar la llave, ya que difiere en claves con la puerta.
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Jobs History */}
        {data.jobs && data.jobs.length > 0 && (
          <div className="pt-8">
            <h2 className="text-[24px] font-bold text-[#111111] mb-8">Historial de Trabajos</h2>
            <div className="space-y-12">
              {data.jobs.map((job: any) => (
                <div key={job.id} className="relative pl-6 border-l-2 border-[#F3F4F6] group">
                  <div className="absolute -left-[5px] top-1.5 w-2 h-2 bg-[#D1D5DB] rounded-full"></div>
                  
                  <div className="flex flex-col gap-1 mb-4 relative">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <h3 className="text-[18px] font-bold text-[#111111]">{job.jobType || job.tipoServicio}</h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide ${
                          (job.jobType || job.tipoServicio) === "Pérdida total" 
                            ? "bg-red-50 text-red-700 border border-red-200" 
                            : "bg-blue-50 text-blue-700 border border-blue-200"
                        }`}>
                          {job.jobType || job.tipoServicio}
                        </span>
                      </div>
                      <div className="flex gap-2">
                          <button
                            onClick={() => setEditingJob(job)}
                            className="text-gray-400 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Editar trabajo"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        <button
                          onClick={() => handleDeleteJob(job.id)}
                          className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Eliminar trabajo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-[13px] text-[#6B7280]">
                      <span>{new Date(job.date).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {job.notes && (
                    <p className="text-[#374151] text-[15px] leading-relaxed mb-6">
                      {job.notes}
                    </p>
                  )}

                  {job.methods && (
                    <div className="mb-6 bg-[#F9FAFB] p-6 rounded-xl">
                      <h4 className="text-[12px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-4">Procedimiento</h4>
                      <ol className="space-y-3">
                        {safeJsonParse(job.methods).map((m: string, i: number) => (
                          <li key={i} className="flex gap-3 text-[14px] text-[#374151]">
                            <span className="font-mono text-[#9CA3AF]">{i+1}.</span>
                            <p>{m}</p>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(job.scanner || job.controlGenerado) && (
                      <div className="p-4 rounded-xl border border-[#F3F4F6]">
                        <h4 className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-2">Herramientas</h4>
                        <div className="flex flex-col gap-1">
                          {job.scanner && <span className="text-[13px] text-[#374151]"><span className="text-[#9CA3AF]">Scanner:</span> {job.scanner}</span>}
                          {job.controlGenerado && <span className="text-[13px] text-[#374151]"><span className="text-[#9CA3AF]">Control:</span> {job.controlGenerado}</span>}
                        </div>
                      </div>
                    )}
                  </div>

                  {job.photos && safeJsonParse(job.photos).length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-[12px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-4">Fotografías</h4>
                      <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 md:mx-0 md:px-0">
                        {safeJsonParse(job.photos).map((photo: string, i: number) => (
                          <div 
                            key={i} 
                            onClick={() => setSelectedImage(photo)}
                            className="flex-none w-[200px] aspect-[4/3] rounded-xl overflow-hidden bg-[#F9FAFB] border border-[#E5E7EB] cursor-pointer hover:opacity-90 transition-opacity"
                          >
                            <img src={photo} alt={`Foto del trabajo ${i+1}`} className="w-full h-full object-cover pointer-events-none" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8 cursor-zoom-out"
          >
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute top-6 right-6 p-2 text-white/70 hover:text-white bg-black/50 hover:bg-black/70 rounded-full transition-colors z-[101]"
            >
              <X className="w-6 h-6" />
            </button>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-5xl w-full max-h-[85vh] flex items-center justify-center cursor-auto"
            >
              <img 
                src={selectedImage} 
                alt="Vista ampliada" 
                className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <EditJobModal 
        job={editingJob} 
        isOpen={!!editingJob} 
        onClose={() => setEditingJob(null)} 
        onSaved={() => {
          setEditingJob(null);
          fetchData();
        }} 
      />
    </motion.div>
  );
}
