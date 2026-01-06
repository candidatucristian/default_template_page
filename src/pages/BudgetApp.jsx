import React, { useState, useRef } from "react";
import { useBudget } from "../context/BudgetContext";
import { useTranslation } from "react-i18next";

// Components
import Sidebar from "../components/Sidebar/Sidebar";
import DashboardStats from "../components/Dashboard/DashboardStats";
import AddMonthForm from "../components/Dashboard/AddMonthForm";
import MonthCard from "../components/MonthCard/MonthCard";
import GoalsTab from "../components/Goals/GoalsTab";
import DebtsTab from "../components/Debts/DebtsTab";
import CalendarTab from "../components/Calendar/CalendarTab";
import InsightsTab from "../components/Insights/InsightsTab";
import CompareTab from "../components/Compare/CompareTab";
import CommandMenu from "../components/Common/CommandMenu";
import AlertsView from "../components/Common/AlertsView";
import ReportsTab from "../components/Reports/ReportsTab";
import SavingsTab from "../components/Savings/SavingsTab";

// Modals
import ExpenseModal from "../components/Modals/ExpenseModal";
import ExpenseDetailModal from "../components/Modals/ExpenseDetailModal";
import EditBudgetModal from "../components/Modals/EditBudgetModal";
import DuplicateMonthModal from "../components/Modals/DuplicateMonthModal";

import { Toaster, toast } from "sonner";
import { FaPlus, FaList, FaTh, FaBell } from "react-icons/fa";

