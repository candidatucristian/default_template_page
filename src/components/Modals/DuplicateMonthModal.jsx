import React, { useState, useEffect } from "react";
import Modal from "../Common/Modal";
import { useBudget } from "../../context/BudgetContext";
import { getAvailableMonths } from "../../utils/helpers";

const DuplicateMonthModal = ({ isOpen, onClose, month, onSave }) => {
  const { state } = useBudget();
  const [newName, setNewName] = useState("");
  const [newBudget, setNewBudget] = useState("");
  const [withExpenses, setWithExpenses] = useState(false);

  const availableMonths = getAvailableMonths(state.months);

  useEffect(() => {
    if (month) {
      setNewName("");
      setNewBudget(month.budget.toString());
      setWithExpenses(false);
    }
  }, [month, isOpen]);

  const handleSubmit = () => {
    if (!newName || !newBudget || parseFloat(newBudget) <= 0) return;
    onSave(month.id, newName, parseFloat(newBudget), withExpenses);
    onClose();
  };

  if (!month) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="📋 Duplică Luna" size="sm">
      <p className="text-sm text-zinc-400 mb-4">
        Creează o copie a lunii{" "}
        <strong className="text-white">{month.name}</strong> cu același buget și
        cheltuieli fixe.
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-zinc-400 mb-2">
            Nume lună nouă
          </label>
          <select
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="">Selectează...</option>
            {availableMonths.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-2">Buget</label>
          <input
            type="number"
            value={newBudget}
            onChange={(e) => setNewBudget(e.target.value)}
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={withExpenses}
            onChange={(e) => setWithExpenses(e.target.checked)}
            className="w-5 h-5 rounded border-zinc-700 bg-zinc-800 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0"
          />
          <span className="text-sm text-zinc-300">
            Include și cheltuielile existente
          </span>
        </label>
      </div>

      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-zinc-800">
        <button
          onClick={onClose}
          className="px-6 py-2 text-zinc-400 hover:text-white transition-colors"
        >
          Anulează
        </button>
        <button
          onClick={handleSubmit}
          disabled={!newName}
          className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-zinc-700 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
        >
          Duplică
        </button>
      </div>
    </Modal>
  );
};

export default DuplicateMonthModal;
