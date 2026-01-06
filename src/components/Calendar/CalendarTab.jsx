import React, { useState, useMemo } from "react";
import { useBudget } from "../../context/BudgetContext";
import { CATEGORY_INFO } from "../../utils/constants";
import {
  FaChevronLeft,
  FaChevronRight,
  FaTimes,
  FaStar,
  FaFire,
  FaLeaf,
  FaPlus,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const CalendarTab = ({ onAddExpense }) => {
  const { state } = useBudget();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // --- DATA ---
  const expensesByDate = useMemo(() => {
    const map = {};
    state.months.forEach((m) => {
      m.expenses.forEach((e) => {
        if (!e.date) return;
        let dateKey = e.date;
        if (e.date.includes(".")) {
          const [d, m, y] = e.date.split(".");
          dateKey = `${y}-${m}-${d}`;
        }
        if (!map[dateKey])
          map[dateKey] = { items: [], total: 0, categories: new Set() };
        map[dateKey].items.push({ ...e, monthName: m.name });
        map[dateKey].total += e.val;
        map[dateKey].categories.add(e.category);
      });
    });
    return map;
  }, [state.months]);

  const currentMonthKey = `${year}-${String(month + 1).padStart(2, "0")}`;
  const monthlyTotal = Object.keys(expensesByDate)
    .filter((k) => k.startsWith(currentMonthKey))
    .reduce((acc, k) => acc + expensesByDate[k].total, 0);

  const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y, m) => {
    const day = new Date(y, m, 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const roMonthNames = [
    "Ianuarie",
    "Februarie",
    "Martie",
    "Aprilie",
    "Mai",
    "Iunie",
    "Iulie",
    "August",
    "Septembrie",
    "Octombrie",
    "Noiembrie",
    "Decembrie",
  ];

  const getIntensityColor = (amount) => {
    if (amount === 0) return "bg-zinc-900/50 border-zinc-800";
    if (amount < 100)
      return "bg-emerald-900/20 border-emerald-500/30 hover:border-emerald-500";
    if (amount < 500)
      return "bg-blue-900/20 border-blue-500/30 hover:border-blue-500";
    if (amount < 1000)
      return "bg-orange-900/20 border-orange-500/30 hover:border-orange-500";
    return "bg-red-900/20 border-red-500/30 hover:border-red-500";
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)] animate-fade-in">
      {/* --- CALENDAR GRID --- */}
      <div className="flex-1 bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 rounded-3xl p-6 flex flex-col shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 opacity-50" />

        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-black text-white capitalize flex items-center gap-3">
              {roMonthNames[month]}{" "}
              <span className="text-zinc-600 font-light">{year}</span>
            </h2>
            <p className="text-zinc-400 text-sm mt-1">
              Total:{" "}
              <span className="text-white font-mono font-bold bg-zinc-800 px-2 rounded-md">
                {monthlyTotal.toLocaleString()} RON
              </span>
            </p>
          </div>
          <div className="flex gap-2 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
            <button
              onClick={() => setCurrentDate(new Date(year, month - 1))}
              className="p-3 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white"
            >
              <FaChevronLeft />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-4 text-xs font-bold text-zinc-500 hover:text-white"
            >
              AZI
            </button>
            <button
              onClick={() => setCurrentDate(new Date(year, month + 1))}
              className="p-3 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white"
            >
              <FaChevronRight />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 mb-4">
          {["Lu", "Ma", "Mi", "Jo", "Vi", "Sâ", "Du"].map((d, i) => (
            <div
              key={i}
              className={`text-center text-xs font-bold uppercase tracking-widest ${
                i >= 5 ? "text-red-400/70" : "text-zinc-500"
              }`}
            >
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 flex-1 gap-3 auto-rows-fr">
          {[...Array(firstDay)].map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {[...Array(daysInMonth)].map((_, i) => {
            const day = i + 1;
            const dateKey = `${year}-${String(month + 1).padStart(
              2,
              "0"
            )}-${String(day).padStart(2, "0")}`;
            const total = expensesByDate[dateKey]?.total || 0;
            const isToday =
              new Date().toDateString() ===
              new Date(year, month, day).toDateString();
            const isSelected = selectedDate === dateKey;

            return (
              <motion.div
                key={day}
                layoutId={`day-${dateKey}`}
                onClick={() => setSelectedDate(dateKey)}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`relative rounded-2xl border p-2 cursor-pointer transition-all group flex flex-col justify-between overflow-hidden ${getIntensityColor(
                  total
                )} ${
                  isSelected
                    ? "ring-2 ring-white scale-[1.02] z-10 shadow-lg"
                    : ""
                } ${isToday ? "ring-1 ring-emerald-500" : ""}`}
              >
                <div className="flex justify-between items-start">
                  <span
                    className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full ${
                      isToday
                        ? "bg-emerald-500 text-white"
                        : "text-zinc-400 bg-black/20"
                    }`}
                  >
                    {day}
                  </span>
                  {total === 0 && new Date(dateKey) < new Date() && (
                    <FaLeaf className="text-emerald-500/50 text-xs" />
                  )}
                  {total > 1000 && (
                    <FaFire className="text-red-500/50 text-xs animate-pulse" />
                  )}
                </div>
                <div className="mt-2">
                  {total > 0 ? (
                    <div className="font-mono font-bold text-white text-sm">
                      -{total > 999 ? (total / 1000).toFixed(1) + "k" : total}
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center opacity-0 group-hover:opacity-20">
                      <span className="text-xs text-zinc-500 font-bold">
                        FREE
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* --- SIDE PANEL (DETALII + BUTON ADAUGĂ) --- */}
      <AnimatePresence mode="wait">
        {selectedDate ? (
          <motion.div
            key="details"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 50, opacity: 0 }}
            className="w-full lg:w-96 bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl flex flex-col h-full"
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">
                  Ziua Selectată
                </div>
                <h3 className="text-2xl font-bold text-white">
                  {new Date(selectedDate).toLocaleDateString("ro-RO", {
                    day: "numeric",
                    month: "long",
                  })}
                </h3>
                <div className="text-zinc-400 text-sm capitalize">
                  {new Date(selectedDate).toLocaleDateString("ro-RO", {
                    weekday: "long",
                  })}
                </div>
              </div>
              <button
                onClick={() => setSelectedDate(null)}
                className="p-2 hover:bg-zinc-800 rounded-full text-zinc-500 hover:text-white"
              >
                <FaTimes />
              </button>
            </div>

            {/* BUTONUL NOU: ADAUGĂ AICI */}
            <button
              onClick={() => onAddExpense(selectedDate)}
              className="w-full mb-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
            >
              <FaPlus /> Adaugă în această zi
            </button>

            <div className="bg-zinc-800/50 p-4 rounded-xl border border-zinc-700/50 mb-4 text-center">
              <span className="text-zinc-400 text-xs uppercase">Total Zi</span>
              <div className="text-3xl font-mono font-bold text-white mt-1">
                {expensesByDate[selectedDate]?.total.toLocaleString() || 0}{" "}
                <span className="text-sm text-emerald-500">RON</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
              {!expensesByDate[selectedDate] ||
              expensesByDate[selectedDate].total === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-zinc-600 opacity-60">
                  <FaStar className="text-5xl text-yellow-500 mb-3" />
                  <p className="text-center text-sm font-medium">
                    Nicio cheltuială!
                  </p>
                </div>
              ) : (
                expensesByDate[selectedDate].items.map((exp, idx) => (
                  <div
                    key={idx}
                    className="bg-zinc-800/40 p-3 rounded-xl border border-zinc-800 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="text-xl bg-zinc-800 w-8 h-8 flex items-center justify-center rounded-lg">
                        {CATEGORY_INFO[exp.category]?.emoji}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-white truncate">
                          {exp.desc}
                        </div>
                        <div className="text-[10px] text-zinc-500">
                          {CATEGORY_INFO[exp.category]?.name}
                        </div>
                      </div>
                    </div>
                    <div className="text-right font-mono font-bold text-white">
                      -{exp.val}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        ) : (
          <div className="hidden lg:flex w-96 bg-zinc-900/30 border border-zinc-800 rounded-3xl p-8 flex-col items-center justify-center text-center opacity-50">
            <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mb-4 animate-pulse">
              <span className="text-3xl">👆</span>
            </div>
            <h3 className="text-lg font-bold text-white">Selectează o zi</h3>
            <p className="text-zinc-500 text-sm">
              Pentru a vedea detalii și a adăuga cheltuieli.
            </p>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CalendarTab;
