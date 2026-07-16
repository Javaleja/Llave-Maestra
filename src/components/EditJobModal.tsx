import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Save } from "lucide-react";
import ImageUploader from "./ImageUploader";

const safeJsonParse = (str: string | null) => {
  if (!str) return [];
  try {
    return JSON.parse(str);
  } catch (e) {
    return [];
  }
};

interface EditJobModalProps {
  job: any;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export default function EditJobModal({ job, isOpen, onClose, onSaved }: EditJobModalProps) {
  const [jobType, setJobType] = useState("");
  const [methods, setMethods] = useState("");
  const [scanner, setScanner] = useState("");
  const [controlGenerado, setControlGenerado] = useState("");
  const [notes, setNotes] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [existingPhotos, setExistingPhotos] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (job && isOpen) {
      setJobType(job.jobType || job.tipoServicio || "");
      setScanner(job.scanner || "");
      setControlGenerado(job.controlGenerado || "");
      setNotes(job.notes || "");
      
      if (job.methods) {
        try {
          setMethods(JSON.parse(job.methods).join('\n'));
        } catch {
          setMethods("");
        }
      } else {
        setMethods("");
      }
      
      if (job.photos) {
        setExistingPhotos(safeJsonParse(job.photos));
      } else {
        setExistingPhotos([]);
      }
      setPhotos([]);
    }
  }, [job, isOpen]);

  const handleRemoveExistingPhoto = (urlToRemove: string) => {
    setExistingPhotos(prev => prev.filter(url => url !== urlToRemove));
  };

  const handleSave = async () => {
    if (!job) return;
    setIsSaving(true);
    try {
      const methodsArray = methods.split('\n').map(m => m.trim()).filter(m => m !== '');
      
      // Combine existing and new photos
      const finalPhotos = [...existingPhotos, ...photos];
      
      const payload = {
        vehicleId: job.vehicleId,
        jobType,
        tipoServicio: jobType,
        methods: JSON.stringify(methodsArray),
        scanner,
        controlGenerado,
        notes,
        photos: JSON.stringify(finalPhotos)
      };

      const res = await fetch(`/api/jobs/${job.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        throw new Error("Error al guardar el trabajo");
      }
      onSaved();
    } catch (error) {
      console.error(error);
      alert("Error al guardar los cambios");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white z-10">
          <h2 className="text-xl font-bold text-gray-900">Editar Trabajo</h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Procedimiento (Tipo de Trabajo)</label>
                <input 
                  type="text" 
                  value={jobType}
                  onChange={e => setJobType(e.target.value)}
                  placeholder="Ej: Programación de Llave"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Scanner Utilizado</label>
                <input 
                  type="text" 
                  value={scanner}
                  onChange={e => setScanner(e.target.value)}
                  placeholder="Ej: Autel IM608"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">ID de Control VVDI / Generado</label>
              <input 
                type="text" 
                value={controlGenerado}
                onChange={e => setControlGenerado(e.target.value)}
                placeholder="Ej: Xhorse Serie XN"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Pasos y Herramientas (Un paso por línea)</label>
              <textarea 
                value={methods}
                onChange={e => setMethods(e.target.value)}
                rows={4}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all resize-none"
                placeholder="1. Leer PIN code...&#10;2. Programar llave..."
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Observaciones</label>
              <textarea 
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all resize-none"
                placeholder="Notas adicionales sobre el trabajo..."
              ></textarea>
            </div>
            
            <div className="pt-4 border-t border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Fotografías del Trabajo</h3>
              <ImageUploader 
                onImagesChange={setPhotos} 
                maxFiles={5}
                existingImages={existingPhotos}
                onRemoveExistingImage={handleRemoveExistingPhoto}
              />
            </div>
          </div>
        </div>
        
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 shrink-0 bg-white z-10">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-black transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium bg-black text-white rounded-full hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isSaving ? "Guardando..." : "Guardar Cambios"}
            {!isSaving && <Save className="w-4 h-4" />}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
