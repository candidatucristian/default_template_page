import React from "react";
import { useBudget } from "../../context/BudgetContext";
import { calculateGlobalStats } from "../../utils/helpers";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { FaClock, FaHeartbeat, FaSearchDollar, FaMedal } from "react-icons/fa";

const InsightsTab = () => {
  const { state } = useBudget();
  const { months, settings } = state;
  const stats = calculateGlobalStats(months);

  // --- CALCULE ---
  const savingsRate = stats.savingsRate;
  let healthScore = 50;
  healthScore += savingsRate > 20 ? 30 : savingsRate;
  healthScore += months.every(
    (m) => m.expenses.reduce((a, b) => a + b.val, 0) <= m.budget
  )
    ? 20
    : -10;
  healthScore = Math.min(100, Math.max(0, Math.round(healthScore)));

  const totalSpentHours = Math.round(
    stats.totalSpent / (settings.hourlyWage || 50)
  );

  // --- SUBSCRIPTION DETECTIVE (IMPROVED) ---
  const flatExpenses = months.flatMap((m) => m.expenses);
  const knownSubs = [
    "netflix",
    "spotify",
    "youtube",
    "hbo",
    "disney",
    "apple",
    "google",
    "icloud",
    "adobe",
    "digi",
    "orange",
    "vodafone",
    "eon",
    "chirie",
    "gym",
    "sala",
    "worldclass",
    "chatgpt",
    "midjourney",
  ];

  const potentialSubs = flatExpenses.reduce((acc, curr) => {
    const cleanDesc = curr.desc.toLowerCase().trim();
    const key = `${curr.val}-${cleanDesc}`;
    const isKnownService = knownSubs.some((sub) => cleanDesc.includes(sub));

    if (!acc[key]) {
      acc[key] = {
        count: 0,
        val: curr.val,
        desc: curr.desc,
        isKnown: isKnownService,
      };
    }
    acc[key].count += 1;
    return acc;
  }, {});

  const subscriptionList = Object.values(potentialSubs)
    .filter((item) => item.count >= 2 || item.isKnown) // Dacă apare de 2 ori SAU e serviciu cunoscut
    .sort((a, b) => b.val - a.val);

  const catData = Object.entries(stats.categoryTotals)
    .map(([name, value]) => ({ name, value }))
    .filter((i) => i.name !== "_total" && i.value > 0);
  const COLORS = [
    "#10b981",
    "#3b82f6",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
  ];

  // STIL TOOLTIP REPARAT (Alb pe Gri Închis)
  const tooltipStyle = {
    backgroundColor: "#18181b",
    borderColor: "#27272a",
    color: "#fff",
    borderRadius: "8px",
    padding: "10px",
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <h2 className="text-3xl font-bold text-white mb-6">
        Analiză Financiară Avansată
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <FaHeartbeat size={100} className="text-red-500" />
          </div>
          <h3 className="text-zinc-400 font-medium mb-2">
            Budget Health Score
          </h3>
          <div className="text-5xl font-bold text-white mb-2">
            {healthScore}/100
          </div>
          <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-500 to-emerald-500"
              style={{ width: `${healthScore}%` }}
            />
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <FaClock size={100} className="text-amber-500" />
          </div>
          <h3 className="text-zinc-400 font-medium mb-2">Timp "Cheltuit"</h3>
          <div className="text-5xl font-bold text-white mb-2">
            {totalSpentHours} <span className="text-lg">ore</span>
          </div>
          <p className="text-sm text-zinc-300">
            Muncă necesară pentru cheltuieli.
          </p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <FaSearchDollar size={100} className="text-violet-500" />
          </div>
          <h3 className="text-zinc-400 font-medium mb-2">
            Subscription Detective
          </h3>
          <div className="space-y-2 mt-4 max-h-[120px] overflow-y-auto custom-scrollbar pr-2">
            {subscriptionList.length === 0 ? (
              <div className="text-zinc-500 italic text-sm">
                Nu am detectat abonamente (încă).
              </div>
            ) : (
              subscriptionList.map((sub, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center text-sm border-b border-zinc-800 pb-2 last:border-0"
                >
                  <div>
                    <span className="text-white font-medium capitalize">
                      {sub.desc}
                    </span>
                    {sub.isKnown && (
                      <span className="ml-2 text-[10px] bg-violet-500/20 text-violet-300 px-1 rounded">
                        DETECTAT
                      </span>
                    )}
                  </div>
                  <span className="text-red-400 font-mono">-{sub.val} RON</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl h-[400px]">
          <h3 className="text-lg font-bold text-white mb-4">
            Distribuție Categorii
          </h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={catData}
                cx="50%"
                cy="50%"
                outerRadius={120}
                innerRadius={60}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {catData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={tooltipStyle}
                itemStyle={{ color: "#fff" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <FaMedal className="text-yellow-500" /> Colecția ta de Medalii
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div
              className={`p-4 rounded-xl border transition-all ${
                savingsRate > 10
                  ? "bg-emerald-900/20 border-emerald-500/50"
                  : "bg-zinc-800 border-zinc-700 opacity-40"
              }`}
            >
              <div className="text-3xl mb-2">🐢</div>
              <div className="font-bold text-white">Saver Novice</div>
            </div>
            <div
              className={`p-4 rounded-xl border transition-all ${
                savingsRate > 50
                  ? "bg-amber-900/20 border-amber-500/50"
                  : "bg-zinc-800 border-zinc-700 opacity-40"
              }`}
            >
              <div className="text-3xl mb-2">🦁</div>
              <div className="font-bold text-white">Budget King</div>
            </div>
            <div
              className={`p-4 rounded-xl border transition-all ${
                months.length >= 3
                  ? "bg-blue-900/20 border-blue-500/50"
                  : "bg-zinc-800 border-zinc-700 opacity-40"
              }`}
            >
              <div className="text-3xl mb-2">📅</div>
              <div className="font-bold text-white">Consistent</div>
            </div>
            <div
              className={`p-4 rounded-xl border transition-all ${
                healthScore > 90
                  ? "bg-violet-900/20 border-violet-500/50"
                  : "bg-zinc-800 border-zinc-700 opacity-40"
              }`}
            >
              <div className="text-3xl mb-2">🧘</div>
              <div className="font-bold text-white">Financial Zen</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsightsTab;
