import React, { useState, useRef } from "react";
import { useBudget } from "../context/BudgetContext";

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

// Modals
import ExpenseModal from "../components/Modals/ExpenseModal";
import ExpenseDetailModal from "../components/Modals/ExpenseDetailModal";
import EditBudgetModal from "../components/Modals/EditBudgetModal";
import DuplicateMonthModal from "../components/Modals/DuplicateMonthModal";

import { Toaster, toast } from "sonner";
import { FaPlus, FaList, FaTh, FaBell } from "react-icons/fa";

const BudgetApp = () => {
  const { state, dispatch } = useBudget();
  const fileInputRef = useRef(null);

  // State-uri originale
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

  // --- LOGICĂ SALVARE ---
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
        payload: {
          monthId: selected.month.id,
          expense: expenseData,
        },
      });
      toast.success("Adăugat!");
    }
    setModals({ ...modals, add: false });
  };

  // --- LOGICĂ FIXATĂ: PRE-SELECTARE DATĂ ÎN FUNCȚIE DE LUNĂ ---
  const openAdd = (monthId = null, dateOverride = null) => {
    // 1. Validare
    if (months.length === 0) return toast.error("Creează o lună mai întâi!");

    let m = null;
    let initialDate = new Date().toISOString().split("T")[0]; // Default: Azi

    // CAZ 1: Click din Calendar (Prioritate Maximă)
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
    }
    // CAZ 2: Click pe Cardul Lunii (Dashboard)
    else if (monthId) {
      m = months.find((x) => x.id === monthId);

      // --- FIX AICI: Dacă luna selectată nu e luna curentă, setăm data pe 1 ---
      if (m) {
        try {
          // Exemplu m.name: "Februarie 2026"
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

          // Verificăm dacă am identificat luna și anul din nume
          if (mIndex !== -1 && !isNaN(mYear)) {
            // Dacă luna/anul selectat diferă de azi
            if (mIndex !== now.getMonth() || mYear !== now.getFullYear()) {
              // Setăm data default pe 1 a acelei luni (ex: 2026-02-01)
              const safeMonth = String(mIndex + 1).padStart(2, "0");
              initialDate = `${mYear}-${safeMonth}-01`;
            }
          }
        } catch (e) {
          console.error("Eroare la calcularea datei default", e);
        }
      }
    }
    // CAZ 3: Butonul plutitor general (+)
    else {
      m = months[months.length - 1];
    }

    if (!m) return toast.error("Nu am găsit luna potrivită!");

    // Trimitem obiectul cu data corectă către modal
    const initialExpense = { date: initialDate };

    setSelected({ month: m, expense: initialExpense, index: null });
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

  // --- ZEN MODE VIEW ---
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
          Exit Zen
        </button>
        <h1 className="text-zinc-500 uppercase tracking-[0.5em] text-xs mb-4">
          BUGET DISPONIBIL AZI
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

  // --- LAYOUT ORIGINAL ---
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

      {/* ALERTS VIEW */}
      {alertsOpen && <AlertsView onClose={() => setAlertsOpen(false)} />}

      <main className="flex-1 p-8 overflow-y-auto h-screen relative scroll-smooth bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-900/10 via-zinc-950 to-zinc-950">
        {/* HEADER TOOLBAR */}
        <div className="flex justify-end gap-3 mb-6 sticky top-0 z-40 py-2 backdrop-blur-md -mx-4 px-4 rounded-xl">
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
            🧘 Zen Mode
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
                    📂 Arhivă Luni
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
                      <FaTh /> Grid
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
                      <FaList /> Listă
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

        {/* CALENDAR cu funcția FIXATĂ */}
        {activeTab === "calendar" && (
          <CalendarTab onAddExpense={(date) => openAdd(null, date)} />
        )}

        {activeTab === "insights" && <InsightsTab />}
        {activeTab === "goals" && <GoalsTab showToast={toast.success} />}
        {activeTab === "debts" && <DebtsTab showToast={toast.success} />}
      </main>

      <button
        onClick={() => openAdd()}
        className="fixed bottom-10 right-10 w-16 h-16 bg-emerald-600 hover:bg-emerald-500 rounded-full shadow-[0_0_50px_rgba(16,185,129,0.5)] flex items-center justify-center text-white text-2xl transition-all hover:scale-110 hover:rotate-90 z-50 border-4 border-zinc-950"
      >
        <FaPlus />
      </button>

      {/* --- MODALS --- */}
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
          dispatch({
            type: "ADD_MONTH",
            payload: { name: n, budget: b },
          });
          setModals({ ...modals, duplicate: false });
          toast.success("Lună duplicată!");
        }}
      />
    </div>
  );
};

export default BudgetApp;
