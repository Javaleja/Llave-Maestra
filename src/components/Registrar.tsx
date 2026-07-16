import React from "react";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ChevronRight } from "lucide-react";
import ImageUploader from "./ImageUploader";

interface RegistrarProps {
  onSave: () => void;
  vehicleId: number | null;
  jobId?: number | null;
}

const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-[13px] font-medium text-[#6B7280] mb-2">{children}</label>
);

const Input = (props: any) => (
  <input 
    {...props} 
    className={`w-full bg-transparent border-b border-[#E5E7EB] py-2 focus:outline-none focus:border-[#111111] transition-colors text-[15px] font-medium text-[#111111] placeholder-[#D1D5DB] ${props.className || ''}`}
  />
);

const TextArea = (props: any) => (
  <textarea 
    {...props} 
    className={`w-full bg-transparent border border-[#E5E7EB] rounded-lg p-4 focus:outline-none focus:border-[#111111] transition-colors text-[15px] text-[#111111] placeholder-[#D1D5DB] resize-none ${props.className || ''}`}
  />
);

export default function Registrar({ onSave, vehicleId, jobId }: RegistrarProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingVehicle, setIsLoadingVehicle] = useState(!!vehicleId);
  const [errorMsg, setErrorMsg] = useState("");

  // Existing vehicles
  const [allVehicles, setAllVehicles] = useState<any[]>([]);
  const [vehicleSearch, setVehicleSearch] = useState("");
  const [selectedExistingId, setSelectedExistingId] = useState<number | null>(vehicleId);

  useEffect(() => {
    if (!vehicleId) {
      fetch("/api/vehicles")
        .then(res => res.json())
        .then(data => setAllVehicles(data))
        .catch(console.error);
    }
  }, [vehicleId]);

  // Vehicle State
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [ecu, setEcu] = useState("");
  const [bcm, setBcm] = useState("");
  const [chip, setChip] = useState("");
  const [frequency, setFrequency] = useState("");
  const [clavesPuerta, setClavesPuerta] = useState("");
  const [clavesContacto, setClavesContacto] = useState("");
  const [mismasClaves, setMismasClaves] = useState("");
  const [keyBlade, setKeyBlade] = useState("");

  useEffect(() => {
    if (vehicleId) {
      setIsLoadingVehicle(true);
      fetch(`/api/vehicles/${vehicleId}`)
        .then(res => res.json())
        .then(data => {
          setMake(data.make || "");
          setModel(data.model || "");
          setYear(data.year || "");
          setEcu(data.ecu || "");
          setBcm(data.bcm || "");
          setChip(data.chip || "");
          setFrequency(data.frequency || "");
          setClavesPuerta(data.clavesPuerta !== null && data.clavesPuerta !== undefined ? String(data.clavesPuerta) : "");
          setClavesContacto(data.clavesContacto !== null && data.clavesContacto !== undefined ? String(data.clavesContacto) : "");
          setMismasClaves(data.mismasClaves || "");
          setKeyBlade(data.keyBlade || "");
          setIsLoadingVehicle(false);
        })
        .catch(err => {
          console.error(err);
          setIsLoadingVehicle(false);
        });
    }
  }, [vehicleId]);

  // Job State
  const [jobType, setJobType] = useState("");
  const [methods, setMethods] = useState("");
  const [scanner, setScanner] = useState("");
  const [controlGenerado, setControlGenerado] = useState("");
  const [notes, setNotes] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);

  useEffect(() => {
    if (jobId) {
      fetch(`/api/jobs/${jobId}`)
        .then(res => res.json())
        .then(data => {
          setJobType(data.jobType || data.tipoServicio || "");
          setScanner(data.scanner || "");
          setControlGenerado(data.controlGenerado || "");
          setNotes(data.notes || "");
          if (data.methods) {
            try {
              setMethods(JSON.parse(data.methods).join('\n'));
            } catch {
              setMethods("");
            }
          }
        })
        .catch(err => console.error(err));
    }
  }, [jobId]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrorMsg("");
    try {
      const payload = {
        vehicleId: selectedExistingId,
        newVehicleInfo: selectedExistingId ? undefined : { 
          make, 
          model, 
          year, 
          ecu, 
          bcm, 
          chip, 
          frequency,
          keyBlade,
          clavesPuerta: clavesPuerta ? parseInt(clavesPuerta, 10) : null,
          clavesContacto: clavesContacto ? parseInt(clavesContacto, 10) : null,
          mismasClaves: mismasClaves || null
        },
        jobType,
        tipoServicio: jobType,
        methods: JSON.stringify(methods.split('\n').filter(m => m.trim())),
        scanner,
        controlGenerado,
        notes,
        photos: JSON.stringify(photos)
      };

      const res = await fetch(jobId ? `/api/jobs/${jobId}` : '/api/jobs', {
        method: jobId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        throw new Error("Error al guardar el trabajo");
      }
      onSave();
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message || "Error desconocido");
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-1 px-8 py-16 md:py-24 bg-white min-h-[calc(100vh-5rem)]"
    >
      <div className="max-w-[600px] mx-auto flex flex-col h-full">
        <h1 className="text-[32px] font-bold tracking-tight text-[#111111] mb-12">
          {vehicleId ? "Registrar Trabajo" : "Nuevo Registro"}
        </h1>

        <div className="space-y-12 flex-1">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col space-y-10">
            
            {!vehicleId && (
              <div className="space-y-6 relative">
                <h2 className="text-[18px] font-bold text-[#111111] mb-6">Buscar Vehículo Existente (Opcional)</h2>
                <div>
                  <Input 
                    value={vehicleSearch} 
                    onChange={(e: any) => {
                      setVehicleSearch(e.target.value);
                      if (!e.target.value) setSelectedExistingId(null);
                    }} 
                    placeholder="Ej. Chevrolet Onix 2022..." 
                  />
                  {vehicleSearch && !selectedExistingId && (
                    <div className="absolute z-10 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                      {allVehicles
                        .filter(v => `${v.make} ${v.model} ${v.year}`.toLowerCase().includes(vehicleSearch.toLowerCase()))
                        .map(v => (
                          <button
                            key={v.id}
                            type="button"
                            className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 transition-colors"
                            onClick={() => {
                              setSelectedExistingId(v.id);
                              setVehicleSearch(`${v.make} ${v.model} ${v.year}`);
                              setMake(v.make);
                              setModel(v.model);
                              setYear(v.year);
                              setEcu(v.ecu || "");
                              setBcm(v.bcm || "");
                              setChip(v.chip || "");
                              setFrequency(v.frequency || "");
                              setKeyBlade(v.keyBlade || "");
                              setClavesPuerta(v.clavesPuerta ? String(v.clavesPuerta) : "");
                              setClavesContacto(v.clavesContacto ? String(v.clavesContacto) : "");
                              setMismasClaves(v.mismasClaves || "");
                            }}
                          >
                            <span className="font-medium text-[#111111]">{v.make} {v.model}</span> <span className="text-gray-500">{v.year}</span>
                          </button>
                        ))}
                      {allVehicles.filter(v => `${v.make} ${v.model} ${v.year}`.toLowerCase().includes(vehicleSearch.toLowerCase())).length === 0 && (
                        <div className="px-4 py-3 text-sm text-gray-500">No se encontraron vehículos. Se creará uno nuevo.</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className={`space-y-6 ${selectedExistingId && !vehicleId ? 'opacity-50 pointer-events-none' : ''}`}>
              <h2 className="text-[18px] font-bold text-[#111111] mb-6">Vehículo</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                  <Label>Marca *</Label>
                  <Input autoFocus={!vehicleId} value={make} onChange={(e: any) => setMake(e.target.value)} disabled={!!vehicleId || !!selectedExistingId} placeholder="Ej. Volkswagen" className={vehicleId || selectedExistingId ? "opacity-50" : ""} />
                </div>
                <div>
                  <Label>Modelo *</Label>
                  <Input value={model} onChange={(e: any) => setModel(e.target.value)} disabled={!!vehicleId || !!selectedExistingId} placeholder="Ej. Golf" className={vehicleId || selectedExistingId ? "opacity-50" : ""} />
                </div>
                <div>
                  <Label>Año *</Label>
                  <Input value={year} onChange={(e: any) => setYear(e.target.value)} disabled={!!vehicleId || !!selectedExistingId} placeholder="Ej. 2018" className={vehicleId || selectedExistingId ? "opacity-50" : ""} />
                </div>
              </div>
            </div>

            <div className={`space-y-6 pt-6 border-t border-[#F3F4F6] ${selectedExistingId && !vehicleId ? 'opacity-50 pointer-events-none' : ''}`}>
              <h2 className="text-[18px] font-bold text-[#111111] mb-6">Especificaciones (Opcional)</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div><Label>Chip (Transponder)</Label><Input disabled={!!vehicleId || !!selectedExistingId} className={vehicleId || selectedExistingId ? "opacity-50" : ""} value={chip} onChange={(e: any) => setChip(e.target.value)} placeholder="Ej. ID48 Megamos" /></div>
                <div><Label>Frecuencia</Label><Input disabled={!!vehicleId || !!selectedExistingId} className={vehicleId || selectedExistingId ? "opacity-50" : ""} value={frequency} onChange={(e: any) => setFrequency(e.target.value)} placeholder="Ej. 433 MHz" /></div>
                <div><Label>ECU</Label><Input disabled={!!vehicleId || !!selectedExistingId} className={vehicleId || selectedExistingId ? "opacity-50" : ""} value={ecu} onChange={(e: any) => setEcu(e.target.value)} placeholder="Ej. Bosch EDC17" /></div>
                <div><Label>BCM / Cuadro</Label><Input disabled={!!vehicleId || !!selectedExistingId} className={vehicleId || selectedExistingId ? "opacity-50" : ""} value={bcm} onChange={(e: any) => setBcm(e.target.value)} placeholder="Ej. MQB VDO" /></div>
              </div>
            </div>

            <div className={`space-y-6 pt-6 border-t border-[#F3F4F6] ${selectedExistingId && !vehicleId ? 'opacity-50 pointer-events-none' : ''}`}>
              <h2 className="text-[18px] font-bold text-[#111111] mb-6">Especificaciones del Cilindro</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                  <Label>Espadín</Label>
                  <Input 
                    value={keyBlade} 
                    onChange={(e: any) => setKeyBlade(e.target.value)} 
                    disabled={!!vehicleId || !!selectedExistingId}
                    placeholder="Ej. HU66, SIP22" 
                    className={vehicleId || selectedExistingId ? "opacity-50" : ""}
                  />
                </div>
                <div>
                  <Label>Claves en Puerta</Label>
                  <Input 
                    type="number" 
                    value={clavesPuerta} 
                    onChange={(e: any) => setClavesPuerta(e.target.value)} 
                    disabled={!!vehicleId || !!selectedExistingId}
                    placeholder="Ej. 8" 
                    className={vehicleId || selectedExistingId ? "opacity-50" : ""}
                  />
                </div>
                <div>
                  <Label>Claves en Contacto</Label>
                  <Input 
                    type="number" 
                    value={clavesContacto} 
                    onChange={(e: any) => setClavesContacto(e.target.value)} 
                    disabled={!!vehicleId || !!selectedExistingId}
                    placeholder="Ej. 10" 
                    className={vehicleId || selectedExistingId ? "opacity-50" : ""}
                  />
                </div>
                <div className="col-span-1 sm:col-span-2">
                  <Label>¿Mismo número de claves?</Label>
                  <div className="flex gap-4 mt-1">
                    <button
                      type="button"
                      disabled={!!vehicleId || !!selectedExistingId}
                      onClick={() => setMismasClaves("Sí")}
                      className={`flex-1 py-2.5 px-4 rounded-xl border text-center transition-all text-sm font-medium ${
                        mismasClaves === "Sí"
                          ? "border-black bg-black text-white"
                          : "border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100"
                      } ${vehicleId || selectedExistingId ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      Sí
                    </button>
                    <button
                      type="button"
                      disabled={!!vehicleId || !!selectedExistingId}
                      onClick={() => setMismasClaves("No")}
                      className={`flex-1 py-2.5 px-4 rounded-xl border text-center transition-all text-sm font-medium ${
                        mismasClaves === "No"
                          ? "border-black bg-black text-white"
                          : "border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100"
                      } ${vehicleId || selectedExistingId ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      No
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6 pt-6 border-t border-[#F3F4F6]">
              <h2 className="text-[18px] font-bold text-[#111111] mb-6">Detalles del Trabajo</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="col-span-1 sm:col-span-2">
                  <Label>Tipo de Trabajo *</Label>
                  <div className="flex gap-4 mt-1">
                    <button
                      type="button"
                      onClick={() => setJobType("Duplicado de llave")}
                      className={`flex-1 py-3 px-4 rounded-xl border text-center transition-all text-sm font-semibold ${
                        jobType === "Duplicado de llave"
                          ? "border-black bg-black text-white"
                          : "border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      Duplicado de llave
                    </button>
                    <button
                      type="button"
                      onClick={() => setJobType("Pérdida total")}
                      className={`flex-1 py-3 px-4 rounded-xl border text-center transition-all text-sm font-semibold ${
                        jobType === "Pérdida total"
                          ? "border-black bg-black text-white"
                          : "border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      Pérdida total
                    </button>
                  </div>
                </div>
                <div><Label>Scanner</Label><Input value={scanner} onChange={(e: any) => setScanner(e.target.value)} placeholder="Ej. Autel IM608" /></div>
                <div><Label>ID Control VVDI</Label><Input value={controlGenerado} onChange={(e: any) => setControlGenerado(e.target.value)} /></div>
              </div>
            </div>

            <div className="space-y-6 pt-6 border-t border-[#F3F4F6]">
              <div>
                <Label>Procedimiento (Método paso a paso)</Label>
                <TextArea rows={5} placeholder="1. Leer data immo por OBD&#10;2. Calcular checksum..." value={methods} onChange={(e: any) => setMethods(e.target.value)} />
              </div>
              <div>
                <Label>Observaciones y Aprendizajes</Label>
                <TextArea rows={3} placeholder="Notas importantes sobre el trabajo, fallas comunes de este modelo..." value={notes} onChange={(e: any) => setNotes(e.target.value)} />
              </div>
              <div>
                <Label>Fotografías (Opcional)</Label>
                <ImageUploader onImagesChange={setPhotos} maxFiles={5} />
              </div>
            </div>

            {errorMsg && (
              <div className="text-red-500 text-sm font-medium p-4 bg-red-50 rounded-lg">
                {errorMsg}
              </div>
            )}

            <div className="flex justify-end items-center pt-8">
              <button 
                onClick={handleSubmit}
                disabled={!make || !model || !year || !jobType || isSubmitting}
                className="px-8 h-10 bg-[#111111] text-white rounded-md font-medium text-[14px] disabled:opacity-30 transition-opacity flex justify-center items-center gap-2"
              >
                {isSubmitting ? (
                   <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  "Guardar Trabajo"
                )}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