const BudgetApp = () => {
  const { t, i18n } = useTranslation();
  const { state, dispatch } = useBudget();
  const fileInputRef = useRef(null);

  const [zenMode, setZenMode] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);

  const { months, activeTab, currentView, alerts } = state;

  const [modals, setModals] = useState({
    add: false,
    detail: false,
    budget: false,
    duplicate: false,
  });
  const [selected, setSelected] = useState({
    month: null,
    expense: null,
    index: null,
  });

  const changeLanguage = (lng) => i18n.changeLanguage(lng);

  const handleAddExpense = (expenseData) => {
    if (selected.index !== null && selected.index !== undefined) {
      dispatch({
        type: "UPDATE_EXPENSE",
        payload: {
          monthId: selected.month.id,
          expense: expenseData,
          expenseIndex: selected.index,
        },
      });
      toast.success("Actualizat!");
    } else {
      dispatch({
        type: "ADD_EXPENSE",
        payload: { monthId: selected.month.id, expense: expenseData },
      });
      toast.success("Adăugat!");
    }
    setModals({ ...modals, add: false });
  };

  const openAdd = (monthId = null, dateOverride = null) => {
    if (months.length === 0) return toast.error("Creează o lună mai întâi!");
    let m = null;
    let initialDate = new Date().toISOString().split("T")[0];

    if (dateOverride) {
      initialDate = dateOverride;
      const targetDate = new Date(dateOverride);
      const roMonths = [
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
      const monthName = roMonths[targetDate.getMonth()];
      const year = targetDate.getFullYear();
      m = months.find(
        (x) => x.name.includes(monthName) && x.name.includes(String(year))
      );
      if (!m) m = months[months.length - 1];
    } else if (monthId) {
      m = months.find((x) => x.id === monthId);
      if (m) {
        try {
          const parts = m.name.split(" ");
          const roMonths = [
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
          const mIndex = roMonths.indexOf(parts[0]);
          const mYear = parseInt(parts[1]);
          const now = new Date();
          if (
            mIndex !== -1 &&
            !isNaN(mYear) &&
            (mIndex !== now.getMonth() || mYear !== now.getFullYear())
          ) {
            const safeMonth = String(mIndex + 1).padStart(2, "0");
            initialDate = `${mYear}-${safeMonth}-01`;
          }
        } catch (e) {}
      }
    } else {
      m = months[months.length - 1];
    }

    if (!m) return toast.error("Nu am găsit luna potrivită!");
    setSelected({ month: m, expense: { date: initialDate }, index: null });
    setModals({ ...modals, add: true });
  };

  const handleDeleteExpense = (monthId, idx) => {
    dispatch({
      type: "DELETE_EXPENSE",
      payload: { monthId, expenseIndex: idx },
    });
    toast.success("Șters!");
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        dispatch({
          type: "IMPORT_DATA",
          payload: JSON.parse(ev.target.result),
        });
        toast.success("Importat!");
      } catch {
        toast.error("Eroare fișier");
      }
    };
    reader.readAsText(file);
  };

  const handleSaveBudget = (id, val, reason) => {
    dispatch({
      type: "UPDATE_BUDGET",
      payload: { monthId: id, newBudget: val, reason },
    });
    toast.success("Buget salvat");
    setModals({ ...modals, budget: false });
  };

  if (zenMode) {
    const current = months[months.length - 1];
    const left = current
      ? current.budget - current.expenses.reduce((a, b) => a + b.val, 0)
      : 0;
    return (
      <div className="h-screen bg-black flex flex-col items-center justify-center text-white relative animate-fade-in z-[200]">
        <button
          onClick={() => setZenMode(false)}
          className="absolute top-8 right-8 text-zinc-600 hover:text-white border border-zinc-800 px-4 py-2 rounded-full"
        >
          {t("header.exit_zen")}
        </button>
        <h1 className="text-zinc-500 uppercase tracking-[0.5em] text-xs mb-4">
          {t("header.budget_available")}
        </h1>
        <div
          className={`text-[10rem] leading-none font-mono font-bold tracking-tighter ${
            left < 0 ? "text-red-600" : "text-emerald-500"
          }`}
        >
          {Math.round(left)}
          <span className="text-4xl text-zinc-700 ml-4">RON</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-zinc-950 text-white font-sans selection:bg-emerald-500/30 overflow-hidden">
      <Toaster position="top-center" theme="dark" richColors />
      <CommandMenu />

      <Sidebar
        onAddDefault={() => toast.success("Fixă adăugată")}
        onExport={() => {}}
        onImport={() => fileInputRef.current.click()}
      />
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleImport}
      />

      {alertsOpen && <AlertsView onClose={() => setAlertsOpen(false)} />}

      <main className="flex-1 p-8 overflow-y-auto h-screen relative scroll-smooth bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-900/10 via-zinc-950 to-zinc-950">
        {/* HEADER TOOLBAR */}
        <div className="flex justify-end gap-3 mb-6 sticky top-0 z-40 py-2 backdrop-blur-md -mx-4 px-4 rounded-xl">
          {/* Selector Limbă cu Steaguri SVG */}
          {/* Selector Limbă - DESIGN ECHILIBRAT, CURAT ȘI FRUMOS */}
          <div className="flex bg-zinc-900/80 border border-zinc-800 rounded-full p-1 shadow-lg backdrop-blur-sm">
            <button
              onClick={() => changeLanguage("ro")}
              className={`group flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
                i18n.language === "ro"
                  ? "bg-emerald-600 text-white shadow-md"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800"
              }`}
            >
              <svg viewBox="0 0 36 36" className="w-5 h-5">
                <rect fill="#002B7F" x="0" y="0" width="12" height="36" />
                <rect fill="#FCD116" x="12" y="0" width="12" height="36" />
                <rect fill="#CE1126" x="24" y="0" width="12" height="36" />
              </svg>
              <span className="font-medium text-sm">RO</span>
            </button>

            <button
              onClick={() => changeLanguage("en")}
              className={`group flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
                i18n.language === "en"
                  ? "bg-emerald-600 text-white shadow-md"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800"
              }`}
            >
              <svg viewBox="0 0 60 30" className="w-5 h-5">
                <clipPath id="ukClip">
                  <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
                </clipPath>
                <path d="M0,0 v30 h60 v-30 z" fill="#00247d" />
                <path
                  d="M0,0 L60,30 M60,0 L0,30"
                  stroke="#fff"
                  strokeWidth="6"
                />
                <path
                  d="M0,0 L60,30 M60,0 L0,30"
                  clipPath="url(#ukClip)"
                  stroke="#cf142b"
                  strokeWidth="4"
                />
                <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
                <path
                  d="M30,0 v30 M0,15 h60"
                  stroke="#cf142b"
                  strokeWidth="6"
                />
              </svg>
              <span className="font-medium text-sm">EN</span>
            </button>
          </div>

          <button
            onClick={() => setAlertsOpen(true)}
            className="relative bg-zinc-900/80 border border-zinc-800 p-3 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all shadow-lg"
          >
            <FaBell />
            {alerts.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-zinc-950">
                {alerts.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setZenMode(true)}
            className="text-xs text-zinc-400 hover:text-white bg-zinc-900/80 border border-zinc-800 px-4 py-2 rounded-full hover:border-emerald-500 transition-all shadow-lg"
          >
            🧘 {t("header.zen_mode")}
          </button>
        </div>

        {activeTab === "dashboard" && (
          <div className="max-w-7xl mx-auto space-y-8 animate-enter relative z-10 pb-20">
            {months.length > 0 && <DashboardStats />}
            <AddMonthForm onSuccess={(msg) => toast.success(msg)} />

            {months.length > 0 && (
              <>
                <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mt-8">
                  <h3 className="text-2xl font-bold text-white flex items-center gap-3 tracking-tight">
                    📂 {t("dashboard.archive_title")}
                  </h3>
                  <div className="flex bg-zinc-900 p-1 rounded-lg border border-zinc-800">
                    <button
                      onClick={() =>
                        dispatch({ type: "SET_VIEW", payload: "grid" })
                      }
                      className={`px-3 py-1.5 rounded-md text-xs font-bold flex gap-2 items-center transition-all ${
                        currentView === "grid"
                          ? "bg-zinc-700 text-white shadow"
                          : "text-zinc-500 hover:text-white"
                      }`}
                    >
                      <FaTh /> {t("dashboard.grid_view")}
                    </button>
                    <button
                      onClick={() =>
                        dispatch({ type: "SET_VIEW", payload: "list" })
                      }
                      className={`px-3 py-1.5 rounded-md text-xs font-bold flex gap-2 items-center transition-all ${
                        currentView === "list"
                          ? "bg-zinc-700 text-white shadow"
                          : "text-zinc-500 hover:text-white"
                      }`}
                    >
                      <FaList /> {t("dashboard.list_view")}
                    </button>
                  </div>
                </div>

                <div
                  className={
                    currentView === "grid"
                      ? "grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6"
                      : "grid grid-cols-1 gap-4"
                  }
                >
                  {[...months]
                    .sort((a, b) => b.id - a.id)
                    .map((m) => (
                      <MonthCard
                        key={m.id}
                        month={m}
                        onAddExpense={() => openAdd(m.id)}
                        onEditExpense={(m, e, i) => {
                          setSelected({ month: m, expense: e, index: i });
                          setModals({ ...modals, add: true });
                        }}
                        onViewExpense={(m, e, i) => {
                          setSelected({ month: m, expense: e, index: i });
                          setModals({ ...modals, detail: true });
                        }}
                        onEditBudget={(m) => {
                          setSelected({ ...selected, month: m });
                          setModals({ ...modals, budget: true });
                        }}
                        onDuplicate={(m) => {
                          setSelected({ ...selected, month: m });
                          setModals({ ...modals, duplicate: true });
                        }}
                        onDelete={(id) =>
                          dispatch({ type: "DELETE_MONTH", payload: id })
                        }
                      />
                    ))}
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === "reports" && <ReportsTab />}
        {activeTab === "compare" && <CompareTab />}
        {activeTab === "calendar" && (
          <CalendarTab onAddExpense={(date) => openAdd(null, date)} />
        )}
        {activeTab === "investments" && <SavingsTab />}
        {activeTab === "insights" && <InsightsTab />}
        {activeTab === "goals" && <GoalsTab showToast={toast.success} />}
        {activeTab === "debts" && <DebtsTab showToast={toast.success} />}
      </main>

      <ExpenseModal
        isOpen={modals.add}
        onClose={() => setModals({ ...modals, add: false })}
        expense={selected.expense}
        monthName={selected.month?.name}
        onSave={handleAddExpense}
      />
      <ExpenseDetailModal
        isOpen={modals.detail}
        onClose={() => setModals({ ...modals, detail: false })}
        expense={selected.expense}
        month={selected.month}
        onDelete={() => {
          handleDeleteExpense(selected.month.id, selected.index);
          setModals({ ...modals, detail: false });
        }}
        onEdit={() => {
          setModals({ detail: false, add: true });
        }}
      />
      <EditBudgetModal
        isOpen={modals.budget}
        onClose={() => setModals({ ...modals, budget: false })}
        month={selected.month}
        onSave={handleSaveBudget}
      />
      <DuplicateMonthModal
        isOpen={modals.duplicate}
        onClose={() => setModals({ ...modals, duplicate: false })}
        month={selected.month}
        onSave={(s, n, b, w) => {
          dispatch({ type: "ADD_MONTH", payload: { name: n, budget: b } });
          setModals({ ...modals, duplicate: false });
          toast.success("Lună duplicată!");
        }}
      />
    </div>
  );
};

export default BudgetApp;
