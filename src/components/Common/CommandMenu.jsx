import React, { useEffect, useState } from "react";
import { Command } from "cmdk";
import { useNavigate } from "react-router-dom"; // Dacă folosești routing
import { useBudget } from "../../context/BudgetContext";
import { FaPlus, FaHome, FaChartPie, FaWallet } from "react-icons/fa";

const CommandMenu = () => {
  const [open, setOpen] = useState(false);
  const { dispatch } = useBudget();

  // Toggle cu Cmd+K sau Ctrl+K
  useEffect(() => {
    const down = (e) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = (command) => {
    setOpen(false);
    command();
  };

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Global Command Menu"
      className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[640px] max-w-full bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl z-[9999] overflow-hidden p-2"
    >
      <Command.Input
        placeholder="Caută o acțiune... (ex: Adaugă cheltuială)"
        className="w-full bg-transparent border-b border-zinc-800 p-3 text-white outline-none font-medium mb-2"
      />

      <Command.List className="max-h-[300px] overflow-y-auto px-2">
        <Command.Empty className="py-6 text-center text-zinc-500">
          Niciun rezultat.
        </Command.Empty>

        <Command.Group
          heading="Acțiuni Rapide"
          className="text-zinc-500 text-xs font-bold mb-2"
        >
          <Command.Item
            className="flex items-center gap-2 p-2 rounded-lg text-white hover:bg-emerald-500/20 hover:text-emerald-500 cursor-pointer transition-colors"
            onSelect={() =>
              runCommand(() =>
                dispatch({ type: "SET_TAB", payload: "dashboard" })
              )
            }
          >
            <FaHome /> Mergi la Dashboard
          </Command.Item>
          <Command.Item
            className="flex items-center gap-2 p-2 rounded-lg text-white hover:bg-emerald-500/20 hover:text-emerald-500 cursor-pointer transition-colors"
            onSelect={() =>
              runCommand(() => dispatch({ type: "SET_TAB", payload: "goals" }))
            }
          >
            <FaChartPie /> Vezi Obiective
          </Command.Item>
          <Command.Item
            className="flex items-center gap-2 p-2 rounded-lg text-white hover:bg-emerald-500/20 hover:text-emerald-500 cursor-pointer transition-colors"
            onSelect={() =>
              runCommand(() => dispatch({ type: "SET_TAB", payload: "debts" }))
            }
          >
            <FaWallet /> Vezi Datorii
          </Command.Item>
        </Command.Group>
      </Command.List>

      <div className="border-t border-zinc-800 mt-2 p-2 flex justify-between items-center text-xs text-zinc-500">
        <span>Caută orice</span>
        <span className="bg-zinc-800 px-2 py-1 rounded">
          ESC pentru a închide
        </span>
      </div>
    </Command.Dialog>
  );
};

export default CommandMenu;
