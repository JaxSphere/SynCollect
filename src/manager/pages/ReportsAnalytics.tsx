import { TrendingUp, Users, Target, Award } from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type CollectionRatePoint = {
  month: string;
  rate: number;
};

const collectionRateData: CollectionRatePoint[] = [];

type PtpSuccessPoint = {
  month: string;
  honored: number;
  broken: number;
};

const ptpSuccessData: PtpSuccessPoint[] = [];

type OfficerPerformance = {
  officer: string;
  collections: number;
  accounts: number;
  rate: number;
};

const officerPerformanceData: OfficerPerformance[] = [];

type AccountStatusPoint = {
  name: string;
  value: number;
  color: string;
};

const accountStatusData: AccountStatusPoint[] = [];

export function ReportsAnalytics() {
  const totalCollections = officerPerformanceData.reduce((sum, o) => sum + o.collections, 0);
  const avgSuccessRate = officerPerformanceData.length
    ? (officerPerformanceData.reduce((sum, o) => sum + o.rate, 0) / officerPerformanceData.length).toFixed(1)
    : "0.0";

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Reports & Analytics</h2>
        <p className="text-gray-500 mt-1">Comprehensive performance insights and metrics</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <span className="text-sm font-medium text-green-600">+8.5%</span>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-bold text-gray-900">₱{(totalCollections / 1000).toFixed(0)}K</p>
            <p className="text-sm text-gray-500 mt-1">Total Collections</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
              <Target className="w-6 h-6" />
            </div>
            <span className="text-sm font-medium text-green-600">+3.2%</span>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-bold text-gray-900">68.5%</p>
            <p className="text-sm text-gray-500 mt-1">Collection Rate</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <span className="text-sm font-medium text-green-600">+5.1%</span>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-bold text-gray-900">78.5%</p>
            <p className="text-sm text-gray-500 mt-1">PTP Success Rate</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-sm font-medium text-gray-600">{avgSuccessRate}% Avg</span>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-bold text-gray-900">{officerPerformanceData.length}</p>
            <p className="text-sm text-gray-500 mt-1">Active Officers</p>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Collection Rate Trend */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Collection Rate Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={collectionRateData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" domain={[0, 100]} />
              <Tooltip
                contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" }}
                formatter={(value) => `${value}%`}
              />
              <Line type="monotone" dataKey="rate" stroke="#10b981" strokeWidth={3} dot={{ fill: "#10b981", r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Account Status Distribution */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Status Distribution</h3>
          <div className="flex items-center justify-between">
            <ResponsiveContainer width="60%" height={300}>
              <PieChart>
                <Pie
                  data={accountStatusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {accountStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-3">
              {accountStatusData.map((item) => (
                <div key={item.name} className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: item.color }} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.value} accounts</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* PTP Success Ratio */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Promise-to-Pay Success Ratio</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={ptpSuccessData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip
              contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" }}
            />
            <Legend />
            <Bar dataKey="honored" fill="#10b981" name="Honored" radius={[4, 4, 0, 0]} />
            <Bar dataKey="broken" fill="#ef4444" name="Broken" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Officer Performance Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Performance Per Officer</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Officer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Collections
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Accounts Managed
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Success Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Per Account
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {officerPerformanceData
                .sort((a, b) => b.rate - a.rate)
                .map((officer, index) => (
                  <tr key={officer.officer} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          index === 0
                            ? "bg-yellow-100 text-yellow-800"
                            : index === 1
                            ? "bg-gray-200 text-gray-700"
                            : index === 2
                            ? "bg-orange-100 text-orange-800"
                            : "bg-gray-50 text-gray-600"
                        }`}
                      >
                        {index + 1}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
                          {officer.officer.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <span className="ml-3 text-sm font-medium text-gray-900">{officer.officer}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      ₱{officer.collections.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{officer.accounts}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">{officer.rate}%</span>
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${officer.rate}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₱{Math.round(officer.collections / officer.accounts).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              {officerPerformanceData.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-500">
                    No officer performance data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
