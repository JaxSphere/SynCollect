import { createBrowserRouter } from "react-router";
import { Login } from "./auth/Login";
import { RequireAdmin, RequireFieldOfficer, RequireManager } from "./auth/auth";
import { RootLayout } from "./manager/components/RootLayout";
import { AdminLayout } from "./admin/components/AdminLayout";
import { Dashboard } from "./manager/pages/Dashboard";
import { AccountManagement } from "./manager/pages/AccountManagement";
import { AdminUserManagement } from "./admin/pages/UserManagement";
import { AccountDetail } from "./manager/pages/AccountDetail";
import { DemandLetterGenerator } from "./manager/pages/DemandLetterGenerator";
import { CalendarView } from "./manager/pages/CalendarView";
import { HomeScreen } from "./fieldOfficer/components/HomeScreen";
import { AccountDetailScreen } from "./fieldOfficer/components/AccountDetailScreen";
import { VisitScreen } from "./fieldOfficer/components/VisitScreen";
import { PTPEntryScreen } from "./fieldOfficer/components/PTPEntryScreen";
import { SuccessScreen } from "./fieldOfficer/components/SuccessScreen";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    Component: RequireManager,
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
  {
    Component: RequireAdmin,
    children: [
      {
        path: "/admin",
        Component: AdminLayout,
        children: [{ index: true, Component: AdminUserManagement }],
      },
    ],
  },
  {
    Component: RequireFieldOfficer,
    children: [
      { path: "/fo", Component: HomeScreen },
      { path: "/fo/account/:accountId", Component: AccountDetailScreen },
      { path: "/fo/visit/:accountId", Component: VisitScreen },
      { path: "/fo/ptp/:accountId", Component: PTPEntryScreen },
      { path: "/fo/success", Component: SuccessScreen },
    ],
  },
]);
