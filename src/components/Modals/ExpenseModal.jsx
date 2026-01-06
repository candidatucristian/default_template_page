import React, { useState, useEffect } from "react";
import Modal from "../Common/Modal";
import { CATEGORY_INFO } from "../../utils/constants";
import { getCurrentDateTime } from "../../utils/helpers";

const ExpenseModal = ({
  isOpen,
  onClose,
  onSave,
  expense,
  monthName, // Adăugat pentru titlu (opțional)
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

  const isEdit = expense && expense.id;

  // --- LOGICA REPARATĂ PENTRU CALENDAR ---
  useEffect(() => {
    if (isOpen) {
      if (expense) {
        // Cazul 1: Editare SAU Adăugare din Calendar (unde avem doar data)
        setFormData({
          desc: expense.desc || "",
          val: expense.val || "",
          category: expense.category || "food",
          // Aici este fix-ul: Folosim data primită (care e deja YYYY-MM-DD de la Calendar)
          // Sau data curentă dacă nu există
          date: expense.date || getCurrentDateTime().isoDate,
          time: expense.time || getCurrentDateTime().isoTime,
          tags: Array.isArray(expense.tags) ? expense.tags.join(", ") : "",
          note: expense.note || "",
        });
      } else {
        // Cazul 2: Adăugare simplă (fără date pre-completate)
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
    }
  }, [expense, isOpen]);

  const handleSubmit = () => {
    if (!formData.desc.trim() || !formData.val || parseFloat(formData.val) <= 0)
      return;

    const tags = formData.tags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t);

    // Păstrăm formatul ISO YYYY-MM-DD pentru consistență în Calendar
    const expenseData = {
      desc: formData.desc.trim(),
      val: parseFloat(formData.val),
      category: formData.category,
      date: formData.date,
      time: formData.time,
      tags,
      note: formData.note.trim(),
    };

    // Apelăm onSave simplu (BudgetApp se ocupă de ID-uri)
    onSave(expenseData);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        isEdit
          ? "✏️ Editează Cheltuiala"
          : `➕ Cheltuială Nouă ${monthName ? `(${monthName})` : ""}`
      }
      size="lg"
    >
      <div className="space-y-4">
        {/* Descriere și Sumă */}
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
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
              autoFocus={!isEdit}
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
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        {/* Categorie, Dată, Oră */}
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
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-emerald-500 transition-colors"
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
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-emerald-500 transition-colors"
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
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm text-zinc-400 mb-2">
            Tags (separate prin virgulă)
          </label>
          <input
            type="text"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            placeholder="Ex: impuls, weekend, prieteni"
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        {/* Notă */}
        <div>
          <label className="block text-sm text-zinc-400 mb-2">
            📝 Notă / Info
          </label>
          <textarea
            value={formData.note}
            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
            placeholder="Ex: Am luat asta când am fost la ziua lui Andrei..."
            rows={3}
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 resize-none transition-colors"
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
          className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white font-medium transition-colors shadow-lg shadow-emerald-900/20"
        >
          {isEdit ? "Salvează" : "Adaugă"}
        </button>
      </div>
    </Modal>
  );
};

export default ExpenseModal;
