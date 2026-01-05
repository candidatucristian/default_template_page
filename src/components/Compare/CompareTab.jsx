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

const CompareTab = () => {
  const { state } = useBudget();
  const { months } = state;

  // Default: ultimele 2 luni sau null
  const [month1Id, setMonth1Id] = useState(
    months.length > 1 ? months[months.length - 2].id : ""
  );
  const [month2Id, setMonth2Id] = useState(
    months.length > 0 ? months[months.length - 1].id : ""
  );

  if (months.length < 2) {
    return (
      <div className="text-center py-20 bg-zinc-900/50 border border-dashed border-zinc-800 rounded-3xl">
        <h2 className="text-xl text-white mb-2">Nu ai destule date</h2>
        <p className="text-zinc-500">
          Adaugă cel puțin 2 luni pentru a le putea compara.
        </p>
      </div>
    );
  }

  const m1 = months.find((m) => m.id.toString() === month1Id.toString());
  const m2 = months.find((m) => m.id.toString() === month2Id.toString());

  if (!m1 || !m2) return null;

  const stats1 = calculateMonthStats(m1);
  const stats2 = calculateMonthStats(m2);

  // Date pentru Bar Chart (General)
  const generalData = [
    {
      name: "Buget",
      [m1.name]: m1.budget,
      [m2.name]: m2.budget,
    },
    {
      name: "Cheltuit",
      [m1.name]: stats1.totalSpent,
      [m2.name]: stats2.totalSpent,
    },
    {
      name: "Economisit",
      [m1.name]: stats1.remaining,
      [m2.name]: stats2.remaining,
    },
  ];

  // Date pentru Radar Chart (Categorii)
  // Colectăm toate categoriile unice
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

  const diffSpent = stats2.totalSpent - stats1.totalSpent;
  const isSpendingMore = diffSpent > 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Selectors */}
      <div className="flex flex-col md:flex-row gap-4 bg-zinc-900 p-4 rounded-xl border border-zinc-800 items-center justify-between">
        <h2 className="text-xl font-bold text-white flex gap-2 items-center">
          🆚 Versus Mode
        </h2>
        <div className="flex gap-4 items-center">
          <select
            value={month1Id}
            onChange={(e) => setMonth1Id(e.target.value)}
            className="bg-zinc-800 text-white p-2 rounded-lg border border-zinc-700 outline-none"
          >
            {months.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
          <span className="text-zinc-500 font-bold">VS</span>
          <select
            value={month2Id}
            onChange={(e) => setMonth2Id(e.target.value)}
            className="bg-zinc-800 text-white p-2 rounded-lg border border-zinc-700 outline-none"
          >
            {months.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Big Stats Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800 text-center">
          <div className="text-zinc-500 text-sm mb-1">Diferență Cheltuieli</div>
          <div
            className={`text-3xl font-bold ${
              isSpendingMore ? "text-red-500" : "text-emerald-500"
            }`}
          >
            {isSpendingMore ? "↗" : "↘"} {formatMoney(Math.abs(diffSpent)).ron}
          </div>
          <p className="text-xs text-zinc-400 mt-2">
            În {m2.name} ai cheltuit {isSpendingMore ? "mai mult" : "mai puțin"}{" "}
            decât în {m1.name}.
          </p>
        </div>

        <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
          <div className="text-zinc-500 text-sm mb-1">
            Câștigător la Economii
          </div>
          <div className="text-2xl font-bold text-white mt-2">
            {stats1.remaining > stats2.remaining ? m1.name : m2.name} 🏆
          </div>
          <div className="text-xs text-zinc-400 mt-1">
            A economisit mai mult
          </div>
        </div>

        <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800 text-center">
          <div className="text-zinc-500 text-sm mb-1">Eficiență Buget</div>
          <div className="flex justify-center gap-4 mt-2">
            <div className="text-center">
              <div className="text-xs text-zinc-500">{m1.name}</div>
              <div className="font-bold text-white">
                {Math.round(stats1.percentUsed)}%
              </div>
            </div>
            <div className="w-px bg-zinc-700"></div>
            <div className="text-center">
              <div className="text-xs text-zinc-500">{m2.name}</div>
              <div className="font-bold text-white">
                {Math.round(stats2.percentUsed)}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800 h-[400px]">
          <h3 className="text-white font-bold mb-4">Comparație Generală</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={generalData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#27272a"
                vertical={false}
              />
              <XAxis dataKey="name" stroke="#71717a" />
              <YAxis stroke="#71717a" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#18181b",
                  borderColor: "#27272a",
                  borderRadius: "8px",
                  color: "#fff",
                }}
                itemStyle={{ color: "#fff" }}
                cursor={{ fill: "transparent" }}
              />
              <Legend />
              <Bar dataKey={m1.name} fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey={m2.name} fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Radar Chart */}
        <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800 h-[400px]">
          <h3 className="text-white font-bold mb-4">Radar Categorii</h3>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
              <PolarGrid stroke="#3f3f46" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: "#a1a1aa", fontSize: 12 }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, "auto"]}
                stroke="#52525b"
              />
              <Radar
                name={m1.name}
                dataKey="A"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="#3b82f6"
                fillOpacity={0.3}
              />
              <Radar
                name={m2.name}
                dataKey="B"
                stroke="#8b5cf6"
                strokeWidth={2}
                fill="#8b5cf6"
                fillOpacity={0.3}
              />
              <Legend />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#18181b",
                  borderColor: "#27272a",
                  borderRadius: "8px",
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
