import { useEffect, useState } from "react";
import { TrendingUp, Users, MapPin, Percent, Phone, Mail, AlertCircle } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { fetchDashboard, type DashboardStats } from "../../shared/api/dashboard";

function formatPHP(amount: number) {
  if (amount >= 1_000_000)
    return `₱${(amount / 1_000_000).toFixed(2)}M`;
  if (amount >= 1_000)
    return `₱${(amount / 1_000).toFixed(1)}K`;
  return `₱${amount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const GRADIENT_COLORS = [
  "from-blue-400 to-blue-600",
  "from-purple-400 to-purple-600",
  "from-green-400 to-green-600",
  "from-orange-400 to-orange-600",
  "from-pink-400 to-pink-600",
  "from-teal-400 to-teal-600",
];

function officerGradient(index: number) {
  return GRADIENT_COLORS[index % GRADIENT_COLORS.length];
}

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchDashboard()
      .then(setStats)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load dashboard.")
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Dashboard Overview</h2>
          <p className="text-gray-500 mt-1">Real-time collection metrics and field operations</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
              <div className="h-12 w-12 bg-gray-200 rounded-lg mb-4" />
              <div className="h-7 w-24 bg-gray-200 rounded mb-2" />
              <div className="h-4 w-32 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-4 text-red-700">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm">{error ?? "Unable to load dashboard data."}</p>
        </div>
      </div>
    );
  }

  const kpiCards = [
    {
      label: "Total Accounts",
      value: stats.totalAccounts.toLocaleString(),
      sub: `${stats.ptpAccounts} on PTP`,
      icon: Users,
      bg: "bg-blue-50",
      text: "text-blue-600",
    },
    {
      label: "Total Outstanding Balance",
      value: formatPHP(stats.totalBalance),
      sub: `Across ${stats.totalAccounts} accounts`,
      icon: TrendingUp,
      bg: "bg-orange-50",
      text: "text-orange-600",
    },
    {
      label: "PTP Rate",
      value: `${stats.collectionRate}%`,
      sub: `${stats.ptpAccounts} of ${stats.totalAccounts} accounts`,
      icon: Percent,
      bg: "bg-green-50",
      text: "text-green-600",
    },
    {
      label: "Field Officers",
      value: stats.totalOfficers.toLocaleString(),
      sub: `${stats.officerPerformance.filter((o) => o.assignedAccounts > 0).length} with assigned accounts`,
      icon: Users,
      bg: "bg-purple-50",
      text: "text-purple-600",
    },
  ];

  const hasChartData = stats.monthlyCollections.some((m) => m.amount > 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Dashboard Overview</h2>
        <p className="text-gray-500 mt-1">Real-time collection metrics and field operations</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className={`w-12 h-12 rounded-lg ${kpi.bg} flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${kpi.text}`} />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
                <p className="text-sm text-gray-500 mt-1">{kpi.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{kpi.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Account Status Summary */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Account Status Breakdown</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {(
            [
              { key: "active",    label: "Active",    color: "bg-blue-100 text-blue-800" },
              { key: "ptp",       label: "PTP",       color: "bg-green-100 text-green-800" },
              { key: "pending",   label: "Pending",   color: "bg-yellow-100 text-yellow-800" },
              { key: "visited",   label: "Visited",   color: "bg-purple-100 text-purple-800" },
              { key: "unlocated", label: "Unlocated", color: "bg-orange-100 text-orange-800" },
              { key: "refused",   label: "Refused",   color: "bg-red-100 text-red-800" },
              { key: "closed",    label: "Closed",    color: "bg-gray-100 text-gray-700" },
              { key: "legal",     label: "Legal",     color: "bg-red-200 text-red-900" },
            ] as const
          ).map(({ key, label, color }) => (
            <div key={key} className="text-center rounded-lg border border-gray-100 p-3">
              <p className="text-xl font-bold text-gray-900">
                {(stats.statusMap[key] ?? 0).toLocaleString()}
              </p>
              <span className={`mt-1 inline-block text-xs font-medium px-2 py-0.5 rounded-full ${color}`}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Collection Trend Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">PTP Collections Over Time</h3>
              <p className="text-sm text-gray-500">Monthly PTP amount collected (last 6 months)</p>
            </div>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          {hasChartData ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={stats.monthlyCollections}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#9ca3af" tick={{ fontSize: 12 }} />
                <YAxis
                  stroke="#9ca3af"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(v) => formatPHP(v)}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: 13,
                  }}
                  formatter={(value: number) => [
                    `₱${value.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`,
                    "PTP Amount",
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: "#3b82f6", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-gray-400 text-sm">
              No PTP collection data for the last 6 months.
            </div>
          )}
        </div>

        {/* Field Officer Locations — left as-is (not yet implementable) */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Field Officer Locations</h3>
              <p className="text-sm text-gray-500">Real-time officer tracking</p>
            </div>
            <MapPin className="w-5 h-5 text-blue-600" />
          </div>
          <div className="relative h-[280px] bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg overflow-hidden flex items-center justify-center">
            <p className="text-sm text-gray-500">No officer location data available.</p>
          </div>
        </div>
      </div>

      {/* Field Officer Performance Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Field Officer Performance</h3>
          <p className="text-sm text-gray-500 mt-1">All-time performance metrics per officer</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Officer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned Accounts
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Visits
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PTP Collections
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PTP Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Success Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats.officerPerformance.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-500">
                    No field officers found. Add field officers in User Management.
                  </td>
                </tr>
              ) : (
                stats.officerPerformance.map((officer, index) => (
                  <tr key={officer.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full bg-gradient-to-br ${officerGradient(index)} flex items-center justify-center text-white font-semibold text-sm`}
                        >
                          {getInitials(officer.name)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{officer.name}</p>
                          <p className="text-xs text-gray-400">@{officer.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {officer.assignedAccounts.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {officer.totalVisits.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {officer.ptpCount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {formatPHP(officer.totalPtpAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-900 w-9 text-right">
                          {officer.successRate}%
                        </span>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${officer.successRate}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <button
                          className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                          title="Call officer"
                        >
                          <Phone className="w-4 h-4 text-gray-500" />
                        </button>
                        <button
                          className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                          title="Email officer"
                        >
                          <Mail className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
