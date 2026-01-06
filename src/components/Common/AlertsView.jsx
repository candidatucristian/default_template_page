import React from "react";
import { useBudget } from "../../context/BudgetContext";
import {
  FaTimes,
  FaBell,
  FaCheck,
  FaExclamationTriangle,
  FaExclamationCircle,
} from "react-icons/fa";

const AlertsView = ({ onClose }) => {
  const { state, dispatch } = useBudget();
  const { alerts } = state;

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl animate-fade-in flex flex-col items-center justify-center p-6">
      <button
        onClick={onClose}
        className="absolute top-8 right-8 text-zinc-500 hover:text-white border border-zinc-800 p-3 rounded-full transition-colors"
      >
        <FaTimes size={20} />
      </button>

      <div className="max-w-2xl w-full">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-800 relative">
            <FaBell className="text-3xl text-white" />
            {alerts.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-4 border-black">
                {alerts.length}
              </span>
            )}
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Centrul de Notificări
          </h2>
          <p className="text-zinc-500">
            {alerts.length === 0
              ? "Totul este liniștit. Nicio alertă."
              : `Ai ${alerts.length} alerte care necesită atenția ta.`}
          </p>
        </div>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar p-2">
          {alerts.length === 0 && (
            <div className="text-center py-10 opacity-30">
              <FaCheck className="text-6xl mx-auto mb-4 text-emerald-500" />
              <p>Ești safe.</p>
            </div>
          )}

          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-5 rounded-2xl border flex items-start gap-4 transition-all  ${
                alert.type === "danger"
                  ? "bg-red-500/10 border-red-500/30"
                  : "bg-amber-500/10 border-amber-500/30"
              }`}
            >
              <div
                className={`mt-1 text-xl ${
                  alert.type === "danger" ? "text-red-500" : "text-amber-500"
                }`}
              >
                {alert.type === "danger" ? (
                  <FaExclamationCircle />
                ) : (
                  <FaExclamationTriangle />
                )}
              </div>
              <div className="flex-1">
                <h4
                  className={`font-bold ${
                    alert.type === "danger" ? "text-red-200" : "text-amber-200"
                  }`}
                >
                  {alert.title}
                </h4>
                <p className="text-sm text-zinc-400 mt-1">{alert.message}</p>
              </div>
              <button
                onClick={() =>
                  dispatch({ type: "DISMISS_ALERT", payload: alert.id })
                }
                className="px-3 py-1.5 bg-zinc-900/50 hover:bg-white/10 rounded-lg text-xs text-zinc-400 hover:text-white transition-colors border border-transparent hover:border-white/20"
              >
                Am înțeles
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AlertsView;
