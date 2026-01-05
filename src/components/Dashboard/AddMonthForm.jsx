import React, { useState } from "react";
import { useBudget } from "../../context/BudgetContext";
import { getAvailableMonths } from "../../utils/helpers";
import { FaPlus } from "react-icons/fa";

const AddMonthForm = ({ onSuccess }) => {
  const { state, dispatch } = useBudget();
  const [monthName, setMonthName] = useState("");
  const [budget, setBudget] = useState("");

  const availableMonths = getAvailableMonths(state.months);

  const handleSubmit = () => {
    if (!monthName || !budget || parseFloat(budget) <= 0) return;

    dispatch({
      type: "ADD_MONTH",
      payload: { name: monthName, budget: parseFloat(budget) },
    });

    setMonthName("");
    setBudget("");
    onSuccess?.(`${monthName} creată!`);
  };

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 mb-6">
      <h3 className="text-sm font-medium text-zinc-400 mb-4">
        Adaugă Lună Nouă
      </h3>
      <div className="flex gap-3">
        <select
          value={monthName}
          onChange={(e) => setMonthName(e.target.value)}
          className="flex-1 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
        >
          <option value="">Selectează luna...</option>
          {availableMonths.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Buget (RON)"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          className="w-40 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
        />
        <button
          onClick={handleSubmit}
          disabled={!monthName || !budget}
          className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-zinc-700 disabled:cursor-not-allowed rounded-lg text-sm text-white font-medium transition-colors flex items-center gap-2"
        >
          <FaPlus /> Creează
        </button>
      </div>
    </div>
  );
};

export default AddMonthForm;
