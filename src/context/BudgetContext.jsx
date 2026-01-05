import React, { createContext, useContext, useReducer, useEffect } from "react";
import { MONTH_COLORS } from "../utils/constants";
import { getCurrentDateTime, generateId } from "../utils/helpers";

const BudgetContext = createContext();

const initialState = {
  months: JSON.parse(localStorage.getItem("bf2_months")) || [],
  defaultExpenses: JSON.parse(localStorage.getItem("bf2_defaults")) || [],
  budgetStops: JSON.parse(localStorage.getItem("bf2_stops")) || [],
  goals: JSON.parse(localStorage.getItem("bf2_goals")) || [],
  debts: JSON.parse(localStorage.getItem("bf2_debts")) || [],
  // --- NOUTATI: Alerte si Setari ---
  alerts: [],
  settings: JSON.parse(localStorage.getItem("bf2_settings")) || {
    hourlyWage: 50, // RON pe oră
    monthlyLimit: 80, // % pentru alertă
  },
  activeTab: "dashboard",
  currentView: "kanban", // Default pe Kanban pt Drag&Drop
};

function budgetReducer(state, action) {
  switch (action.type) {
    case "SET_TAB":
      return { ...state, activeTab: action.payload };
    case "SET_VIEW":
      return { ...state, currentView: action.payload };

    // --- ALERTE ---
    case "ADD_ALERT":
      if (state.alerts.find((a) => a.id === action.payload.id)) return state;
      return { ...state, alerts: [action.payload, ...state.alerts] };
    case "CLEAR_ALERTS":
      return { ...state, alerts: [] };

    // --- STANDARD ---
    case "ADD_MONTH": {
      const { name, budget } = action.payload;
      const color = MONTH_COLORS[state.months.length % MONTH_COLORS.length];
      const dt = getCurrentDateTime();
      // Copiem cheltuielile fixe automat
      const startingExpenses = state.defaultExpenses.map((d) => ({
        ...d,
        id: generateId() + Math.random(), // ID unic
        date: dt.isoDate, // Format ISO YYYY-MM-DD
        time: dt.time,
        tags: [],
        note: "Cheltuială fixă",
      }));
      const newMonth = {
        id: generateId(),
        name,
        budget,
        color,
        expenses: startingExpenses,
        budgetHistory: [],
      };
      return { ...state, months: [...state.months, newMonth] };
    }

    case "DELETE_MONTH":
      return {
        ...state,
        months: state.months.filter((m) => m.id !== action.payload),
      };

    case "UPDATE_BUDGET": {
      const { monthId, newBudget, reason } = action.payload;
      return {
        ...state,
        months: state.months.map((m) => {
          if (m.id === monthId) {
            const budgetHistory = m.budgetHistory || [];
            budgetHistory.push({
              oldBudget: m.budget,
              newBudget,
              date: new Date().toLocaleDateString("ro-RO"),
              reason,
            });
            return { ...m, budget: newBudget, budgetHistory };
          }
          return m;
        }),
      };
    }

    case "ADD_EXPENSE": {
      const { monthId, expense } = action.payload;
      const dt = getCurrentDateTime();
      const newExpense = {
        id: generateId(),
        ...expense,
        date: expense.date || dt.isoDate,
        time: expense.time || dt.isoTime,
        tags: expense.tags || [],
        note: expense.note || "",
      };
      return {
        ...state,
        months: state.months.map((m) =>
          m.id === monthId ? { ...m, expenses: [...m.expenses, newExpense] } : m
        ),
      };
    }

    case "UPDATE_EXPENSE": {
      const { monthId, expenseIndex, expense } = action.payload;
      return {
        ...state,
        months: state.months.map((m) => {
          if (m.id === monthId) {
            const newExpenses = [...m.expenses];
            newExpenses[expenseIndex] = {
              ...newExpenses[expenseIndex],
              ...expense,
            };
            return { ...m, expenses: newExpenses };
          }
          return m;
        }),
      };
    }

    case "DELETE_EXPENSE": {
      const { monthId, expenseIndex } = action.payload;
      return {
        ...state,
        months: state.months.map((m) => {
          if (m.id === monthId) {
            const newExpenses = [...m.expenses];
            newExpenses.splice(expenseIndex, 1);
            return { ...m, expenses: newExpenses };
          }
          return m;
        }),
      };
    }

    case "ADD_DEFAULT_EXPENSE":
      return {
        ...state,
        defaultExpenses: [...state.defaultExpenses, action.payload],
      };
    case "DELETE_DEFAULT_EXPENSE":
      return {
        ...state,
        defaultExpenses: state.defaultExpenses.filter(
          (_, i) => i !== action.payload
        ),
      };

    case "ADD_GOAL":
      return {
        ...state,
        goals: [...state.goals, { id: generateId(), ...action.payload }],
      };
    case "ADD_TO_GOAL":
      return {
        ...state,
        goals: state.goals.map((g) =>
          g.id === action.payload.goalId
            ? { ...g, current: g.current + action.payload.amount }
            : g
        ),
      };
    case "DELETE_GOAL":
      return {
        ...state,
        goals: state.goals.filter((g) => g.id !== action.payload),
      };

    case "ADD_DEBT":
      return {
        ...state,
        debts: [
          ...state.debts,
          { id: generateId(), settled: false, ...action.payload },
        ],
      };
    case "SETTLE_DEBT":
      return {
        ...state,
        debts: state.debts.map((d) =>
          d.id === action.payload ? { ...d, settled: true } : d
        ),
      };
    case "DELETE_DEBT":
      return {
        ...state,
        debts: state.debts.filter((d) => d.id !== action.payload),
      };

    case "IMPORT_DATA":
      return { ...state, ...action.payload };

    default:
      return state;
  }
}

export function BudgetProvider({ children }) {
  const [state, dispatch] = useReducer(budgetReducer, initialState);

  // Persistence
  useEffect(
    () => localStorage.setItem("bf2_months", JSON.stringify(state.months)),
    [state.months]
  );
  useEffect(
    () =>
      localStorage.setItem(
        "bf2_defaults",
        JSON.stringify(state.defaultExpenses)
      ),
    [state.defaultExpenses]
  );
  useEffect(
    () => localStorage.setItem("bf2_goals", JSON.stringify(state.goals)),
    [state.goals]
  );
  useEffect(
    () => localStorage.setItem("bf2_debts", JSON.stringify(state.debts)),
    [state.debts]
  );
  useEffect(
    () => localStorage.setItem("bf2_settings", JSON.stringify(state.settings)),
    [state.settings]
  );

  // --- ALERTS CHECKER (Rulează la fiecare schimbare) ---
  useEffect(() => {
    dispatch({ type: "CLEAR_ALERTS" });
    state.months.forEach((month) => {
      const totalSpent = month.expenses.reduce((acc, e) => acc + e.val, 0);
      const percent = month.budget > 0 ? (totalSpent / month.budget) * 100 : 0;

      if (percent >= state.settings.monthlyLimit) {
        dispatch({
          type: "ADD_ALERT",
          payload: {
            id: `alert-${month.id}`,
            type: percent > 100 ? "danger" : "warning",
            message:
              percent > 100
                ? `🚨 Ai depășit bugetul pentru ${month.name}!`
                : `⚠️ Atenție! Ai cheltuit ${Math.round(
                    percent
                  )}% din bugetul pe ${month.name}.`,
          },
        });
      }
    });
  }, [state.months, state.settings.monthlyLimit]);

  return (
    <BudgetContext.Provider value={{ state, dispatch }}>
      {children}
    </BudgetContext.Provider>
  );
}

export function useBudget() {
  return useContext(BudgetContext);
}
