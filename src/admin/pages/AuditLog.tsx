import { useEffect, useState } from "react";
import { Search, ShieldCheck, RefreshCw } from "lucide-react";
import { fetchAuditLogs, type AuditLogEntry } from "../../shared/api/audit";

const ACTION_COLORS: Record<string, string> = {
  USER_CREATED: "bg-green-100 text-green-800",
  USER_UPDATED: "bg-blue-100 text-blue-800",
  USER_DELETED: "bg-red-100 text-red-800",
  ACCOUNT_CREATED: "bg-emerald-100 text-emerald-800",
  ACCOUNT_UPDATED: "bg-sky-100 text-sky-800",
  ACCOUNT_DELETED: "bg-rose-100 text-rose-800",
};

const PAGE_SIZE = 50;

export function AdminAuditLog() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [targetType, setTargetType] = useState("ALL");
  const [page, setPage] = useState(0);

  const load = async (searchVal = search, typeVal = targetType, pageVal = page) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAuditLogs({
        limit: PAGE_SIZE,
        offset: pageVal * PAGE_SIZE,
        search: searchVal || undefined,
        targetType: typeVal !== "ALL" ? typeVal : undefined,
      });
      setLogs(data.logs);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load audit logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSearch = (val: string) => {
    setSearch(val);
    setPage(0);
    load(val, targetType, 0);
  };

  const handleTypeFilter = (val: string) => {
    setTargetType(val);
    setPage(0);
    load(search, val, 0);
  };

  const handlePage = (newPage: number) => {
    setPage(newPage);
    load(search, targetType, newPage);
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-blue-600" />
            Audit Logs
          </h2>
          <p className="text-gray-500 mt-1 text-sm">
            Immutable record of all system actions — read-only, timestamped, tied to user IDs.
          </p>
        </div>
        <button
          onClick={() => load()}
          className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by action, target, or performer..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={targetType}
          onChange={(e) => handleTypeFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="ALL">All Types</option>
          <option value="USER">Users</option>
          <option value="ACCOUNT">Accounts</option>
        </select>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 text-xs text-gray-500 font-medium">
          {total} total entries {loading && "— loading…"}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performed By</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.length === 0 && !loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-gray-400">No audit entries found.</td>
                </tr>
              ) : (
                logs.map((log) => {
                  const details = log.details ? (() => { try { return JSON.parse(log.details!); } catch { return null; } })() : null;
                  return (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-gray-500 text-xs font-mono">
                        {new Date(log.createdAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "medium" })}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${ACTION_COLORS[log.action] ?? "bg-gray-100 text-gray-700"}`}>
                          {log.action.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{log.targetName ?? log.targetId}</div>
                        <div className="text-xs text-gray-400">{log.targetType} · {log.targetId.slice(0, 8)}…</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{log.performedBy ?? "—"}</div>
                        {log.performedById && (
                          <div className="text-xs text-gray-400">{log.performedById.slice(0, 8)}…</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 max-w-xs truncate">
                        {details ? Object.entries(details).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : String(v)}`).join(" · ") : "—"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between text-sm">
            <span className="text-gray-500">Page {page + 1} of {totalPages}</span>
            <div className="flex gap-2">
              <button
                onClick={() => handlePage(page - 1)}
                disabled={page === 0}
                className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => handlePage(page + 1)}
                disabled={page >= totalPages - 1}
                className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
