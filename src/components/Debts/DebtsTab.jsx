import React, { useState, useMemo } from "react";
import { useBudget } from "../../context/BudgetContext";
import { formatMoney, getCurrentDateTime } from "../../utils/helpers";
import Modal from "../Common/Modal";
import {
  FaPlus,
  FaTrash,
  FaCheck,
  FaArrowUp,
  FaArrowDown,
  FaHandHoldingUsd,
  FaMoneyBillWave,
  FaBalanceScale,
  FaUserFriends,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const DebtsTab = ({ showToast }) => {
  const { state, dispatch } = useBudget();
  const { debts } = state;

  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState("active"); // 'active' | 'history'
  const [formData, setFormData] = useState({
    person: "",
    amount: "",
    type: "owed_to_me",
    reason: "",
    date: getCurrentDateTime().isoDate,
  });

  // --- STATISTICI ---
  const activeDebts = debts.filter((d) => !d.settled);
  const historyDebts = debts.filter((d) => d.settled);

  const owedToMe = activeDebts
    .filter((d) => d.type === "owed_to_me")
    .reduce((a, d) => a + d.amount, 0);
  const iOwe = activeDebts
    .filter((d) => d.type === "i_owe")
    .reduce((a, d) => a + d.amount, 0);
  const balance = owedToMe - iOwe;

  // Grupăm datoriile pe persoane pentru a vedea "Cine e cel mai rău platnic" :)
  const peopleStats = useMemo(() => {
    const stats = {};
    activeDebts.forEach((d) => {
      if (!stats[d.person]) stats[d.person] = { total: 0, count: 0 };
      if (d.type === "owed_to_me") stats[d.person].total += d.amount;
      else stats[d.person].total -= d.amount;
      stats[d.person].count++;
    });
    return Object.entries(stats).sort((a, b) => b[1].total - a[1].total); // Sortăm după cine ne datorează cel mai mult
  }, [activeDebts]);

  const handleAddDebt = () => {
    if (
      !formData.person.trim() ||
      !formData.amount ||
      parseFloat(formData.amount) <= 0
    )
      return;
    dispatch({
      type: "ADD_DEBT",
      payload: {
        person: formData.person.trim(),
        amount: parseFloat(formData.amount),
        type: formData.type,
        reason: formData.reason.trim(),
        date: formData.date
          ? new Date(formData.date).toLocaleDateString("ro-RO")
          : "",
      },
    });
    setFormData({
      person: "",
      amount: "",
      type: "owed_to_me",
      reason: "",
      date: getCurrentDateTime().isoDate,
    });
    setShowAddModal(false);
    showToast?.("Datorie înregistrată! 📝");
  };

  const handleSettle = (id) => {
    if (window.confirm("Această datorie a fost achitată integral?")) {
      dispatch({ type: "SETTLE_DEBT", payload: id });
      showToast?.("Datorie stinsă! 🎉");
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Ștergi definitiv această înregistrare?")) {
      dispatch({ type: "DELETE_DEBT", payload: id });
      showToast?.("Înregistrare ștearsă");
    }
  };

  return (
    <div className="animate-fade-in pb-20 space-y-8">
      {/* --- HERO DASHBOARD --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Balanță Netă */}
        <div className="bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 p-6 rounded-3xl relative overflow-hidden shadow-lg flex flex-col justify-between h-40">
          <div className="absolute right-0 top-0 p-4 opacity-10">
            <FaBalanceScale size={80} className="text-white" />
          </div>
          <div>
            <h3 className="text-zinc-400 font-bold uppercase tracking-wider text-xs mb-1">
              Balanță Netă
            </h3>
            <div
              className={`text-4xl font-black font-mono ${
                balance >= 0 ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {balance > 0 ? "+" : ""}
              {formatMoney(balance).ron}
            </div>
          </div>
          <div className="text-xs text-zinc-500">
            {balance > 0
              ? "Ești pe plus. Lumea îți datorează bani."
              : "Ești pe minus. Ai datorii de achitat."}
          </div>
        </div>

        {/* Card 2: Îmi Datorează (Assets) */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl relative overflow-hidden shadow-lg flex flex-col justify-between h-40 group hover:border-emerald-500/30 transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-emerald-500 font-bold uppercase tracking-wider text-xs mb-1 flex items-center gap-2">
                <FaArrowDown /> De Primit
              </h3>
              <div className="text-3xl font-bold text-white font-mono">
                {formatMoney(owedToMe).ron}
              </div>
            </div>
            <div className="bg-emerald-500/10 p-3 rounded-xl text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
              <FaHandHoldingUsd size={24} />
            </div>
          </div>
          <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden mt-4">
            <div
              className="h-full bg-emerald-500"
              style={{ width: `${(owedToMe / (owedToMe + iOwe || 1)) * 100}%` }}
            />
          </div>
        </div>

        {/* Card 3: Datorez (Liabilities) */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl relative overflow-hidden shadow-lg flex flex-col justify-between h-40 group hover:border-red-500/30 transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-red-500 font-bold uppercase tracking-wider text-xs mb-1 flex items-center gap-2">
                <FaArrowUp /> De Dat
              </h3>
              <div className="text-3xl font-bold text-white font-mono">
                {formatMoney(iOwe).ron}
              </div>
            </div>
            <div className="bg-red-500/10 p-3 rounded-xl text-red-500 group-hover:bg-red-500 group-hover:text-white transition-colors">
              <FaMoneyBillWave size={24} />
            </div>
          </div>
          <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden mt-4">
            <div
              className="h-full bg-red-500"
              style={{ width: `${(iOwe / (owedToMe + iOwe || 1)) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* --- LEFT COLUMN: PEOPLE & ACTIONS --- */}
        <div className="space-y-6">
          {/* Quick Add Button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full py-4 bg-white hover:bg-zinc-200 text-black font-bold rounded-2xl shadow-lg hover:shadow-xl  transition-all flex items-center justify-center gap-2"
          >
            <FaPlus /> Înregistrează Datorie
          </button>

          {/* People Summary */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <FaUserFriends className="text-zinc-500" /> Top Persoane
            </h3>
            <div className="space-y-3">
              {peopleStats.length === 0 ? (
                <div className="text-zinc-500 text-sm text-center py-4">
                  Nu ai datorii active.
                </div>
              ) : (
                peopleStats.map(([name, stat], idx) => (
                  <div
                    key={name}
                    className="flex justify-between items-center text-sm border-b border-zinc-800/50 pb-2 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          stat.total > 0
                            ? "bg-emerald-500/20 text-emerald-500"
                            : stat.total < 0
                            ? "bg-red-500/20 text-red-500"
                            : "bg-zinc-800 text-zinc-400"
                        }`}
                      >
                        {name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-zinc-300 font-medium">{name}</span>
                    </div>
                    <span
                      className={`font-mono font-bold ${
                        stat.total > 0
                          ? "text-emerald-400"
                          : stat.total < 0
                          ? "text-red-400"
                          : "text-zinc-500"
                      }`}
                    >
                      {stat.total > 0 ? "+" : ""}
                      {stat.total}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* --- RIGHT COLUMN: ACTIVE DEBTS LIST --- */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => setActiveTab("active")}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                activeTab === "active"
                  ? "bg-zinc-100 text-black"
                  : "text-zinc-500 hover:text-white"
              }`}
            >
              Active ({activeDebts.length})
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                activeTab === "history"
                  ? "bg-zinc-100 text-black"
                  : "text-zinc-500 hover:text-white"
              }`}
            >
              Istoric ({historyDebts.length})
            </button>
          </div>

          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {(activeTab === "active" ? activeDebts : historyDebts).length ===
              0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-20 bg-zinc-900/30 border-2 border-dashed border-zinc-800 rounded-3xl"
                >
                  <div className="text-4xl mb-2 opacity-30">📭</div>
                  <p className="text-zinc-500">Lista este goală.</p>
                </motion.div>
              ) : (
                (activeTab === "active" ? activeDebts : historyDebts).map(
                  (debt) => (
                    <motion.div
                      key={debt.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={`flex items-center justify-between p-5 bg-zinc-900 border rounded-2xl transition-all hover:translate-x-1 ${
                        debt.type === "owed_to_me"
                          ? "border-zinc-800 hover:border-emerald-500/30"
                          : "border-zinc-800 hover:border-red-500/30"
                      }`}
                    >
                      <div className="flex items-center gap-5">
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-inner ${
                            debt.type === "owed_to_me"
                              ? "bg-emerald-500/10 text-emerald-500"
                              : "bg-red-500/10 text-red-500"
                          }`}
                        >
                          {debt.type === "owed_to_me" ? (
                            <FaArrowDown />
                          ) : (
                            <FaArrowUp />
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-lg">
                            {debt.person}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-zinc-500">
                            <span className="bg-zinc-800 px-2 py-0.5 rounded">
                              {debt.date}
                            </span>
                            <span>•</span>
                            <span>{debt.reason || "Fără motiv"}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div
                          className={`text-xl font-black font-mono ${
                            debt.type === "owed_to_me"
                              ? "text-emerald-400"
                              : "text-red-400"
                          }`}
                        >
                          {formatMoney(debt.amount).ron}
                        </div>

                        {activeTab === "active" && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSettle(debt.id)}
                              className="p-3 bg-zinc-800 hover:bg-emerald-500 hover:text-white text-zinc-400 rounded-xl transition-all"
                              title="Marchează Achitat"
                            >
                              <FaCheck />
                            </button>
                            <button
                              onClick={() => handleDelete(debt.id)}
                              className="p-3 bg-zinc-800 hover:bg-red-500 hover:text-white text-zinc-400 rounded-xl transition-all"
                              title="Șterge"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )
                )
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* --- MODAL ADAUGĂ --- */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="💸 Adaugă Datorie"
        size="md"
      >
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setFormData({ ...formData, type: "owed_to_me" })}
              className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                formData.type === "owed_to_me"
                  ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                  : "border-zinc-700 text-zinc-500 hover:border-zinc-600"
              }`}
            >
              <FaArrowDown size={20} />
              <span className="font-bold text-sm">Trebuie să primesc</span>
            </button>
            <button
              onClick={() => setFormData({ ...formData, type: "i_owe" })}
              className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                formData.type === "i_owe"
                  ? "border-red-500 bg-red-500/10 text-red-400"
                  : "border-zinc-700 text-zinc-500 hover:border-zinc-600"
              }`}
            >
              <FaArrowUp size={20} />
              <span className="font-bold text-sm">Trebuie să dau</span>
            </button>
          </div>

          <div className="space-y-3">
            <input
              type="text"
              value={formData.person}
              onChange={(e) =>
                setFormData({ ...formData, person: e.target.value })
              }
              placeholder="Nume Persoană *"
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:border-emerald-500 outline-none"
            />
            <input
              type="number"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              placeholder="Sumă (RON) *"
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:border-emerald-500 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <input
              type="text"
              value={formData.reason}
              onChange={(e) =>
                setFormData({ ...formData, reason: e.target.value })
              }
              placeholder="Motiv (ex: Pizza, Chirie)..."
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:border-emerald-500 outline-none"
            />
            <input
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:border-emerald-500 outline-none"
            />
          </div>

          <button
            onClick={handleAddDebt}
            className="w-full bg-emerald-500 hover:bg-emerald-600 py-3 rounded-xl text-white font-bold text-lg transition-colors mt-2 shadow-lg shadow-emerald-900/20"
          >
            Salvează
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default DebtsTab;
