import React, { useEffect, useMemo, useState } from "react";
import { Search, Upload, ChevronDown, Eye, Pencil, Trash2, Plus, X, AlertTriangle } from "lucide-react";
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
  creditor: "",
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
  const [creditorFilter, setCreditorFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
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

  const creditorOptions = Array.from(
    new Set(accounts.map((a) => a.creditor).filter(Boolean) as string[])
  ).sort();

  const filteredAccounts = accounts.filter((account) => {
    const idMatch = String(account.accountNumber ?? account.id).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSearch =
      account.debtorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (account.creditor ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      idMatch;
    const matchesStatus = statusFilter === "all" || account.status === statusFilter;
    const matchesCreditor = creditorFilter === "all" || account.creditor === creditorFilter;
    return matchesSearch && matchesStatus && matchesCreditor;
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
      creditor: account.creditor ?? "",
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
          creditor: form.creditor.trim() || undefined,
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
          creditor: form.creditor.trim() || undefined,
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

  const handleDelete = (account: ApiAccount) => {
    const id = getAccountActionId(account);
    if (!id.trim()) {
      setError("Account ID is required.");
      return;
    }
    setDeleteTarget({ id, name: account.debtorName });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setLoading(true);
    setError(null);
    try {
      await deleteAccount(deleteTarget.id);
      await loadAccounts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete account.");
    } finally {
      setLoading(false);
      setDeleteTarget(null);
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
          <div className="flex gap-2 flex-wrap">
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
            <div className="relative">
              <select
                value={creditorFilter}
                onChange={(e) => setCreditorFilter(e.target.value)}
                className="appearance-none px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="all">All Creditors</option>
                {creditorOptions.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total</p>
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
          <p className="text-sm text-gray-500">Visited</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">
            {accounts.filter((a) => a.status === "visited").length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Legal</p>
          <p className="text-2xl font-bold text-red-600 mt-1">
            {accounts.filter((a) => a.status === "legal").length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Unlocated</p>
          <p className="text-2xl font-bold text-orange-500 mt-1">
            {accounts.filter((a) => a.status === "unlocated").length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Closed</p>
          <p className="text-2xl font-bold text-gray-500 mt-1">
            {accounts.filter((a) => a.status === "closed").length}
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
                  Creditor
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {account.creditor ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {account.creditor}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-[180px] truncate">
                    {account.debtorAddress || "—"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    ₱{account.balance.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
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
                      onClick={() => handleDelete(account)}
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

      {deleteTarget && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-1">Delete Account</h3>
              <p className="text-sm text-gray-500 text-center mb-1">
                Are you sure you want to delete
              </p>
              <p className="text-sm font-semibold text-gray-800 text-center mb-4">
                {deleteTarget.name}?
              </p>
              <p className="text-xs text-red-600 text-center mb-6">
                This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={loading}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? "Deleting…" : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col">

            {/* ── Modal header ── */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingAccountId ? "Edit Account" : "Add New Account"}
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  Fields marked <span className="text-red-500 font-medium">*</span> are required
                </p>
              </div>
              <button
                type="button"
                onClick={resetForm}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* ── Scrollable body ── */}
            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6">

              {/* Account Info */}
              <section>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
                  Account Info
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={form.accountNumber}
                      onChange={(e) => setForm((prev) => ({ ...prev, accountNumber: e.target.value }))}
                      placeholder="e.g. 100001"
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Creditor
                    </label>
                    <input
                      type="text"
                      value={form.creditor}
                      onChange={(e) => setForm((prev) => ({ ...prev, creditor: e.target.value }))}
                      placeholder="e.g. BDO Bank, Asian Hospital"
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Year Account</label>
                    <input
                      type="number"
                      value={form.yearAccount}
                      onChange={(e) => setForm((prev) => ({ ...prev, yearAccount: e.target.value }))}
                      placeholder="e.g. 2024"
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Officer</label>
                    <select
                      value={form.assignedOfficerId}
                      onChange={(e) => setForm((prev) => ({ ...prev, assignedOfficerId: e.target.value }))}
                      className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">— Unassigned —</option>
                      {officers.map((officer) => (
                        <option key={officer.id} value={officer.id}>
                          {officer.fullName || officer.username}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </section>

              <hr className="border-gray-100" />

              {/* Client Info */}
              <section>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
                  Client Info
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Client Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.debtorName}
                      onChange={(e) => setForm((prev) => ({ ...prev, debtorName: e.target.value }))}
                      placeholder="Full name of the debtor"
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                    <input
                      type="tel"
                      value={form.debtorPhone}
                      onChange={(e) => setForm((prev) => ({ ...prev, debtorPhone: e.target.value }))}
                      placeholder="+63 9XX XXX XXXX"
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input
                      type="text"
                      value={form.debtorAddress}
                      onChange={(e) => setForm((prev) => ({ ...prev, debtorAddress: e.target.value }))}
                      placeholder="Street, Barangay, City"
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </section>

              <hr className="border-gray-100" />

              {/* Payment Details */}
              <section>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
                  Payment Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bill Amount (PHP)</label>
                    <input
                      type="number"
                      value={form.bill}
                      onChange={(e) => setForm((prev) => ({ ...prev, bill: e.target.value }))}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Outstanding Balance (PHP)</label>
                    <input
                      type="number"
                      value={form.balance}
                      onChange={(e) => setForm((prev) => ({ ...prev, balance: Number(e.target.value) }))}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                    <input
                      type="date"
                      value={form.dueDate}
                      onChange={(e) => setForm((prev) => ({ ...prev, dueDate: e.target.value }))}
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Payment Date</label>
                    <input
                      type="date"
                      value={form.lastPayment}
                      onChange={(e) => setForm((prev) => ({ ...prev, lastPayment: e.target.value }))}
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </section>

              <hr className="border-gray-100" />

              {/* Guarantor */}
              <section>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
                  Guarantor Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Guarantor Name</label>
                    <input
                      type="text"
                      value={form.guarantorName}
                      onChange={(e) => setForm((prev) => ({ ...prev, guarantorName: e.target.value }))}
                      placeholder="Full name"
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Relationship to Client</label>
                    <input
                      type="text"
                      value={form.relationship}
                      onChange={(e) => setForm((prev) => ({ ...prev, relationship: e.target.value }))}
                      placeholder="e.g. Spouse, Parent, Sibling"
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Guarantor Contact</label>
                    <input
                      type="tel"
                      value={form.guarantorContacts}
                      onChange={(e) => setForm((prev) => ({ ...prev, guarantorContacts: e.target.value }))}
                      placeholder="+63 9XX XXX XXXX"
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Guarantor Address</label>
                    <input
                      type="text"
                      value={form.guarantorAddress}
                      onChange={(e) => setForm((prev) => ({ ...prev, guarantorAddress: e.target.value }))}
                      placeholder="Street, Barangay, City"
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </section>

            </div>

            {/* ── Modal footer ── */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={(e) => handleSubmit(e as any)}
                disabled={!isFormValid || loading}
                className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Saving…" : editingAccountId ? "Save Changes" : "Create Account"}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
