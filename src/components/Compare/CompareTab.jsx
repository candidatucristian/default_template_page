import React, { useState } from "react";
import { useBudget } from "../../context/BudgetContext";
import { calculateMonthStats, formatMoney } from "../../utils/helpers";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { FaExchangeAlt, FaCrown, FaBalanceScale } from "react-icons/fa";
import { motion } from "framer-motion";

const CompareTab = () => {
  const { state } = useBudget();
  const { months } = state;

  // Culori "Team A" vs "Team B"
  const COLOR_A = "#10b981"; // Emerald
  const COLOR_B = "#8b5cf6"; // Violet

  const [month1Id, setMonth1Id] = useState(
    months.length > 1 ? months[months.length - 2].id : ""
  );
  const [month2Id, setMonth2Id] = useState(
    months.length > 0 ? months[months.length - 1].id : ""
  );

  if (months.length < 2) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-zinc-500">
        <div className="text-6xl mb-4 opacity-20">⚖️</div>
        <h2 className="text-xl text-white font-bold">Nu ai destule date</h2>
        <p>Adaugă cel puțin 2 luni pentru a intra în ARENĂ.</p>
      </div>
    );
  }

  const m1 = months.find((m) => m.id.toString() === month1Id.toString());
  const m2 = months.find((m) => m.id.toString() === month2Id.toString());

  if (!m1 || !m2) return null;

  // --- STATISTICI ---
  const s1 = calculateMonthStats(m1);
  const s2 = calculateMonthStats(m2);

  // Helper pentru medie zilnica (evita NaN)
  const getDailyAvg = (month, stats) => {
    // Simplificare: presupunem 30 de zile daca nu e luna curenta, sau zilele trecute din luna curenta
    // Pentru comparatie corecta istoric, folosim nr de zile din luna
    // Daca e luna curenta, folosim zilele trecute pana azi

    // Mai robust: impartim totalSpent la nr de zile in care s-au facut cheltuieli SAU nr de zile din luna
    // Aici folosim logica simpla: total / 30 (standardizat) pentru consistenta
    // SAU stats.dailyAverage daca e calculat corect in helper.
    // Daca stats.dailyAverage vine NaN, il recalculam aici safe.

    if (stats.dailyAverage && !isNaN(stats.dailyAverage))
      return stats.dailyAverage;

    // Fallback simplu
    return stats.totalSpent / 30;
  };

  const dailyAvg1 = getDailyAvg(m1, s1);
  const dailyAvg2 = getDailyAvg(m2, s2);

  // Cine a câștigat? (Cine a economisit mai mult procentual)
  const winner =
    s1.savingsRate > s2.savingsRate
      ? "m1"
      : s2.savingsRate > s1.savingsRate
      ? "m2"
      : "draw";

  // Date Grafice
  const chartData = [
    { name: "Venit (Buget)", A: m1.budget, B: m2.budget },
    { name: "Cheltuit", A: s1.totalSpent, B: s2.totalSpent },
    { name: "Economisit", A: s1.remaining, B: s2.remaining },
  ];

  // Radar Data
  const allCats = new Set([
    ...m1.expenses.map((e) => e.category),
    ...m2.expenses.map((e) => e.category),
  ]);
  const radarData = Array.from(allCats).map((cat) => {
    const val1 = m1.expenses
      .filter((e) => e.category === cat)
      .reduce((a, b) => a + b.val, 0);
    const val2 = m2.expenses
      .filter((e) => e.category === cat)
      .reduce((a, b) => a + b.val, 0);
    return {
      subject: cat,
      A: val1,
      B: val2,
      fullMark: Math.max(val1, val2) * 1.2,
    };
  });

  // Delta Categories (Cele mai mari diferențe)
  const categoryDiffs = Array.from(allCats)
    .map((cat) => {
      const v1 = m1.expenses
        .filter((e) => e.category === cat)
        .reduce((a, b) => a + b.val, 0);
      const v2 = m2.expenses
        .filter((e) => e.category === cat)
        .reduce((a, b) => a + b.val, 0);
      return { cat, diff: v2 - v1, v1, v2 };
    })
    .sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff))
    .slice(0, 3); // Top 3 diferențe

  // --- SUB-COMPONENTE VIZUALE ---
  const ComparisonRow = ({
    label,
    val1,
    val2,
    isCurrency = true,
    inverse = false,
  }) => {
    const v1 = parseFloat(val1) || 0; // Default la 0 daca e NaN
    const v2 = parseFloat(val2) || 0;
    // Logică câștigător rând (Inverse = e mai bine să fie mic, ex: cheltuieli)
    const win1 = inverse ? v1 < v2 : v1 > v2;
    const win2 = inverse ? v2 < v1 : v2 > v1;

    const diff = v2 - v1;
    const percentDiff = v1 !== 0 ? ((diff / v1) * 100).toFixed(1) : 0;

    return (
      <div className="grid grid-cols-7 items-center py-4 border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors rounded-lg px-2">
        {/* Stânga (M1) */}
        <div
          className={`col-span-2 text-right font-mono font-bold ${
            win1 ? "text-emerald-400" : "text-zinc-500"
          }`}
        >
          {isCurrency ? formatMoney(v1).ron : `${Math.round(v1)}%`}
        </div>

        {/* Centru (Bară VS) */}
        <div className="col-span-3 flex flex-col items-center justify-center px-4">
          <div className="text-[10px] uppercase text-zinc-500 font-bold mb-1">
            {label}
          </div>
          <div className="flex items-center gap-2 w-full">
            {/* Bara Stânga (M1) - umplere de la dreapta la stânga */}
            <div className="flex-1 h-1.5 bg-zinc-800 rounded-l-full overflow-hidden flex justify-end">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(v1 / (Math.max(v1, v2) || 1)) * 100}%` }}
                className="h-full bg-emerald-500"
              />
            </div>
            {/* Separator */}
            <div className="text-[10px] font-bold text-zinc-600">VS</div>
            {/* Bara Dreapta (M2) */}
            <div className="flex-1 h-1.5 bg-zinc-800 rounded-r-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(v2 / (Math.max(v1, v2) || 1)) * 100}%` }}
                className="h-full bg-violet-500"
              />
            </div>
          </div>
          {/* Diff Badge */}
          <div
            className={`mt-1 text-[9px] px-1.5 py-0.5 rounded ${
              diff > 0
                ? inverse
                  ? "bg-red-500/10 text-red-400"
                  : "bg-emerald-500/10 text-emerald-400"
                : inverse
                ? "bg-emerald-500/10 text-emerald-400"
                : "bg-red-500/10 text-red-400"
            }`}
          >
            {diff > 0 ? "+" : ""}
            {isCurrency ? Math.round(diff) : percentDiff}
            {isCurrency ? " RON" : "%"}
          </div>
        </div>

        {/* Dreapta (M2) */}
        <div
          className={`col-span-2 text-left font-mono font-bold ${
            win2 ? "text-violet-400" : "text-zinc-500"
          }`}
        >
          {isCurrency ? formatMoney(v2).ron : `${Math.round(v2)}%`}
        </div>
      </div>
    );
  };

  return (
    <div className="animate-fade-in pb-20 space-y-8">
      {/* --- 1. THE ARENA HEADER --- */}
      <div className="relative bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-0 left-0 w-1/2 h-full bg-emerald-500/5 blur-3xl"></div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-violet-500/5 blur-3xl"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          {/* FIGHTER 1 (Left) */}
          <div className="flex-1 w-full text-center md:text-left relative">
            {winner === "m1" && (
              <FaCrown className="absolute -top-6 left-1/2 md:left-4 text-yellow-400 text-3xl animate-bounce drop-shadow-lg" />
            )}
            <div className="text-xs text-emerald-500 font-bold uppercase tracking-widest mb-2">
              Concurent A
            </div>
            <select
              value={month1Id}
              onChange={(e) => setMonth1Id(e.target.value)}
              className="bg-black/40 text-white text-xl font-bold p-3 rounded-xl border border-emerald-500/30 w-full focus:outline-none focus:border-emerald-500 transition-colors"
            >
              {months.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
            <div className="mt-2 flex justify-center md:justify-start gap-4 text-sm text-zinc-400">
              <span>
                Cheltuit:{" "}
                <span className="text-white font-mono">
                  {formatMoney(s1.totalSpent).ron}
                </span>
              </span>
            </div>
          </div>

          {/* VS BADGE */}
          <div className="flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-zinc-950 border-4 border-zinc-800 flex items-center justify-center text-2xl font-black italic text-zinc-600 shadow-xl z-20">
              VS
            </div>
          </div>

          {/* FIGHTER 2 (Right) */}
          <div className="flex-1 w-full text-center md:text-right relative">
            {winner === "m2" && (
              <FaCrown className="absolute -top-6 left-1/2 md:right-4 md:left-auto text-yellow-400 text-3xl animate-bounce drop-shadow-lg" />
            )}
            <div className="text-xs text-violet-500 font-bold uppercase tracking-widest mb-2">
              Concurent B
            </div>
            <select
              value={month2Id}
              onChange={(e) => setMonth2Id(e.target.value)}
              className="bg-black/40 text-white text-xl font-bold p-3 rounded-xl border border-violet-500/30 w-full focus:outline-none focus:border-violet-500 transition-colors text-right"
            >
              {months.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
            <div className="mt-2 flex justify-center md:justify-end gap-4 text-sm text-zinc-400">
              <span>
                Cheltuit:{" "}
                <span className="text-white font-mono">
                  {formatMoney(s2.totalSpent).ron}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* --- 2. TALE OF THE TAPE (Metrics) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Comparison Column */}
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-white font-bold flex items-center gap-2">
              <FaBalanceScale className="text-zinc-500" /> Analiză Directă
            </h3>
            <div className="flex gap-4 text-xs font-bold">
              <span className="text-emerald-500">{m1.name}</span>
              <span className="text-zinc-600">vs</span>
              <span className="text-violet-500">{m2.name}</span>
            </div>
          </div>

          <div className="space-y-2">
            <ComparisonRow
              label="Venit Total"
              val1={m1.budget}
              val2={m2.budget}
            />
            <ComparisonRow
              label="Cheltuieli"
              val1={s1.totalSpent}
              val2={s2.totalSpent}
              inverse={true}
            />
            <ComparisonRow
              label="Economii"
              val1={s1.remaining}
              val2={s2.remaining}
            />
            <ComparisonRow
              label="Rată Economisire"
              val1={s1.savingsRate}
              val2={s2.savingsRate}
              isCurrency={false}
            />
            <ComparisonRow
              label="Medie Zilnică"
              val1={Math.round(dailyAvg1)}
              val2={Math.round(dailyAvg2)}
              inverse={true}
            />
          </div>
        </div>

        {/* Side Stats: Biggest Swings */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 flex flex-col">
          <h3 className="text-white font-bold mb-6 flex items-center gap-2">
            <FaExchangeAlt className="text-zinc-500" /> Fluctuații Mari
          </h3>
          <div className="flex-1 space-y-4">
            {categoryDiffs.map((item, idx) => (
              <div
                key={idx}
                className="bg-zinc-950/50 p-4 rounded-2xl border border-zinc-800 relative overflow-hidden"
              >
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1 ${
                    item.diff > 0 ? "bg-red-500" : "bg-emerald-500"
                  }`}
                ></div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm text-zinc-400 capitalize">
                    {item.cat}
                  </span>
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded ${
                      item.diff > 0
                        ? "bg-red-500/10 text-red-400"
                        : "bg-emerald-500/10 text-emerald-400"
                    }`}
                  >
                    {item.diff > 0 ? "↗ A crescut" : "↘ A scăzut"}
                  </span>
                </div>
                <div className="flex items-end justify-between">
                  <div className="text-xs text-zinc-500">
                    {m1.name}: <span className="text-zinc-300">{item.v1}</span>
                    <br />
                    {m2.name}: <span className="text-zinc-300">{item.v2}</span>
                  </div>
                  <div className="text-xl font-mono font-bold text-white">
                    {Math.abs(item.diff)}{" "}
                    <span className="text-xs font-sans text-zinc-600">RON</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- 3. CHARTS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-3xl h-[400px]">
          <h3 className="text-white font-bold mb-4">Privire de Ansamblu</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#27272a"
                vertical={false}
              />
              <XAxis dataKey="name" stroke="#71717a" fontSize={12} />
              <YAxis
                stroke="#71717a"
                fontSize={12}
                tickFormatter={(val) => `${val / 1000}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#18181b",
                  borderColor: "#27272a",
                  borderRadius: "12px",
                  color: "#fff",
                }}
                cursor={{ fill: "transparent" }}
              />
              <Legend wrapperStyle={{ paddingTop: "20px" }} />
              <Bar
                dataKey="A"
                name={m1.name}
                fill={COLOR_A}
                radius={[6, 6, 0, 0]}
                barSize={40}
              />
              <Bar
                dataKey="B"
                name={m2.name}
                fill={COLOR_B}
                radius={[6, 6, 0, 0]}
                barSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Radar Chart */}
        <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-3xl h-[400px]">
          <h3 className="text-white font-bold mb-4">Amprenta Categoriilor</h3>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
              <PolarGrid stroke="#3f3f46" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: "#a1a1aa", fontSize: 11 }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, "auto"]}
                stroke="#52525b"
              />
              <Radar
                name={m1.name}
                dataKey="A"
                stroke={COLOR_A}
                strokeWidth={3}
                fill={COLOR_A}
                fillOpacity={0.2}
              />
              <Radar
                name={m2.name}
                dataKey="B"
                stroke={COLOR_B}
                strokeWidth={3}
                fill={COLOR_B}
                fillOpacity={0.2}
              />
              <Legend wrapperStyle={{ paddingTop: "10px" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#18181b",
                  borderColor: "#27272a",
                  borderRadius: "12px",
                }}
                itemStyle={{ color: "#fff" }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default CompareTab;
