import React, { useState } from "react";
import { useBudget } from "../../context/BudgetContext";
import { CATEGORY_INFO } from "../../utils/constants";
import { calculateRunningBalance } from "../../utils/helpers";
import {
  FaHome,
  FaCalendarAlt,
  FaBullseye,
  FaHandHoldingUsd,
  FaLightbulb,
  FaPlus,
  FaTimes,
  FaFileExport,
  FaFileImport,
  FaExchangeAlt,
  FaCalculator,
  FaTable,
} from "react-icons/fa";
import jsPDF from "jspdf";
import Modal from "../Common/Modal";

const Sidebar = ({ onAddDefault, onExport, onImport }) => {
  const { state, dispatch } = useBudget();
  const { months, defaultExpenses = [], activeTab } = state;

  const [defDesc, setDefDesc] = useState("");
  const [defCost, setDefCost] = useState("");
  const [defCategory, setDefCategory] = useState("housing");

  const [showCalc, setShowCalc] = useState(false);
  const [calcData, setCalcData] = useState({
    initial: 1000,
    monthly: 500,
    years: 10,
    rate: 7,
  });
  const [calcResult, setCalcResult] = useState(null);

  const tabs = [
    { id: "dashboard", icon: FaHome, label: "Dashboard" },
    { id: "reports", icon: FaTable, label: "Rapoarte Avansate" },
    { id: "compare", icon: FaExchangeAlt, label: "Compară Luni" },
    { id: "calendar", icon: FaCalendarAlt, label: "Calendar" },
    { id: "goals", icon: FaBullseye, label: "Obiective" },
    { id: "debts", icon: FaHandHoldingUsd, label: "Datorii" },
    { id: "insights", icon: FaLightbulb, label: "Insights" },
  ];

  const totalSaved = calculateRunningBalance(months);

  const handleAddDefault = () => {
    if (!defDesc.trim() || !defCost) return;
    dispatch({
      type: "ADD_DEFAULT_EXPENSE",
      payload: {
        desc: defDesc.trim(),
        val: parseFloat(defCost),
        category: defCategory,
      },
    });
    setDefDesc("");
    setDefCost("");
    onAddDefault?.();
  };

  const removeDiacritics = (str) => {
    if (!str) return "";
    return str
      .toString()
      .replace(/ă/g, "a")
      .replace(/Ă/g, "A")
      .replace(/â/g, "a")
      .replace(/Â/g, "A")
      .replace(/î/g, "i")
      .replace(/Î/g, "I")
      .replace(/ș/g, "s")
      .replace(/Ș/g, "S")
      .replace(/ț/g, "t")
      .replace(/Ț/g, "T");
  };

  // --- EXECUTIVE PDF ENGINE ---
  const handleExportPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // CULORI
    const C_EMERALD = [16, 185, 129];
    const C_DARK = [24, 24, 27];
    const C_GRAY = [113, 113, 122];
    const C_LIGHT_GRAY = [244, 244, 245];
    const C_RED = [239, 68, 68];

    let y = 0;

    // --- PAGINA 1: COPERTA & GLOBAL STATS ---

    // Header Decorativ
    doc.setFillColor(...C_DARK);
    doc.rect(0, 0, pageWidth, 60, "F");

    doc.setFontSize(30);
    doc.setTextColor(...C_EMERALD);
    doc.text("BudgetFlow", 20, 25);

    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.text("RAPORT FINANCIAR COMPLET", 20, 35);

    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text(`Generat la: ${new Date().toLocaleDateString("ro-RO")}`, 20, 45);

    // Global Stats Cards (Desene)
    y = 80;

    const drawCard = (x, title, value, sub, color) => {
      doc.setFillColor(250, 250, 250);
      doc.setDrawColor(220, 220, 220);
      doc.roundedRect(x, y, 55, 35, 3, 3, "FD");

      doc.setFontSize(9);
      doc.setTextColor(...C_GRAY);
      doc.text(title, x + 5, y + 10);

      doc.setFontSize(14);
      doc.setTextColor(...color);
      doc.text(value, x + 5, y + 20);

      doc.setFontSize(8);
      doc.setTextColor(180, 180, 180);
      doc.text(sub, x + 5, y + 28);
    };

    // Calcule Globale
    const globalSpent = months.reduce(
      (acc, m) => acc + m.expenses.reduce((a, b) => a + b.val, 0),
      0
    );
    const globalBudget = months.reduce((acc, m) => acc + m.budget, 0);
    const savingsRate =
      globalBudget > 0
        ? Math.round(((globalBudget - globalSpent) / globalBudget) * 100)
        : 0;

    drawCard(
      20,
      "NET WORTH",
      `${totalSaved} RON`,
      "Economii Totale",
      C_EMERALD
    );
    drawCard(
      85,
      "TOTAL CHELTUIT",
      `${globalSpent} RON`,
      "Toate timpurile",
      C_RED
    );
    drawCard(
      150,
      "RATA ECONOMII",
      `${savingsRate}%`,
      "Eficienta",
      [59, 130, 246]
    ); // Blue

    y += 50;

    // --- DETALIERE LUNI ---
    const sortedMonths = [...months].sort((a, b) => b.id - a.id);

    sortedMonths.forEach((month, index) => {
      // Paginare inteligentă
      if (y > 220) {
        doc.addPage();
        y = 20;
      }

      const mSpent = month.expenses.reduce((a, b) => a + b.val, 0);
      const mBudget = month.budget;
      const mPercent = Math.min(100, Math.round((mSpent / mBudget) * 100));
      const mRemaining = mBudget - mSpent;

      // Card Lună (Background)
      doc.setFillColor(...C_LIGHT_GRAY);
      doc.roundedRect(10, y, pageWidth - 20, 40, 4, 4, "F");

      // Titlu Lună
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text(removeDiacritics(month.name), 20, y + 12);

      // Buget Info
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(
        `Buget: ${mBudget} | Cheltuit: ${mSpent} | Ramas: ${mRemaining}`,
        20,
        y + 20
      );

      // Bara Progres Vizuală
      doc.setFillColor(220, 220, 220); // Fundal bara
      doc.roundedRect(20, y + 25, 100, 4, 2, 2, "F");

      // Umplere bară (Verde/Roșu)
      if (mPercent > 100) doc.setFillColor(...C_RED);
      else doc.setFillColor(...C_EMERALD);

      doc.roundedRect(20, y + 25, mPercent, 4, 2, 2, "F");
      doc.setFontSize(8);
      doc.text(`${mPercent}% Utilizat`, 125, y + 28);

      y += 50;

      // Tabel Cheltuieli
      doc.setFontSize(9);
      doc.setTextColor(150);
      doc.text("DESCRIERE", 20, y);
      doc.text("CATEGORIE", 100, y);
      doc.text("SUMA", 170, y);
      doc.setDrawColor(230);
      doc.line(20, y + 2, pageWidth - 20, y + 2);
      y += 8;

      doc.setTextColor(50);
      month.expenses.forEach((exp) => {
        if (y > 275) {
          doc.addPage();
          y = 20;
        }

        let desc = removeDiacritics(exp.desc);
        let cat = removeDiacritics(
          CATEGORY_INFO[exp.category]?.name || "Altele"
        );
        if (desc.length > 40) desc = desc.substring(0, 40) + "...";

        doc.text(desc, 20, y);
        doc.text(cat, 100, y);

        // Sumă aliniată dreapta (aproximativ)
        const sumText = `${exp.val} RON`;
        doc.text(sumText, 170, y);

        // Linie subtilă
        doc.setDrawColor(245);
        doc.line(20, y + 2, pageWidth - 20, y + 2);

        y += 8;
      });

      y += 15; // Spațiu între luni
    });

    // Footer
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(200);
      doc.text(
        `Pagina ${i} din ${totalPages}`,
        pageWidth - 30,
        pageHeight - 10
      );
      doc.text("Generat cu BudgetFlow Ultimate", 20, pageHeight - 10);
    }

    doc.save(`Raport_Executive_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  const calculateInterest = () => {
    const { initial, monthly, years, rate } = calcData;
    let total = initial;
    for (let i = 0; i < years * 12; i++) {
      total += monthly;
      total += total * (rate / 100 / 12);
    }
    setCalcResult(Math.round(total));
  };

  return (
    <>
      <aside className="w-72 bg-zinc-900/80 backdrop-blur-xl border-r border-zinc-800 flex flex-col h-screen sticky top-0 shadow-2xl z-50">
        <div className="p-6 border-b border-zinc-800 flex items-center gap-3 bg-gradient-to-r from-zinc-900 to-zinc-800/50">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-emerald-500/20">
            💸
          </div>
          <div>
            <h1 className="font-bold text-white text-lg">BudgetFlow</h1>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full uppercase font-bold">
              Ultimate
            </span>
          </div>
        </div>

        <nav className="p-3 border-b border-zinc-800 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => dispatch({ type: "SET_TAB", payload: tab.id })}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-emerald-600 text-white shadow-lg"
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
              }`}
            >
              <tab.icon
                className={activeTab === tab.id ? "animate-pulse" : ""}
              />{" "}
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="px-3 py-2 border-b border-zinc-800">
          <button
            onClick={() => setShowCalc(true)}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:bg-zinc-800 hover:text-white transition-all"
          >
            <FaCalculator /> Calculator Dobândă
          </button>
        </div>

        <div className="p-4 border-b border-zinc-800">
          <div className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700">
            <div className="text-xs text-zinc-500 uppercase font-bold mb-1">
              Net Worth
            </div>
            <div
              className={`text-2xl font-bold font-mono ${
                totalSaved >= 0 ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {totalSaved >= 0 ? "+" : ""}
              {totalSaved.toLocaleString()}{" "}
              <span className="text-sm text-zinc-600">RON</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <h3 className="text-xs text-zinc-500 uppercase font-bold mb-3 flex justify-between items-center">
            Fixe (Recurente)
            <span className="bg-zinc-800 text-white text-[10px] px-2 py-0.5 rounded-full">
              {defaultExpenses.length}
            </span>
          </h3>

          <div className="space-y-2 mb-4">
            {defaultExpenses.map((def, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center p-2.5 bg-zinc-800/40 border border-zinc-800 rounded-lg group hover:border-emerald-500/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">
                    {CATEGORY_INFO[def.category]?.emoji}
                  </span>
                  <div>
                    <div className="text-sm text-white font-medium">
                      {def.desc}
                    </div>
                    <div className="text-xs text-zinc-500 font-mono">
                      {def.val} RON
                    </div>
                  </div>
                </div>
                <button
                  onClick={() =>
                    dispatch({ type: "DELETE_DEFAULT_EXPENSE", payload: idx })
                  }
                  className="text-zinc-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <FaTimes />
                </button>
              </div>
            ))}
          </div>

          <div className="space-y-2 pt-2 border-t border-zinc-800">
            <input
              value={defDesc}
              onChange={(e) => setDefDesc(e.target.value)}
              placeholder="Ex: Chirie..."
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none"
            />
            <div className="flex gap-2">
              <input
                type="number"
                value={defCost}
                onChange={(e) => setDefCost(e.target.value)}
                placeholder="RON"
                className="w-20 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none"
              />
              <select
                value={defCategory}
                onChange={(e) => setDefCategory(e.target.value)}
                className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-2 text-sm text-white focus:border-emerald-500 outline-none"
              >
                {Object.entries(CATEGORY_INFO)
                  .filter((k) => k[0] !== "_total")
                  .map(([k, v]) => (
                    <option key={k} value={k}>
                      {v.emoji} {v.name}
                    </option>
                  ))}
              </select>
            </div>
            <button
              onClick={handleAddDefault}
              className="w-full py-2 bg-zinc-800 hover:bg-emerald-600 text-zinc-400 hover:text-white rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
            >
              <FaPlus size={10} /> Adaugă
            </button>
          </div>
        </div>

        <div className="p-4 border-t border-zinc-800 flex gap-2">
          <button
            onClick={handleExportPDF}
            className="flex-1 py-2 bg-emerald-900/30 hover:bg-emerald-900/50 border border-emerald-500/30 rounded text-xs text-emerald-400 hover:text-emerald-200 transition-colors flex items-center justify-center gap-2"
          >
            <FaFileExport /> PDF Raport
          </button>
          <button
            onClick={() => {
              onExport();
              onImport();
            }}
            className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 rounded text-xs text-zinc-400 hover:text-white transition-colors flex items-center justify-center gap-2"
          >
            <FaFileImport /> JSON
          </button>
        </div>
      </aside>

      <Modal
        isOpen={showCalc}
        onClose={() => setShowCalc(false)}
        title="📈 Calculator Dobândă Compusă"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm text-zinc-400">Sumă Inițială</label>
            <input
              type="number"
              value={calcData.initial}
              onChange={(e) =>
                setCalcData({ ...calcData, initial: +e.target.value })
              }
              className="w-full bg-zinc-800 p-2 rounded text-white"
            />
          </div>
          <div>
            <label className="text-sm text-zinc-400">Contribuție Lunară</label>
            <input
              type="number"
              value={calcData.monthly}
              onChange={(e) =>
                setCalcData({ ...calcData, monthly: +e.target.value })
              }
              className="w-full bg-zinc-800 p-2 rounded text-white"
            />
          </div>
          <div>
            <label className="text-sm text-zinc-400">Ani</label>
            <input
              type="number"
              value={calcData.years}
              onChange={(e) =>
                setCalcData({ ...calcData, years: +e.target.value })
              }
              className="w-full bg-zinc-800 p-2 rounded text-white"
            />
          </div>
          <div>
            <label className="text-sm text-zinc-400">Randament Anual (%)</label>
            <input
              type="number"
              value={calcData.rate}
              onChange={(e) =>
                setCalcData({ ...calcData, rate: +e.target.value })
              }
              className="w-full bg-zinc-800 p-2 rounded text-white"
            />
          </div>
          <button
            onClick={calculateInterest}
            className="w-full bg-emerald-500 py-2 rounded text-white font-bold hover:bg-emerald-600 transition"
          >
            Calculează
          </button>
          {calcResult && (
            <div className="mt-4 p-4 bg-emerald-500/20 border border-emerald-500/50 rounded-xl text-center">
              <div className="text-sm text-emerald-300">Rezultat:</div>
              <div className="text-3xl font-bold text-white">
                {calcResult.toLocaleString()} RON
              </div>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};

export default Sidebar;
