import { useState, useEffect } from "react";
import { Search as SearchIcon, ChevronRight, Plus, Shield } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface SearchProps {
  onSelectVehicle: (id: number) => void;
  onRegistrar: () => void;
  onAdmin: () => void;
}

export default function Search({ onSelectVehicle, onRegistrar, onAdmin }: SearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (query.trim().length === 0) {
      setResults([]);
      return;
    }

    const fetchResults = async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data);
      } catch (err) {
        console.error("Search failed", err);
      }
    };

    const timer = setTimeout(fetchResults, 150);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="h-[calc(100vh-5rem)] w-full flex flex-col items-center pt-[20vh] px-6 relative bg-white">
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-3xl flex flex-col items-center relative z-10"
      >
        <div className="mb-12 flex flex-col items-center gap-6">
          <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center shadow-sm">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h1 className="text-[32px] font-semibold tracking-tight text-[#111111]">Llave Maestra</h1>
        </div>

        <div className="w-full relative group">
          <div className={`absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none transition-opacity duration-300 ${isFocused ? 'opacity-100' : 'opacity-40'}`}>
            <SearchIcon className="h-5 w-5 text-[#111111]" strokeWidth={2} />
          </div>
          <input
            type="text"
            className="w-full h-[64px] bg-white border border-[#E5E7EB] rounded-2xl pl-16 pr-6 text-lg focus:outline-none focus:ring-[3px] focus:ring-[#111111]/10 focus:border-[#111111] transition-all text-[#111111] placeholder-[#9CA3AF] shadow-sm"
            placeholder="Buscar por Marca, Modelo, ECU, etc..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            autoFocus
          />
        </div>

        <AnimatePresence>
          {results.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="w-full mt-4 bg-white rounded-2xl shadow-[0_12px_40px_rgb(0,0,0,0.08)] border border-[#F3F4F6] overflow-hidden absolute top-full left-0"
            >
              {results.map((v) => (
                <div
                  key={v.id}
                  onClick={() => onSelectVehicle(v.id)}
                  className="px-6 py-4 border-b border-[#F9FAFB] last:border-0 hover:bg-[#F9FAFB] cursor-pointer transition-colors flex items-center justify-between group"
                >
                  <div className="flex flex-col">
                    <div className="flex items-center gap-3">
                      <span className="text-[15px] font-medium text-[#111111]">{v.make} {v.model} {v.year} {v.patente && `| Patente: ${v.patente}`}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      {v.ecu && <span className="text-[13px] text-[#6B7280]">ECU: {v.ecu}</span>}
                      {v.immoSystem && (
                        <>
                          <span className="w-1 h-1 bg-[#D1D5DB] rounded-full"></span>
                          <span className="text-[13px] text-[#6B7280]">{v.immoSystem}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <ChevronRight className="w-4 h-4 text-[#D1D5DB] group-hover:text-[#111111] transition-colors" />
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <div className="absolute bottom-10 flex items-center gap-4 opacity-60 hover:opacity-100 transition-opacity">
        <button 
          onClick={onAdmin}
          className="flex items-center gap-2 px-5 h-10 bg-transparent text-[#111111] rounded-full font-medium text-[13px] hover:bg-[#F9FAFB] transition-colors border border-transparent hover:border-[#E5E7EB]"
        >
          <Shield className="w-4 h-4" />
          Panel de Administración
        </button>
        <button 
          onClick={onRegistrar}
          className="flex items-center gap-2 px-5 h-10 bg-transparent text-[#111111] rounded-full font-medium text-[13px] hover:bg-[#F9FAFB] transition-colors border border-transparent hover:border-[#E5E7EB]"
        >
          <Plus className="w-4 h-4" />
          Registrar nuevo trabajo
        </button>
      </div>
    </div>
  );
}
