import React, { useEffect, useMemo, useState } from "react";
import { PlusCircle, Pencil, Trash2, Save, X } from "lucide-react";
import { fetchUsers, createUser, updateUser, deleteUser } from "../../shared/api/users";
import type { ApiUser } from "../../shared/api/types";
import type { UserRole } from "../../auth/types";

const defaultForm = {
  username: "",
  password: "",
  fullName: "",
  role: "fieldOfficer" as UserRole,
};

export function UserManagement() {
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  const isFormValid = useMemo(
    () => form.username.trim().length > 0 && (editingUserId || form.password.trim().length > 0),
    [form, editingUserId],
  );

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchUsers();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const resetForm = () => {
    setForm(defaultForm);
    setEditingUserId(null);
  };

  const handleEdit = (user: ApiUser) => {
    setEditingUserId(user.id);
    setForm({
      username: user.username,
      password: "",
      fullName: user.fullName ?? "",
      role: user.role,
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isFormValid) {
      setError("Please add a username and password (password is required for new users).");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (editingUserId) {
        await updateUser(editingUserId, {
          username: form.username.trim(),
          password: form.password.trim() || undefined,
          role: form.role,
          fullName: form.fullName.trim() || null,
        });
      } else {
        await createUser({
          username: form.username.trim(),
          password: form.password.trim(),
          role: form.role,
          fullName: form.fullName.trim() || null,
        });
      }
      await loadUsers();
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save user.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this user? This action cannot be undone.")) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await deleteUser(id);
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete user.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">User Management</h2>
          <p className="text-gray-500 mt-1">Create, update, and delete manager or field officer accounts.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={resetForm}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            <PlusCircle className="w-4 h-4" />
            New user
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <section className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="text-xl font-semibold text-gray-900">{editingUserId ? "Edit user" : "Create user"}</h3>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Username</label>
              <input
                value={form.username}
                onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))}
                className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                placeholder={editingUserId ? "Leave blank to keep current password" : "Enter a password"}
                className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Full name</label>
              <input
                value={form.fullName}
                onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value }))}
                className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <select
                value={form.role}
                onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value as UserRole }))}
                className="mt-2 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2 focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="manager">Manager</option>
                <option value="fieldOfficer">Field Officer</option>
              </select>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              <button
                type="submit"
                disabled={!isFormValid || loading}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-200"
              >
                <Save className="w-4 h-4" />
                {editingUserId ? "Update user" : "Create user"}
              </button>
              {editingUserId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="text-xl font-semibold text-gray-900">User list</h3>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Username</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Full name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Role</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 text-sm text-gray-900">{user.username}</td>
                    <td className="px-4 py-4 text-sm text-gray-700">{user.fullName ?? "—"}</td>
                    <td className="px-4 py-4 text-sm text-gray-700">{user.role}</td>
                    <td className="px-4 py-4 text-right text-sm font-medium space-x-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(user)}
                        className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-gray-700 hover:bg-gray-50"
                      >
                        <Pencil className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(user.id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-red-700 hover:bg-red-100"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && (
              <div className="p-6 text-center text-sm text-gray-500">No users found.</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
