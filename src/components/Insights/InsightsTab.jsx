import React, { useMemo } from "react";
import { useBudget } from "../../context/BudgetContext";
import { calculateGlobalStats } from "../../utils/helpers";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  FaHeartbeat,
  FaClock,
  FaPlaneDeparture,
  FaChartLine,
  FaSearchDollar,
  FaMedal,
  FaLock,
} from "react-icons/fa";
import { motion } from "framer-motion";

const InsightsTab = () => {
  const { state } = useBudget();
  const { months, settings } = state;
  const stats = calculateGlobalStats(months);

  // --- 1. LOGICA AVANSATĂ & SAFE MATH ---

  // A. Calculăm manual totalurile pentru siguranță maximă
  const totalBudget = months.reduce(
    (acc, m) => acc + (parseFloat(m.budget) || 0),
    0
  );
  const totalSpent = months.reduce(
    (acc, m) =>
      acc + m.expenses.reduce((a, b) => a + (parseFloat(b.val) || 0), 0),
    0
  );
  const totalSaved = totalBudget - totalSpent; // Net Worth

  // B. Runway (Supraviețuire)
  // Dacă nu ai cheltuieli (lună nouă), considerăm o cheltuială minimă de 1 pentru a evita împărțirea la 0
  const averageMonthlySpend =
    totalSpent > 0 ? totalSpent / (months.length || 1) : 0;

  let runwayMonths = 0;
  if (averageMonthlySpend > 0 && totalSaved > 0) {
    runwayMonths = totalSaved / averageMonthlySpend;
  }

  // Formatăm frumos (ex: 3.5 luni)
  const runwayMonthsDisplay = runwayMonths.toFixed(1);
  const runwayDays = Math.round(runwayMonths * 30);

  // C. Time Machine (Proiecție Viitor)
  // Presupunem că economisești media actuală lunară
  const averageMonthlySavings = totalSaved / (months.length || 1);

  const projectionData = useMemo(() => {
    const data = [];
    // Dacă ești pe minus, nu putem proiecta avere, punem 0 sau valoarea curentă
    let currentWealth = Math.max(0, totalSaved);
    const monthlyInterest = 0.05 / 12; // 5% dobândă anuală (conservator)

    for (let i = 0; i <= 60; i += 12) {
      // 5 ani
      data.push({
        name: i === 0 ? "Acum" : `Anul ${i / 12}`,
        suma: Math.round(currentWealth),
      });
      // Simulăm creșterea pe 12 luni
      for (let m = 0; m < 12; m++) {
        // Adăugăm economiile lunare doar dacă sunt pozitive
        if (averageMonthlySavings > 0) {
          currentWealth += averageMonthlySavings;
        }
        // Adăugăm dobânda compusă
        currentWealth = currentWealth * (1 + monthlyInterest);
      }
    }
    return data;
  }, [totalSaved, averageMonthlySavings]);

  // D. Health Score
  const savingsRate = totalBudget > 0 ? (totalSaved / totalBudget) * 100 : 0;
  let healthScore = 50;

  if (savingsRate > 50) healthScore += 40;
  else if (savingsRate > 20) healthScore += 20;
  else if (savingsRate > 0) healthScore += 10;
  else healthScore -= 20; // Ești pe minus

  if (runwayMonths > 6) healthScore += 10;
  // Bonus dacă respecți bugetul în toate lunile
  if (
    months.length > 0 &&
    months.every((m) => m.expenses.reduce((a, b) => a + b.val, 0) <= m.budget)
  ) {
    healthScore += 10;
  }

  // Clamp între 0 și 100
  healthScore = Math.min(100, Math.max(0, Math.round(healthScore)));

  // E. Subscription Detective
  const flatExpenses = months.flatMap((m) => m.expenses);
  const subs = flatExpenses.reduce((acc, curr) => {
    const key = `${curr.val}-${curr.desc.toLowerCase().trim()}`;
    const known = [
      "netflix",
      "spotify",
      "youtube",
      "hbo",
      "disney",
      "icloud",
      "adobe",
      "digi",
      "orange",
      "vodafone",
      "gym",
      "chatgpt",
    ].some((k) => curr.desc.toLowerCase().includes(k));
    if (!acc[key])
      acc[key] = { count: 0, val: curr.val, desc: curr.desc, isKnown: known };
    acc[key].count++;
    return acc;
  }, {});
  const subscriptionList = Object.values(subs)
    .filter((i) => i.count >= 2 || i.isKnown)
    .sort((a, b) => b.val - a.val);

  // F. Chart Data
  const catData = Object.entries(stats.categoryTotals || {})
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

  // --- 2. BADGES ---
  const badges = [
    {
      id: 1,
      icon: "🐢",
      title: "Începător",
      desc: "Economii > 10%",
      unlocked: savingsRate > 10,
    },
    {
      id: 2,
      icon: "🛡️",
      title: "Siguranță",
      desc: "Runway > 3 luni",
      unlocked: runwayMonths >= 3,
    },
    {
      id: 3,
      icon: "🎯",
      title: "Sniper",
      desc: "Buget respectat (3 luni)",
      unlocked:
        months.length >= 3 &&
        months
          .slice(-3)
          .every((m) => m.expenses.reduce((a, b) => a + b.val, 0) <= m.budget),
    },
    {
      id: 4,
      icon: "🦁",
      title: "Regele Junglei",
      desc: "Net Worth > 10k",
      unlocked: totalSaved >= 10000,
    },
    {
      id: 5,
      icon: "🧘",
      title: "Financial Zen",
      desc: "Scor Sănătate 90+",
      unlocked: healthScore >= 90,
    },
    {
      id: 6,
      icon: "🚀",
      title: "To The Moon",
      desc: "Economii > 50%",
      unlocked: savingsRate >= 50,
    },
  ];

  return (
    <div className="animate-fade-in pb-20 space-y-8">
      {/* --- HERO HEADER --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Health Score */}
        <div className="bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 p-6 rounded-3xl relative overflow-hidden shadow-lg group">
          <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <FaHeartbeat
              size={120}
              className={healthScore > 70 ? "text-emerald-500" : "text-red-500"}
            />
          </div>
          <h3 className="text-zinc-400 font-bold uppercase tracking-wider text-xs mb-2">
            Puls Financiar
          </h3>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-6xl font-black ${
                healthScore > 70
                  ? "text-emerald-400"
                  : healthScore > 40
                  ? "text-amber-400"
                  : "text-red-400"
              }`}
            >
              {healthScore}
            </span>
            <span className="text-zinc-500 font-bold">/100</span>
          </div>
          <div className="mt-4 w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${healthScore}%` }}
              transition={{ duration: 1.5 }}
              className={`h-full ${
                healthScore > 70 ? "bg-emerald-500" : "bg-red-500"
              }`}
            />
          </div>
          <p className="text-xs text-zinc-500 mt-2">
            {healthScore > 80
              ? "Excelent! Ești în formă maximă."
              : "Analizează unde poți reduce costurile."}
          </p>
        </div>

        {/* Card 2: Runway Calculator */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl relative overflow-hidden shadow-lg">
          <div className="absolute right-0 top-0 p-4 opacity-10">
            <FaPlaneDeparture size={120} className="text-blue-500" />
          </div>
          <h3 className="text-zinc-400 font-bold uppercase tracking-wider text-xs mb-2">
            Runway (Supraviețuire)
          </h3>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black text-white">{runwayDays}</span>
            <span className="text-lg text-zinc-500 font-bold">zile</span>
          </div>
          <div className="mt-2 text-sm text-zinc-400">
            Poți trăi{" "}
            <span className="text-white font-bold">
              {runwayMonthsDisplay} luni
            </span>{" "}
            din economii, dacă venitul se oprește azi.
          </div>
        </div>

        {/* Card 3: Time Spent */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl relative overflow-hidden shadow-lg">
          <div className="absolute right-0 top-0 p-4 opacity-10">
            <FaClock size={120} className="text-amber-500" />
          </div>
          <h3 className="text-zinc-400 font-bold uppercase tracking-wider text-xs mb-2">
            Viață "Cheltuită"
          </h3>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black text-white">
              {Math.round(totalSpent / (settings.hourlyWage || 1))}
            </span>
            <span className="text-lg text-zinc-500 font-bold">ore</span>
          </div>
          <div className="mt-2 text-sm text-zinc-400">
            Muncă necesară (la {settings.hourlyWage} RON/oră) pentru a acoperi
            cheltuielile totale.
          </div>
        </div>
      </div>

      {/* --- SECOND ROW --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Time Machine */}
        <div className="lg:col-span-2 bg-zinc-900/50 border border-zinc-800 p-6 rounded-3xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <FaChartLine className="text-emerald-500" /> Mașina Timpului
            </h3>
            <div className="text-xs bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20">
              Proiecție 5 Ani (+5%)
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={projectionData}>
                <defs>
                  <linearGradient id="colorWealth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#27272a"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  stroke="#71717a"
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  stroke="#71717a"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(val) => `${val / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#18181b",
                    borderColor: "#27272a",
                    borderRadius: "12px",
                    color: "#fff",
                  }}
                  itemStyle={{ color: "#34d399" }}
                  formatter={(val) => [
                    `${val.toLocaleString()} RON`,
                    "Avere Estimată",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="suma"
                  stroke="#10b981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorWealth)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-3xl flex flex-col items-center justify-center relative">
          <h3 className="text-lg font-bold text-white mb-4 absolute top-6 left-6">
            Structură
          </h3>
          {catData.length > 0 ? (
            <>
              <div className="h-[250px] w-full mt-8">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={catData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
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
                      contentStyle={{
                        backgroundColor: "#18181b",
                        borderColor: "#27272a",
                        borderRadius: "8px",
                      }}
                      itemStyle={{ color: "#fff" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="text-center -mt-4">
                <div className="text-xs text-zinc-500 uppercase">
                  Top Categorie
                </div>
                <div className="text-xl font-bold text-white capitalize">
                  {catData[0]?.name}
                </div>
              </div>
            </>
          ) : (
            <div className="text-zinc-500 italic mt-10">
              Nu există date suficiente.
            </div>
          )}
        </div>
      </div>

      {/* --- THIRD ROW --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Subscription Detective */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-violet-500/20 p-3 rounded-xl text-violet-400">
              <FaSearchDollar size={20} />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">
                Subscription Detective
              </h3>
              <p className="text-xs text-zinc-500">
                Detectăm automat plățile recurente.
              </p>
            </div>
          </div>

          <div className="space-y-3 max-h-[250px] overflow-y-auto custom-scrollbar pr-2">
            {subscriptionList.length === 0 ? (
              <div className="text-center py-8 text-zinc-500 italic">
                Curat! Nu am găsit abonamente suspecte.
              </div>
            ) : (
              subscriptionList.map((sub, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center p-3 bg-zinc-950/50 border border-zinc-800 rounded-xl hover:border-violet-500/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-white">
                      {sub.desc.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white capitalize">
                        {sub.desc}
                      </div>
                      <div className="text-[10px] text-zinc-500 flex gap-2">
                        {sub.isKnown && (
                          <span className="text-violet-400">
                            Serviciu Cunoscut
                          </span>
                        )}
                        <span>Detectat de {sub.count} ori</span>
                      </div>
                    </div>
                  </div>
                  <div className="font-mono text-red-400 font-bold">
                    -{sub.val}{" "}
                    <span className="text-[10px] text-zinc-600">RON</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Gamification */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-yellow-500/20 p-3 rounded-xl text-yellow-400">
              <FaMedal size={20} />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">Hall of Fame</h3>
              <p className="text-xs text-zinc-500">
                Deblochează realizări prin disciplină.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all ${
                  badge.unlocked
                    ? "bg-gradient-to-br from-zinc-800 to-zinc-900 border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.1)]"
                    : "bg-zinc-950 border-zinc-800 opacity-40 grayscale"
                }`}
              >
                <div className="text-3xl mb-2 filter drop-shadow-md">
                  {badge.icon}
                </div>
                <div className="text-xs font-bold text-white mb-1">
                  {badge.title}
                </div>
                <div className="text-[9px] text-zinc-500 leading-tight">
                  {badge.desc}
                </div>
                {!badge.unlocked && (
                  <FaLock className="text-[8px] text-zinc-600 mt-2" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsightsTab;
