import React, { useState } from "react";
import { useBudget } from "../../context/BudgetContext";
import { GOAL_EMOJIS, GOAL_COLORS } from "../../utils/constants";
import { formatMoney } from "../../utils/helpers";
import Modal from "../Common/Modal";
import { FaPlus, FaTrash, FaCheck } from "react-icons/fa";

const GoalsTab = ({ showToast }) => {
  const { state, dispatch } = useBudget();
  const { goals } = state;

  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddAmountModal, setShowAddAmountModal] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState(null);
  const [addAmount, setAddAmount] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    target: "",
    current: "0",
    deadline: "",
    emoji: "🎯",
    color: "#10b981",
  });

  const handleAddGoal = () => {
    if (!formData.name || !formData.target || parseFloat(formData.target) <= 0)
      return;
    dispatch({
      type: "ADD_GOAL",
      payload: {
        name: formData.name,
        target: parseFloat(formData.target),
        current: parseFloat(formData.current) || 0,
        deadline: formData.deadline,
        emoji: formData.emoji,
        color: formData.color,
      },
    });
    setFormData({
      name: "",
      target: "",
      current: "0",
      deadline: "",
      emoji: "🎯",
      color: "#10b981",
    });
    setShowAddModal(false);
    showToast?.("Obiectiv creat!");
  };

  const handleAddToGoal = () => {
    if (!addAmount || parseFloat(addAmount) <= 0) return;
    const goal = goals.find((g) => g.id === selectedGoalId);
    const wasComplete = goal && goal.current >= goal.target;

    dispatch({
      type: "ADD_TO_GOAL",
      payload: { goalId: selectedGoalId, amount: parseFloat(addAmount) },
    });

    if (
      !wasComplete &&
      goal &&
      goal.current + parseFloat(addAmount) >= goal.target
    ) {
      showToast?.("🎉 Obiectiv atins!");
    } else {
      showToast?.(
        `+${parseFloat(addAmount).toLocaleString("ro-RO")} RON adăugat`
      );
    }

    setAddAmount("");
    setShowAddAmountModal(false);
  };

  const handleDeleteGoal = (id) => {
    if (window.confirm("Ștergi acest obiectiv?")) {
      dispatch({ type: "DELETE_GOAL", payload: id });
      showToast?.("Obiectiv șters");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">🎯 Obiective</h2>
          <p className="text-zinc-500">Setează ținte de economisire</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-white font-medium transition-colors flex items-center gap-2"
        >
          <FaPlus /> Obiectiv Nou
        </button>
      </div>

      {goals.length === 0 ? (
        <div className="text-center py-16 bg-zinc-900/50 border border-zinc-800 rounded-xl">
          <div className="text-5xl mb-4">🎯</div>
          <h3 className="text-lg font-medium text-white mb-2">
            Niciun obiectiv
          </h3>
          <p className="text-zinc-500 mb-4">
            Creează primul tău obiectiv de economisire
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-white font-medium transition-colors"
          >
            Creează Obiectiv
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map((goal) => {
            const percent =
              goal.target > 0
                ? Math.min((goal.current / goal.target) * 100, 100)
                : 0;
            const completed = percent >= 100;
            const deadline = goal.deadline ? new Date(goal.deadline) : null;
            const monthsLeft = deadline
              ? Math.max(
                  0,
                  Math.ceil(
                    (deadline - new Date()) / (30 * 24 * 60 * 60 * 1000)
                  )
                )
              : null;
            const monthlyNeed =
              monthsLeft && monthsLeft > 0
                ? Math.ceil((goal.target - goal.current) / monthsLeft)
                : 0;

            return (
              <div
                key={goal.id}
                className={`bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 ${
                  completed ? "ring-2 ring-emerald-500/50" : ""
                }`}
                style={{ "--goal-color": goal.color }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                      style={{ backgroundColor: `${goal.color}20` }}
                    >
                      {goal.emoji}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{goal.name}</h3>
                      <p className="text-xs text-zinc-500">
                        {deadline
                          ? `Până la ${deadline.toLocaleDateString("ro-RO")}`
                          : "Fără deadline"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setSelectedGoalId(goal.id);
                        setShowAddAmountModal(true);
                      }}
                      className="p-2 text-zinc-500 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-colors"
                    >
                      <FaPlus size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <FaTrash size={14} />
                    </button>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all rounded-full"
                      style={{
                        width: `${percent}%`,
                        backgroundColor: goal.color,
                      }}
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-sm">
                    <span className="text-zinc-400">
                      {formatMoney(goal.current, false)}
                    </span>
                    <span className="text-zinc-500">
                      {formatMoney(goal.target, false)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  {completed ? (
                    <div className="flex items-center gap-2 text-emerald-500 text-sm font-medium">
                      <FaCheck /> Obiectiv atins!
                    </div>
                  ) : (
                    <div className="text-xs text-zinc-500">
                      Trebuie{" "}
                      <span className="text-white font-medium">
                        {formatMoney(monthlyNeed, false)}/lună
                      </span>
                    </div>
                  )}
                  <div
                    className="text-lg font-bold"
                    style={{ color: goal.color }}
                  >
                    {Math.round(percent)}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Goal Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="🎯 Obiectiv Nou"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-2">
              Nume obiectiv *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Ex: Vacanță în Grecia"
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-2">
                Sumă țintă (RON) *
              </label>
              <input
                type="number"
                value={formData.target}
                onChange={(e) =>
                  setFormData({ ...formData, target: e.target.value })
                }
                placeholder="10000"
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-2">
                Sumă curentă (RON)
              </label>
              <input
                type="number"
                value={formData.current}
                onChange={(e) =>
                  setFormData({ ...formData, current: e.target.value })
                }
                placeholder="0"
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-2">
              Deadline (opțional)
            </label>
            <input
              type="date"
              value={formData.deadline}
              onChange={(e) =>
                setFormData({ ...formData, deadline: e.target.value })
              }
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-2">Emoji</label>
            <div className="flex flex-wrap gap-2">
              {GOAL_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setFormData({ ...formData, emoji })}
                  className={`w-10 h-10 rounded-lg text-xl transition-all ${
                    formData.emoji === emoji
                      ? "bg-emerald-500/20 ring-2 ring-emerald-500"
                      : "bg-zinc-800 hover:bg-zinc-700"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-2">Culoare</label>
            <div className="flex flex-wrap gap-2">
              {GOAL_COLORS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setFormData({ ...formData, color: c.value })}
                  className={`w-10 h-10 rounded-lg transition-all ${
                    formData.color === c.value
                      ? "ring-2 ring-white ring-offset-2 ring-offset-zinc-900"
                      : ""
                  }`}
                  style={{ backgroundColor: c.value }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-zinc-800">
          <button
            onClick={() => setShowAddModal(false)}
            className="px-6 py-2 text-zinc-400 hover:text-white"
          >
            Anulează
          </button>
          <button
            onClick={handleAddGoal}
            className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-white font-medium"
          >
            Creează
          </button>
        </div>
      </Modal>

      {/* Add Amount Modal */}
      <Modal
        isOpen={showAddAmountModal}
        onClose={() => setShowAddAmountModal(false)}
        title="💵 Adaugă la Obiectiv"
        size="sm"
      >
        <div>
          <label className="block text-sm text-zinc-400 mb-2">
            Sumă de adăugat (RON)
          </label>
          <input
            type="number"
            value={addAmount}
            onChange={(e) => setAddAmount(e.target.value)}
            placeholder="Ex: 500"
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-zinc-800">
          <button
            onClick={() => setShowAddAmountModal(false)}
            className="px-6 py-2 text-zinc-400 hover:text-white"
          >
            Anulează
          </button>
          <button
            onClick={handleAddToGoal}
            className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-white font-medium"
          >
            Adaugă
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default GoalsTab;
