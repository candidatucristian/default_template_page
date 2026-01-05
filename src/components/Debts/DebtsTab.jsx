import React, { useState } from "react";
import { useBudget } from "../../context/BudgetContext";
import { formatMoney, getCurrentDateTime } from "../../utils/helpers";
import Modal from "../Common/Modal";
import {
  FaPlus,
  FaTrash,
  FaCheck,
  FaArrowUp,
  FaArrowDown,
} from "react-icons/fa";

const DebtsTab = ({ showToast }) => {
  const { state, dispatch } = useBudget();
  const { debts } = state;

  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    person: "",
    amount: "",
    type: "owed_to_me",
    reason: "",
    date: getCurrentDateTime().isoDate,
  });

  const activeDebts = debts.filter((d) => !d.settled);
  const owedToMe = activeDebts
    .filter((d) => d.type === "owed_to_me")
    .reduce((a, d) => a + d.amount, 0);
  const iOwe = activeDebts
    .filter((d) => d.type === "i_owe")
    .reduce((a, d) => a + d.amount, 0);
  const balance = owedToMe - iOwe;

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
    showToast?.("Datorie adăugată");
  };

  const handleSettle = (id) => {
    if (window.confirm("Marchezi ca achitată?")) {
      dispatch({ type: "SETTLE_DEBT", payload: id });
      showToast?.("Achitat ✓");
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Ștergi această datorie?")) {
      dispatch({ type: "DELETE_DEBT", payload: id });
      showToast?.("Șters");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">💸 Datorii</h2>
          <p className="text-zinc-500">
            Urmărește cine îți datorează și cui datorezi
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-white font-medium transition-colors flex items-center gap-2"
        >
          <FaPlus /> Adaugă
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-5">
          <div className="flex items-center gap-2 text-emerald-500 mb-2">
            <FaArrowDown /> <span className="text-sm">Îmi datorează</span>
          </div>
          <div className="text-xl font-bold font-mono text-emerald-500">
            {formatMoney(owedToMe).full}
          </div>
        </div>
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-5">
          <div className="flex items-center gap-2 text-red-500 mb-2">
            <FaArrowUp /> <span className="text-sm">Datorez</span>
          </div>
          <div className="text-xl font-bold font-mono text-red-500">
            {formatMoney(iOwe).full}
          </div>
        </div>
        <div
          className={`${
            balance >= 0
              ? "bg-emerald-500/10 border-emerald-500/30"
              : "bg-red-500/10 border-red-500/30"
          } border rounded-xl p-5`}
        >
          <div className="text-sm text-zinc-400 mb-2">Balanță</div>
          <div
            className={`text-xl font-bold font-mono ${
              balance >= 0 ? "text-emerald-500" : "text-red-500"
            }`}
          >
            {balance >= 0 ? "+" : ""}
            {formatMoney(balance).full}
          </div>
        </div>
      </div>

      {activeDebts.length === 0 ? (
        <div className="text-center py-16 bg-zinc-900/50 border border-zinc-800 rounded-xl">
          <div className="text-5xl mb-4">💸</div>
          <h3 className="text-lg font-medium text-white mb-2">
            Nicio datorie activă
          </h3>
          <p className="text-zinc-500">Toate datoriile sunt achitate!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activeDebts.map((debt) => (
            <div
              key={debt.id}
              className={`flex items-center justify-between p-4 bg-zinc-900/50 border rounded-xl ${
                debt.type === "owed_to_me"
                  ? "border-emerald-500/30"
                  : "border-red-500/30"
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                    debt.type === "owed_to_me"
                      ? "bg-emerald-500/20 text-emerald-500"
                      : "bg-red-500/20 text-red-500"
                  }`}
                >
                  {debt.person.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-medium text-white">
                    {debt.person}{" "}
                    {debt.type === "owed_to_me"
                      ? "îți datorează"
                      : "- datorezi"}
                  </h4>
                  <p className="text-sm text-zinc-500">
                    {debt.reason || "Fără motiv"} • {debt.date}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span
                  className={`text-lg font-bold font-mono ${
                    debt.type === "owed_to_me"
                      ? "text-emerald-500"
                      : "text-red-500"
                  }`}
                >
                  {formatMoney(debt.amount).full}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleSettle(debt.id)}
                    className="p-2 text-zinc-500 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-lg"
                  >
                    <FaCheck />
                  </button>
                  <button
                    onClick={() => handleDelete(debt.id)}
                    className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="💸 Adaugă Datorie"
        size="md"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setFormData({ ...formData, type: "owed_to_me" })}
              className={`p-4 rounded-lg border-2 ${
                formData.type === "owed_to_me"
                  ? "border-emerald-500 bg-emerald-500/10"
                  : "border-zinc-700"
              }`}
            >
              <FaArrowDown
                className={
                  formData.type === "owed_to_me"
                    ? "text-emerald-500"
                    : "text-zinc-500"
                }
              />
              <div
                className={
                  formData.type === "owed_to_me"
                    ? "text-emerald-500"
                    : "text-zinc-400"
                }
              >
                Îmi datorează
              </div>
            </button>
            <button
              onClick={() => setFormData({ ...formData, type: "i_owe" })}
              className={`p-4 rounded-lg border-2 ${
                formData.type === "i_owe"
                  ? "border-red-500 bg-red-500/10"
                  : "border-zinc-700"
              }`}
            >
              <FaArrowUp
                className={
                  formData.type === "i_owe" ? "text-red-500" : "text-zinc-500"
                }
              />
              <div
                className={
                  formData.type === "i_owe" ? "text-red-500" : "text-zinc-400"
                }
              >
                Datorez
              </div>
            </button>
          </div>
          <input
            type="text"
            value={formData.person}
            onChange={(e) =>
              setFormData({ ...formData, person: e.target.value })
            }
            placeholder="Persoană *"
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
          />
          <input
            type="number"
            value={formData.amount}
            onChange={(e) =>
              setFormData({ ...formData, amount: e.target.value })
            }
            placeholder="Sumă (RON) *"
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
          />
          <input
            type="text"
            value={formData.reason}
            onChange={(e) =>
              setFormData({ ...formData, reason: e.target.value })
            }
            placeholder="Motiv (opțional)"
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
          />
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
          />
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-zinc-800">
          <button
            onClick={() => setShowAddModal(false)}
            className="px-6 py-2 text-zinc-400 hover:text-white"
          >
            Anulează
          </button>
          <button
            onClick={handleAddDebt}
            className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-white font-medium"
          >
            Adaugă
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default DebtsTab;
