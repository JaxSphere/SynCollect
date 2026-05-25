import React, { useEffect, useMemo, useState } from "react";
import { Search, Filter, Upload, ChevronDown, Eye, Pencil, Trash2, Plus } from "lucide-react";
import { fetchAccounts, createAccount, updateAccount, deleteAccount } from "../../shared/api/accounts";
import { fetchUsers } from "../../shared/api/users";
import type { ApiAccount, ApiUser } from "../../shared/api/types";
import { Link } from "react-router";

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

const defaultForm = {
  debtorName: "",
  debtorPhone: "",
  debtorAddress: "",
  accountNumber: "",
  yearAccount: "",
  guarantorName: "",
  relationship: "",
  guarantorContacts: "",
  guarantorAddress: "",
  dueDate: "",
  bill: "",
  balance: 0,
  lastPayment: "",
  assignedOfficerId: "",
};

function getOfficerInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const officerAvatarColors: string[][] = [
  ["bg-blue-100", "text-blue-700"],
  ["bg-green-100", "text-green-700"],
  ["bg-purple-100", "text-purple-700"],
  ["bg-amber-100", "text-amber-700"],
  ["bg-pink-100", "text-pink-700"],
  ["bg-teal-100", "text-teal-700"],
];

function getOfficerColors(name: string): string[] {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) & 0xffff;
  return officerAvatarColors[hash % officerAvatarColors.length];
}

function getAccountActionId(account: ApiAccount): string {
  return String(account.id || account.accountNumber || "").trim();
}

function optionalNumber(value: string) {
  return value.trim() ? Number(value) : undefined;
}

