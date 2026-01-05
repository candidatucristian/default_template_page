import React from "react";
import Modal from "../Common/Modal";
import { CATEGORY_INFO } from "../../utils/constants";
import { formatMoney } from "../../utils/helpers";
import {
  FaCalendar,
  FaClock,
  FaFolder,
  FaCalendarAlt,
  FaPen,
} from "react-icons/fa";

const ExpenseDetailModal = ({ isOpen, onClose, expense, month, onEdit }) => {
  if (!expense || !month) return null;

  const catInfo = CATEGORY_INFO[expense.category] || CATEGORY_INFO.other;
  const hasNote = expense.note && expense.note.trim().length > 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="📋 Detalii Cheltuială"
      size="lg"
    >
      {/* Header */}
      <div className="flex items-center gap-4 pb-5 border-b border-zinc-800 mb-5">
        <div
          className={`w-16 h-16 rounded-xl flex items-center justify-center text-3xl ${catInfo.bg}`}
        >
          {catInfo.emoji}
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">{expense.desc}</h2>
          <div className="text-lg font-mono text-red-400 mt-1">
            -{formatMoney(expense.val).full}
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="flex items-center gap-3 p-4 bg-zinc-800/50 rounded-lg">
          <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
            <FaCalendar className="text-emerald-500" />
          </div>
          <div>
            <div className="text-xs text-zinc-500 uppercase">Data</div>
            <div className="text-sm text-white">
              {expense.date || "Nespecificată"}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-zinc-800/50 rounded-lg">
          <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
            <FaClock className="text-emerald-500" />
          </div>
          <div>
            <div className="text-xs text-zinc-500 uppercase">Ora</div>
            <div className="text-sm text-white">
              {expense.time || "Nespecificată"}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-zinc-800/50 rounded-lg">
          <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
            <FaFolder className="text-emerald-500" />
          </div>
          <div>
            <div className="text-xs text-zinc-500 uppercase">Categorie</div>
            <div className="text-sm text-white">{catInfo.name}</div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-zinc-800/50 rounded-lg">
          <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
            <FaCalendarAlt className="text-emerald-500" />
          </div>
          <div>
            <div className="text-xs text-zinc-500 uppercase">Luna</div>
            <div className="text-sm text-white">{month.name}</div>
          </div>
        </div>
      </div>

      {/* Tags */}
      {expense.tags && expense.tags.length > 0 && (
        <div className="mb-5">
          <div className="text-xs text-zinc-500 uppercase mb-2">Tags</div>
          <div className="flex flex-wrap gap-2">
            {expense.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-violet-500/20 text-violet-400 rounded-full text-sm"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Note */}
      <div className="mb-5">
        <div className="text-xs text-zinc-500 uppercase mb-2">
          📝 Notă personală
        </div>
        <div
          className={`p-4 bg-zinc-800/50 rounded-lg border-l-4 ${
            hasNote ? "border-emerald-500" : "border-zinc-700"
          }`}
        >
          <p
            className={`text-sm ${
              hasNote ? "text-white" : "text-zinc-500"
            } whitespace-pre-wrap`}
          >
            {hasNote
              ? expense.note
              : "Nicio notă adăugată. Click pe Editează pentru a adăuga una."}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
        <button
          onClick={onClose}
          className="px-6 py-2 text-zinc-400 hover:text-white transition-colors"
        >
          Închide
        </button>
        <button
          onClick={onEdit}
          className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-white font-medium transition-colors flex items-center gap-2"
        >
          <FaPen /> Editează
        </button>
      </div>
    </Modal>
  );
};

export default ExpenseDetailModal;
