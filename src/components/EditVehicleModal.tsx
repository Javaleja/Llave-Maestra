import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Save } from "lucide-react";

interface EditVehicleModalProps {
  vehicleId: number;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
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

export default function EditVehicleModal({ vehicleId, isOpen, onClose, onSaved }: EditVehicleModalProps) {
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [patente, setPatente] = useState("");
  const [chasis, setChasis] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [codigoCorte, setCodigoCorte] = useState("");
  const [ecu, setEcu] = useState("");
  const [bcm, setBcm] = useState("");
  const [chip, setChip] = useState("");
  const [frequency, setFrequency] = useState("");
  const [clavesPuerta, setClavesPuerta] = useState("");
  const [clavesContacto, setClavesContacto] = useState("");
  const [mismasClaves, setMismasClaves] = useState("");
  const [keyBlade, setKeyBlade] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen && vehicleId) {
      fetch(`/api/vehicles/${vehicleId}`)
        .then(res => res.json())
        .then(data => {
          setMake(data.make || "");
          setModel(data.model || "");
          setYear(data.year || "");
          setPatente(data.patente || "");
          setChasis(data.chasis || "");
          setPinCode(data.pinCode || "");
          setCodigoCorte(data.codigoCorte || "");
          setEcu(data.ecu || "");
          setBcm(data.bcm || "");
          setChip(data.chip || "");
          setFrequency(data.frequency || "");
          setKeyBlade(data.keyBlade || "");
          setClavesPuerta(data.clavesPuerta !== null ? String(data.clavesPuerta) : "");
          setClavesContacto(data.clavesContacto !== null ? String(data.clavesContacto) : "");
          setMismasClaves(data.mismasClaves || "");
        })
        .catch(console.error);
    }
  }, [isOpen, vehicleId]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const res = await fetch(`/api/vehicles/${vehicleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          make,
          model,
          year,
          patente,
          chasis,
          pinCode,
          codigoCorte,
          ecu,
          bcm,
          chip,
          frequency,
          keyBlade,
          clavesPuerta: clavesPuerta ? parseInt(clavesPuerta, 10) : null,
          clavesContacto: clavesContacto ? parseInt(clavesContacto, 10) : null,
          mismasClaves: mismasClaves || null
        })
      });
      if (!res.ok) throw new Error("Error saving vehicle");
      onSaved();
    } catch (e) {
      console.error(e);
      alert("Error al guardar el vehículo");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden my-auto"
        >
          <div className="sticky top-0 bg-white/80 backdrop-blur-md z-10 px-8 py-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#111111]">Editar Vehículo</h2>
            <button 
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-8 space-y-10 max-h-[70vh] overflow-y-auto">
            <div className="space-y-6">
              <h3 className="text-[18px] font-bold text-[#111111] mb-6">Datos Principales</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div><Label>Marca *</Label><Input value={make} onChange={(e: any) => setMake(e.target.value)} /></div>
                <div><Label>Modelo *</Label><Input value={model} onChange={(e: any) => setModel(e.target.value)} /></div>
                <div><Label>Año *</Label><Input value={year} onChange={(e: any) => setYear(e.target.value)} /></div>
                <div><Label>Patente</Label><Input value={patente} onChange={(e: any) => setPatente(e.target.value)} /></div>
                <div className="col-span-1 sm:col-span-2"><Label>Chasis / VIN</Label><Input value={chasis} onChange={(e: any) => setChasis(e.target.value)} /></div>
              </div>
            </div>

            <div className="space-y-6 pt-6 border-t border-[#F3F4F6]">
              <h3 className="text-[18px] font-bold text-[#111111] mb-6">Especificaciones y Códigos de Seguridad</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div><Label>PIN Code</Label><Input value={pinCode} onChange={(e: any) => setPinCode(e.target.value)} /></div>
                <div><Label>Chip (Transponder)</Label><Input value={chip} onChange={(e: any) => setChip(e.target.value)} /></div>
                <div><Label>Frecuencia</Label><Input value={frequency} onChange={(e: any) => setFrequency(e.target.value)} /></div>
                <div><Label>ECU</Label><Input value={ecu} onChange={(e: any) => setEcu(e.target.value)} /></div>
                <div><Label>BCM / Cuadro</Label><Input value={bcm} onChange={(e: any) => setBcm(e.target.value)} /></div>
              </div>
            </div>

            <div className="space-y-6 pt-6 border-t border-[#F3F4F6]">
              <h3 className="text-[18px] font-bold text-[#111111] mb-6">Cilindro</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div><Label>Espadín</Label><Input value={keyBlade} onChange={(e: any) => setKeyBlade(e.target.value)} /></div>
                <div><Label>Código de Corte</Label><Input value={codigoCorte} onChange={(e: any) => setCodigoCorte(e.target.value)} /></div>
                <div><Label>Claves Puerta</Label><Input type="number" value={clavesPuerta} onChange={(e: any) => setClavesPuerta(e.target.value)} /></div>
                <div><Label>Claves Contacto</Label><Input type="number" value={clavesContacto} onChange={(e: any) => setClavesContacto(e.target.value)} /></div>
                <div className="col-span-1 sm:col-span-2">
                  <Label>¿Mismo número de claves?</Label>
                  <div className="flex gap-4 mt-1">
                    <button
                      type="button"
                      onClick={() => setMismasClaves("Sí")}
                      className={`flex-1 py-2 px-4 rounded-lg border text-sm font-medium transition-colors ${mismasClaves === "Sí" ? "bg-black text-white border-black" : "bg-gray-50 text-gray-700 border-gray-200"}`}
                    >Sí</button>
                    <button
                      type="button"
                      onClick={() => setMismasClaves("No")}
                      className={`flex-1 py-2 px-4 rounded-lg border text-sm font-medium transition-colors ${mismasClaves === "No" ? "bg-black text-white border-black" : "bg-gray-50 text-gray-700 border-gray-200"}`}
                    >No</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 bg-white border-t border-gray-100 px-8 py-5 flex justify-end gap-3 rounded-b-2xl">
            <button 
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-black hover:bg-gray-50 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button 
              onClick={handleSave}
              disabled={isSaving || !make || !model || !year}
              className="flex items-center gap-2 px-6 py-2.5 bg-black text-white text-sm font-medium rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : <Save className="w-4 h-4" />}
              Guardar Cambios
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
