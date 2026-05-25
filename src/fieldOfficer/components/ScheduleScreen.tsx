import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ChevronLeft, ChevronRight, Home, CalendarDays, Settings, X } from 'lucide-react';
import { fetchScheduledVisits, type VisitResponse } from '../../shared/api/visits';

// ── Helpers ──────────────────────────────────────────────────────────────────
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function formatDateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function formatDateLabel(dateStr: string) {
  // parse as local date to avoid UTC offset shifting the day
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

// ── Component ────────────────────────────────────────────────────────────────
export function ScheduleScreen() {
  const navigate = useNavigate();
  const today = new Date();
  const todayKey = formatDateKey(today.getFullYear(), today.getMonth(), today.getDate());

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  // null = show all upcoming; a YYYY-MM-DD string = filter to that day
  const [dayFilter, setDayFilter] = useState<string | null>(null);
  const [events, setEvents] = useState<VisitResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const updateMonth = (year: number, month: number) => {
    setViewYear(year);
    setViewMonth(month);
  };

  const prevMonth = () => {
    if (viewMonth === 0) updateMonth(viewYear - 1, 11);
    else updateMonth(viewYear, viewMonth - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) updateMonth(viewYear + 1, 0);
    else updateMonth(viewYear, viewMonth + 1);
  };

  const isToday = (day: number) =>
    day === today.getDate() &&
    viewMonth === today.getMonth() &&
    viewYear === today.getFullYear();

  const isSelected = (day: number) =>
    dayFilter === formatDateKey(viewYear, viewMonth, day);

  const handleDayClick = (day: number) => {
    const key = formatDateKey(viewYear, viewMonth, day);
    // tap same day again → clear filter back to "all upcoming"
    setDayFilter((prev) => (prev === key ? null : key));
  };

  const clearFilter = () => setDayFilter(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchScheduledVisits()
      .then((data) => setEvents(data))
      .catch(() => setError('Unable to load scheduled visits. Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  // ── Derived event lists ────────────────────────────────────────────────────
  const allUpcomingPtps = events
    .filter((e) => e.ptpDate && e.ptpDate >= todayKey)
    .sort((a, b) => (a.ptpDate ?? '').localeCompare(b.ptpDate ?? ''));

  const allUpcomingFollowUps = events
    .filter((e) => e.scheduledDate && e.scheduledDate >= todayKey)
    .sort((a, b) => (a.scheduledDate ?? '').localeCompare(b.scheduledDate ?? ''));

  const ptpToShow = dayFilter
    ? events.filter((e) => e.ptpDate === dayFilter)
    : allUpcomingPtps;

  const followUpsToShow = dayFilter
    ? events.filter((e) => e.scheduledDate === dayFilter)
    : allUpcomingFollowUps;

  // glass style
  const glass = {
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.13)',
  } as React.CSSProperties;

  const glassStrong = {
    background: 'rgba(255,255,255,0.11)',
    border: '1px solid rgba(255,255,255,0.18)',
  } as React.CSSProperties;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(160deg, #0d1b38 0%, #112044 50%, #0d1b38 100%)' }}
    >
      {/* ── Top bar ── */}
      <div
        className="px-5 pt-10 pb-4"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
      >
        <h1 className="text-white text-lg font-bold tracking-tight text-center">
          Schedule
        </h1>
      </div>

      {/* ── Scrollable body ── */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-32 space-y-5">

        {/* ── Calendar — same grid format as CalendarView ── */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: '1px solid rgba(255,255,255,0.13)' }}
        >
          {/* Month nav header */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{
              background: 'rgba(255,255,255,0.06)',
              borderBottom: '1px solid rgba(255,255,255,0.10)',
            }}
          >
            <button
              type="button"
              onClick={prevMonth}
              className="p-1.5 rounded-lg text-blue-300 hover:bg-white/10 transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div className="text-center">
              <p className="text-white font-semibold text-sm">
                {MONTHS[viewMonth]} {viewYear}
              </p>
              <div className="flex items-center justify-center gap-3 mt-1 text-[10px] text-blue-300/70">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" /> PTP
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block" /> Follow-up
                </span>
                <span className="text-blue-300/40">· tap to filter</span>
              </div>
            </div>
            <button
              type="button"
              onClick={nextMonth}
              className="p-1.5 rounded-lg text-blue-300 hover:bg-white/10 transition-colors"
              aria-label="Next month"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Grid */}
          <div
            className="grid grid-cols-7"
            style={{ gap: '1px', background: 'rgba(255,255,255,0.08)' }}
          >
            {/* Day-of-week headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div
                key={d}
                className="p-2 text-center text-[11px] font-semibold text-blue-300/60"
                style={{ background: 'rgba(255,255,255,0.04)' }}
              >
                {d}
              </div>
            ))}

            {/* Empty cells before month start */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="min-h-[72px]"
                style={{ background: 'rgba(13,27,56,0.9)' }}
              />
            ))}

            {/* Day cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const key = formatDateKey(viewYear, viewMonth, day);
              const selected = isSelected(day);
              const todayCell = isToday(day);
              const ptpEvents = events.filter((e) => e.ptpDate === key);
              const followUpEvents = events.filter((e) => e.scheduledDate === key);

              return (
                <div
                  key={day}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleDayClick(day)}
                  onKeyDown={(e) => e.key === 'Enter' && handleDayClick(day)}
                  className="min-h-[72px] p-1.5 cursor-pointer transition-colors"
                  style={{
                    background: selected
                      ? 'rgba(59,130,246,0.18)'
                      : todayCell
                      ? 'rgba(255,255,255,0.06)'
                      : 'rgba(13,27,56,0.9)',
                  }}
                  aria-label={`${MONTHS[viewMonth]} ${day}`}
                  aria-pressed={selected}
                >
                  {/* Day number */}
                  <div className="flex justify-start mb-1">
                    <span
                      className="text-xs font-semibold flex items-center justify-center"
                      style={
                        selected
                          ? {
                              width: 22, height: 22, borderRadius: '50%',
                              background: 'rgba(59,130,246,0.9)', color: '#fff',
                            }
                          : todayCell
                          ? {
                              width: 22, height: 22, borderRadius: '50%',
                              background: 'rgba(255,255,255,0.2)', color: '#93c5fd',
                            }
                          : { color: 'rgba(255,255,255,0.75)' }
                      }
                    >
                      {day}
                    </span>
                  </div>

                  {/* Event chips */}
                  <div className="space-y-0.5">
                    {ptpEvents.map((e) => (
                      <div
                        key={`ptp-${e.id}`}
                        className="text-[10px] px-1 py-0.5 rounded leading-tight truncate"
                        style={{
                          background: 'rgba(74,222,128,0.15)',
                          color: '#86efac',
                          border: '1px solid rgba(74,222,128,0.25)',
                        }}
                        title={e.debtorName ?? `Acct #${e.accountNumber}`}
                      >
                        {e.debtorName ?? `#${e.accountNumber}`}
                      </div>
                    ))}
                    {followUpEvents.map((e) => (
                      <div
                        key={`fu-${e.id}`}
                        className="text-[10px] px-1 py-0.5 rounded leading-tight truncate"
                        style={{
                          background: 'rgba(96,165,250,0.15)',
                          color: '#93c5fd',
                          border: '1px solid rgba(96,165,250,0.25)',
                        }}
                        title={e.debtorName ?? `Acct #${e.accountNumber}`}
                      >
                        {e.debtorName ?? `#${e.accountNumber}`}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Active filter banner ── */}
        {dayFilter && (
          <div
            className="rounded-xl px-4 py-2.5 flex items-center justify-between"
            style={{ background: 'rgba(59,130,246,0.18)', border: '1px solid rgba(59,130,246,0.35)' }}
          >
            <p className="text-blue-200 text-sm font-medium">
              Showing: {formatDateLabel(dayFilter)}
            </p>
            <button
              type="button"
              onClick={clearFilter}
              className="flex items-center gap-1 text-blue-300 text-xs hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Show all
            </button>
          </div>
        )}

        {/* ── PTP Reminders ── */}
        <section>
          <div className="flex items-center justify-between mb-2.5 px-0.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-green-400 inline-block" />
              <h2 className="text-white font-bold text-base">
                {dayFilter ? 'PTP Reminders' : 'Upcoming PTPs'}
              </h2>
            </div>
            {!loading && ptpToShow.length > 0 && (
              <span
                className="text-[11px] font-bold rounded-full px-2.5 py-0.5"
                style={{ background: 'rgba(74,222,128,0.2)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.3)' }}
              >
                {ptpToShow.length}
              </span>
            )}
          </div>

          {loading ? (
            <div className="rounded-2xl px-4 py-6 text-center" style={glass}>
              <p className="text-blue-300/70 text-sm">Loading…</p>
            </div>
          ) : error ? (
            <div className="rounded-2xl px-4 py-5 text-center" style={glass}>
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          ) : ptpToShow.length === 0 ? (
            <div className="rounded-2xl px-4 py-6 text-center" style={glass}>
              <p className="text-blue-300/70 text-sm">
                {dayFilter ? 'No PTP reminders on this day.' : 'No upcoming PTP reminders.'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {ptpToShow.map((ptp) => (
                <div
                  key={ptp.id}
                  className="rounded-2xl px-4 py-3.5 flex items-start justify-between gap-3"
                  style={glassStrong}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold leading-snug truncate">
                      {ptp.debtorName ?? 'Unknown Debtor'}
                    </p>
                    {ptp.accountNumber && (
                      <p className="text-blue-300/80 text-xs mt-0.5">
                        Account #{ptp.accountNumber}
                      </p>
                    )}
                    {/* Show the date when viewing all upcoming */}
                    {!dayFilter && ptp.ptpDate && (
                      <p className="text-green-400/80 text-xs mt-1 font-medium">
                        Due: {formatDateLabel(ptp.ptpDate)}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-green-300 font-bold text-sm">
                      ₱{(ptp.ptpAmount ?? 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-blue-300/60 text-[10px] mt-0.5">PTP Amount</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Scheduled Follow-ups ── */}
        <section>
          <div className="flex items-center justify-between mb-2.5 px-0.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400 inline-block" />
              <h2 className="text-white font-bold text-base">
                {dayFilter ? 'Scheduled Follow-ups' : 'Upcoming Follow-ups'}
              </h2>
            </div>
            {!loading && followUpsToShow.length > 0 && (
              <span
                className="text-[11px] font-bold rounded-full px-2.5 py-0.5"
                style={{ background: 'rgba(96,165,250,0.2)', color: '#60a5fa', border: '1px solid rgba(96,165,250,0.3)' }}
              >
                {followUpsToShow.length}
              </span>
            )}
          </div>

          {loading ? (
            <div className="rounded-2xl px-4 py-6 text-center" style={glass}>
              <p className="text-blue-300/70 text-sm">Loading…</p>
            </div>
          ) : error ? (
            <div className="rounded-2xl px-4 py-5 text-center" style={glass}>
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          ) : followUpsToShow.length === 0 ? (
            <div className="rounded-2xl px-4 py-6 text-center" style={glass}>
              <p className="text-blue-300/70 text-sm">
                {dayFilter ? 'No follow-ups on this day.' : 'No upcoming follow-up visits.'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {followUpsToShow.map((fu) => (
                <div key={fu.id} className="rounded-2xl px-4 py-3.5" style={glassStrong}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-semibold leading-snug truncate">
                        {fu.debtorName ?? 'Unknown Debtor'}
                      </p>
                      {fu.accountNumber && (
                        <p className="text-blue-300/80 text-xs mt-0.5">
                          Account #{fu.accountNumber}
                        </p>
                      )}
                    </div>
                    {/* Show the date when viewing all upcoming */}
                    {!dayFilter && fu.scheduledDate && (
                      <p className="text-blue-400/80 text-xs font-medium shrink-0">
                        {formatDateLabel(fu.scheduledDate)}
                      </p>
                    )}
                  </div>
                  <p className="text-blue-300/70 text-xs mt-1.5 capitalize">
                    {fu.remarkType.replace(/_/g, ' ')}
                  </p>
                  {fu.notes && (
                    <p className="text-blue-200/60 text-xs mt-1 italic leading-relaxed">
                      {fu.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

      </div>

      {/* ── Bottom Navigation ── */}
      <div
        className="fixed bottom-0 left-0 right-0 flex items-center justify-around px-6 py-5"
        style={{
          background: 'rgba(13, 27, 56, 0.97)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(16px)',
        }}
      >
        <button
          type="button"
          onClick={() => navigate('/fo')}
          className="flex flex-col items-center gap-1 text-blue-400/60"
          aria-label="Home"
        >
          <Home className="w-6 h-6" />
        </button>

        <button
          type="button"
          onClick={() => navigate('/fo/schedule')}
          className="flex flex-col items-center gap-1 text-white"
          aria-label="Schedule"
        >
          <CalendarDays className="w-6 h-6" />
        </button>

        <button
          type="button"
          onClick={() => navigate('/fo/settings')}
          className="flex flex-col items-center gap-1 text-blue-400/60"
          aria-label="Settings"
        >
          <Settings className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
