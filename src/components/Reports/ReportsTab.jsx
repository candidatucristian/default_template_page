import React, { useState, useMemo } from "react";
import { useBudget } from "../../context/BudgetContext";
import { CATEGORY_INFO } from "../../utils/constants";
import {
  FaSearch,
  FaSortAmountDown,
  FaSortAmountUp,
  FaFilter,
  FaFileInvoiceDollar,
  FaCalendarAlt,
  FaLayerGroup,
  FaTrophy,
  FaDna,
  FaRobot,
  FaMoneyBillWave,
} from "react-icons/fa";

const ReportsTab = () => {
  const { state } = useBudget();
  const { months } = state;

  // --- STATE PENTRU FILTRE ---
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState("date-desc");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("all");
  const [subscriptionMode, setSubscriptionMode] = useState(false);

  // --- 1. PROCESAREA DATELOR ---
  const allData = useMemo(() => {
    return months.flatMap((month) =>
      month.expenses.map((exp) => {
        let dateObj = new Date();
        if (exp.date) {
          if (exp.date.includes(".")) {
            const [d, m, y] = exp.date.split(".");
            dateObj = new Date(`${y}-${m}-${d}`);
          } else {
            dateObj = new Date(exp.date);
          }
        }
        return {
          ...exp,
          monthName: month.name,
          monthId: month.id,
          realDate: dateObj,
          year: dateObj.getFullYear(),
          monthIndex: dateObj.getMonth(),
          dayName: dateObj.toLocaleDateString("ro-RO", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          }),
        };
      })
    );
  }, [months]);

  const availableYears = useMemo(
    () => [...new Set(allData.map((d) => d.year))].sort((a, b) => b - a),
    [allData]
  );
  const monthNamesRo = [
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

  // --- 2. FILTRARE ---
  const filteredData = useMemo(() => {
    let data = [...allData];

    if (yearFilter !== "all")
      data = data.filter((e) => e.year === parseInt(yearFilter));
    if (monthFilter !== "all")
      data = data.filter((e) => e.monthIndex === parseInt(monthFilter));
    if (searchTerm)
      data = data.filter((e) =>
        e.desc.toLowerCase().includes(searchTerm.toLowerCase())
      );
    if (categoryFilter !== "all")
      data = data.filter((e) => e.category === categoryFilter);

    if (subscriptionMode) {
      const subs = [
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
        "worldclass",
        "chirie",
        "intretinere",
        "chatgpt",
        "apple",
        "google",
      ];
      data = data.filter((e) =>
        subs.some((s) => e.desc.toLowerCase().includes(s))
      );
    }

    // Sortare elemente individuale (pentru consistență internă)
    data.sort((a, b) => b.val - a.val); // Cele mai scumpe primele în cadrul zilei

    return data;
  }, [
    allData,
    searchTerm,
    categoryFilter,
    yearFilter,
    monthFilter,
    subscriptionMode,
  ]);

  // --- 3. GRUPARE PE ZILE ---
  const groupedByDay = useMemo(() => {
    const groups = {};

    filteredData.forEach((item) => {
      // Cheie unică pentru zi: YYYY-MM-DD
      const dateKey = item.realDate.toISOString().split("T")[0];

      if (!groups[dateKey]) {
        groups[dateKey] = {
          dateObj: item.realDate,
          dayDisplay: item.dayName, // "Luni, 5 Februarie 2026"
          items: [],
          totalDaily: 0,
        };
      }
      groups[dateKey].items.push(item);
      groups[dateKey].totalDaily += item.val;
    });

    // Convertim obiectul în array și sortăm zilele
    return Object.values(groups).sort((a, b) => {
      if (sortConfig === "date-asc") return a.dateObj - b.dateObj;
      return b.dateObj - a.dateObj; // Default: cele mai recente sus
    });
  }, [filteredData, sortConfig]);

  // --- 4. STATISTICI ---
  const stats = useMemo(() => {
    const total = filteredData.reduce((acc, curr) => acc + curr.val, 0);
    const count = filteredData.length;
    const maxExpense = filteredData.reduce(
      (max, curr) => (curr.val > max.val ? curr : max),
      { val: 0, desc: "-" }
    );

    const catCounts = {};
    filteredData.forEach((e) => {
      catCounts[e.category] = (catCounts[e.category] || 0) + e.val;
    });
    const topCatKey = Object.keys(catCounts).reduce(
      (a, b) => (catCounts[a] > catCounts[b] ? a : b),
      "other"
    );

    let dnaTitle = "Analist Financiar";
    let dnaColor = "text-blue-400";

    if (topCatKey === "food" || topCatKey === "fun") {
      dnaTitle = "Hedonistul Vieții";
      dnaColor = "text-pink-400";
    } else if (topCatKey === "investments" || topCatKey === "savings") {
      dnaTitle = "Lupul de pe Wall St";
      dnaColor = "text-emerald-400";
    } else if (count > 20 && total < 2000) {
      dnaTitle = "Micul Strateg";
      dnaColor = "text-yellow-400";
    }

    return { total, count, maxExpense, topCat: topCatKey, dnaTitle, dnaColor };
  }, [filteredData]);

  return (
    <div className="space-y-6 animate-fade-in pb-24">
      {/* HEADER: SPENDING DNA CARD */}
      <div className="bg-gradient-to-r from-zinc-900 to-zinc-950 p-6 rounded-3xl border border-zinc-800 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
          <div>
            <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-1 flex items-center gap-2">
              <FaRobot /> AI Analysis
            </h2>
            <div className="text-3xl md:text-4xl font-black text-white">
              Profil:{" "}
              <span className={`${stats.dnaColor}`}>{stats.dnaTitle}</span>
            </div>
            <p className="text-zinc-400 mt-2 max-w-lg">
              Top categorie:{" "}
              <span className="text-white font-bold mx-1">
                {CATEGORY_INFO[stats.topCat]?.name || "Diverse"}
              </span>
              .
            </p>
          </div>
          <div className="text-right bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800/50 backdrop-blur-md">
            <div className="text-xs text-zinc-500 uppercase font-bold">
              Total Selecție
            </div>
            <div className="text-4xl font-mono font-bold text-white">
              {stats.total.toLocaleString()}{" "}
              <span className="text-lg text-emerald-500">RON</span>
            </div>
          </div>
        </div>
      </div>

      {/* CONTROL BAR */}
      <div className="bg-zinc-950/80 border border-zinc-800 p-4 rounded-2xl sticky top-0 z-30 backdrop-blur-xl shadow-2xl transition-all">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {/* AN */}
          <div className="relative col-span-1">
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 text-white pl-3 pr-8 py-2 rounded-lg text-xs font-bold focus:border-emerald-500 outline-none appearance-none cursor-pointer hover:bg-zinc-800 transition-colors"
            >
              <option value="all">Toți Anii</option>
              {availableYears.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <FaCalendarAlt className="absolute right-3 top-2.5 text-zinc-500 pointer-events-none text-xs" />
          </div>
          {/* LUNA */}
          <div className="relative col-span-1">
            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 text-white pl-3 pr-8 py-2 rounded-lg text-xs font-bold focus:border-emerald-500 outline-none appearance-none cursor-pointer hover:bg-zinc-800 transition-colors"
            >
              <option value="all">Toate Lunile</option>
              {monthNamesRo.map((m, i) => (
                <option key={i} value={i}>
                  {m}
                </option>
              ))}
            </select>
            <FaCalendarAlt className="absolute right-3 top-2.5 text-zinc-500 pointer-events-none text-xs" />
          </div>
          {/* SEARCH */}
          <div className="relative col-span-2">
            <FaSearch className="absolute left-3 top-2.5 text-zinc-500 text-xs" />
            <input
              type="text"
              placeholder="Caută (ex: Netflix)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 text-white pl-8 pr-4 py-2 rounded-lg text-xs focus:border-emerald-500 outline-none"
            />
          </div>
          {/* CATEGORIE */}
          <div className="relative col-span-1">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 text-white pl-3 pr-8 py-2 rounded-lg text-xs font-bold focus:border-emerald-500 outline-none appearance-none cursor-pointer hover:bg-zinc-800 transition-colors"
            >
              <option value="all">Orice Categorie</option>
              {Object.entries(CATEGORY_INFO)
                .filter((k) => k[0] !== "_total")
                .map(([key, val]) => (
                  <option key={key} value={key}>
                    {val.emoji} {val.name}
                  </option>
                ))}
            </select>
            <FaFilter className="absolute right-3 top-2.5 text-zinc-500 pointer-events-none text-xs" />
          </div>
          {/* SORTARE */}
          <div className="relative col-span-1">
            <select
              value={sortConfig}
              onChange={(e) => setSortConfig(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 text-white pl-3 pr-8 py-2 rounded-lg text-xs font-bold focus:border-emerald-500 outline-none appearance-none cursor-pointer hover:bg-zinc-800 transition-colors"
            >
              <option value="date-desc">📅 Zile: Noi-Vechi</option>
              <option value="date-asc">📅 Zile: Vechi-Noi</option>
            </select>
            <FaSortAmountDown className="absolute right-3 top-2.5 text-zinc-500 pointer-events-none text-xs" />
          </div>
        </div>
        {/* TOGGLE SUBSCRIPTIONS */}
        <div className="mt-3 flex justify-end">
          <button
            onClick={() => setSubscriptionMode(!subscriptionMode)}
            className={`text-xs px-4 py-1.5 rounded-full border transition-all flex items-center gap-2 font-bold ${
              subscriptionMode
                ? "bg-violet-600 border-violet-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.5)]"
                : "bg-zinc-900 border-zinc-700 text-zinc-400 hover:bg-zinc-800"
            }`}
          >
            {subscriptionMode ? (
              <FaRobot className="animate-bounce" />
            ) : (
              <FaSearch />
            )}{" "}
            {subscriptionMode ? "Mod DETECTIV: ACTIV" : "Detectează Abonamente"}
          </button>
        </div>
      </div>

      {/* NEW GROUPED VIEW */}
      <div className="space-y-6">
        {groupedByDay.length === 0 ? (
          <div className="p-16 text-center border-2 border-dashed border-zinc-800 rounded-3xl bg-zinc-900/20">
            <div className="text-5xl opacity-20 mb-4">🕵️‍♂️</div>
            <p className="text-zinc-500">Nu am găsit tranzacții.</p>
          </div>
        ) : (
          groupedByDay.map((group, idx) => (
            <div
              key={idx}
              className="bg-zinc-900/40 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-700 transition-colors animate-scale-in"
              style={{ animationDelay: `${idx * 0.05}s` }}
            >
              {/* DAY HEADER */}
              <div className="bg-zinc-900/80 px-6 py-4 flex justify-between items-center border-b border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center text-emerald-500 text-lg border border-zinc-700 font-bold">
                    {group.dateObj.getDate()}
                  </div>
                  <div>
                    <h3 className="text-white font-bold capitalize text-lg leading-tight">
                      {group.dayDisplay.split(",")[0]}
                    </h3>
                    <p className="text-zinc-500 text-xs capitalize">
                      {group.dayDisplay.split(",")[1]}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="block text-xs text-zinc-500 uppercase font-bold">
                    Total Zi
                  </span>
                  <span className="font-mono text-white font-bold">
                    {group.totalDaily.toLocaleString()} RON
                  </span>
                </div>
              </div>

              {/* EXPENSES LIST */}
              <div className="divide-y divide-zinc-800/50">
                {group.items.map((exp, expIdx) => (
                  <div
                    key={expIdx}
                    className="px-6 py-3 flex items-center justify-between hover:bg-zinc-800/20 transition-colors group"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="text-2xl opacity-80 group-hover:scale-110 transition-transform">
                        {CATEGORY_INFO[exp.category]?.emoji || "📦"}
                      </div>
                      <div className="min-w-0">
                        <div className="text-zinc-200 font-medium truncate pr-4">
                          {exp.desc}
                        </div>
                        <div className="flex items-center gap-2 text-[10px]">
                          <span className="text-zinc-500">
                            {CATEGORY_INFO[exp.category]?.name}
                          </span>
                          {exp.note && (
                            <span className="text-zinc-600 border-l border-zinc-700 pl-2 italic truncate max-w-[150px]">
                              {exp.note}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="font-mono font-bold text-red-400 whitespace-nowrap">
                      -{exp.val.toLocaleString()}{" "}
                      <span className="text-[10px] text-zinc-600">RON</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReportsTab;
