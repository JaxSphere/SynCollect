import { useParams, useNavigate } from "react-router";
import { ArrowLeft, Phone, MapPin, DollarSign, Calendar, FileText, UserPlus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchAccount, updateAccount } from "../../shared/api/accounts";
import { fetchUsers } from "../../shared/api/users";
import type { ApiAccount } from "../../shared/api/types";
import type { ApiUser } from "../../shared/api/types";

const statusColors: Record<string, string> = {
  active: "bg-blue-100 text-blue-800",
  ptp: "bg-green-100 text-green-800",
  closed: "bg-gray-100 text-gray-800",
  legal: "bg-red-100 text-red-800",
  pending: "bg-yellow-100 text-yellow-800",
  visited: "bg-purple-100 text-purple-800",
  unlocated: "bg-orange-100 text-orange-800",
  refused: "bg-red-100 text-red-800",
};

export function AccountDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [account, setAccount] = useState<ApiAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Assign Officer modal state
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [officers, setOfficers] = useState<ApiUser[]>([]);
  const [officersLoading, setOfficersLoading] = useState(false);
  const [selectedOfficerId, setSelectedOfficerId] = useState<string>("");
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);
  const [assignSuccess, setAssignSuccess] = useState(false);

  useEffect(() => {
    if (!id) {
      setError("Account ID not found");
      setLoading(false);
      return;
    }

    fetchAccount(id)
      .then((data) => {
        setAccount(data);
        setSelectedOfficerId(data.assignedOfficerId ?? "");
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load account");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const openAssignModal = async () => {
    setAssignError(null);
    setAssignSuccess(false);
    setShowAssignModal(true);
    setOfficersLoading(true);
    try {
      const users = await fetchUsers();
      setOfficers(users.filter((u) => u.role === "fieldOfficer"));
    } catch (err) {
      setAssignError(err instanceof Error ? err.message : "Failed to load officers.");
    } finally {
      setOfficersLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!id) return;
    setAssigning(true);
    setAssignError(null);
    try {
      const updated = await updateAccount(id, {
        assignedOfficerId: selectedOfficerId || undefined,
      });
      setAccount(updated);
      setAssignSuccess(true);
      setTimeout(() => {
        setShowAssignModal(false);
        setAssignSuccess(false);
      }, 1200);
    } catch (err) {
      setAssignError(err instanceof Error ? err.message : "Failed to assign officer.");
    } finally {
      setAssigning(false);
    }
  };

  const assignedOfficerName =
    account?.assignedOfficerName ||
    officers.find((o) => o.id === account?.assignedOfficerId)?.fullName ||
    officers.find((o) => o.id === account?.assignedOfficerId)?.username ||
    null;

  if (loading) {
    return <div className="p-6 text-gray-600">Loading account details...</div>;
  }

  if (error || !account) {
    return (
      <div className="p-6">
        <p className="text-red-600">{error || "Account not found."}</p>
        <button
          onClick={() => navigate("/accounts")}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back to Accounts
        </button>
      </div>
    );
  }

  const ptpRecords = account.history.filter((h) => h.action.includes("PTP"));

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/accounts")}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1">
          <h2 className="text-3xl font-bold text-gray-900">{account.debtorName}</h2>
          <p className="text-gray-500 mt-1">Account #{account.accountNumber ?? account.id}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={openAssignModal}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Assign Officer
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <FileText className="w-4 h-4 inline mr-2" />
            Generate Letter
          </button>
        </div>
      </div>

      {/* Account Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="text-sm font-medium text-gray-900">{account.debtorPhone || "—"}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Address</p>
                <p className="text-sm font-medium text-gray-900">{account.debtorAddress || "—"}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Details</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Current Balance</p>
              <p className="text-2xl font-bold text-red-600">
                ₱{Number(account.balance).toLocaleString("en-PH", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
            <div className="pt-4 border-t border-gray-200 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Last Payment</span>
                <span className="text-sm font-medium text-gray-900">
                  {account.lastPayment
                    ? new Date(account.lastPayment).toLocaleDateString()
                    : "—"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Status</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-2">Status</p>
              <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${statusColors[account.status]}`}>
                {account.status.toUpperCase()}
              </span>
            </div>
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-1">Assigned Officer</p>
              {account.assignedOfficerId ? (
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-xs">
                    {(assignedOfficerName ?? account.assignedOfficerId).charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {assignedOfficerName ?? account.assignedOfficerId}
                  </span>
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">No officer assigned</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Visit History */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Timeline</h3>
        {account.history.length === 0 ? (
          <p className="text-gray-500 text-sm">No activity recorded yet.</p>
        ) : (
          <div className="space-y-4">
            {account.history.map((entry, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-blue-600" />
                  {index !== account.history.length - 1 && (
                    <div className="w-0.5 h-full bg-gray-200 mt-2" />
                  )}
                </div>
                <div className="flex-1 pb-8">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-gray-900">{entry.action}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(entry.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      {entry.amount && (
                        <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded font-semibold">
                          <DollarSign className="w-3 h-3" />
                          ₱{Number(entry.amount).toLocaleString("en-PH")}
                        </div>
                      )}
                    </div>
                    {entry.notes && <p className="text-sm text-gray-600">{entry.notes}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PTP Records */}
      {ptpRecords.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Promise-to-Pay Records</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {ptpRecords.map((ptp, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(ptp.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {ptp.amount ? `₱${Number(ptp.amount).toLocaleString("en-PH")}` : "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{ptp.notes || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Assign Officer Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Assign Field Officer</h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  Account #{account.id} — {account.debtorName}
                </p>
              </div>
              <button
                onClick={() => setShowAssignModal(false)}
                className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {assignError && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {assignError}
              </div>
            )}

            {assignSuccess && (
              <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                Officer assigned successfully!
              </div>
            )}

            {officersLoading ? (
              <div className="py-8 text-center text-sm text-gray-500">Loading officers…</div>
            ) : officers.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-500">
                No field officers found. Create one in User Management first.
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto mb-5">
                {/* Unassign option */}
                <label
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                    selectedOfficerId === ""
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="officer"
                    value=""
                    checked={selectedOfficerId === ""}
                    onChange={() => setSelectedOfficerId("")}
                    className="accent-blue-600"
                  />
                  <span className="text-sm text-gray-500 italic">— No officer (unassign)</span>
                </label>

                {officers.map((officer) => (
                  <label
                    key={officer.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                      selectedOfficerId === officer.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="officer"
                      value={officer.id}
                      checked={selectedOfficerId === officer.id}
                      onChange={() => setSelectedOfficerId(officer.id)}
                      className="accent-blue-600"
                    />
                    <div className="flex items-center gap-2 flex-1">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm">
                        {(officer.fullName ?? officer.username).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {officer.fullName ?? officer.username}
                        </p>
                        <p className="text-xs text-gray-500">@{officer.username}</p>
                      </div>
                    </div>
                    {account.assignedOfficerId === officer.id && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                        Current
                      </span>
                    )}
                  </label>
                ))}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleAssign}
                disabled={assigning || officersLoading || officers.length === 0}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors font-medium"
              >
                {assigning ? "Saving…" : "Confirm Assignment"}
              </button>
              <button
                onClick={() => setShowAssignModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}