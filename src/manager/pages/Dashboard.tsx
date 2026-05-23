import { TrendingUp, Users, Calendar, Percent, MapPin, Phone, Mail } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type KpiCard = {
  label: string;
  value: string;
  change: string;
  icon: typeof Users;
  color: "blue" | "green" | "purple" | "orange";
};

const kpiData: KpiCard[] = [];

type CollectionPoint = {
  month: string;
  amount: number;
};

const collectionData: CollectionPoint[] = [];

type FieldOfficer = {
  id: number;
  name: string;
  lat: number;
  lng: number;
  accounts: number;
  collections: string;
  rate: string;
  status: "active" | "on-break";
};

const fieldOfficers: FieldOfficer[] = [];

export function Dashboard() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Dashboard Overview</h2>
        <p className="text-gray-500 mt-1">Real-time collection metrics and field operations</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((kpi) => {
          const Icon = kpi.icon;
          const colorClasses = {
            blue: "bg-blue-50 text-blue-600",
            green: "bg-green-50 text-green-600",
            purple: "bg-purple-50 text-purple-600",
            orange: "bg-orange-50 text-orange-600",
          };

          return (
            <div key={kpi.label} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className={`w-12 h-12 rounded-lg ${colorClasses[kpi.color]} flex items-center justify-center`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-sm font-medium text-green-600">{kpi.change}</span>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
                <p className="text-sm text-gray-500 mt-1">{kpi.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Collection Trend Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Collections Over Time</h3>
              <p className="text-sm text-gray-500">Monthly collection performance</p>
            </div>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={collectionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" }}
                formatter={(value) => `PHP ${value.toLocaleString()}`}
              />
              <Line type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={3} dot={{ fill: "#3b82f6", r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Field Officer Map */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Field Officer Locations</h3>
              <p className="text-sm text-gray-500">Real-time officer tracking</p>
            </div>
            <MapPin className="w-5 h-5 text-blue-600" />
          </div>
          <div className="relative h-[300px] bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg overflow-hidden">
            {/* Simplified map visualization */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-full h-full">
                {fieldOfficers.map((officer, index) => (
                  <div
                    key={officer.id}
                    className="absolute"
                    style={{
                      left: `${20 + index * 15}%`,
                      top: `${30 + (index % 2) * 30}%`,
                    }}
                  >
                    <div className="relative group">
                      <div className={`w-4 h-4 rounded-full ${officer.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'} border-2 border-white shadow-lg animate-pulse`} />
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block">
                        <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap">
                          <p className="font-medium">{officer.name}</p>
                          <p className="text-gray-300">{officer.accounts} accounts</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {fieldOfficers.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-sm text-gray-500">No officer location data available.</p>
              </div>
            )}
            <div className="absolute bottom-4 left-4 bg-white rounded-lg px-3 py-2 text-xs shadow-md">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-gray-600">Active ({fieldOfficers.filter(o => o.status === 'active').length})</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-yellow-500" />
                  <span className="text-gray-600">Break ({fieldOfficers.filter(o => o.status === 'on-break').length})</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Field Officer Performance Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Field Officer Performance</h3>
          <p className="text-sm text-gray-500 mt-1">Current month performance metrics</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Officer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Accounts</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Collections</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Success Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {fieldOfficers.map((officer) => (
                <tr key={officer.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
                        {officer.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{officer.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      officer.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {officer.status === 'active' ? 'Active' : 'On Break'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{officer.accounts}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{officer.collections}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-900">{officer.rate}</span>
                      <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: officer.rate }} />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <Phone className="w-4 h-4 text-gray-600" />
                      </button>
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <Mail className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {fieldOfficers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-500">
                    No officer performance records available.
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
