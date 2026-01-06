import React, { useState, useEffect } from "react";
import { useBudget } from "../../context/BudgetContext";
import { useNavigate } from "react-router-dom"; // Dacă folosești router, altfel folosim dispatch
import {
  FaHome,
  FaChartPie,
  FaCalendarAlt,
  FaBullseye,
  FaHandHoldingUsd,
  FaLightbulb,
  FaSearch,
  FaPlus,
  FaTimes,
  FaTerminal,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const CommandMenu = () => {
  const { state, dispatch } = useBudget();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  // --- 1. KEYBOARD LISTENERS ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Toggle cu Ctrl+K sau Cmd+K
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      // Închide cu Escape
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Resetare selecție la deschidere/schimbare query
  useEffect(() => {
    setSelectedIndex(0);
  }, [isOpen, query]);

  // --- 2. LISTA DE COMENZI ---
  const commands = [
    {
      id: "goto-dashboard",
      label: "Mergi la Dashboard",
      icon: <FaHome />,
      section: "Navigare",
      action: () => dispatch({ type: "SET_TAB", payload: "dashboard" }),
    },
    {
      id: "goto-reports",
      label: "Mergi la Rapoarte",
      icon: <FaChartPie />,
      section: "Navigare",
      action: () => dispatch({ type: "SET_TAB", payload: "reports" }),
    },
    {
      id: "goto-calendar",
      label: "Mergi la Calendar",
      icon: <FaCalendarAlt />,
      section: "Navigare",
      action: () => dispatch({ type: "SET_TAB", payload: "calendar" }),
    },
    {
      id: "goto-goals",
      label: "Mergi la Obiective",
      icon: <FaBullseye />,
      section: "Navigare",
      action: () => dispatch({ type: "SET_TAB", payload: "goals" }),
    },
    {
      id: "goto-debts",
      label: "Mergi la Datorii",
      icon: <FaHandHoldingUsd />,
      section: "Navigare",
      action: () => dispatch({ type: "SET_TAB", payload: "debts" }),
    },
    {
      id: "goto-insights",
      label: "Mergi la Insights",
      icon: <FaLightbulb />,
      section: "Navigare",
      action: () => dispatch({ type: "SET_TAB", payload: "insights" }),
    },
    {
      id: "action-add-month",
      label: "Adaugă Lună Nouă",
      icon: <FaPlus />,
      section: "Acțiuni",
      action: () => {
        dispatch({ type: "SET_TAB", payload: "dashboard" });
        // Aici am putea declanșa un event global sau un context state pentru a deschide modalul
        // Pentru simplificare, ducem doar la dashboard
        document.getElementById("add-month-input")?.focus();
      },
    },
    {
      id: "view-grid",
      label: "Comutare: Grid View",
      icon: <FaTerminal />,
      section: "Vizualizare",
      action: () => dispatch({ type: "SET_VIEW", payload: "grid" }),
    },
    {
      id: "view-list",
      label: "Comutare: List View",
      icon: <FaTerminal />,
      section: "Vizualizare",
      action: () => dispatch({ type: "SET_VIEW", payload: "list" }),
    },
  ];

  // Filtrare
  const filteredCommands = commands.filter(
    (cmd) =>
      cmd.label.toLowerCase().includes(query.toLowerCase()) ||
      cmd.section.toLowerCase().includes(query.toLowerCase())
  );

  // Executare comandă
  const executeCommand = (cmd) => {
    cmd.action();
    setIsOpen(false);
    setQuery("");
  };

  // Navigare tastatură în listă
  const handleListKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        Math.min(prev + 1, filteredCommands.length - 1)
      );
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    }
    if (e.key === "Enter") {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        executeCommand(filteredCommands[selectedIndex]);
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Menu Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.1 }}
            className="relative w-full max-w-lg bg-[#1a1a1a] border border-zinc-700 shadow-2xl rounded-xl overflow-hidden flex flex-col max-h-[60vh]"
          >
            {/* Input Area */}
            <div className="flex items-center px-4 border-b border-zinc-800 py-4">
              <FaSearch className="text-zinc-500 mr-3" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleListKeyDown}
                placeholder="Ce dorești să faci?"
                className="flex-1 bg-transparent text-white placeholder-zinc-500 focus:outline-none text-lg"
              />
              <div className="text-[10px] text-zinc-500 border border-zinc-700 px-1.5 py-0.5 rounded bg-zinc-900 font-mono">
                ESC
              </div>
            </div>

            {/* Results List */}
            <div className="overflow-y-auto custom-scrollbar p-2">
              {filteredCommands.length === 0 ? (
                <div className="py-8 text-center text-zinc-500">
                  Nu am găsit comanda "{query}"
                </div>
              ) : (
                filteredCommands.map((cmd, idx) => (
                  <div
                    key={cmd.id}
                    onClick={() => executeCommand(cmd)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-colors ${
                      idx === selectedIndex
                        ? "bg-emerald-600 text-white"
                        : "text-zinc-400 hover:bg-zinc-800"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-md ${
                        idx === selectedIndex
                          ? "bg-emerald-500/20 text-white"
                          : "bg-zinc-800 text-zinc-500"
                      }`}
                    >
                      {cmd.icon}
                    </div>
                    <div className="flex-1">
                      <div
                        className={`text-sm font-medium ${
                          idx === selectedIndex ? "text-white" : "text-zinc-300"
                        }`}
                      >
                        {cmd.label}
                      </div>
                      {query.length > 0 && (
                        <div className="text-[10px] opacity-50 uppercase tracking-wider">
                          {cmd.section}
                        </div>
                      )}
                    </div>
                    {idx === selectedIndex && (
                      <div className="text-[10px] font-mono opacity-70">
                        ↵ Enter
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="bg-zinc-900 border-t border-zinc-800 px-4 py-2 flex justify-between items-center text-[10px] text-zinc-500">
              <div className="flex gap-3">
                <span>
                  <strong className="text-zinc-400">↑↓</strong> navigare
                </span>
                <span>
                  <strong className="text-zinc-400">↵</strong> selectare
                </span>
              </div>
              <div>BudgetFlow OS v2.0</div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CommandMenu;
