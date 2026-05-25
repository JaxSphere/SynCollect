import { useEffect, useState, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, DollarSign, FileText, UserPlus, X } from "lucide-react";
import { fetchAccount, updateAccount } from "../../shared/api/accounts";
import { fetchUsers } from "../../shared/api/users";
import { fetchAccountVisits } from "../../shared/api/visits";
import type { ApiAccount, ApiUser, ApiVisit } from "../../shared/api/types";

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

function emptyText(value: string | number | null | undefined) {
  return value === null || value === undefined || value === "" ? "-" : String(value);
}

function formatDate(value: string | null | undefined) {
  return value ? new Date(value).toLocaleDateString() : "-";
}

function formatMoney(value: number | null | undefined) {
  if (value === null || value === undefined) return "-";
  return `₱${Number(value).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;
}

function DetailItem({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-sm font-medium text-gray-900 break-words">{value}</p>
    </div>
  );
}

export function AccountDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [account, setAccount] = useState<ApiAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visits, setVisits] = useState<ApiVisit[]>([]);
  const [visitsLoading, setVisitsLoading] = useState(false);
  const [visitsError, setVisitsError] = useState<string | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [officers, setOfficers] = useState<ApiUser[]>([]);
  const [officersLoading, setOfficersLoading] = useState(false);
  const [selectedOfficerId, setSelectedOfficerId] = useState("");
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

  useEffect(() => {
    if (!account?.id) {
      return;
    }

    setVisitsLoading(true);
    setVisitsError(null);

    fetchAccountVisits(account.id)
      .then((data) => setVisits(data))
      .catch((err) => setVisitsError(err instanceof Error ? err.message : "Unable to load visit history."))
      .finally(() => setVisitsLoading(false));
  }, [account?.id]);

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

  const assignedOfficerName =
    account.assignedOfficerName ||
    officers.find((o) => o.id === account.assignedOfficerId)?.fullName ||
    officers.find((o) => o.id === account.assignedOfficerId)?.username ||
    null;
  const ptpRecords = account.history.filter((h) => h.action.includes("PTP"));

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/accounts")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">{account.debtorName}</h2>
            <p className="text-gray-500 mt-1">Account #{account.accountNumber ?? account.id}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
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

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Account Information</h3>
            <p className="text-sm text-gray-500 mt-1">Client, guarantor, and payment details in one record.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${statusColors[account.status]}`}>
              {account.status.toUpperCase()}
            </span>
            <span className="text-sm text-gray-500">Assigned to</span>
            {account.assignedOfficerId ? (
              <span className="inline-flex items-center gap-2 text-sm font-medium text-gray-900">
                <span className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-xs">
                  {(assignedOfficerName ?? account.assignedOfficerId).charAt(0).toUpperCase()}
                </span>
                {assignedOfficerName ?? account.assignedOfficerId}
              </span>
            ) : (
              <span className="text-sm text-gray-400 italic">Unassigned</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-gray-200">
          <section className="p-6">
            <h4 className="text-sm font-semibold uppercase text-gray-500 mb-4">Client</h4>
            <div className="space-y-4">
              <DetailItem label="Creditor Account Reference" value={emptyText(account.accountNumber)} />
              <DetailItem label="Creditor" value={emptyText(account.creditor)} />
              <DetailItem label="Client Name" value={emptyText(account.debtorName)} />
              <DetailItem label="Client's Address" value={emptyText(account.debtorAddress)} />
              <DetailItem label="Client's Contact" value={emptyText(account.debtorPhone)} />
              <DetailItem label="Year Account" value={emptyText(account.yearAccount)} />
            </div>
          </section>

          <section className="p-6">
            <h4 className="text-sm font-semibold uppercase text-gray-500 mb-4">Guarantor</h4>
            <div className="space-y-4">
              <DetailItem label="Guarantor's Name" value={emptyText(account.guarantorName)} />
              <DetailItem label="Relationship" value={emptyText(account.relationship)} />
              <DetailItem label="Guarantor's Contacts" value={emptyText(account.guarantorContacts)} />
              <DetailItem label="Guarantor's Address" value={emptyText(account.guarantorAddress)} />
            </div>
          </section>

          <section className="p-6">
            <h4 className="text-sm font-semibold uppercase text-gray-500 mb-4">Payment</h4>
            <div className="space-y-4">
              <DetailItem label="Due Date" value={formatDate(account.dueDate)} />
              <DetailItem label="Bill" value={formatMoney(account.bill)} />
              <div>
                <p className="text-sm text-gray-500">Balance</p>
                <p className="text-2xl font-bold text-red-600">{formatMoney(account.balance)}</p>
              </div>
              <DetailItem label="Last Payment" value={formatDate(account.lastPayment)} />
            </div>
          </section>
        </div>
      </div>

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
                          ₱{Number(entry.amount).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
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

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Visit Photo History</h3>
          {visitsLoading && <span className="text-sm text-gray-500">Loading photos...</span>}
        </div>
        {visitsError ? (
          <p className="text-red-600 text-sm">{visitsError}</p>
        ) : !visits.length ? (
          <p className="text-gray-500 text-sm">No visit photos have been uploaded yet.</p>
        ) : (
          <div className="space-y-6">
            {visits.map((visit) => {
              const photos = [
                { label: "House Photo", url: visit.housePhoto },
                { label: "Client Photo", url: visit.clientPhoto },
                ...((visit.additionalPhotos ?? []).map((url, index) => ({ label: `Additional Photo ${index + 1}`, url })) ?? []),
              ].filter((item) => item.url);

              if (!photos.length) {
                return null;
              }

              return (
                <div key={visit.id} className="rounded-lg border border-gray-200 p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-medium text-gray-900">{visit.remarkType.replace(/_/g, " ")}</p>
                      <p className="text-sm text-gray-500">{new Date(visit.createdAt).toLocaleString()}</p>
                      {visit.officerName && (
                        <p className="text-sm text-blue-600 mt-0.5">Officer: {visit.officerName}</p>
                      )}
                    </div>
                    {visit.ptpAmount ? (
                      <span className="text-sm text-green-700 font-semibold">₱{Number(visit.ptpAmount).toLocaleString("en-PH", { minimumFractionDigits: 2 })}</span>
                    ) : null}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {photos.map((photo) => (
                      <div key={photo.label} className="rounded-lg overflow-hidden border border-gray-200 bg-white">
                        <div className="p-2 text-xs font-semibold text-gray-600 border-b border-gray-100">{photo.label}</div>
                        <img
                          src={photo.url}
                          alt={photo.label}
                          className="w-full h-40 object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

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
                      {ptp.amount ? `₱${Number(ptp.amount).toLocaleString("en-PH", { minimumFractionDigits: 2 })}` : "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{ptp.notes || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Assign Field Officer</h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  Account #{account.accountNumber ?? account.id} - {account.debtorName}
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
              <div className="py-8 text-center text-sm text-gray-500">Loading officers...</div>
            ) : officers.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-500">
                No field officers found. Create one in User Management first.
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto mb-5">
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
                  <span className="text-sm text-gray-500 italic">No officer (unassign)</span>
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
                {assigning ? "Saving..." : "Confirm Assignment"}
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
