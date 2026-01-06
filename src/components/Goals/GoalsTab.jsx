import React, { useState } from "react";
import { useBudget } from "../../context/BudgetContext";
import { GOAL_EMOJIS, GOAL_COLORS } from "../../utils/constants";
import { formatMoney } from "../../utils/helpers";
import Modal from "../Common/Modal";
import {
  FaPlus,
  FaTrash,
  FaCheck,
  FaHourglassHalf,
  FaRocket,
  FaCoins,
} from "react-icons/fa";
import { motion } from "framer-motion";

const GoalsTab = ({ showToast }) => {
  const { state, dispatch } = useBudget();
  const { goals } = state;

  const [showAddModal, setShowAddModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [depositAmount, setDepositAmount] = useState("");

  // --- STATE FORMULAR ---
  const [formData, setFormData] = useState({
    name: "",
    target: "",
    current: "0",
    deadline: "",
    emoji: "🎯",
    color: "#10b981",
  });

  // --- HANDLERS ---
  const handleAddGoal = () => {
    if (!formData.name || !formData.target || parseFloat(formData.target) <= 0)
      return;
    dispatch({
      type: "ADD_GOAL",
      payload: {
        name: formData.name,
        target: parseFloat(formData.target),
        current: parseFloat(formData.current) || 0,
        deadline: formData.deadline,
        emoji: formData.emoji,
        color: formData.color,
      },
    });
    setFormData({
      name: "",
      target: "",
      current: "0",
      deadline: "",
      emoji: "🎯",
      color: "#10b981",
    });
    setShowAddModal(false);
    showToast?.("Obiectiv creat cu succes! 🚀");
  };

  const handleQuickDeposit = (amount) => {
    if (!selectedGoal) return;
    dispatch({
      type: "ADD_TO_GOAL",
      payload: { goalId: selectedGoal.id, amount: parseFloat(amount) },
    });

    if (selectedGoal.current + amount >= selectedGoal.target) {
      showToast?.("🎉 FELICITĂRI! Obiectiv Atins!");
    } else {
      showToast?.(`Ai pus deoparte ${amount} RON!`);
    }
    setShowDepositModal(false);
    setDepositAmount("");
  };

  const handleDeleteGoal = (e, id) => {
    e.stopPropagation(); // Oprește click-ul să se ducă la părinte
    if (window.confirm("Ești sigur că renunți la acest vis?")) {
      dispatch({ type: "DELETE_GOAL", payload: id });
      showToast?.("Obiectiv șters.");
    }
  };

  const getMotivation = (percent) => {
    if (percent >= 100) return "Misiune Îndeplinită! 🏆";
    if (percent >= 75) return "Ești pe ultima sută de metri!";
    if (percent >= 50) return "Jumătate din drum parcurs!";
    if (percent >= 25) return "Început promițător!";
    return "Orice început e greu. Curaj!";
  };

  // Stats Globale
  const totalSavedGoals = goals.reduce((acc, g) => acc + g.current, 0);
  const totalTargetGoals = goals.reduce((acc, g) => acc + g.target, 0);
  const globalProgress =
    totalTargetGoals > 0 ? (totalSavedGoals / totalTargetGoals) * 100 : 0;

  return (
    <div className="animate-fade-in pb-20">
      {/* --- HERO SECTION --- */}
      <div className="relative bg-zinc-900 border border-zinc-800 rounded-3xl p-8 mb-8 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h2 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
              Vision Board <FaRocket className="text-emerald-500" />
            </h2>
            <p className="text-zinc-400 max-w-md">
              Aici transformi dorințele în realitate.
            </p>
          </div>

          <div className="flex gap-6 text-center">
            <div className="bg-zinc-950/50 p-4 rounded-2xl border border-zinc-800 backdrop-blur-md">
              <div className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-1">
                Total Economisit
              </div>
              <div className="text-3xl font-mono font-bold text-emerald-400">
                {formatMoney(totalSavedGoals).ron}
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-4 bg-white text-black hover:bg-zinc-200 rounded-xl font-bold transition-transform hover:scale-105 shadow-lg flex items-center gap-2"
          >
            <FaPlus /> Vis Nou
          </button>
        </div>

        <div className="mt-8 h-2 bg-zinc-800 rounded-full overflow-hidden relative">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${globalProgress}%` }}
            transition={{ duration: 1.5 }}
            className="h-full bg-gradient-to-r from-emerald-600 via-emerald-400 to-teal-400"
          />
        </div>
      </div>

      {/* --- GOALS GRID --- */}
      {goals.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-zinc-800 rounded-3xl bg-zinc-900/20">
          <div className="text-6xl mb-4 opacity-50">🏝️</div>
          <h3 className="text-xl font-bold text-white mb-2">
            Niciun obiectiv setat
          </h3>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-medium transition-all mt-4"
          >
            Start!
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {goals.map((goal) => {
            const percent =
              goal.target > 0
                ? Math.min((goal.current / goal.target) * 100, 100)
                : 0;
            const completed = percent >= 100;
            const deadlineDate = goal.deadline ? new Date(goal.deadline) : null;

            const today = new Date();
            const timeDiff = deadlineDate ? deadlineDate - today : 0;
            const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
            const amountLeft = goal.target - goal.current;
            const dailyNeed =
              daysLeft > 0 && amountLeft > 0 ? amountLeft / daysLeft : 0;

            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`relative bg-zinc-900/60 border border-zinc-800 rounded-3xl p-6 overflow-hidden hover:border-zinc-600 transition-all flex flex-col justify-between h-full ${
                  completed ? "border-emerald-500/50" : ""
                }`}
              >
                {/* Background Glow */}
                <div
                  className="absolute top-0 left-0 w-full h-1 opacity-50 pointer-events-none"
                  style={{ backgroundColor: goal.color }}
                ></div>

                {/* --- HEADER CARD --- */}
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-inner bg-zinc-800/50 border border-zinc-700/50">
                        {completed ? "🏆" : goal.emoji}
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-lg leading-tight">
                          {goal.name}
                        </h3>
                        <div className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
                          {deadlineDate ? (
                            daysLeft > 0 ? (
                              <span className="flex items-center gap-1 text-zinc-400">
                                <FaHourglassHalf /> {daysLeft} zile rămase
                              </span>
                            ) : (
                              <span className="text-red-400 font-bold">
                                Deadline depășit
                              </span>
                            )
                          ) : (
                            <span>Fără termen limită</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* --- BUTONUL DE STERGE REPARAT --- */}
                    <button
                      onClick={(e) => handleDeleteGoal(e, goal.id)}
                      className="p-2 bg-zinc-800/50 hover:bg-red-500/20 text-zinc-500 hover:text-red-500 rounded-lg transition-colors z-20"
                      title="Șterge obiectiv"
                    >
                      <FaTrash size={14} />
                    </button>
                  </div>

                  {/* Progress Area */}
                  <div className="mb-6">
                    <div className="flex justify-between items-end mb-2">
                      <div className="text-2xl font-mono font-bold text-white">
                        {formatMoney(goal.current, false)}{" "}
                        <span className="text-sm text-zinc-500 font-sans font-normal">
                          / {formatMoney(goal.target, false)}
                        </span>
                      </div>
                      <div className="font-bold" style={{ color: goal.color }}>
                        {Math.round(percent)}%
                      </div>
                    </div>
                    <div className="h-4 bg-zinc-800 rounded-full overflow-hidden shadow-inner border border-zinc-700/50">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="h-full relative overflow-hidden"
                        style={{ backgroundColor: goal.color }}
                      />
                    </div>
                    <p className="text-xs text-zinc-500 mt-2 italic text-center">
                      "{getMotivation(percent)}"
                    </p>
                  </div>
                </div>

                {/* Bottom Stats & Actions */}
                <div className="mt-auto relative z-10">
                  {!completed && dailyNeed > 0 && (
                    <div className="mb-4 bg-zinc-800/30 p-3 rounded-xl border border-zinc-700/30 flex items-center justify-center gap-2 text-xs text-zinc-400">
                      <span>💡 Pune</span>
                      <span className="font-bold text-white bg-zinc-700 px-1.5 py-0.5 rounded">
                        {Math.ceil(dailyNeed)} RON / zi
                      </span>
                    </div>
                  )}

                  {completed ? (
                    <div className="w-full py-3 bg-emerald-500/10 border border-emerald-500/50 rounded-xl text-emerald-400 font-bold text-center flex items-center justify-center gap-2 uppercase tracking-wide">
                      <FaCheck /> Vis Îndeplinit
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedGoal(goal);
                        setShowDepositModal(true);
                      }}
                      className="w-full py-3 bg-white text-black hover:bg-zinc-200 rounded-xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg"
                    >
                      <FaCoins /> Adaugă Bani
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* --- MODAL ADAUGĂ BANI (REPARAT CSS) --- */}
      <Modal
        isOpen={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        title={`💵 ${selectedGoal?.name}`}
        size="sm"
      >
        <div className="text-center mb-6">
          <p className="text-zinc-400 text-sm mb-4">
            Cât vrei să pui deoparte astăzi?
          </p>

          <div className="flex justify-center gap-3 mb-4">
            {[50, 100, 200, 500].map((amt) => (
              <button
                key={amt}
                onClick={() => handleQuickDeposit(amt)}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-emerald-600 hover:text-white rounded-lg text-sm border border-zinc-700 transition-colors"
              >
                +{amt}
              </button>
            ))}
          </div>

          <div className="relative">
            {/* CSS HACK PENTRU INPUT: appearance-none ascunde săgețile */}
            <input
              type="number"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              placeholder="Altă sumă..."
              className="w-full bg-zinc-900 border border-zinc-700 p-4 rounded-xl text-center text-2xl font-bold text-white focus:border-emerald-500 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              autoFocus
            />
            <span className="absolute right-4 top-5 text-zinc-500 text-sm pointer-events-none">
              RON
            </span>
          </div>
        </div>
        <button
          onClick={() => handleQuickDeposit(depositAmount)}
          className="w-full bg-emerald-500 hover:bg-emerald-600 py-3 rounded-xl text-white font-bold text-lg transition-colors"
        >
          Confirmă Depunerea
        </button>
      </Modal>

      {/* --- MODAL OBIECTIV NOU --- */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="✨ Creează un Vis"
        size="md"
      >
        <div className="space-y-5">
          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1 block">
              Denumire
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Ex: MacBook Pro..."
              className="w-full bg-zinc-800 border-zinc-700 rounded-xl p-3 text-white focus:border-emerald-500 outline-none border"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1 block">
                Țintă (RON)
              </label>
              <input
                type="number"
                value={formData.target}
                onChange={(e) =>
                  setFormData({ ...formData, target: e.target.value })
                }
                className="w-full bg-zinc-800 border-zinc-700 rounded-xl p-3 text-white focus:border-emerald-500 outline-none border [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1 block">
                Start (RON)
              </label>
              <input
                type="number"
                value={formData.current}
                onChange={(e) =>
                  setFormData({ ...formData, current: e.target.value })
                }
                className="w-full bg-zinc-800 border-zinc-700 rounded-xl p-3 text-white focus:border-emerald-500 outline-none border [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1 block">
              Deadline
            </label>
            <input
              type="date"
              value={formData.deadline}
              onChange={(e) =>
                setFormData({ ...formData, deadline: e.target.value })
              }
              className="w-full bg-zinc-800 border-zinc-700 rounded-xl p-3 text-white focus:border-emerald-500 outline-none border"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">
              Aspect
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {GOAL_COLORS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setFormData({ ...formData, color: c.value })}
                  className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${
                    formData.color === c.value
                      ? "ring-2 ring-white ring-offset-2 ring-offset-zinc-900 scale-110"
                      : ""
                  }`}
                  style={{ backgroundColor: c.value }}
                />
              ))}
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
              {GOAL_EMOJIS.map((e) => (
                <button
                  key={e}
                  onClick={() => setFormData({ ...formData, emoji: e })}
                  className={`text-2xl p-2 rounded-lg hover:bg-zinc-800 transition ${
                    formData.emoji === e
                      ? "bg-zinc-800 ring-1 ring-emerald-500"
                      : ""
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleAddGoal}
            className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-zinc-200 transition-colors mt-2"
          >
            Salvează
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default GoalsTab;
