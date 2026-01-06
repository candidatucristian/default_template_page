import React, { useState, useEffect } from "react";
import Modal from "../Common/Modal";
import { useTranslation } from "react-i18next";
import { CATEGORY_INFO } from "../../utils/constants";
import { getCurrentDateTime } from "../../utils/helpers";

const ExpenseModal = ({ isOpen, onClose, onSave, expense, monthName }) => {
  const { t } = useTranslation();
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

  useEffect(() => {
    if (isOpen) {
      if (expense) {
        setFormData({
          desc: expense.desc || "",
          val: expense.val || "",
          category: expense.category || "food",
          date: expense.date || getCurrentDateTime().isoDate,
          time: expense.time || getCurrentDateTime().isoTime,
          tags: Array.isArray(expense.tags) ? expense.tags.join(", ") : "",
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
    }
  }, [expense, isOpen]);

  const handleSubmit = () => {
    if (!formData.desc.trim() || !formData.val || parseFloat(formData.val) <= 0)
      return;
    const tags = formData.tags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t);
    const expenseData = {
      desc: formData.desc.trim(),
      val: parseFloat(formData.val),
      category: formData.category,
      date: formData.date,
      time: formData.time,
      tags,
      note: formData.note.trim(),
    };
    onSave(expenseData);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        isEdit
          ? `✏️ ${t("expense_modal.edit_title")}`
          : `➕ ${t("expense_modal.add_title")} ${
              monthName ? `(${monthName})` : ""
            }`
      }
      size="lg"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <label className="block text-sm text-zinc-400 mb-2">
              {t("expense_modal.desc_label")} *
            </label>
            <input
              type="text"
              value={formData.desc}
              onChange={(e) =>
                setFormData({ ...formData, desc: e.target.value })
              }
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
              autoFocus={!isEdit}
            />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-2">
              {t("expense_modal.amount_label")} *
            </label>
            <input
              type="number"
              value={formData.val}
              onChange={(e) =>
                setFormData({ ...formData, val: e.target.value })
              }
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-2">
              {t("expense_modal.category_label")}
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
                    {info.emoji} {t(`categories.${key}`)}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-2">
              {t("expense_modal.date_label")}
            </label>
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
            <label className="block text-sm text-zinc-400 mb-2">
              {t("expense_modal.time_label")}
            </label>
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
        <div>
          <label className="block text-sm text-zinc-400 mb-2">
            {t("expense_modal.tags_label")}
          </label>
          <input
            type="text"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm text-zinc-400 mb-2">
            📝 {t("expense_modal.note_label")}
          </label>
          <textarea
            value={formData.note}
            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
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
          {t("expense_modal.cancel_btn")}
        </button>
        <button
          onClick={handleSubmit}
          className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white font-medium transition-colors shadow-lg shadow-emerald-900/20"
        >
          {isEdit ? t("expense_modal.save_btn") : t("expense_modal.add_btn")}
        </button>
      </div>
    </Modal>
  );
};

export default ExpenseModal;
