import React, { useState, useMemo } from "react";
import { useBudget } from "../../context/BudgetContext";
import { CATEGORY_INFO } from "../../utils/constants";
import { calculateMonthStats, formatMoney } from "../../utils/helpers";
import {
  FaEllipsisV,
  FaWallet,
  FaCopy,
  FaTrash,
  FaPen,
  FaPlus,
  FaThumbtack, // Putem înlocui cu FaSnowflake dacă vrei, dar Thumbtack e ok pt "Fixat"
  FaSyncAlt,
  FaSnowflake,
} from "react-icons/fa";
import { AnimatePresence } from "framer-motion";

const MonthCard = ({
  month,
  onAddExpense,
  onEditExpense,
  onViewExpense,
  onEditBudget,
  onDuplicate,
  onDelete,
}) => {
  const { state, dispatch } = useBudget();
  const { defaultExpenses } = state;
  const [menuOpen, setMenuOpen] = useState(false);
  const stats = calculateMonthStats(month);

  // 1. SORTARE: Cheltuielile FIXE (Recurente) apar primele
  const sortedExpenses = useMemo(() => {
    return [...month.expenses].sort((a, b) => {
      const aFixed = a.isFixed || a.note?.includes("Cheltuială fixă");
      const bFixed = b.isFixed || b.note?.includes("Cheltuială fixă");
      // Dacă a e fix și b nu, a vine primul (-1)
      if (aFixed && !bFixed) return -1;
      if (!aFixed && bFixed) return 1;
      return 0; // Păstrăm ordinea originală pentru restul
    });
  }, [month.expenses]);

  // Verificăm lipsuri recurente
  const hasMissingRecurring = defaultExpenses.some(
    (def) =>
      !month.expenses.some(
        (exp) => exp.desc === def.desc && exp.val === def.val
      )
  );

  const getStatusColor = () => {
    if (stats.percentUsed > 100) return "bg-red-500";
    if (stats.percentUsed > 85) return "bg-amber-500";
    return "bg-emerald-500";
  };

  const handleDeleteExpense = (idx) => {
    if (window.confirm("Ștergi această cheltuială?")) {
      dispatch({
        type: "DELETE_EXPENSE",
        payload: { monthId: month.id, expenseIndex: idx },
      });
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex flex-col h-full shadow-md relative group/card hover:border-zinc-700 transition-colors">
      {/* --- TOP BAR --- */}
      <div className="flex justify-between items-center px-5 pt-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-widest text-zinc-500 group-hover/card:text-zinc-400 transition-colors">
            {month.name}
          </span>
          <div className={`w-2 h-2 rounded-full ${getStatusColor()}`}></div>
        </div>

        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-zinc-500 hover:text-white p-1"
          >
            <FaEllipsisV />
          </button>
          <AnimatePresence>
            {menuOpen && (
              <div className="absolute right-0 top-6 w-48 bg-zinc-950 border border-zinc-700 rounded-lg shadow-xl z-50 overflow-hidden">
                <button
                  onClick={() => {
                    onEditBudget(month);
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 text-sm text-zinc-300 hover:bg-zinc-800 flex gap-2 items-center"
                >
                  <FaWallet /> Modifică Buget
                </button>
                <button
                  onClick={() => {
                    onDuplicate(month);
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 text-sm text-zinc-300 hover:bg-zinc-800 flex gap-2 items-center"
                >
                  <FaCopy /> Duplică Luna
                </button>
                <div className="h-px bg-zinc-800"></div>
                <button
                  onClick={() => {
                    onDelete(month.id);
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 flex gap-2 items-center"
                >
                  <FaTrash /> Șterge Luna
                </button>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* --- HERO SECTION --- */}
      <div className="px-5 py-4 flex justify-between items-center gap-4 border-b border-zinc-800/50">
        <div className="flex-1">
          <div
            className={`text-4xl font-mono font-bold tracking-tight ${
              stats.remaining < 0 ? "text-red-500" : "text-white"
            }`}
          >
            {formatMoney(stats.remaining).ron}
          </div>
          <div className="text-xs text-zinc-500 mt-1 flex gap-2">
            <span>Disponibil din {formatMoney(month.budget, false)}</span>
            <span className="text-zinc-600">|</span>
            <span>Cheltuit: {stats.totalSpent}</span>
          </div>
          <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className={`h-full ${getStatusColor()}`}
              style={{ width: `${Math.min(stats.percentUsed, 100)}%` }}
            ></div>
          </div>
        </div>

        <button
          onClick={() => onAddExpense(month.id)}
          className="flex-shrink-0 w-14 h-14 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl flex items-center justify-center text-xl shadow-lg transition-colors border border-emerald-400/20"
          title="Adaugă Cheltuială"
        >
          <FaPlus />
        </button>
      </div>

      {/* --- BUTON SINCRONIZARE --- */}
      {hasMissingRecurring && (
        <div className="px-5 pt-3 pb-1 animate-fade-in-down">
          <button
            onClick={() =>
              dispatch({
                type: "SYNC_RECURRING",
                payload: { monthId: month.id },
              })
            }
            className="w-full py-2 bg-cyan-900/20 hover:bg-cyan-900/40 border border-cyan-500/30 rounded-lg text-cyan-300 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-[0_0_10px_rgba(34,211,238,0.1)]"
          >
            <FaSyncAlt className="animate-spin-slow" />
            Adaugă cheltuieli recurente lipsă
          </button>
        </div>
      )}

      {/* --- EXPENSES LIST --- */}
      <div className="flex-1 bg-zinc-900/50 overflow-y-auto custom-scrollbar p-3 space-y-2">
        {sortedExpenses.length === 0 ? (
          <div className="text-center py-10 text-zinc-600">
            <div className="text-lg font-medium">Nicio cheltuială</div>
          </div>
        ) : (
          sortedExpenses.map((exp, idx) => {
            const isFixed =
              exp.isFixed || exp.note?.includes("Cheltuială fixă");

            return (
              <div
                key={exp.id || idx}
                onClick={() => onViewExpense(month, exp, idx)}
                className={`
                    relative flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all duration-300
                    ${
                      isFixed
                        ? // --- DESIGN FROZEN ---
                          "bg-cyan-950/20 border-cyan-400/20 shadow-[0_0_15px_-5px_rgba(6,182,212,0.15)] hover:border-cyan-400/40 hover:bg-cyan-900/30 hover:shadow-cyan-400/20 group"
                        : // --- DESIGN STANDARD ---
                          "bg-transparent border-transparent hover:bg-zinc-800 hover:border-zinc-700 group"
                    }
                `}
              >
                {/* Glow subtil pentru Frozen */}
                {isFixed && (
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-transparent rounded-xl pointer-events-none" />
                )}

                <div className="flex items-center gap-4 min-w-0 relative z-10">
                  <div
                    className={`
                        w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 transition-colors
                        ${
                          isFixed
                            ? "bg-cyan-500/10 text-cyan-300 shadow-inner border border-cyan-500/10"
                            : "bg-zinc-800 text-zinc-400"
                        }
                    `}
                  >
                    {CATEGORY_INFO[exp.category]?.emoji || "📦"}
                  </div>

                  <div className="min-w-0">
                    <div
                      className={`text-lg font-medium truncate ${
                        isFixed
                          ? "text-cyan-100 drop-shadow-[0_0_5px_rgba(34,211,238,0.3)]"
                          : "text-zinc-200"
                      }`}
                    >
                      {exp.desc}
                    </div>
                    <div className="text-xs text-zinc-500 flex items-center gap-2">
                      {isFixed && (
                        // Iconiță de "Gheață/Fixat"
                        <FaSnowflake className="text-cyan-400 text-[10px] animate-pulse-slow" />
                      )}
                      <span
                        className={`truncate ${
                          isFixed ? "text-cyan-500/70" : ""
                        }`}
                      >
                        {CATEGORY_INFO[exp.category]?.name}
                      </span>
                      <span className="text-zinc-600">• {exp.date}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1 relative z-10">
                  <span
                    className={`text-xl font-mono font-bold ${
                      isFixed ? "text-cyan-300 drop-shadow-md" : "text-white"
                    }`}
                  >
                    -{exp.val}
                  </span>

                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditExpense(month, exp, idx);
                      }}
                      className={`${
                        isFixed
                          ? "text-cyan-500 hover:text-cyan-200"
                          : "text-zinc-500 hover:text-white"
                      }`}
                    >
                      <FaPen size={12} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteExpense(idx);
                      }}
                      className={`${
                        isFixed
                          ? "text-cyan-500 hover:text-red-400"
                          : "text-zinc-500 hover:text-red-500"
                      }`}
                    >
                      <FaTrash size={12} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MonthCard;
