import React, { useState } from "react";
import { useBudget } from "../../context/BudgetContext";
import { CATEGORY_INFO } from "../../utils/constants";
import { calculateMonthStats, formatMoney } from "../../utils/helpers";
import {
  FaEllipsisV,
  FaWallet,
  FaCopy,
  FaTrash,
  FaPen,
  FaStickyNote,
  FaPlus,
} from "react-icons/fa";

const MonthCard = ({
  month,
  onAddExpense,
  onEditExpense,
  onViewExpense,
  onEditBudget,
  onDuplicate,
  onDelete,
}) => {
  const { dispatch } = useBudget();
  const [menuOpen, setMenuOpen] = useState(false);
  const stats = calculateMonthStats(month);

  const getProgressColor = () => {
    if (stats.percentUsed > 100) return "bg-red-600";
    if (stats.percentUsed > 85) return "bg-red-500";
    if (stats.percentUsed > 60) return "bg-amber-500";
    return "bg-emerald-500";
  };

  return (
    <div className="bg-zinc-900/60 border border-zinc-800/60 backdrop-blur-xl rounded-2xl overflow-hidden flex flex-col h-full hover:border-zinc-700 transition-all duration-300 group shadow-lg">
      {/* Header */}
      <div className="p-6 pb-4 relative">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-2xl font-bold text-white tracking-tight">
              {month.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-zinc-500 text-sm">Buget:</span>
              <span className="bg-zinc-800 px-2 py-0.5 rounded text-zinc-300 font-mono text-sm">
                {formatMoney(month.budget, false)}
              </span>
            </div>
          </div>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 -mr-2 -mt-2 text-zinc-500 hover:text-white rounded-lg transition-colors"
          >
            <FaEllipsisV />
          </button>

          {/* Dropdown Menu */}
          {menuOpen && (
            <div className="absolute right-4 top-12 w-48 bg-zinc-800 border border-zinc-700 rounded-xl shadow-2xl z-20 overflow-hidden animate-scale-in">
              <button
                onClick={() => {
                  onEditBudget(month);
                  setMenuOpen(false);
                }}
                className="w-full text-left px-4 py-3 text-sm text-zinc-300 hover:bg-zinc-700 flex gap-2 items-center"
              >
                <FaWallet /> Modifică buget
              </button>
              <button
                onClick={() => {
                  onDuplicate(month);
                  setMenuOpen(false);
                }}
                className="w-full text-left px-4 py-3 text-sm text-zinc-300 hover:bg-zinc-700 flex gap-2 items-center"
              >
                <FaCopy /> Duplică luna
              </button>
              <div className="border-t border-zinc-700"></div>
              <button
                onClick={() => {
                  onDelete(month.id);
                  setMenuOpen(false);
                }}
                className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 flex gap-2 items-center"
              >
                <FaTrash /> Șterge luna
              </button>
            </div>
          )}
        </div>

        {/* Progress Bar & Stats */}
        <div className="mt-6">
          <div className="flex justify-between items-end mb-2">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">
                Rămas
              </div>
              <div
                className={`text-3xl font-mono font-bold ${
                  stats.remaining < 0 ? "text-red-500" : "text-emerald-500"
                }`}
              >
                {formatMoney(stats.remaining).ron}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">
                Cheltuit
              </div>
              <div className="text-zinc-300 font-mono">
                {stats.totalSpent.toLocaleString()} RON
              </div>
            </div>
          </div>
          <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-700 ease-out ${getProgressColor()}`}
              style={{ width: `${Math.min(stats.percentUsed, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Expenses List */}
      <div className="flex-1 bg-zinc-900/40 border-t border-zinc-800/50 overflow-y-auto max-h-[300px] custom-scrollbar p-1">
        {month.expenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-zinc-600">
            <div className="text-2xl mb-2">🍃</div>
            <div className="text-sm">Fără cheltuieli</div>
          </div>
        ) : (
          month.expenses.map((exp, idx) => (
            <div
              key={idx}
              onClick={() => onViewExpense(month, exp, idx)}
              className="flex items-center justify-between p-3 hover:bg-zinc-800/50 rounded-lg cursor-pointer group transition-colors mx-2 my-1"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg bg-zinc-800 border border-zinc-700 group-hover:border-emerald-500/30 transition-colors`}
                >
                  {CATEGORY_INFO[exp.category]?.emoji || "📦"}
                </div>
                <div className="min-w-0">
                  <div className="text-sm text-zinc-200 font-medium truncate group-hover:text-white">
                    {exp.desc}
                  </div>
                  <div className="text-[10px] text-zinc-500 flex gap-2">
                    <span>{exp.date}</span>
                    {exp.note && (
                      <FaStickyNote className="text-emerald-600" />
                    )}{" "}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-mono text-red-400 group-hover:text-red-300">
                  -{exp.val}
                </span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditExpense(month, exp, idx);
                    }}
                    className="p-1.5 bg-zinc-800 hover:bg-zinc-700 rounded text-zinc-400 hover:text-white"
                  >
                    <FaPen size={10} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      dispatch({
                        type: "DELETE_EXPENSE",
                        payload: { monthId: month.id, expenseIndex: idx },
                      });
                    }}
                    className="p-1.5 bg-zinc-800 hover:bg-red-500/20 rounded text-zinc-400 hover:text-red-500"
                  >
                    <FaTrash size={10} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* BIG GREEN BUTTON */}
      <button
        onClick={() => onAddExpense(month.id)}
        className="p-4 bg-zinc-800/80 hover:bg-emerald-600 hover:text-white text-zinc-400 transition-all font-medium flex items-center justify-center gap-2 border-t border-zinc-800"
      >
        <FaPlus /> Adaugă Cheltuială Nouă
      </button>
    </div>
  );
};

export default MonthCard;
