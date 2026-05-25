import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ChevronLeft, ChevronRight, Home, CalendarDays, Settings } from 'lucide-react';
import { fetchScheduledVisits, type VisitResponse } from '../../shared/api/visits';

// ── Helpers ──────────────────────────────────────────────────────────────────
const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
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

function getEventsForDay(events: VisitResponse[], year: number, month: number, day: number) {
  const key = formatDateKey(year, month, day);
  return events.filter((event) => event.ptpDate === key || event.scheduledDate === key);
}

// ── Component ────────────────────────────────────────────────────────────────
export function ScheduleScreen() {
  const navigate = useNavigate();
  const today = new Date();

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<number>(today.getDate());
  const [events, setEvents] = useState<VisitResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const updateMonth = (year: number, month: number) => {
    const maxDay = getDaysInMonth(year, month);
    setViewYear(year);
    setViewMonth(month);
    setSelectedDate((current) => Math.min(current, maxDay));
  };

  const prevMonth = () => {
    if (viewMonth === 0) {
      updateMonth(viewYear - 1, 11);
    } else {
      updateMonth(viewYear, viewMonth - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      updateMonth(viewYear + 1, 0);
    } else {
      updateMonth(viewYear, viewMonth + 1);
    }
  };

  const isToday = (day: number) =>
    day === today.getDate() &&
    viewMonth === today.getMonth() &&
    viewYear === today.getFullYear();

  const isSelected = (day: number) => day === selectedDate;

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetchScheduledVisits()
      .then((data) => {
        setEvents(data);
      })
      .catch(() => {
        setError('Unable to load scheduled visits. Please try again.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const selectedDateKey = formatDateKey(viewYear, viewMonth, selectedDate);

  const ptpForDay = events.filter((event) => event.ptpDate === selectedDateKey);

  const followUpsForDay = events.filter(
    (event) => event.scheduledDate === selectedDateKey
  );

  // Glass card style
  const glass = {
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.11)',
  } as React.CSSProperties;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(160deg, #0d1b38 0%, #112044 50%, #0d1b38 100%)' }}
    >
      {/* ── Top bar ── */}
      <div
        className="px-5 pt-8 pb-4 text-center"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
      >
        <h1 className="text-white text-lg font-semibold tracking-tight">Schedule Calendar</h1>
      </div>

      {/* ── Scrollable body ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-28 space-y-4">

        {/* Calendar card */}
        <div className="rounded-2xl p-4" style={glass}>
          {/* Month nav */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1.5 rounded-full text-blue-300 hover:bg-white/10 transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-white font-semibold text-sm tracking-wide">
              {MONTHS[viewMonth].toUpperCase()} {viewYear}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="p-1.5 rounded-full text-blue-300 hover:bg-white/10 transition-colors"
              aria-label="Next month"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-2 mb-4 text-[11px] text-blue-200">
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-400" /> Follow-up
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-400" /> PTP
            </span>
          </div>

          {/* Day-of-week headers */}
          <div className="grid grid-cols-7 mb-2">
            {DAYS.map((d, i) => (
              <div key={i} className="text-center text-blue-300 text-xs font-medium py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7">
            {/* Empty cells before first day */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const selected = isSelected(day);
              const todayCell = isToday(day);
              const dayKey = formatDateKey(viewYear, viewMonth, day);
              const dayEvents = getEventsForDay(events, viewYear, viewMonth, day);
              const hasFollowUp = dayEvents.some((event) => event.scheduledDate === dayKey);
              const hasPTP = dayEvents.some((event) => event.ptpDate === dayKey);

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => setSelectedDate(day)}
                  className="flex flex-col items-center justify-center aspect-square text-sm font-medium transition-all rounded-full mx-auto w-9 h-9"
                  style={
                    selected
                      ? { background: 'rgba(59,130,246,0.85)', color: '#fff' }
                      : todayCell
                      ? { color: '#93c5fd', fontWeight: 700 }
                      : { color: 'rgba(255,255,255,0.75)' }
                  }
                  aria-label={`${MONTHS[viewMonth]} ${day}`}
                  aria-pressed={selected}
                >
                  <span>{day}</span>
                  <span className="mt-1 flex items-center gap-1">
                    {hasFollowUp && <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />}
                    {hasPTP && <span className="w-1.5 h-1.5 rounded-full bg-green-400" />}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── PTP Reminders ── */}
        <section>
          <div className="flex items-center justify-between mb-2 px-1">
            <h2 className="text-white font-semibold text-base">PTP Reminders</h2>
            <ChevronRight className="w-4 h-4 text-blue-400" />
          </div>

          {loading ? (
            <div className="rounded-2xl px-4 py-5 text-center" style={glass}>
              <p className="text-blue-300 text-sm">Loading scheduled events...</p>
            </div>
          ) : error ? (
            <div className="rounded-2xl px-4 py-5 text-center" style={glass}>
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          ) : ptpForDay.length === 0 ? (
            <div className="rounded-2xl px-4 py-5 text-center" style={glass}>
              <p className="text-blue-300 text-sm">No promise-to-pay reminders scheduled.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {ptpForDay.map((ptp) => (
                <div key={ptp.id} className="rounded-2xl px-4 py-3 flex items-center justify-between" style={glass}>
                  <div>
                    <p className="text-white text-sm font-medium">Account {ptp.accountId}</p>
                    <p className="text-blue-300 text-xs">PTP Amount due</p>
                  </div>
                  <span className="text-red-300 font-semibold text-sm">
                    ₱{(ptp.ptpAmount ?? 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Scheduled Follow-ups ── */}
        <section>
          <div className="flex items-center justify-between mb-2 px-1">
            <h2 className="text-white font-semibold text-base">Scheduled Follow-ups</h2>
            <ChevronRight className="w-4 h-4 text-blue-400" />
          </div>

          {loading ? (
            <div className="rounded-2xl px-4 py-5 text-center" style={glass}>
              <p className="text-blue-300 text-sm">Loading scheduled events...</p>
            </div>
          ) : error ? (
            <div className="rounded-2xl px-4 py-5 text-center" style={glass}>
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          ) : followUpsForDay.length === 0 ? (
            <div className="rounded-2xl px-4 py-5 text-center" style={glass}>
              <p className="text-blue-300 text-sm">No follow-up visits scheduled.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {followUpsForDay.map((fu) => (
                <div key={fu.id} className="rounded-2xl px-4 py-3" style={glass}>
                  <p className="text-white text-sm font-medium">Account {fu.accountId}</p>
                  <p className="text-blue-300 text-xs mt-1">Remark: {fu.remarkType.replace(/_/g, ' ')}</p>
                  {fu.notes && <p className="text-blue-300 text-xs mt-1">{fu.notes}</p>}
                </div>
              ))}
            </div>
          )}
        </section>

      </div>

      {/* ── Bottom Navigation ── */}
      <div
        className="fixed bottom-0 left-0 right-0 flex items-center justify-around px-6 py-3"
        style={{
          background: 'rgba(13, 27, 56, 0.95)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <button
          type="button"
          onClick={() => navigate('/fo')}
          className="flex flex-col items-center gap-1 text-blue-400 opacity-60"
          aria-label="Home"
        >
          <Home className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={() => navigate('/fo/schedule')}
          className="flex flex-col items-center gap-1 text-white"
          aria-label="Schedule"
        >
          <CalendarDays className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={() => navigate('/fo/settings')}
          className="flex flex-col items-center gap-1 text-blue-400 opacity-60"
          aria-label="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}