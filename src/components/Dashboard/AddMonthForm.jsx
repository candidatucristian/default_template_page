import React, { useState } from "react";
import { useBudget } from "../../context/BudgetContext";
import {
  FaRocket,
  FaPlus,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaWallet,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const RO_MONTHS = [
  "Ianuarie",
  "Februarie",
  "Martie",
  "Aprilie",
  "Mai",
  "Iunie",
  "Iulie",
  "August",
  "Septembrie",
  "Octombrie",
  "Noiembrie",
  "Decembrie",
];

const AddMonthForm = ({ onSuccess }) => {
  const { state, dispatch } = useBudget();
  const { months } = state;
  const isNewUser = months.length === 0;

  // --- STATE ---
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(
    new Date().getMonth()
  );
  const [budget, setBudget] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!budget || parseFloat(budget) <= 0) return;

    const monthName = `${RO_MONTHS[selectedMonthIndex]} ${selectedYear}`;

    if (months.some((m) => m.name === monthName)) {
      alert("Această lună există deja! Alege alta.");
      return;
    }

    dispatch({
      type: "ADD_MONTH",
      payload: { name: monthName, budget: parseFloat(budget) },
    });

    if (selectedMonthIndex === 11) {
      setSelectedMonthIndex(0);
      setSelectedYear((prev) => prev + 1);
    } else {
      setSelectedMonthIndex((prev) => prev + 1);
    }
    setBudget("");
    setIsExpanded(false);
    onSuccess?.(`Luna ${monthName} a fost creată! 🚀`);
  };

  // --- COMPONENTA INTERNĂ: SELECTORUL DE TIMP ---
  const TimeSelector = () => (
    <div className="space-y-6">
      {/* YEAR SELECTOR */}
      <div className="flex items-center justify-between bg-black/20 p-2 rounded-xl border border-zinc-700/50">
        <button
          type="button"
          onClick={() => setSelectedYear(selectedYear - 1)}
          className="p-3 text-zinc-500 hover:text-white hover:bg-zinc-700 rounded-lg transition-colors"
        >
          <FaChevronLeft />
        </button>
        <div className="text-2xl font-black text-white font-mono tracking-widest">
          {selectedYear}
        </div>
        <button
          type="button"
          onClick={() => setSelectedYear(selectedYear + 1)}
          className="p-3 text-zinc-500 hover:text-white hover:bg-zinc-700 rounded-lg transition-colors"
        >
          <FaChevronRight />
        </button>
      </div>

      {/* MONTH GRID (REPARAT SPAȚIEREA) */}
      <div className="grid grid-cols-3 gap-2">
        {RO_MONTHS.map((m, idx) => {
          const isActive = idx === selectedMonthIndex;
          return (
            <button
              key={m}
              type="button"
              onClick={() => setSelectedMonthIndex(idx)}
              className={`
                            py-3 px-1 rounded-xl text-sm font-bold transition-all duration-200 border
                            ${
                              isActive
                                ? "bg-emerald-600 border-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)] z-10"
                                : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-600 hover:bg-zinc-800"
                            }
                        `}
            >
              {/* AICI AM SCOS SPAȚIUL DINTRE SLICE-URI */}
              {m.slice(0, 3)}
              <span className="hidden sm:inline">{m.slice(3)}</span>
            </button>
          );
        })}
      </div>

      {/* BUDGET INPUT */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <FaWallet
            className={`text-lg transition-colors ${
              budget ? "text-emerald-500" : "text-zinc-600"
            }`}
          />
        </div>
        <input
          type="number"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          placeholder="Buget Total (ex: 5000)"
          className="w-full bg-black/30 border-2 border-zinc-700 rounded-2xl py-4 pl-12 pr-12 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 focus:bg-zinc-900/50 transition-all text-xl font-bold font-mono"
          autoFocus
        />
        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-zinc-500 font-bold text-sm">
          RON
        </div>
      </div>
    </div>
  );

  // --- VIEW 1: WELCOME SCREEN (NEW USER) ---
  if (isNewUser) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center animate-fade-in relative">
        <div className="absolute w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none"></div>

        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative z-10 w-full max-w-lg"
        >
          <div className="bg-[#09090b]/80 backdrop-blur-2xl border border-zinc-800 p-8 rounded-[2rem] shadow-2xl">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center text-3xl text-white shadow-lg mb-4">
                👋
              </div>
              <h1 className="text-3xl font-black text-white mb-2">
                Bun venit!
              </h1>
              <p className="text-zinc-400">
                Alege data și bugetul pentru a începe.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <TimeSelector />

              <button className="w-full mt-8 bg-white hover:bg-zinc-200 text-black font-black py-4 rounded-xl shadow-lg transform  transition-all flex items-center justify-center gap-2 text-lg">
                <FaRocket className="text-emerald-600" /> Lansează Bugetul
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  // --- VIEW 2: DASHBOARD ACTION (EXISTING USER) ---
  // REPARAT: Buton Verde și Aliniat la Dreapta
  return (
    <div className="mb-10">
      <AnimatePresence mode="wait">
        {!isExpanded ? (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex justify-start" // <-- ALINIERE DREAPTA
          >
            <button
              onClick={() => setIsExpanded(true)}
              // <-- CULOARE VERDE & UMBRĂ
              className="group relative bg-emerald-600 hover:bg-emerald-500 rounded-2xl p-2 pr-6 flex items-center gap-4 transition-all shadow-lg shadow-emerald-900/20 hover:shadow-emerald-500/30 "
            >
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-white transition-all">
                <FaPlus />
              </div>
              <div className="">
                <div className="text-white font-bold">Lună Nouă</div>
                <div className="text-emerald-100 text-xs">
                  Planifică următorul buget
                </div>
              </div>
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-zinc-900/95 border border-zinc-800 backdrop-blur-xl p-6 rounded-3xl relative shadow-2xl max-w-2xl mx-auto"
          >
            <button
              onClick={() => setIsExpanded(false)}
              className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white bg-zinc-800/50 hover:bg-zinc-700 rounded-full transition-colors z-20"
            >
              <FaTimes />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="text-emerald-500">●</span> Planificator
              </h3>
            </div>

            <form onSubmit={handleSubmit}>
              <TimeSelector />

              <div className="mt-6 flex justify-end">
                <button className="px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all ">
                  Creează Luna
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AddMonthForm;
