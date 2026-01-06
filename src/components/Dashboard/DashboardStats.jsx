import React from "react";
import { useBudget } from "../../context/BudgetContext";
import { useTranslation } from "react-i18next";
import {
  calculateGlobalStats,
  calculateRunningBalance,
} from "../../utils/helpers";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { motion } from "framer-motion";

const DashboardStats = () => {
  const { t } = useTranslation();
  const { state } = useBudget();
  const { months } = state;

  const stats = calculateGlobalStats(months);
  const runningBalance = calculateRunningBalance(months);

  const chartData = [...months]
    .sort((a, b) => a.id - b.id)
    .slice(-12)
    .map((m) => {
      const spent = m.expenses.reduce((acc, curr) => acc + curr.val, 0);
      return { name: m.name.split(" ")[0], Cheltuit: spent, Buget: m.budget };
    });

  const categoryData = Object.entries(stats.categoryTotals || {})
    .map(([key, value]) => ({ name: key, value: value }))
    .filter((x) => x.name !== "_total" && x.value > 0);

  const COLORS = [
    "#10b981",
    "#3b82f6",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
    "#06b6d4",
  ];
  const tooltipStyle = {
    backgroundColor: "#18181b",
    borderColor: "#27272a",
    color: "#fff",
    borderRadius: "12px",
    padding: "10px",
  };

  return (
    <div className="space-y-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: t("dashboard.stats.balance"),
            val: `${runningBalance} RON`,
            color: "emerald",
            sub: "Net Worth",
          },
          {
            label: t("dashboard.stats.total_spent"),
            val: `${stats.totalSpent} RON`,
            color: "red",
            sub: "Lifetime",
          },
          {
            label: t("dashboard.stats.savings_rate"),
            val: `${Math.round(stats.savingsRate)}%`,
            color: "amber",
            sub: "Eficiență",
          },
          {
            label: t("dashboard.stats.active_months"),
            val: months.length,
            color: "blue",
            sub: "Istoric",
          },
        ].map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-zinc-900/60 backdrop-blur-md border border-zinc-800 rounded-2xl p-6 relative overflow-hidden group hover:border-zinc-600 transition-colors"
          >
            <div
              className={`absolute -right-4 -top-4 w-32 h-32 bg-${item.color}-500/10 rounded-full group-hover:scale-150 transition-transform duration-700 blur-xl`}
            />
            <p className="text-zinc-500 text-sm font-bold uppercase tracking-wider relative">
              {item.label}
            </p>
            <h3 className="text-4xl font-bold text-white mt-2 relative">
              {item.val}
            </h3>
            <p
              className={`text-xs mt-2 text-${item.color}-400 font-mono relative`}
            >
              {item.sub}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-2 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 h-[450px]"
        >
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            📈 {t("dashboard.stats.financial_trend")}
          </h3>
          <ResponsiveContainer width="100%" height="90%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
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
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis
                stroke="#71717a"
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `${val / 1000}k`}
                dx={-10}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                itemStyle={{ color: "#fff" }}
                cursor={{ stroke: "#3f3f46", strokeWidth: 1 }}
              />
              <Area
                type="monotone"
                dataKey="Cheltuit"
                stroke="#10b981"
                strokeWidth={4}
                fillOpacity={1}
                fill="url(#colorSpent)"
                activeDot={{ r: 8, strokeWidth: 0 }}
              />
              <Area
                type="monotone"
                dataKey="Buget"
                stroke="#3f3f46"
                strokeWidth={2}
                strokeDasharray="5 5"
                fill="none"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 h-[450px] flex flex-col"
        >
          <h3 className="text-lg font-bold text-white mb-4">
            {t("dashboard.stats.category_dist")}
          </h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {categoryData.map((entry, index) => (
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
          <div className="grid grid-cols-2 gap-2 mt-4">
            {categoryData.slice(0, 6).map((c, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-xs text-zinc-400"
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                />
                <span className="truncate">{t(`categories.${c.name}`)}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardStats;
