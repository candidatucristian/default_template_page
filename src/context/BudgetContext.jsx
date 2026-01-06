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
  savings: JSON.parse(localStorage.getItem("bf2_savings")) || [],
  alerts: [],
  dismissedIds: [],
  settings: JSON.parse(localStorage.getItem("bf2_settings")) || {
    hourlyWage: 50,
    monthlyLimit: 85,
  },
  activeTab: "dashboard",
  currentView: "grid",
};

function budgetReducer(state, action) {
  switch (action.type) {
    case "SET_TAB":
      return { ...state, activeTab: action.payload };
    case "SET_VIEW":
      return { ...state, currentView: action.payload };

    case "SET_ALERTS":
      return { ...state, alerts: action.payload };

    case "DISMISS_ALERT":
      return {
        ...state,
        alerts: state.alerts.filter((a) => a.id !== action.payload),
        dismissedIds: [...state.dismissedIds, action.payload],
      };
    case "ADD_SAVING":
      return {
        ...state,
        savings: [...state.savings, { ...action.payload, id: generateId() }],
      };
    case "DELETE_SAVING":
      return {
        ...state,
        savings: state.savings.filter((s) => s.id !== action.payload),
      };
    // AM SCHIMBAT ACEST CAZ PENTRU A FI MAI GENERAL (UPDATE COMPLET)
    case "UPDATE_SAVING":
      return {
        ...state,
        savings: state.savings.map((s) =>
          s.id === action.payload.id
            ? { ...s, ...action.payload.updatedData }
            : s
        ),
      };
    case "UPDATE_SAVING_VALUE":
      return {
        ...state,
        savings: state.savings.map((s) =>
          s.id === action.payload.id
            ? { ...s, amount: action.payload.amount }
            : s
        ),
      };
    case "ADD_MONTH": {
      const { name, budget } = action.payload;

      // Prevent duplicates
      if (state.months.some((m) => m.name === name)) return state;

      const color = MONTH_COLORS[state.months.length % MONTH_COLORS.length];

      // Fix Data: 1 ale lunii
      let expenseDate = getCurrentDateTime().isoDate;
      try {
        const parts = name.split(" ");
        if (parts.length === 2) {
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
          if (mIndex !== -1) {
            const year = parts[1];
            const mStr = String(mIndex + 1).padStart(2, "0");
            expenseDate = `${year}-${mStr}-01`;
          }
        }
      } catch (e) {
        console.error(e);
      }

      // Adăugăm recurențele
      const startingExpenses = state.defaultExpenses.map((d) => ({
        ...d,
        id: generateId() + Math.random(),
        date: expenseDate,
        time: "09:00",
        tags: ["fix"],
        note: "Cheltuială fixă (Recurentă)",
        isFixed: true,
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
      const dateToUse = expense.date || dt.isoDate;

      const newExpense = {
        id: generateId(),
        ...expense,
        date: dateToUse,
        time: expense.time || dt.isoTime,
        tags: expense.tags || [],
        note: expense.note || "",
        isFixed: false,
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

    case "SYNC_RECURRING": {
      const { monthId } = action.payload;
      return {
        ...state,
        months: state.months.map((m) => {
          if (m.id !== monthId) return m;

          // 1. Calcul Data
          let expenseDate = getCurrentDateTime().isoDate;
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

            if (mIndex !== -1 && parts[1]) {
              const year = parseInt(parts[1]);
              const targetDate = new Date(year, mIndex, 2);
              expenseDate = targetDate.toISOString().split("T")[0];
            }
          } catch (e) {
            console.error("Sync error", e);
          }

          // 2. Găsim ce lipsește
          const missingDefaults = state.defaultExpenses.filter(
            (def) =>
              !m.expenses.some(
                (exp) => exp.desc === def.desc && exp.val === def.val
              )
          );

          if (missingDefaults.length === 0) return m;

          // 3. Adăugăm
          const newExpenses = missingDefaults.map((d) => ({
            ...d,
            id: generateId() + Math.random(),
            date: expenseDate,
            time: "09:00",
            tags: ["fix", "sync"],
            note: "Cheltuială fixă (Sincronizată)",
            isFixed: true,
          }));

          return { ...m, expenses: [...m.expenses, ...newExpenses] };
        }),
      };
    }
    case "ADD_INVESTMENT":
      return {
        ...state,
        investments: [
          ...state.investments,
          { ...action.payload, id: generateId() },
        ],
      };
    case "DELETE_INVESTMENT":
      return {
        ...state,
        investments: state.investments.filter((i) => i.id !== action.payload),
      };
    case "UPDATE_INVESTMENT_PRICE":
      // Actualizăm prețul curent al unui activ
      return {
        ...state,
        investments: state.investments.map((i) =>
          i.id === action.payload.id
            ? { ...i, currentPrice: action.payload.price }
            : i
        ),
      };
    default:
      return state;
  }
}

export function BudgetProvider({ children }) {
  const [state, dispatch] = useReducer(budgetReducer, initialState);
  useEffect(
    () =>
      localStorage.setItem(
        "bf2_investments",
        JSON.stringify(state.investments)
      ),
    [state.investments]
  );

  useEffect(
    () => localStorage.setItem("bf2_savings", JSON.stringify(state.savings)),
    [state.savings]
  );

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

  // SMART ALERTS
  useEffect(() => {
    const newAlerts = [];
    state.months.forEach((month) => {
      const totalSpent = month.expenses.reduce((acc, e) => acc + e.val, 0);
      const percent = month.budget > 0 ? (totalSpent / month.budget) * 100 : 0;

      if (percent >= state.settings.monthlyLimit) {
        const id = `limit-${month.id}`;
        if (!state.dismissedIds.includes(id)) {
          newAlerts.push({
            id,
            type: percent > 100 ? "danger" : "warning",
            title: percent > 100 ? "Buget Depășit!" : "Atenție Buget",
            message:
              percent > 100
                ? `Ai depășit bugetul pentru ${month.name}!`
                : `Ai ajuns la ${Math.round(percent)}% din buget (${
                    month.name
                  }).`,
          });
        }
      }
    });

    if (JSON.stringify(newAlerts) !== JSON.stringify(state.alerts)) {
      dispatch({ type: "SET_ALERTS", payload: newAlerts });
    }
  }, [state.months, state.settings.monthlyLimit, state.dismissedIds]);

  return (
    <BudgetContext.Provider value={{ state, dispatch }}>
      {children}
    </BudgetContext.Provider>
  );
}

export function useBudget() {
  return useContext(BudgetContext);
}
