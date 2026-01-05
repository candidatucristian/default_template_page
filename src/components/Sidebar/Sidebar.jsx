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
} from "react-icons/fa";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Modal from "../Common/Modal";

const Sidebar = ({ onAddDefault, onExport, onImport }) => {
  const { state, dispatch } = useBudget();
  const { months, defaultExpenses = [], activeTab } = state;

  const [defDesc, setDefDesc] = useState("");
  const [defCost, setDefCost] = useState("");
  const [defCategory, setDefCategory] = useState("housing");

  // Calculator State
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
    { id: "compare", icon: FaExchangeAlt, label: "Compară Luni" }, // NEW
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

  // --- PDF EXPORT FUNCTIONALITY ---
  const handleExportPDF = async () => {
    const element = document.getElementById("root"); // Capturează toată aplicația
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`BudgetFlow_Report_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  // --- COMPOUND INTEREST CALC ---
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
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-emerald-500/20 transform rotate-3">
            💸
          </div>
          <div>
            <h1 className="font-bold text-white tracking-tight text-lg">
              BudgetFlow
            </h1>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20 uppercase tracking-wide font-bold">
              Ultimate
            </span>
          </div>
        </div>

        <nav className="p-3 border-b border-zinc-800 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => dispatch({ type: "SET_TAB", payload: tab.id })}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group ${
                activeTab === tab.id
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/40 translate-x-1"
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-white hover:translate-x-1"
              }`}
            >
              <tab.icon
                className={`text-lg ${
                  activeTab === tab.id
                    ? "animate-pulse"
                    : "group-hover:text-emerald-400"
                }`}
              />
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Tools Section */}
        <div className="px-3 py-2 border-b border-zinc-800">
          <p className="text-[10px] text-zinc-500 uppercase font-bold px-4 mb-2">
            Unelte
          </p>
          <button
            onClick={() => setShowCalc(true)}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:bg-zinc-800 hover:text-white transition-all"
          >
            <FaCalculator /> Calculator Dobândă
          </button>
        </div>

        <div className="p-4 border-b border-zinc-800">
          <div className="bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-xl p-4 border border-zinc-700 shadow-inner">
            <div className="text-xs text-zinc-500 uppercase font-bold mb-1">
              Net Worth (Economii)
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
            {defaultExpenses.length === 0 && (
              <div className="text-zinc-600 text-xs text-center py-4 border border-dashed border-zinc-800 rounded">
                Nicio cheltuială fixă.
              </div>
            )}
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
              placeholder="Ex: Chirie, Netflix..."
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
            <FaFileExport /> PDF
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

      {/* Calculator Modal */}
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
            <div className="mt-4 p-4 bg-emerald-500/20 border border-emerald-500/50 rounded-xl text-center animate-scale-in">
              <div className="text-sm text-emerald-300">
                În {calcData.years} ani vei avea:
              </div>
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
