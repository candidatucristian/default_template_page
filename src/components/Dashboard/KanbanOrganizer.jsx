import React from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useBudget } from "../../context/BudgetContext";
import { CATEGORY_INFO } from "../../utils/constants";
import { FaGripVertical } from "react-icons/fa";

const KanbanOrganizer = ({ monthId }) => {
  const { state, dispatch } = useBudget();
  const month = state.months.find((m) => m.id === monthId);

  if (!month) return null;

  // Grupăm cheltuielile pe categorii
  const categories = Object.keys(CATEGORY_INFO).filter((k) => k !== "_total");

  const expensesByCategory = categories.reduce((acc, cat) => {
    acc[cat] = month.expenses
      .map((exp, index) => ({ ...exp, originalIndex: index })) // Păstrăm indexul original
      .filter(
        (exp) => exp.category === cat || (!exp.category && cat === "other")
      );
    return acc;
  }, {});

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;

    if (source.droppableId !== destination.droppableId) {
      // Logica de schimbare categorie
      // Aici e un pic tricky pentru că array-ul de expenses e plat în state,
      // dar vizual e grupat.
      // Simplificăm: Găsim cheltuiala și îi actualizăm categoria.

      // În viața reală, parsezi draggableId care ar trebui să conțină indexul original
      const expenseIndex = parseInt(draggableId.split("-")[1]);
      const newCategory = destination.droppableId;

      const expense = month.expenses[expenseIndex];
      const updatedExpense = { ...expense, category: newCategory };

      dispatch({
        type: "UPDATE_EXPENSE",
        payload: { monthId, expenseIndex, expense: updatedExpense },
      });
    }
  };

  return (
    <div className="overflow-x-auto pb-4">
      <h3 className="text-white font-bold mb-4 px-1">
        Organizator Vizual (Drag & Drop)
      </h3>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 min-w-max">
          {categories.map((catKey) => (
            <Droppable key={catKey} droppableId={catKey}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`w-64 bg-zinc-900/50 border ${
                    snapshot.isDraggingOver
                      ? "border-emerald-500"
                      : "border-zinc-800"
                  } rounded-xl p-3 flex flex-col`}
                >
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-zinc-800">
                    <span className="text-xl">
                      {CATEGORY_INFO[catKey].emoji}
                    </span>
                    <span className="font-medium text-white">
                      {CATEGORY_INFO[catKey].name}
                    </span>
                    <span className="ml-auto text-xs text-zinc-500">
                      {expensesByCategory[catKey].length}
                    </span>
                  </div>

                  <div className="flex-1 space-y-2 min-h-[100px]">
                    {expensesByCategory[catKey].map((exp, index) => (
                      <Draggable
                        key={`${exp.originalIndex}`}
                        draggableId={`exp-${exp.originalIndex}`}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`p-3 bg-zinc-800 rounded-lg border border-zinc-700 shadow-sm flex justify-between items-center group
                                ${
                                  snapshot.isDragging
                                    ? "rotate-3 scale-105 border-emerald-500 z-50"
                                    : ""
                                }
                            `}
                          >
                            <div>
                              <div className="text-sm text-white font-medium truncate w-32">
                                {exp.desc}
                              </div>
                              <div className="text-xs text-zinc-500">
                                {exp.val} RON
                              </div>
                            </div>
                            <FaGripVertical className="text-zinc-600 opacity-0 group-hover:opacity-100" />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default KanbanOrganizer;
