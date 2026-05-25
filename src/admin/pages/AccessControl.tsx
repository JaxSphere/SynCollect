import { ShieldAlert, Check, X } from "lucide-react";

type Permission = {
  feature: string;
  admin: boolean;
  manager: boolean;
  fieldOfficer: boolean;
};

const PERMISSIONS: Permission[] = [
  { feature: "Create / Edit / Delete Users",        admin: true,  manager: false, fieldOfficer: false },
  { feature: "View All Users",                      admin: true,  manager: true,  fieldOfficer: false },
  { feature: "Create / Edit / Delete Accounts",     admin: true,  manager: true,  fieldOfficer: false },
  { feature: "View All Accounts",                   admin: true,  manager: true,  fieldOfficer: false },
  { feature: "View Assigned Accounts Only",         admin: false, manager: false, fieldOfficer: true  },
  { feature: "Log Visits & Upload Photos",          admin: false, manager: false, fieldOfficer: true  },
  { feature: "Submit PTP / Promise to Pay",         admin: false, manager: false, fieldOfficer: true  },
  { feature: "View Dashboard & KPIs",               admin: true,  manager: true,  fieldOfficer: false },
  { feature: "Generate Demand Letters",             admin: true,  manager: true,  fieldOfficer: false },
  { feature: "View Calendar & PTP Schedule",        admin: true,  manager: true,  fieldOfficer: false },
  { feature: "View Audit Logs",                     admin: true,  manager: false, fieldOfficer: false },
  { feature: "Manage Access Control Settings",      admin: true,  manager: false, fieldOfficer: false },
  { feature: "Assign Officers to Accounts",         admin: true,  manager: true,  fieldOfficer: false },
];

const ROLES = [
  { key: "admin",        label: "Admin",         color: "text-purple-700 bg-purple-50 border-purple-200" },
  { key: "manager",      label: "Manager",       color: "text-blue-700 bg-blue-50 border-blue-200" },
  { key: "fieldOfficer", label: "Field Officer", color: "text-green-700 bg-green-50 border-green-200" },
] as const;

export function AdminAccessControl() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-blue-600" />
          Access Control
        </h2>
        <p className="text-gray-500 mt-1 text-sm">
          Role-based permission matrix — enforced server-side on every request. These boundaries cannot be overridden from the UI.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {ROLES.map((role) => (
          <div key={role.key} className={`rounded-lg border p-4 ${role.color}`}>
            <p className="font-semibold text-sm">{role.label}</p>
            <p className="text-xs mt-1 opacity-70">
              {role.key === "admin" && "Full system access. Manages users and audit logs."}
              {role.key === "manager" && "Manages accounts and views performance data."}
              {role.key === "fieldOfficer" && "Logs visits for assigned accounts only."}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/2">Feature / Permission</th>
                {ROLES.map((r) => (
                  <th key={r.key} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{r.label}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {PERMISSIONS.map((perm) => (
                <tr key={perm.feature} className="hover:bg-gray-50">
                  <td className="px-6 py-3 font-medium text-gray-800">{perm.feature}</td>
                  {(["admin", "manager", "fieldOfficer"] as const).map((role) => (
                    <td key={role} className="px-6 py-3 text-center">
                      {perm[role] ? (
                        <Check className="w-5 h-5 text-green-600 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-red-400 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <strong>Note:</strong> All permissions are enforced server-side via middleware on every API request. The UI reflects these rules but cannot bypass them.
      </div>
    </div>
  );
}
