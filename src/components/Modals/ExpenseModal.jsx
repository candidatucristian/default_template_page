import React, { useState, useEffect } from "react";
import Modal from "../Common/Modal";
import { CATEGORY_INFO } from "../../utils/constants";
import { getCurrentDateTime } from "../../utils/helpers";

const ExpenseModal = ({
  isOpen,
  onClose,
  onSave,
  expense,
  monthId,
  expenseIndex,
}) => {
  const [formData, setFormData] = useState({
    desc: "",
    val: "",
    category: "food",
    date: "",
    time: "",
    tags: "",
    note: "",
  });

  const isEdit = expense !== null;

  useEffect(() => {
    if (expense) {
      const dateVal = expense.date
        ? (() => {
            const parts = expense.date.split(".");
            if (parts.length === 3) {
              return `${parts[2]}-${parts[1].padStart(
                2,
                "0"
              )}-${parts[0].padStart(2, "0")}`;
            }
            return "";
          })()
        : "";

      setFormData({
        desc: expense.desc || "",
        val: expense.val || "",
        category: expense.category || "food",
        date: dateVal,
        time: expense.time || "",
        tags: (expense.tags || []).join(", "),
        note: expense.note || "",
      });
    } else {
      const dt = getCurrentDateTime();
      setFormData({
        desc: "",
        val: "",
        category: "food",
        date: dt.isoDate,
        time: dt.isoTime,
        tags: "",
        note: "",
      });
    }
  }, [expense, isOpen]);

  const handleSubmit = () => {
    if (!formData.desc.trim() || !formData.val || parseFloat(formData.val) <= 0)
      return;

    const tags = formData.tags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t);
    const dateFormatted = formData.date
      ? new Date(formData.date).toLocaleDateString("ro-RO")
      : "";

    const expenseData = {
      desc: formData.desc.trim(),
      val: parseFloat(formData.val),
      category: formData.category,
      date: dateFormatted,
      time: formData.time,
      tags,
      note: formData.note.trim(),
    };

    onSave(monthId, expenseData, expenseIndex);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "✏️ Editează Cheltuiala" : "➕ Cheltuială Nouă"}
      size="lg"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <label className="block text-sm text-zinc-400 mb-2">
              Descriere *
            </label>
            <input
              type="text"
              value={formData.desc}
              onChange={(e) =>
                setFormData({ ...formData, desc: e.target.value })
              }
              placeholder="Ex: Pizza de la Dominos"
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-2">
              Sumă (RON) *
            </label>
            <input
              type="number"
              value={formData.val}
              onChange={(e) =>
                setFormData({ ...formData, val: e.target.value })
              }
              placeholder="50"
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-2">
              Categorie
            </label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
            >
              {Object.entries(CATEGORY_INFO)
                .filter(([k]) => k !== "_total")
                .map(([key, info]) => (
                  <option key={key} value={key}>
                    {info.emoji} {info.name}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-2">Data</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-2">Ora</label>
            <input
              type="time"
              value={formData.time}
              onChange={(e) =>
                setFormData({ ...formData, time: e.target.value })
              }
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-2">
            Tags (separate prin virgulă)
          </label>
          <input
            type="text"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            placeholder="Ex: impuls, weekend, prieteni"
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-2">
            📝 Notă / Info
          </label>
          <textarea
            value={formData.note}
            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
            placeholder="Ex: Am luat asta când am fost la ziua lui Andrei..."
            rows={3}
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 resize-none"
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
          {isEdit ? "Salvează" : "Adaugă"}
        </button>
      </div>
    </Modal>
  );
};

export default ExpenseModal;
