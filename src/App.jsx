import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { BudgetProvider } from "./context/BudgetContext";
import BudgetApp from "./pages/BudgetApp";

const router = createBrowserRouter([
  {
    path: "/",
    element: <BudgetApp />,
    errorElement: (
      <div className="h-screen flex items-center justify-center text-center bg-zinc-950">
        <div>
          <h1 className="text-3xl font-bold text-red-500 mb-4">
            Oops! Page not found.
          </h1>
          <a href="/" className="text-emerald-500 hover:underline">
            Înapoi la Dashboard
          </a>
        </div>
      </div>
    ),
  },
]);

const App = () => {
  return (
    <BudgetProvider>
      <RouterProvider router={router} />
    </BudgetProvider>
  );
};

export default App;
