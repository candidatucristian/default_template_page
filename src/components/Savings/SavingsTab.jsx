import React, { useState } from "react";
import { useBudget } from "../../context/BudgetContext";
import { formatMoney } from "../../utils/helpers";
import {
  FaPlus,
  FaChartLine,
  FaGem,
  FaTrash,
  FaPen,
  FaTimes,
  FaCheck,
  FaBuilding,
  FaWallet,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

// CONFIGURARE NEON + COLOANE
const SECTIONS = {
  cash: {
    id: "cash",
    title: "Lichidități",
    subtitle: "Fonduri de urgență, conturi curente, Cash",
    icon: <FaWallet />,
    // Culori specifice
    color: "text-emerald-400",
    border: "border-emerald-500/30",
    glow: "shadow-[0_0_30px_-10px_rgba(16,185,129,0.3)]",
    bgGradient: "from-emerald-500/10 to-transparent",
    buttonHover:
      "hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/50",
  },
  invest: {
    id: "invest",
    title: "Investiții",
    subtitle: "Acțiuni, Crypto, ETF-uri",
    icon: <FaChartLine />,
    color: "text-blue-400",
    border: "border-blue-500/30",
    glow: "shadow-[0_0_30px_-10px_rgba(59,130,246,0.3)]",
    bgGradient: "from-blue-500/10 to-transparent",
    buttonHover:
      "hover:bg-blue-500/10 hover:text-blue-400 hover:border-blue-500/50",
  },
  assets: {
    id: "assets",
    title: "Active Fixe",
    subtitle: "Imobiliare, Aur, Bijuterii, Mașini",
    icon: <FaBuilding />,
    color: "text-purple-400",
    border: "border-purple-500/30",
    glow: "shadow-[0_0_30px_-10px_rgba(168,85,247,0.3)]",
    bgGradient: "from-purple-500/10 to-transparent",
    buttonHover:
      "hover:bg-purple-500/10 hover:text-purple-400 hover:border-purple-500/50",
  },
  windfall: {
    id: "windfall",
    title: "Diverse",
    subtitle: "Moșteniri, Bonusuri, Câștiguri Loto",
    icon: <FaGem />,
    color: "text-amber-400",
    border: "border-amber-500/30",
    glow: "shadow-[0_0_30px_-10px_rgba(251,191,36,0.3)]",
    bgGradient: "from-amber-500/10 to-transparent",
    buttonHover:
      "hover:bg-amber-500/10 hover:text-amber-400 hover:border-amber-500/50",
  },
};

const SavingsTab = () => {
  const { state, dispatch } = useBudget();
  const { savings } = state;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    type: "cash",
    note: "",
  });

  const totalWealth = savings.reduce(
    (acc, item) => acc + parseFloat(item.amount),
    0
  );

  // --- ACTIONS ---
  const openAdd = (type) => {
    setEditId(null);
    setFormData({ name: "", amount: "", type: type, note: "" });
    setIsModalOpen(true);
  };

  const openEdit = (item) => {
    setEditId(item.id);
    setFormData({
      name: item.name,
      amount: item.amount,
      type: item.type,
      note: item.note || "",
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.amount) return;

    if (editId) {
      dispatch({
        type: "UPDATE_SAVING",
        payload: {
          id: editId,
          updatedData: { ...formData, amount: parseFloat(formData.amount) },
        },
      });
    } else {
      dispatch({
        type: "ADD_SAVING",
        payload: {
          ...formData,
          amount: parseFloat(formData.amount),
          date: new Date().toISOString().split("T")[0],
          id: Date.now(),
        },
      });
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm("Ștergi acest activ?")) {
      dispatch({ type: "DELETE_SAVING", payload: id });
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] animate-enter pb-6">
      {/* HEADER: NET WORTH GLOW */}
      <div className="flex items-end justify-between mb-8 px-2">
        <div>
          <h2 className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.3em] mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Status Portofoliu
          </h2>
          <div className="text-6xl font-black text-white tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.15)]">
            {formatMoney(totalWealth).ron}
          </div>
        </div>
        <div className="hidden md:block text-right">
          <div className="px-4 py-2 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-bold uppercase tracking-wider">
            {savings.length} Active Totale
          </div>
        </div>
      </div>

      {/* COLOANE NEON */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
        <div className="flex gap-6 h-full min-w-[1200px] md:min-w-0 px-2">
          {Object.values(SECTIONS).map((col) => {
            const colItems = savings.filter((s) => s.type === col.id);
            const colTotal = colItems.reduce(
              (acc, item) => acc + parseFloat(item.amount),
              0
            );

            return (
              <div
                key={col.id}
                className={`flex-1 flex flex-col min-w-[300px] rounded-[2.5rem] bg-zinc-950 border border-zinc-900 relative overflow-hidden shadow-2xl group/col`}
              >
                {/* 1. COLUMN HEADER (Premium Glass) */}
                <div className="relative p-6 z-10">
                  {/* Background Gradient */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-b ${col.bgGradient} opacity-50`}
                  ></div>

                  {/* Icon Background (Big) */}
                  <div
                    className={`absolute -right-4 -top-4 text-8xl opacity-10 rotate-12 ${col.color} transition-transform group-hover/col:scale-110 duration-700`}
                  >
                    {col.icon}
                  </div>

                  <div className="relative z-20">
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className={`w-12 h-12 rounded-2xl bg-zinc-900/80 backdrop-blur-md border border-white/5 flex items-center justify-center text-xl ${col.color} ${col.glow}`}
                      >
                        {col.icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white leading-none">
                          {col.title}
                        </h3>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-1">
                          {col.subtitle}
                        </p>
                      </div>
                    </div>
                    <div className="text-3xl font-black font-mono text-white tracking-tight">
                      {formatMoney(colTotal, false)}
                    </div>
                  </div>
                </div>

                {/* 2. CARD LIST (Chips) */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3 bg-zinc-900/30">
                  {colItems.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-30">
                      <div className={`text-4xl mb-2 ${col.color} grayscale`}>
                        {col.icon}
                      </div>
                      <span className="text-xs text-zinc-500 uppercase tracking-widest">
                        Listă goală
                      </span>
                    </div>
                  ) : (
                    colItems.map((item) => (
                      <motion.div
                        layoutId={item.id}
                        key={item.id}
                        onClick={() => openEdit(item)}
                        className={`
                                            group/card relative p-4 rounded-2xl cursor-pointer transition-all duration-300
                                            bg-zinc-900/80 border border-white/5 hover:border-white/20 hover:shadow-xl hover:-translate-y-1 overflow-hidden
                                        `}
                      >
                        {/* Subtle Side Glow */}
                        <div
                          className={`absolute left-0 top-0 bottom-0 w-1 opacity-0 group-hover/card:opacity-100 transition-opacity ${col.color.replace(
                            "text-",
                            "bg-"
                          )}`}
                        ></div>

                        <div className="relative z-10">
                          <div className="flex justify-between items-start mb-2">
                            <div className="font-bold text-zinc-100 text-sm truncate pr-6">
                              {item.name}
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(item.id);
                              }}
                              className="absolute top-0 right-0 p-2 text-zinc-600 hover:text-red-500 opacity-0 group-hover/card:opacity-100 transition-opacity"
                            >
                              <FaTrash size={10} />
                            </button>
                          </div>

                          <div className="flex justify-between items-end">
                            <div className="text-[10px] text-zinc-500 uppercase font-medium max-w-[120px] truncate">
                              {item.note || "---"}
                            </div>
                            <div
                              className={`font-mono font-bold text-base ${col.color} drop-shadow-sm`}
                            >
                              {parseFloat(item.amount).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>

                {/* 3. ADD BUTTON (Neon Dashed) */}
                <div className="p-4 bg-zinc-950/80 backdrop-blur-md border-t border-white/5">
                  <button
                    onClick={() => openAdd(col.id)}
                    className={`w-full py-3 rounded-xl border border-dashed border-zinc-800 text-zinc-500 text-xs font-bold uppercase tracking-widest transition-all ${col.buttonHover} flex items-center justify-center gap-2`}
                  >
                    <FaPlus /> Adaugă
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* --- MODAL (Clean Glass) --- */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-zinc-950 border border-white/10 rounded-3xl shadow-2xl overflow-hidden p-6 space-y-5"
            >
              <div className="flex justify-between items-center">
                <div className="text-zinc-400 text-xs font-bold uppercase tracking-widest">
                  {editId ? "Modifică" : "Adaugă"} •{" "}
                  <span className={SECTIONS[formData.type].color}>
                    {SECTIONS[formData.type].title}
                  </span>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-zinc-500 hover:text-white"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="flex justify-center items-baseline gap-2 pb-4 border-b border-white/5">
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  placeholder="0"
                  autoFocus
                  className="bg-transparent text-4xl font-bold text-white text-center w-full max-w-[200px] outline-none placeholder-zinc-800 caret-emerald-500"
                />
                <span className="text-lg text-zinc-600 font-medium">RON</span>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-500 font-bold uppercase ml-1">
                    Denumire
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder={
                      formData.type === "invest"
                        ? "ex: Palantir, Nvidia"
                        : "ex: Cont Economii"
                    }
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-emerald-500/50 transition-all placeholder-zinc-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-500 font-bold uppercase ml-1">
                    Detalii (Opțional)
                  </label>
                  <input
                    type="text"
                    value={formData.note}
                    onChange={(e) =>
                      setFormData({ ...formData, note: e.target.value })
                    }
                    placeholder="ex: Randament +20%"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-emerald-500/50 transition-all placeholder-zinc-600"
                  />
                </div>
              </div>

              <button
                onClick={handleSave}
                className="w-full py-3 bg-white text-black font-bold rounded-xl shadow hover:scale-[1.02] active:scale-[0.98] transition-all flex justify-center items-center gap-2"
              >
                <FaCheck /> Salvează
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SavingsTab;
