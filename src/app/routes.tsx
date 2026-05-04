import { createBrowserRouter } from "react-router";
import { RequireAuth } from "./auth";
import { RootLayout } from "./components/RootLayout";
import { Dashboard } from "./pages/Dashboard";
import { AccountManagement } from "./pages/AccountManagement";
import { AccountDetail } from "./pages/AccountDetail";
import { DemandLetterGenerator } from "./pages/DemandLetterGenerator";
import { CalendarView } from "./pages/CalendarView";
import { Login } from "./pages/Login";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    Component: RequireAuth,
    children: [
      {
        path: "/",
        Component: RootLayout,
        children: [
          { index: true, Component: Dashboard },
          { path: "accounts", Component: AccountManagement },
          { path: "accounts/:id", Component: AccountDetail },
          { path: "demand-letter", Component: DemandLetterGenerator },
          { path: "calendar", Component: CalendarView },
          { path: "reports", Component: Dashboard },
        ],
      },
    ],
  },
]);
