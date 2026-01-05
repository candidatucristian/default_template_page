import { EUR_RATE, MONTHS_RO } from "./constants";

export const formatMoney = (amount, showEur = true) => {
  const ron = Math.round(amount).toLocaleString("ro-RO");
  if (!showEur) return `${ron} RON`;
  const eur = Math.round(amount / EUR_RATE);
  return { ron: `${ron} RON`, eur: `€${eur}`, full: `${ron} RON (€${eur})` };
};

export const formatMoneyPlain = (amount) => {
  const ron = Math.round(amount).toLocaleString("ro-RO");
  const eur = Math.round(amount / EUR_RATE);
  return `${ron} RON (€${eur})`;
};

export const getCurrentDateTime = () => {
  const now = new Date();
  return {
    date: now.toLocaleDateString("ro-RO"),
    time: now.toLocaleTimeString("ro-RO", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    isoDate: now.toISOString().split("T")[0],
    isoTime: now.toTimeString().slice(0, 5),
  };
};

export const calculateMonthStats = (month) => {
  const totalSpent = month.expenses.reduce((acc, exp) => acc + exp.val, 0);
  const remaining = month.budget - totalSpent;
  const percentUsed = month.budget > 0 ? (totalSpent / month.budget) * 100 : 0;
  return { totalSpent, remaining, percentUsed };
};

export const calculateRunningBalance = (appData, upToMonthId = null) => {
  let running = 0;
  const sorted = [...appData].sort((a, b) => a.id - b.id);
  for (const m of sorted) {
    running += calculateMonthStats(m).remaining;
    if (upToMonthId && m.id === upToMonthId) break;
  }
  return running;
};

export const calculateGlobalStats = (appData) => {
  if (appData.length === 0) {
    return {
      totalBudget: 0,
      totalSpent: 0,
      totalSaved: 0,
      avgSaved: 0,
      savingsRate: 0,
      categoryTotals: {},
    };
  }
  let totalBudget = 0,
    totalSpent = 0;
  const categoryTotals = {};
  appData.forEach((m) => {
    totalBudget += m.budget;
    m.expenses.forEach((exp) => {
      totalSpent += exp.val;
      const cat = exp.category || "other";
      categoryTotals[cat] = (categoryTotals[cat] || 0) + exp.val;
    });
  });
  const totalSaved = totalBudget - totalSpent;
  return {
    totalBudget,
    totalSpent,
    totalSaved,
    avgSaved: appData.length > 0 ? totalSaved / appData.length : 0,
    savingsRate: totalBudget > 0 ? (totalSaved / totalBudget) * 100 : 0,
    categoryTotals,
  };
};

export const getCurrentMonthSpending = (appData) => {
  const categoryTotals = {};
  let totalSpent = 0;
  appData.forEach((m) => {
    m.expenses.forEach((exp) => {
      const cat = exp.category || "other";
      categoryTotals[cat] = (categoryTotals[cat] || 0) + exp.val;
      totalSpent += exp.val;
    });
  });
  categoryTotals["_total"] = totalSpent;
  return categoryTotals;
};

export const getAvailableMonths = (appData) => {
  const year = new Date().getFullYear();
  const months = [];
  for (let y = year; y <= year + 1; y++) {
    MONTHS_RO.forEach((m) => {
      const name = `${m} ${y}`;
      if (!appData.some((x) => x.name === name)) {
        months.push(name);
      }
    });
  }
  return months;
};

export const parseRomanianDate = (dateStr) => {
  if (!dateStr) return null;
  const parts = dateStr.split(".");
  if (parts.length === 3) {
    return new Date(parts[2], parts[1] - 1, parts[0]);
  }
  return null;
};

export const generateId = () => Date.now();

export const generateInsights = (months) => {
  if (!months.length) return [];
  const insights = [];
  const currentMonth = months[months.length - 1];

  // 1. Verificare Weekend
  const weekendSpending = currentMonth.expenses.reduce((acc, exp) => {
    const day = new Date(exp.date).getDay();
    return day === 0 || day === 6 ? acc + exp.val : acc;
  }, 0);
  const totalSpending = calculateMonthStats(currentMonth).totalSpent;

  if (weekendSpending > totalSpending * 0.4) {
    insights.push({
      type: "warning",
      text: `🔥 40% din cheltuieli sunt în weekend! Încearcă activități gratuite sâmbăta viitoare.`,
    });
  }

  // 2. Verificare Mâncare
  const foodSpending = currentMonth.expenses
    .filter((e) => e.category === "food")
    .reduce((acc, e) => acc + e.val, 0);
  if (foodSpending > currentMonth.budget * 0.3) {
    insights.push({
      type: "info",
      text: `🍕 Cheltuielile pe mâncare sunt mari (${Math.round(
        foodSpending
      )} RON). Poate gătim mai mult?`,
    });
  }

  return insights;
};
