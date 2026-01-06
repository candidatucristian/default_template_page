import React, { useState } from "react";
import { useBudget } from "../../context/BudgetContext";
import { formatMoney } from "../../utils/helpers";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaPlus,
  FaBitcoin,
  FaChartLine,
  FaLandmark,
  FaTrash,
  FaArrowUp,
  FaArrowDown,
} from "react-icons/fa";
import Modal from "../Common/Modal"; // Folosim modalul tău generic

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ec4899"];

const InvestmentsTab = () => {
  const { state, dispatch } = useBudget();
  const { investments } = state;
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [newAsset, setNewAsset] = useState({
    name: "",
    type: "stock", // stock, crypto, etf, real_estate
    quantity: "",
    buyPrice: "",
    currentPrice: "",
  });

  // --- CALCULATIONS ---
  const totalInvested = investments.reduce(
    (acc, inv) => acc + inv.buyPrice * inv.quantity,
    0
  );
  const currentValue = investments.reduce(
    (acc, inv) => acc + inv.currentPrice * inv.quantity,
    0
  );
  const profit = currentValue - totalInvested;
  const roi = totalInvested > 0 ? (profit / totalInvested) * 100 : 0;

  // Data for Charts
  const allocationData = investments.map((inv) => ({
    name: inv.name,
    value: inv.currentPrice * inv.quantity,
  }));

  // Mock data for Area Chart (Trend) - Putem face ceva mai smart pe viitor
  const trendData = [
    { name: "Jan", val: totalInvested * 0.9 },
    { name: "Feb", val: totalInvested * 0.95 },
    { name: "Mar", val: totalInvested * 1.02 },
    { name: "Apr", val: totalInvested * 1.05 },
    { name: "May", val: currentValue * 0.98 },
    { name: "Jun", val: currentValue },
  ];

  const handleAdd = () => {
    if (!newAsset.name || !newAsset.quantity) return;
    dispatch({
      type: "ADD_INVESTMENT",
      payload: {
        name: newAsset.name,
        type: newAsset.type,
        quantity: parseFloat(newAsset.quantity),
        buyPrice: parseFloat(newAsset.buyPrice),
        currentPrice: parseFloat(newAsset.currentPrice || newAsset.buyPrice),
      },
    });
    setIsModalOpen(false);
    setNewAsset({
      name: "",
      type: "stock",
      quantity: "",
      buyPrice: "",
      currentPrice: "",
    });
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "crypto":
        return <FaBitcoin className="text-orange-500" />;
      case "stock":
        return <FaChartLine className="text-blue-500" />;
      case "real_estate":
        return <FaLandmark className="text-emerald-500" />;
      default:
        return <FaChartLine className="text-zinc-500" />;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      {/* 1. HERO SECTION - KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Value Card */}
        <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 rounded-3xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl group-hover:scale-110 transition-transform">
            💎
          </div>
          <div className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-2">
            Valoare Portofoliu
          </div>
          <div className="text-4xl font-black text-white tracking-tight">
            {formatMoney(currentValue).ron}
          </div>
          <div className="mt-2 text-xs text-zinc-500">
            Investiție inițială: {formatMoney(totalInvested).ron}
          </div>
        </div>

        {/* Profit Card */}
        <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 rounded-3xl p-6 relative overflow-hidden">
          <div className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-2">
            Profit / Pierdere
          </div>
          <div
            className={`text-4xl font-black tracking-tight flex items-center gap-2 ${
              profit >= 0 ? "text-emerald-500" : "text-red-500"
            }`}
          >
            {profit > 0 ? "+" : ""}
            {formatMoney(profit).ron}
            <span
              className={`text-sm px-2 py-1 rounded-full bg-white/5 border border-white/10 flex items-center gap-1 ${
                profit >= 0 ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {profit >= 0 ? (
                <FaArrowUp size={10} />
              ) : (
                <FaArrowDown size={10} />
              )}{" "}
              {Math.abs(roi).toFixed(2)}%
            </span>
          </div>
          <div className="mt-2 text-xs text-zinc-500">
            Randament total (ROI)
          </div>
        </div>

        {/* Add Button Card */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/30 border-dashed rounded-3xl p-6 flex flex-col items-center justify-center gap-3 transition-all group cursor-pointer text-emerald-500 hover:text-emerald-400"
        >
          <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-black text-xl shadow-[0_0_20px_rgba(16,185,129,0.4)] group-hover:scale-110 transition-transform">
            <FaPlus />
          </div>
          <span className="font-bold uppercase tracking-widest text-xs">
            Adaugă Activ Nou
          </span>
        </button>
      </div>

      {/* 2. CHARTS SECTION */}
      {investments.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Allocation Chart */}
          <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 rounded-3xl p-6 min-h-[300px] flex flex-col">
            <h3 className="text-white font-bold mb-6 flex items-center gap-2">
              <span className="w-2 h-6 bg-blue-500 rounded-full"></span> Alocare
              Portofoliu
            </h3>
            <div className="flex-1 w-full h-full min-h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={allocationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {allocationData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                        stroke="rgba(0,0,0,0.5)"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#18181b",
                      borderColor: "#27272a",
                      borderRadius: "12px",
                      color: "#fff",
                    }}
                    itemStyle={{ color: "#fff" }}
                    formatter={(value) => `${value.toLocaleString()} RON`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Trend Chart */}
          <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 rounded-3xl p-6 min-h-[300px] flex flex-col">
            <h3 className="text-white font-bold mb-6 flex items-center gap-2">
              <span className="w-2 h-6 bg-emerald-500 rounded-full"></span>{" "}
              Evoluție (Simulat)
            </h3>
            <div className="flex-1 w-full h-full min-h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
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
                    stroke="#52525b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#52525b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `${val / 1000}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#18181b",
                      borderColor: "#27272a",
                      borderRadius: "12px",
                      color: "#fff",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="val"
                    stroke="#10b981"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorVal)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* 3. ASSETS LIST */}
      <div>
        <h3 className="text-zinc-500 font-bold text-xs uppercase tracking-widest mb-4 ml-2">
          Activele Tale
        </h3>
        <div className="space-y-3">
          {investments.length === 0 ? (
            <div className="text-center py-12 text-zinc-600 border border-dashed border-zinc-800 rounded-3xl">
              Nu ai nicio investiție momentan. Adaugă primul activ! 🚀
            </div>
          ) : (
            investments.map((inv) => {
              const itemProfit =
                (inv.currentPrice - inv.buyPrice) * inv.quantity;
              const itemRoi =
                ((inv.currentPrice - inv.buyPrice) / inv.buyPrice) * 100;

              return (
                <motion.div
                  key={inv.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-zinc-900/40 border border-zinc-800 hover:border-zinc-600 rounded-2xl p-4 flex items-center justify-between group transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center text-xl shadow-inner">
                      {getTypeIcon(inv.type)}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-lg">
                        {inv.name}
                      </h4>
                      <div className="text-xs text-zinc-500 flex gap-2">
                        <span>{inv.quantity} buc</span>
                        <span className="text-zinc-600">•</span>
                        <span>Avg: {inv.buyPrice} RON</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-right">
                    <div>
                      <div className="font-mono font-bold text-white text-lg">
                        {formatMoney(inv.currentPrice * inv.quantity).ron}
                      </div>
                      <div
                        className={`text-xs font-bold ${
                          itemProfit >= 0 ? "text-emerald-500" : "text-red-500"
                        }`}
                      >
                        {itemProfit > 0 ? "+" : ""}
                        {Math.round(itemProfit)} RON ({itemRoi.toFixed(1)}%)
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        dispatch({ type: "DELETE_INVESTMENT", payload: inv.id })
                      }
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-600 hover:text-red-500 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* 4. MODAL ADD INVESTMENT */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Adaugă Investiție"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs text-zinc-500 font-bold uppercase ml-1">
              Nume Activ
            </label>
            <input
              type="text"
              value={newAsset.name}
              onChange={(e) =>
                setNewAsset({ ...newAsset, name: e.target.value })
              }
              placeholder="ex: Apple, Bitcoin, Aur"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-zinc-500 font-bold uppercase ml-1">
                Tip
              </label>
              <select
                value={newAsset.type}
                onChange={(e) =>
                  setNewAsset({ ...newAsset, type: e.target.value })
                }
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500 transition-colors"
              >
                <option value="stock">Acțiuni (Stock)</option>
                <option value="crypto">Crypto</option>
                <option value="etf">ETF</option>
                <option value="real_estate">Imobiliare</option>
                <option value="other">Altele</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-zinc-500 font-bold uppercase ml-1">
                Cantitate
              </label>
              <input
                type="number"
                value={newAsset.quantity}
                onChange={(e) =>
                  setNewAsset({ ...newAsset, quantity: e.target.value })
                }
                placeholder="0.00"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-zinc-500 font-bold uppercase ml-1">
                Preț Mediu Cumpărare
              </label>
              <input
                type="number"
                value={newAsset.buyPrice}
                onChange={(e) =>
                  setNewAsset({ ...newAsset, buyPrice: e.target.value })
                }
                placeholder="RON"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-500 font-bold uppercase ml-1">
                Preț Curent (Piață)
              </label>
              <input
                type="number"
                value={newAsset.currentPrice}
                onChange={(e) =>
                  setNewAsset({ ...newAsset, currentPrice: e.target.value })
                }
                placeholder="RON"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          <button
            onClick={handleAdd}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl mt-4 shadow-lg shadow-emerald-900/20"
          >
            Salvează în Portofoliu
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default InvestmentsTab;
