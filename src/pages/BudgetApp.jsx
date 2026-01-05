import React, { useState, useRef, useEffect } from "react";
import { useBudget } from "../context/BudgetContext";

// Components & Tabs
import Sidebar from "../components/Sidebar/Sidebar";
import DashboardStats from "../components/Dashboard/DashboardStats";
import AddMonthForm from "../components/Dashboard/AddMonthForm";
import MonthCard from "../components/MonthCard/MonthCard";
import GoalsTab from "../components/Goals/GoalsTab";
import DebtsTab from "../components/Debts/DebtsTab";
import CalendarTab from "../components/Calendar/CalendarTab";
import InsightsTab from "../components/Insights/InsightsTab";
import CompareTab from "../components/Compare/CompareTab"; // <--- NOU
import CommandMenu from "../components/Common/CommandMenu";

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
  const [zenMode, setZenMode] = useState(false);

  const { months, activeTab, currentView, alerts } = state; // currentView default e Grid sau List acum

  // Alerts System
  useEffect(() => {
    if (alerts && alerts.length > 0) {
      alerts.forEach((a) =>
        toast(a.message, { type: a.type === "danger" ? "error" : "warning" })
      );
    }
  }, [alerts]);

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

  const handleAddExpense = (monthId, expense, index = null) => {
    const type = index !== null ? "UPDATE_EXPENSE" : "ADD_EXPENSE";
    dispatch({ type, payload: { monthId, expense, expenseIndex: index } });
    toast.success(index !== null ? "Actualizat!" : "Adăugat!");
  };

  const openAdd = (monthId = null) => {
    if (!months.length) return toast.error("Creează o lună mai întâi");
    const m = monthId
      ? months.find((x) => x.id === monthId)
      : months[months.length - 1];
    setSelected({ month: m, expense: null, index: null });
    setModals({ ...modals, add: true });
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
  };

  // --- ZEN MODE (Minimalist) ---
  if (zenMode) {
    const current = months[months.length - 1];
    const left = current
      ? current.budget - current.expenses.reduce((a, b) => a + b.val, 0)
      : 0;
    return (
      <div className="h-screen bg-black flex flex-col items-center justify-center text-white relative animate-fade-in">
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
        <p className="mt-8 text-zinc-600 italic">
          "Concentrează-te pe ceea ce contează."
        </p>
      </div>
    );
  }

  return (
    <div
      className="flex min-h-screen bg-zinc-950 text-white font-sans selection:bg-emerald-500/30 overflow-hidden"
      id="app-container"
    >
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

      <main className="flex-1 p-8 overflow-y-auto h-screen relative scroll-smooth bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-900/10 via-zinc-950 to-zinc-950">
        {/* Alerts Banner */}
        {alerts.length > 0 && (
          <div className="mb-6 sticky top-0 z-40 space-y-2">
            {alerts.map((a, i) => (
              <div
                key={i}
                className={`p-4 rounded-xl border backdrop-blur-xl shadow-2xl flex items-center gap-3 ${
                  a.type === "danger"
                    ? "bg-red-500/10 border-red-500/50 text-red-200"
                    : "bg-amber-500/10 border-amber-500/50 text-amber-200"
                }`}
              >
                <FaBell className="text-xl" />{" "}
                <span className="font-medium">{a.message}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end mb-4">
          <button
            onClick={() => setZenMode(true)}
            className="text-xs text-zinc-400 hover:text-white bg-zinc-900/50 border border-zinc-800 px-4 py-2 rounded-full hover:border-emerald-500 transition-all shadow-lg backdrop-blur-sm"
          >
            🧘 Zen Mode
          </button>
        </div>

        {activeTab === "dashboard" && (
          <div className="max-w-7xl mx-auto space-y-10 animate-enter relative z-10">
            <DashboardStats />
            <AddMonthForm onSuccess={(msg) => toast.success(msg)} />

            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <h3 className="text-3xl font-bold text-white flex items-center gap-3 tracking-tight">
                📂 Lunile Tale
              </h3>
              <div className="flex bg-zinc-900 p-1.5 rounded-xl border border-zinc-800">
                <button
                  onClick={() =>
                    dispatch({ type: "SET_VIEW", payload: "grid" })
                  }
                  className={`px-4 py-2 rounded-lg text-sm flex gap-2 items-center transition-all ${
                    currentView === "grid"
                      ? "bg-zinc-700 text-white shadow"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <FaTh /> Grid
                </button>
                <button
                  onClick={() =>
                    dispatch({ type: "SET_VIEW", payload: "list" })
                  }
                  className={`px-4 py-2 rounded-lg text-sm flex gap-2 items-center transition-all ${
                    currentView === "list"
                      ? "bg-zinc-700 text-white shadow"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <FaList /> Listă
                </button>
              </div>
            </div>

            {months.length === 0 ? (
              <div className="text-center py-32 border-2 border-dashed border-zinc-800 rounded-3xl text-zinc-500 bg-zinc-900/20">
                <div className="text-6xl mb-4 opacity-50">🌑</div>
                <p className="text-xl">Începe prin a adăuga o lună nouă.</p>
              </div>
            ) : (
              <div
                className={
                  currentView === "grid"
                    ? "grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-8"
                    : "grid grid-cols-1 gap-6"
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
            )}
          </div>
        )}

        {/* --- ACTUAL COMPONENTS --- */}
        {activeTab === "compare" && <CompareTab />}
        {activeTab === "calendar" && <CalendarTab />}
        {activeTab === "insights" && <InsightsTab />}
        {activeTab === "goals" && <GoalsTab showToast={toast} />}
        {activeTab === "debts" && <DebtsTab showToast={toast} />}
      </main>

      <button
        onClick={() => openAdd()}
        className="fixed bottom-10 right-10 w-16 h-16 bg-emerald-600 hover:bg-emerald-500 rounded-full shadow-[0_0_50px_rgba(16,185,129,0.5)] flex items-center justify-center text-white text-2xl transition-all hover:scale-110 hover:rotate-90 z-50 border-4 border-zinc-950"
      >
        <FaPlus />
      </button>

      {/* Modals */}
      <ExpenseModal
        isOpen={modals.add}
        onClose={() => setModals({ ...modals, add: false })}
        expense={selected.expense}
        monthId={selected.month?.id}
        expenseIndex={selected.index}
        onSave={handleAddExpense}
      />
      <ExpenseDetailModal
        isOpen={modals.detail}
        onClose={() => setModals({ ...modals, detail: false })}
        expense={selected.expense}
        month={selected.month}
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
            type: "DUPLICATE_MONTH",
            payload: {
              sourceMonthId: s,
              newName: n,
              newBudget: b,
              withExpenses: w,
            },
          });
          setModals({ ...modals, duplicate: false });
        }}
      />
    </div>
  );
};

export default BudgetApp;
