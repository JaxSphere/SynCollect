import { useParams, Link } from "react-router";
import { ArrowLeft, Phone, Mail, MapPin, DollarSign, User, FileText, Calendar, ImageIcon, Clock } from "lucide-react";

const accountDetails = {
  ACC001: {
    debtorName: " ",
    accountNumber: " ",
    phone: " ",
    email: " ",
    address: " ",
    originalBalance: "",
    currentBalance: " ",
    penalties: " ",
    interestRate: " ",
    status: " ",
    assignedOfficer: " ",
    accountOpened: " ",
    lastPayment: " ",
    visits: [
      { date: "2026-04-28", time: "10:30 AM", officer: "Sarah Johnson", result: "Not home", notes: "Neighbor stated debtor works late shifts", hasImage: true },
      { date: "2026-04-25", time: "2:15 PM", officer: "Sarah Johnson", result: "Contact made", notes: "Discussed payment plan, debtor requested 2 weeks to arrange funds", hasImage: false },
      { date: "2026-04-20", time: "4:45 PM", officer: "Sarah Johnson", result: "Partial payment", notes: "Received PHP 200 cash payment, receipt provided", hasImage: true },
    ],
    ptpRecords: [
      { date: "2026-05-05", amount: "PHP 1,000", status: "pending", notes: "Debtor committed to payment after receiving paycheck" },
      { date: "2026-04-15", amount: "PHP 500", status: "honored", notes: "Payment received on time via bank transfer" },
      { date: "2026-03-20", amount: "PHP 300", status: "broken", notes: "No payment received, debtor did not respond to calls" },
    ],
  },
};

export function AccountDetail() {
  const { id } = useParams();
  const account = accountDetails[id || "ACC001"];

  if (!account) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Account not found.</p>
      </div>
    );
  }

  const ptpStatusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    honored: "bg-green-100 text-green-800",
    broken: "bg-red-100 text-red-800",
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/accounts" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div className="flex-1">
          <h2 className="text-3xl font-bold text-gray-900">{account.debtorName}</h2>
          <p className="text-gray-500 mt-1">Account #{account.accountNumber}</p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/demand-letter"
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FileText className="w-4 h-4 inline mr-2" />
            Generate Letter
          </Link>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Assign Officer
          </button>
        </div>
      </div>

      {/* Debtor Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Debtor Information</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="text-sm font-medium text-gray-900">{account.debtorName}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="text-sm font-medium text-gray-900">{account.phone}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-sm font-medium text-gray-900">{account.email}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Address</p>
                <p className="text-sm font-medium text-gray-900">{account.address}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Details</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Current Balance</p>
              <p className="text-2xl font-bold text-red-600">{account.currentBalance}</p>
            </div>
            <div className="pt-4 border-t border-gray-200 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Original Balance</span>
                <span className="text-sm font-medium text-gray-900">{account.originalBalance}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Penalties</span>
                <span className="text-sm font-medium text-gray-900">{account.penalties}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Interest Rate</span>
                <span className="text-sm font-medium text-gray-900">{account.interestRate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Last Payment</span>
                <span className="text-sm font-medium text-gray-900">{account.lastPayment}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Status</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-2">Status</p>
              <span className="px-3 py-1 inline-flex text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
                {account.status.toUpperCase()}
              </span>
            </div>
            <div className="pt-4 border-t border-gray-200 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Assigned Officer</span>
                <span className="text-sm font-medium text-gray-900">{account.assignedOfficer}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Account Opened</span>
                <span className="text-sm font-medium text-gray-900">{account.accountOpened}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Visit History */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Visit History Timeline</h3>
        <div className="space-y-4">
          {account.visits.map((visit, index) => (
            <div key={index} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-blue-600" />
                {index !== account.visits.length - 1 && (
                  <div className="w-0.5 h-full bg-gray-200 mt-2" />
                )}
              </div>
              <div className="flex-1 pb-8">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-gray-900">{visit.result}</p>
                      <p className="text-sm text-gray-500">
                        {visit.date} at {visit.time}
                      </p>
                    </div>
                    {visit.hasImage && (
                      <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        <ImageIcon className="w-3 h-3" />
                        Photo
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{visit.notes}</p>
                  <p className="text-xs text-gray-500">Officer: {visit.officer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PTP Records */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Promise-to-Pay Records</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {account.ptpRecords.map((ptp, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ptp.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    {ptp.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        ptpStatusColors[ptp.status]
                      }`}
                    >
                      {ptp.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{ptp.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