export function AccountManagement() {
  const [accounts, setAccounts] = useState<ApiAccount[]>([]);
  const [officers, setOfficers] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [officersLoading, setOfficersLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [editingAccountNumber, setEditingAccountNumber] = useState<number | null>(null);
  const [form, setForm] = useState(defaultForm);

  const isFormValid = useMemo(() => {
    return form.debtorName.trim().length > 0 && form.accountNumber.trim().length > 0;
  }, [form]);

  const loadAccounts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAccounts();
      setAccounts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load accounts.");
    } finally {
      setLoading(false);
    }
  };

  const loadOfficers = async () => {
    setOfficersLoading(true);
    try {
      const users = await fetchUsers();
      setOfficers(users.filter((user) => user.role === "fieldOfficer"));
    } catch (err) {
      console.error(err);
    } finally {
      setOfficersLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
    loadOfficers();
  }, []);

  const filteredAccounts = accounts.filter((account) => {
    const idMatch = String(account.accountNumber ?? account.id).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSearch =
      account.debtorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      idMatch;
    const matchesStatus = statusFilter === "all" || account.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const resetForm = () => {
    setForm(defaultForm);
    setEditingAccountId(null);
    setEditingAccountNumber(null);
    setShowForm(false);
  };

  const handleEdit = (account: ApiAccount) => {
    setEditingAccountId(getAccountActionId(account));
    setEditingAccountNumber(account.accountNumber ?? null);
    setForm({
      debtorName: account.debtorName,
      debtorPhone: account.debtorPhone ?? "",
      debtorAddress: account.debtorAddress ?? "",
      accountNumber: account.accountNumber?.toString() ?? "",
      yearAccount: account.yearAccount?.toString() ?? "",
      guarantorName: account.guarantorName ?? "",
      relationship: account.relationship ?? "",
      guarantorContacts: account.guarantorContacts ?? "",
      guarantorAddress: account.guarantorAddress ?? "",
      dueDate: account.dueDate ?? "",
      bill: account.bill?.toString() ?? "",
      balance: account.balance,
      lastPayment: account.lastPayment ?? "",
      assignedOfficerId: account.assignedOfficerId ?? "",
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      setError("Debtor name and account number are required.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (editingAccountId) {
        await updateAccount(editingAccountId, {
          debtorName: form.debtorName.trim(),
          debtorPhone: form.debtorPhone.trim() || undefined,
          debtorAddress: form.debtorAddress.trim() || undefined,
          accountNumber: Number(form.accountNumber),
          yearAccount: optionalNumber(form.yearAccount),
          guarantorName: form.guarantorName.trim() || undefined,
          relationship: form.relationship.trim() || undefined,
          guarantorContacts: form.guarantorContacts.trim() || undefined,
          guarantorAddress: form.guarantorAddress.trim() || undefined,
          dueDate: form.dueDate || null,
          bill: optionalNumber(form.bill),
          balance: form.balance,
          lastPayment: form.lastPayment || null,
          assignedOfficerId: form.assignedOfficerId.trim() || undefined,
        });
      } else {
        await createAccount({
          debtorName: form.debtorName.trim(),
          accountNumber: Number(form.accountNumber),
          debtorPhone: form.debtorPhone.trim() || undefined,
          debtorAddress: form.debtorAddress.trim() || undefined,
          yearAccount: optionalNumber(form.yearAccount),
          guarantorName: form.guarantorName.trim() || undefined,
          relationship: form.relationship.trim() || undefined,
          guarantorContacts: form.guarantorContacts.trim() || undefined,
          guarantorAddress: form.guarantorAddress.trim() || undefined,
          dueDate: form.dueDate || undefined,
          bill: optionalNumber(form.bill),
          balance: form.balance,
          lastPayment: form.lastPayment || undefined,
          assignedOfficerId: form.assignedOfficerId.trim() || undefined,
        });
      }
      await loadAccounts();
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save account.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!id.trim()) {
      setError("Account ID is required.");
      return;
    }

    if (!window.confirm("Delete this account? This action cannot be undone.")) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await deleteAccount(id);
      await loadAccounts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Account Management</h2>
          <p className="text-gray-500 mt-1">Manage and track all debt collection accounts</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Account
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
            <Upload className="w-4 h-4" />
            Upload CSV
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or account number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="ptp">PTP</option>
                <option value="legal">Legal</option>
                <option value="closed">Closed</option>
                <option value="pending">Pending</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="w-4 h-4" />
              More Filters
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Accounts</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{accounts.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Active</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {accounts.filter((a) => a.status === "active").length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">PTP</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {accounts.filter((a) => a.status === "ptp").length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Legal</p>
          <p className="text-2xl font-bold text-red-600 mt-1">
            {accounts.filter((a) => a.status === "legal").length}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Account #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Debtor Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Balance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned Officer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAccounts.map((account) => (
                <tr key={account.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {account.accountNumber ?? account.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {account.debtorName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-[180px] truncate">
                    {account.debtorAddress || "—"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    PHP {account.balance.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        statusColors[account.status] || "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {account.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {account.assignedOfficerName ? (
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${
                            getOfficerColors(account.assignedOfficerName).join(" ")
                          }`}
                        >
                          {getOfficerInitials(account.assignedOfficerName)}
                        </div>
                        <span className="text-sm text-gray-900 truncate max-w-[120px]">
                          {account.assignedOfficerName}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2 flex">
                    <Link
                      to={`/accounts/${getAccountActionId(account)}`}
                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </Link>
                    <button
                      onClick={() => handleEdit(account)}
                      className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-800"
                    >
                      <Pencil className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(getAccountActionId(account))}
                      className="inline-flex items-center gap-1 text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredAccounts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No accounts found matching your criteria.</p>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingAccountId ? "Edit Account" : "Create New Account"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Client Name *</label>
                <input
                  type="text"
                  value={form.debtorName}
                  onChange={(e) => setForm((prev) => ({ ...prev, debtorName: e.target.value }))}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Client's Contact</label>
                <input
                  type="tel"
                  value={form.debtorPhone}
                  onChange={(e) => setForm((prev) => ({ ...prev, debtorPhone: e.target.value }))}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Client's Address</label>
                <input
                  type="text"
                  value={form.debtorAddress}
                  onChange={(e) => setForm((prev) => ({ ...prev, debtorAddress: e.target.value }))}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Account Number *</label>
                <input
                  type="number"
                  value={form.accountNumber}
                  onChange={(e) => setForm((prev) => ({ ...prev, accountNumber: e.target.value }))}
                  placeholder=""
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Year Account</label>
                  <input
                    type="number"
                    value={form.yearAccount}
                    onChange={(e) => setForm((prev) => ({ ...prev, yearAccount: e.target.value }))}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Due Date</label>
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={(e) => setForm((prev) => ({ ...prev, dueDate: e.target.value }))}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Bill (PHP)</label>
                  <input
                    type="number"
                    value={form.bill}
                    onChange={(e) => setForm((prev) => ({ ...prev, bill: e.target.value }))}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Balance (PHP)</label>
                  <input
                    type="number"
                    value={form.balance}
                    onChange={(e) => setForm((prev) => ({ ...prev, balance: Number(e.target.value) }))}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Payment</label>
                  <input
                    type="date"
                    value={form.lastPayment}
                    onChange={(e) => setForm((prev) => ({ ...prev, lastPayment: e.target.value }))}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Relationship</label>
                  <input
                    type="text"
                    value={form.relationship}
                    onChange={(e) => setForm((prev) => ({ ...prev, relationship: e.target.value }))}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Guarantor's Name</label>
                  <input
                    type="text"
                    value={form.guarantorName}
                    onChange={(e) => setForm((prev) => ({ ...prev, guarantorName: e.target.value }))}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Guarantor's Contacts</label>
                  <input
                    type="tel"
                    value={form.guarantorContacts}
                    onChange={(e) => setForm((prev) => ({ ...prev, guarantorContacts: e.target.value }))}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Guarantor's Address</label>
                  <input
                    type="text"
                    value={form.guarantorAddress}
                    onChange={(e) => setForm((prev) => ({ ...prev, guarantorAddress: e.target.value }))}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Assigned Officer</label>
                <select
                  value={form.assignedOfficerId}
                  onChange={(e) => setForm((prev) => ({ ...prev, assignedOfficerId: e.target.value }))}
                  className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2"
                >
                  <option value="">Unassigned</option>
                  {officers.map((officer) => (
                    <option key={officer.id} value={officer.id}>
                      {officer.fullName || officer.username}
                    </option>
                  ))}
                </select>
                {officersLoading && (
                  <p className="mt-2 text-sm text-gray-500">Loading officers...</p>
                )}
                {!officersLoading && officers.length === 0 && (
                  <p className="mt-2 text-sm text-gray-500">No field officers available yet.</p>
                )}
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  disabled={!isFormValid || loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
                >
                  {editingAccountId ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
