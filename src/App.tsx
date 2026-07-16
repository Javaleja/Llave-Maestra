/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import Search from "./components/Search";
import Ficha from "./components/Ficha";
import Registrar from "./components/Registrar";
import AdminPanel from "./components/AdminPanel";
import { Shield } from "lucide-react";

export default function App() {
  const [currentView, setCurrentView] = useState<"search" | "ficha" | "registrar" | "admin">("search");
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);
  const [editingJobId, setEditingJobId] = useState<number | null>(null);

  const navigateToFicha = (id: number) => {
    setSelectedVehicleId(id);
    setCurrentView("ficha");
    setEditingJobId(null);
  };

  const navigateToSearch = () => {
    setCurrentView("search");
    setSelectedVehicleId(null);
    setEditingJobId(null);
  };

  const navigateToRegistrar = () => {
    setCurrentView("registrar");
    setEditingJobId(null);
    setSelectedVehicleId(null);
  };

  const handleEditJob = (jobId: number) => {
    setEditingJobId(jobId);
    setCurrentView("registrar");
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#111827] font-sans selection:bg-blue-100 flex flex-col">
      {/* Global Minimalist Header - Only show if not in search (search has its own massive flow) */}
      {currentView !== "search" && (
        <header className="sticky top-0 z-50 bg-white border-b border-gray-100 h-20 px-8 flex items-center justify-between shrink-0">
          <button 
            onClick={navigateToSearch}
            className="flex items-center gap-4 hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <span className="font-bold text-xl tracking-tight">Llave Maestra</span>
          </button>
          <div className="flex gap-4">
            {currentView !== "admin" && (
              <button 
                onClick={() => {
                  setCurrentView("admin");
                  setSelectedVehicleId(null);
                  setEditingJobId(null);
                }}
                className="flex items-center gap-2 px-5 h-11 bg-white border border-gray-200 text-black rounded-full font-medium text-sm hover:bg-gray-50 transition-colors"
              >
                <Shield className="w-4 h-4" />
                Panel Admin
              </button>
            )}
            {currentView !== "registrar" && (
              <button 
                onClick={navigateToRegistrar}
                className="flex items-center gap-2 px-5 h-11 bg-black text-white rounded-full font-medium text-sm hover:opacity-90 transition-opacity"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                Registrar Trabajo
              </button>
            )}
          </div>
        </header>
      )}

      <main className="flex-1 w-full mx-auto max-w-5xl relative">
        {currentView === "search" && (
          <Search onSelectVehicle={navigateToFicha} onRegistrar={navigateToRegistrar} onAdmin={() => {
            setCurrentView("admin");
            setSelectedVehicleId(null);
            setEditingJobId(null);
          }} />
        )}
        {currentView === "ficha" && selectedVehicleId && (
          <Ficha vehicleId={selectedVehicleId} onEditJob={handleEditJob} />
        )}
        {currentView === "registrar" && (
          <Registrar onSave={() => selectedVehicleId ? navigateToFicha(selectedVehicleId) : navigateToSearch()} vehicleId={selectedVehicleId} jobId={editingJobId} />
        )}
        {currentView === "admin" && (
          <AdminPanel />
        )}
      </main>
    </div>
  );
}

