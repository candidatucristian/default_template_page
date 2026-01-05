import React, { useState } from "react";
import { useBudget } from "../../context/BudgetContext";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const CalendarTab = () => {
  const { state } = useBudget();
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (year, month) =>
    new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);

  let firstDay = getFirstDayOfMonth(year, month) - 1;
  if (firstDay < 0) firstDay = 6;

  // --- LOGICA REPARATĂ PENTRU DATE ---
  const getExpensesForDay = (day) => {
    // Ziua curentă din calendar pe care o verificăm
    // Comparăm doar componentele numerice pentru siguranță maximă
    return state.months
      .flatMap((m) => m.expenses)
      .filter((e) => {
        if (!e.date) return false;

        let expenseDay, expenseMonth, expenseYear;

        // Caz 1: Format "2024-02-15"
        if (e.date.includes("-")) {
          const parts = e.date.split("-");
          expenseYear = parseInt(parts[0]);
          expenseMonth = parseInt(parts[1]) - 1; // Luna începe de la 0 în JS
          expenseDay = parseInt(parts[2]);
        }
        // Caz 2: Format "15.02.2024"
        else if (e.date.includes(".")) {
          const parts = e.date.split(".");
          expenseDay = parseInt(parts[0]);
          expenseMonth = parseInt(parts[1]) - 1;
          expenseYear = parseInt(parts[2]);
        } else {
          return false;
        }

        return (
          expenseYear === year && expenseMonth === month && expenseDay === day
        );
      });
  };

  const changeMonth = (offset) => {
    setCurrentDate(new Date(year, month + offset, 1));
  };

  const monthNames = [
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

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 animate-fade-in h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white capitalize flex items-center gap-2">
          📅 {monthNames[month]} <span className="text-zinc-500">{year}</span>
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => changeMonth(-1)}
            className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-white transition-colors"
          >
            <FaChevronLeft />
          </button>
          <button
            onClick={() => changeMonth(1)}
            className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-white transition-colors"
          >
            <FaChevronRight />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-2 text-center text-zinc-500 text-xs font-bold uppercase tracking-wider">
        <div>Luni</div>
        <div>Marți</div>
        <div>Miercuri</div>
        <div>Joi</div>
        <div>Vineri</div>
        <div>Sâmbătă</div>
        <div>Duminică</div>
      </div>

      <div className="grid grid-cols-7 gap-2 flex-1 auto-rows-fr min-h-[500px]">
        {[...Array(firstDay)].map((_, i) => (
          <div
            key={`empty-${i}`}
            className="bg-zinc-900/20 rounded-lg border border-zinc-800/20"
          ></div>
        ))}

        {[...Array(daysInMonth)].map((_, i) => {
          const day = i + 1;
          const exps = getExpensesForDay(day);
          const totalDaily = exps.reduce((a, b) => a + b.val, 0);
          const isToday =
            new Date().toDateString() ===
            new Date(year, month, day).toDateString();

          return (
            <div
              key={day}
              className={`bg-zinc-800/40 border ${
                isToday
                  ? "border-emerald-500 bg-emerald-500/5"
                  : "border-zinc-700/50"
              } rounded-lg p-2 flex flex-col relative group hover:bg-zinc-800 transition-colors`}
            >
              <div className="flex justify-between items-start mb-1">
                <span
                  className={`text-sm font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                    isToday ? "bg-emerald-500 text-white" : "text-zinc-400"
                  }`}
                >
                  {day}
                </span>
                {totalDaily > 0 && (
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1 rounded">
                    -{totalDaily} lei
                  </span>
                )}
              </div>

              <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar pr-1">
                {exps.map((e, idx) => (
                  <div
                    key={idx}
                    className="text-[10px] bg-zinc-900/80 p-1.5 rounded border border-zinc-700/80 text-zinc-300 truncate hover:text-white transition-colors"
                    title={`${e.desc} - ${e.val} RON`}
                  >
                    {e.desc}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarTab;
