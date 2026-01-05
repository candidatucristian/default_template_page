import React, { useState, useEffect } from "react";
import Modal from "../Common/Modal";
import { formatMoneyPlain } from "../../utils/helpers";

const EditBudgetModal = ({ isOpen, onClose, month, onSave }) => {
  const [newBudget, setNewBudget] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (month) {
      setNewBudget(month.budget.toString());
      setReason("");
    }
  }, [month, isOpen]);

  const handleSubmit = () => {
    if (!newBudget || parseFloat(newBudget) <= 0) return;
    if (parseFloat(newBudget) === month.budget) {
      onClose();
      return;
    }
    onSave(month.id, parseFloat(newBudget), reason.trim());
    onClose();
  };

  if (!month) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="💰 Modifică Bugetul"
      size="sm"
    >
      <div className="space-y-4">
        <div className="bg-zinc-800/50 p-4 rounded-lg text-center">
          <div className="text-xs text-zinc-500 uppercase mb-1">
            Buget actual
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-500">
            {formatMoneyPlain(month.budget)}
          </div>
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-2">
            Buget nou (RON)
          </label>
          <input
            type="number"
            value={newBudget}
            onChange={(e) => setNewBudget(e.target.value)}
            placeholder="Ex: 6000"
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-2">
            Motiv modificare (opțional)
          </label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Ex: Am primit bonus"
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
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
          className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-white font-medium transition-colors"
        >
          Salvează
        </button>
      </div>
    </Modal>
  );
};

export default EditBudgetModal;
