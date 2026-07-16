import { useState, useEffect } from "react";
import { Edit, Trash2, Plus, X, Search as SearchIcon, FileText } from "lucide-react";
import EditJobModal from "./EditJobModal";

const safeJsonParse = (str: string | null) => {
  if (!str) return [];
  try {
    return JSON.parse(str);
  } catch {
    return [];
  }
};

type Vehicle = {
  id: number;
  make: string;
  model: string;
  year: string;
  engine: string | null;
  ecu: string | null;
  bcm: string | null;
  immoSystem: string | null;
  chip: string | null;
  frequency: string | null;
  keyBlade: string | null;
  warnings: string | null;
  clavesPuerta: number | null;
  clavesContacto: number | null;
  mismasClaves: string | null;
  controlGenerado: string | null;
  photos: string | null;
};

export default function AdminPanel() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"vehicles" | "jobs">("vehicles");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [editingJob, setEditingJob] = useState<any | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<Partial<Vehicle>>({
    make: "", model: "", year: "", engine: "", ecu: "", bcm: "",
    immoSystem: "", chip: "", frequency: "", keyBlade: "", warnings: "",
    clavesPuerta: null, clavesContacto: null, mismasClaves: "", controlGenerado: null, photos: null
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [vehiclesRes, jobsRes] = await Promise.all([
        fetch(`/api/vehicles?_t=${Date.now()}`),
        fetch(`/api/jobs?_t=${Date.now()}`)
      ]);
      
      if (vehiclesRes.ok) {
        const data = await vehiclesRes.json();
        setVehicles(data);
      }
      if (jobsRes.ok) {
        const data = await jobsRes.json();
        setJobs(data);
      }
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (vehicle?: Vehicle) => {
    if (vehicle) {
      setEditingVehicle(vehicle);
      setFormData(vehicle);
    } else {
      setEditingVehicle(null);
      setFormData({
        make: "", model: "", year: "", engine: "", ecu: "", bcm: "",
        immoSystem: "", chip: "", frequency: "", keyBlade: "", warnings: "",
        clavesPuerta: null, clavesContacto: null, mismasClaves: "", controlGenerado: null, photos: null
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingVehicle(null);
  };

  const handleSave = async () => {
    try {
      const url = editingVehicle ? `/api/vehicles/${editingVehicle.id}` : "/api/vehicles";
      const method = editingVehicle ? "PUT" : "POST";
      
      const payload = { ...formData };
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        fetchData();
        handleCloseModal();
      } else {
        alert("Error saving vehicle");
      }
    } catch (error) {
      console.error("Save error", error);
      alert("Error saving vehicle");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar este vehículo y todos sus trabajos asociados?")) return;
    try {
      const res = await fetch(`/api/vehicles/${id}`, { method: "DELETE" });
      if (res.ok) {
        setVehicles(vehicles.filter(v => v.id !== id));
      } else {
        alert("Error deleting vehicle");
      }
    } catch (error) {
      console.error("Delete error", error);
    }
  };

  const handleDeleteJob = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar este trabajo?")) return;
    try {
      const res = await fetch(`/api/jobs/${id}`, { method: "DELETE" });
      if (res.ok) {
        setJobs(jobs.filter(j => j.id !== id));
      } else {
        alert("Error deleting job");
      }
    } catch (error) {
      console.error("Delete job error", error);
    }
  };

  const filteredVehicles = vehicles.filter(v => 
    `${v.make} ${v.model} ${v.year}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredJobs = jobs.filter(j => 
    `${j.jobType} ${j.tipoServicio}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold tracking-tight">Panel de Administración</h2>
        {activeTab === "vehicles" && (
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-full font-medium text-sm hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Añadir Vehículo
          </button>
        )}
      </div>
      
      <div className="flex gap-4 mb-6">
        <button 
          onClick={() => setActiveTab("vehicles")}
          className={`px-4 py-2 font-medium text-sm rounded-full transition-colors ${activeTab === "vehicles" ? "bg-black text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
        >
          Vehículos
        </button>
        <button 
          onClick={() => setActiveTab("jobs")}
          className={`px-4 py-2 font-medium text-sm rounded-full transition-colors ${activeTab === "jobs" ? "bg-black text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
        >
          Trabajos
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center gap-3">
          <SearchIcon className="w-5 h-5 text-gray-400" />
          <input 
            type="text"
            placeholder={activeTab === "vehicles" ? "Buscar por marca, modelo o año..." : "Buscar por tipo de servicio..."}
            className="flex-1 outline-none text-sm placeholder:text-gray-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="overflow-x-auto">
          {activeTab === "vehicles" ? (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50/50 text-gray-500 font-medium">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Vehículo</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan={3} className="px-6 py-12 text-center text-gray-400">Cargando datos...</td></tr>
                ) : filteredVehicles.length === 0 ? (
                  <tr><td colSpan={3} className="px-6 py-12 text-center text-gray-400">No se encontraron vehículos.</td></tr>
                ) : (
                  filteredVehicles.map(v => (
                    <tr key={v.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 text-gray-400">{v.id}</td>
                      <td className="px-6 py-4 font-medium">{v.make} {v.model} {v.year}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleOpenModal(v)} className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition-colors">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(v.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50/50 text-gray-500 font-medium">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Tipo de Servicio</th>
                  <th className="px-6 py-4">Vehículo ID</th>
                  <th className="px-6 py-4">Fecha</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400">Cargando datos...</td></tr>
                ) : filteredJobs.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400">No se encontraron trabajos.</td></tr>
                ) : (
                  filteredJobs.map(j => (
                    <tr key={j.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 text-gray-400">{j.id}</td>
                      <td className="px-6 py-4 font-medium">{j.jobType || j.tipoServicio}</td>
                      <td className="px-6 py-4 text-gray-500">{j.vehicleId}</td>
                      <td className="px-6 py-4 text-gray-500">{new Date(j.date).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => setEditingJob(j)} className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition-colors" title="Editar trabajo">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteJob(j.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-xl">
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between shrink-0">
              <h3 className="text-xl font-bold">{editingVehicle ? "Editar Vehículo" : "Nuevo Vehículo"}</h3>
              <button onClick={handleCloseModal} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-8 overflow-y-auto">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Marca</label>
                  <input type="text" value={formData.make || ""} onChange={e => setFormData({...formData, make: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Modelo</label>
                  <input type="text" value={formData.model || ""} onChange={e => setFormData({...formData, model: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Año</label>
                  <input type="text" value={formData.year || ""} onChange={e => setFormData({...formData, year: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Motor</label>
                  <input type="text" value={formData.engine || ""} onChange={e => setFormData({...formData, engine: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Sistema Immo</label>
                  <input type="text" value={formData.immoSystem || ""} onChange={e => setFormData({...formData, immoSystem: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">ECU</label>
                  <input type="text" value={formData.ecu || ""} onChange={e => setFormData({...formData, ecu: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">BCM</label>
                  <input type="text" value={formData.bcm || ""} onChange={e => setFormData({...formData, bcm: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Chip</label>
                  <input type="text" value={formData.chip || ""} onChange={e => setFormData({...formData, chip: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Frecuencia</label>
                  <input type="text" value={formData.frequency || ""} onChange={e => setFormData({...formData, frequency: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Espadín</label>
                  <input type="text" value={formData.keyBlade || ""} onChange={e => setFormData({...formData, keyBlade: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Claves en Puerta</label>
                  <input type="number" value={formData.clavesPuerta !== null && formData.clavesPuerta !== undefined ? formData.clavesPuerta : ""} onChange={e => setFormData({...formData, clavesPuerta: e.target.value ? parseInt(e.target.value, 10) : null})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Claves en Contacto</label>
                  <input type="number" value={formData.clavesContacto !== null && formData.clavesContacto !== undefined ? formData.clavesContacto : ""} onChange={e => setFormData({...formData, clavesContacto: e.target.value ? parseInt(e.target.value, 10) : null})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">ID Control VVDI</label>
                  <input type="text" value={formData.controlGenerado || ""} onChange={e => setFormData({...formData, controlGenerado: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">¿Mismo número de claves?</label>
                  <select value={formData.mismasClaves || ""} onChange={e => setFormData({...formData, mismasClaves: e.target.value || null})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all">
                    <option value="">Seleccionar...</option>
                    <option value="Sí">Sí</option>
                    <option value="No">No</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="px-8 py-6 border-t border-gray-100 flex justify-end gap-3 shrink-0">
              <button onClick={handleCloseModal} className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-black transition-colors">Cancelar</button>
              <button onClick={handleSave} className="px-5 py-2.5 text-sm font-medium bg-black text-white rounded-full hover:opacity-90 transition-opacity">Guardar Cambios</button>
            </div>
          </div>
        </div>
      )}

      <EditJobModal 
        job={editingJob} 
        isOpen={!!editingJob} 
        onClose={() => setEditingJob(null)} 
        onSaved={() => {
          setEditingJob(null);
          fetchData();
        }} 
      />
    </div>
  );
}
