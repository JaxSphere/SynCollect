import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Clock, DollarSign } from "lucide-react";
import { fetchScheduledVisits, type VisitResponse } from "../../shared/api/visits";

function formatDateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function CalendarView() {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [events, setEvents] = useState<VisitResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchScheduledVisits()
      .then(setEvents)
      .catch(() => setError("Unable to load scheduled events."))
      .finally(() => setLoading(false));
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const monthName = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(year, month + direction, 1));
  };

  const getEventsForDate = (day: number) => {
    const key = formatDateKey(year, month, day);
    return events.filter((e) => e.ptpDate === key || e.scheduledDate === key);
  };

  const isToday = (day: number) =>
    day === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear();

  const upcomingEvents = events
    .filter((e) => {
      const dateStr = e.ptpDate ?? e.scheduledDate ?? "";
      return dateStr >= formatDateKey(today.getFullYear(), today.getMonth(), today.getDate());
    })
    .sort((a, b) => {
      const da = a.ptpDate ?? a.scheduledDate ?? "";
      const db = b.ptpDate ?? b.scheduledDate ?? "";
      return da.localeCompare(db);
    })
    .slice(0, 8);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Calendar</h2>
          <p className="text-gray-500 mt-1">PTP schedules and field visit planning</p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-green-400" /> PTP
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-400" /> Follow-up
          </span>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">{monthName}</h3>
          <div className="flex gap-2">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={() => navigateMonth(1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="py-16 text-center text-sm text-gray-500">Loading scheduled events...</div>
          ) : (
            <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-lg overflow-hidden">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="bg-gray-50 p-3 text-center">
                  <span className="text-sm font-medium text-gray-600">{day}</span>
                </div>
              ))}

              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} className="bg-white p-3 min-h-[120px]" />
              ))}

              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dayEvents = getEventsForDate(day);
                const todayCell = isToday(day);
                const ptpEvents = dayEvents.filter((e) => e.ptpDate === formatDateKey(year, month, day));
                const followUpEvents = dayEvents.filter((e) => e.scheduledDate === formatDateKey(year, month, day));

                return (
                  <div
                    key={day}
                    className={`bg-white p-3 min-h-[120px] hover:bg-gray-50 transition-colors ${todayCell ? "bg-blue-50" : ""}`}
                  >
                    <div
                      className={`text-sm font-medium mb-2 ${
                        todayCell
                          ? "w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center"
                          : "text-gray-900"
                      }`}
                    >
                      {day}
                    </div>
                    <div className="space-y-1">
                      {ptpEvents.map((event) => (
                        <div
                          key={`ptp-${event.id}`}
                          className="text-xs p-1.5 rounded bg-green-100 text-green-800 border border-green-200"
                          title={`PTP: ${event.debtorName ?? event.accountId}${event.officerName ? ` · ${event.officerName}` : ""}`}
                        >
                          <div className="font-medium truncate">{event.debtorName ?? `Acct #${event.accountNumber ?? event.accountId}`}</div>
                          {event.officerName && (
                            <div className="opacity-75 truncate">{event.officerName}</div>
                          )}
                        </div>
                      ))}
                      {followUpEvents.map((event) => (
                        <div
                          key={`fu-${event.id}`}
                          className="text-xs p-1.5 rounded bg-blue-100 text-blue-800 border border-blue-200"
                          title={`Follow-up: ${event.debtorName ?? event.accountId}${event.officerName ? ` · ${event.officerName}` : ""}`}
                        >
                          <div className="font-medium truncate">{event.debtorName ?? `Acct #${event.accountNumber ?? event.accountId}`}</div>
                          {event.officerName && (
                            <div className="opacity-75 truncate">{event.officerName}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Events</h3>
        {loading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : upcomingEvents.length === 0 ? (
          <p className="text-sm text-gray-500">No upcoming scheduled events.</p>
        ) : (
          <div className="space-y-3">
            {upcomingEvents.map((event) => {
              const isPtp = !!event.ptpDate;
              const dateStr = event.ptpDate ?? event.scheduledDate ?? "";
              return (
                <div
                  key={event.id}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isPtp ? "bg-green-100" : "bg-blue-100"
                    }`}
                  >
                    {isPtp ? (
                      <DollarSign className="w-6 h-6 text-green-600" />
                    ) : (
                      <Clock className="w-6 h-6 text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {event.debtorName ?? `Account #${event.accountNumber ?? event.accountId}`}
                    </p>
                    <p className="text-sm text-gray-500">
                      {isPtp
                        ? `PTP · ₱${(event.ptpAmount ?? 0).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`
                        : `Follow-up · ${event.remarkType.replace(/_/g, " ")}`}
                    </p>
                    {event.officerName && (
                      <p className="text-xs text-gray-400">Officer: {event.officerName}</p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-medium text-gray-900">{dateStr}</p>
                    {event.accountNumber && (
                      <p className="text-xs text-gray-500">Acct #{event.accountNumber}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
