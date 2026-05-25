import { Link, createBrowserRouter, useRouteError } from "react-router";
import { Login } from "./auth/Login";
import { RequireAdmin, RequireFieldOfficer, RequireManager } from "./auth/auth";
import { RootLayout } from "./manager/components/RootLayout";
import { AdminLayout } from "./admin/components/AdminLayout";
import { Dashboard } from "./manager/pages/Dashboard";
import { AccountManagement } from "./manager/pages/AccountManagement";
import { AdminUserManagement } from "./admin/pages/UserManagement";
import { AdminAuditLog } from "./admin/pages/AuditLog";
import { AdminAccessControl } from "./admin/pages/AccessControl";
import { AccountDetail } from "./manager/pages/AccountDetail";
import { DemandLetterGenerator } from "./manager/pages/DemandLetterGenerator";
import { CalendarView } from "./manager/pages/CalendarView";
import { HomeScreen } from "./fieldOfficer/components/HomeScreen";
import { ScheduleScreen } from "./fieldOfficer/components/ScheduleScreen";
import { SettingsScreen } from "./fieldOfficer/components/SettingScreen";
import { AccountDetailScreen } from "./fieldOfficer/components/AccountDetailScreen";
import { VisitScreen } from "./fieldOfficer/components/VisitScreen";
import { PTPEntryScreen } from "./fieldOfficer/components/PTPEntryScreen";
import { SuccessScreen } from "./fieldOfficer/components/SuccessScreen";

function RouteError() {
  const error = useRouteError() as { message?: string } | null;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-semibold mb-4">Something went wrong</h1>
      <p className="mb-6">{error?.message ?? "An unexpected error occurred."}</p>
      <Link to="/" className="text-blue-600 underline">
        Go back home
      </Link>
    </div>
  );
}

function FieldOfficerAccountInfo() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-slate-950 text-white">
      <div className="max-w-xl w-full rounded-3xl p-10 shadow-2xl bg-slate-900/90 border border-white/10">
        <h1 className="text-2xl font-semibold mb-4">Account Information</h1>
        <p className="text-slate-300">Account information is coming soon. This screen is a placeholder while the feature is being built.</p>
      </div>
    </div>
  );
}

function FieldOfficerChangePassword() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-slate-950 text-white">
      <div className="max-w-xl w-full rounded-3xl p-10 shadow-2xl bg-slate-900/90 border border-white/10">
        <h1 className="text-2xl font-semibold mb-4">Change Password</h1>
        <p className="text-slate-300">Password change support is coming soon. Use this screen to add the form later.</p>
      </div>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
    errorElement: <RouteError />,
  },
  {
    Component: RequireManager,
    errorElement: <RouteError />,
    children: [
      {
        path: "/",
        Component: RootLayout,
        errorElement: <RouteError />,
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
    errorElement: <RouteError />,
    children: [
      {
        path: "/admin",
        Component: AdminLayout,
        errorElement: <RouteError />,
        children: [
          { index: true, Component: AdminUserManagement },
          { path: "audit-logs", Component: AdminAuditLog },
          { path: "access-control", Component: AdminAccessControl },
        ],
      },
    ],
  },
  {
    Component: RequireFieldOfficer,
    errorElement: <RouteError />,
    children: [
      { path: "/fo", Component: HomeScreen },
      { path: "/fo/schedule", Component: ScheduleScreen },
      { path: "/fo/settings", Component: SettingsScreen },
      { path: "/fo/account-info", Component: FieldOfficerAccountInfo },
      { path: "/fo/change-password", Component: FieldOfficerChangePassword },
      { path: "/fo/account/:accountId", Component: AccountDetailScreen },
      { path: "/fo/visit/:accountId", Component: VisitScreen },
      { path: "/fo/ptp/:accountId", Component: PTPEntryScreen },
      { path: "/fo/success", Component: SuccessScreen },
    ],
  },
]);
