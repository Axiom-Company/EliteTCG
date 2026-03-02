import { useState, useEffect } from 'react';
import { emailAdminApi } from '../hooks/useApi';
import {
  Search,
  Mail,
  AlertTriangle,
  Eye,
  MousePointerClick,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';

const PAGE_SIZE = 20;

const EMAIL_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'welcome', label: 'Welcome' },
  { value: 'order_confirmation', label: 'Order Confirmation' },
  { value: 'shipping_notification', label: 'Shipping Notification' },
  { value: 'delivery_confirmation', label: 'Delivery Confirmation' },
  { value: 'payment_failed', label: 'Payment Failed' },
  { value: 'refund_confirmation', label: 'Refund Confirmation' },
  { value: 'order_cancelled', label: 'Order Cancelled' },
  { value: 'back_in_stock', label: 'Back In Stock' },
  { value: 'abandoned_cart', label: 'Abandoned Cart' },
  { value: 'new_drop_alert', label: 'New Drop Alert' },
  { value: 'raw', label: 'Raw' },
];

const LOG_STATUSES = [
  { value: '', label: 'All Statuses' },
  { value: 'sent', label: 'Sent' },
  { value: 'failed', label: 'Failed' },
];

const EVENT_TYPES = [
  { value: '', label: 'All Events' },
  { value: 'softbounce', label: 'Soft Bounce' },
  { value: 'hardbounce', label: 'Hard Bounce' },
  { value: 'open', label: 'Open' },
  { value: 'click', label: 'Click' },
];

const STATUS_BADGE = {
  sent: 'bg-emerald-900/30 text-emerald-400 border-emerald-800/40',
  failed: 'bg-red-900/30 text-red-400 border-red-800/40',
};

const EVENT_BADGE = {
  softbounce: 'bg-amber-900/30 text-amber-400 border-amber-800/40',
  hardbounce: 'bg-red-900/30 text-red-400 border-red-800/40',
  open: 'bg-blue-900/30 text-blue-400 border-blue-800/40',
  click: 'bg-purple-900/30 text-purple-400 border-purple-800/40',
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return '\u2014';
  const d = new Date(dateStr);
  return `${d.toLocaleDateString('en-ZA')} ${d.toLocaleTimeString('en-ZA')}`;
};

const formatType = (type) => {
  if (!type) return '\u2014';
  return type
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

const Badge = ({ value, colors }) => (
  <span
    className={`inline-block px-2 py-0.5 text-[10px] font-medium rounded-full border whitespace-nowrap ${
      colors[value] || 'bg-[#1e1e1e] text-[#6b6b6b] border-[#2e2e2e]'
    }`}
  >
    {formatType(value)}
  </span>
);

const SkeletonCard = () => (
  <div className="bg-[#111111] border border-[#282828] rounded-xl p-5 animate-pulse">
    <div className="h-2.5 bg-[#1e1e1e] rounded w-20 mb-3" />
    <div className="h-7 bg-[#1e1e1e] rounded w-24" />
  </div>
);

const SkeletonRow = () => (
  <tr className="border-b border-[#1e1e1e] animate-pulse">
    <td className="px-4 py-3"><div className="h-3.5 bg-[#1e1e1e] rounded w-32" /></td>
    <td className="px-4 py-3"><div className="h-3.5 bg-[#1e1e1e] rounded w-20" /></td>
    <td className="px-4 py-3"><div className="h-3.5 bg-[#1e1e1e] rounded w-40" /></td>
    <td className="px-4 py-3"><div className="h-4 bg-[#1e1e1e] rounded-full w-14" /></td>
    <td className="px-4 py-3"><div className="h-3.5 bg-[#1e1e1e] rounded w-28" /></td>
  </tr>
);

const EmailManagement = () => {
  const [activeTab, setActiveTab] = useState('logs');
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Logs state
  const [logs, setLogs] = useState([]);
  const [logsTotal, setLogsTotal] = useState(0);
  const [logsPage, setLogsPage] = useState(1);
  const [logsLoading, setLogsLoading] = useState(true);
  const [logSearch, setLogSearch] = useState('');
  const [logStatusFilter, setLogStatusFilter] = useState('');
  const [logTypeFilter, setLogTypeFilter] = useState('');

  // Events state
  const [events, setEvents] = useState([]);
  const [eventsTotal, setEventsTotal] = useState(0);
  const [eventsPage, setEventsPage] = useState(1);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventSearch, setEventSearch] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState('');

  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      const data = await emailAdminApi.getStats();
      setStats(data);
    } catch (err) {
      console.error('Email stats fetch error:', err);
      setError(err.message || 'Failed to load email stats');
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchLogs = async () => {
    setLogsLoading(true);
    try {
      const params = { page: logsPage, page_size: PAGE_SIZE };
      if (logSearch) params.search = logSearch;
      if (logStatusFilter) params.status = logStatusFilter;
      if (logTypeFilter) params.email_type = logTypeFilter;
      const data = await emailAdminApi.getLogs(params);
      setLogs(data.logs || []);
      setLogsTotal(data.total || 0);
    } catch (err) {
      console.error('Email logs fetch error:', err);
    } finally {
      setLogsLoading(false);
    }
  };

  const fetchEvents = async () => {
    setEventsLoading(true);
    try {
      const params = { page: eventsPage, page_size: PAGE_SIZE };
      if (eventSearch) params.search = eventSearch;
      if (eventTypeFilter) params.event_type = eventTypeFilter;
      const data = await emailAdminApi.getEvents(params);
      setEvents(data.events || []);
      setEventsTotal(data.total || 0);
    } catch (err) {
      console.error('Email events fetch error:', err);
    } finally {
      setEventsLoading(false);
    }
  };

  // Fetch stats on mount
  useEffect(() => {
    fetchStats();
  }, []);

  // Fetch logs when filters or page change
  useEffect(() => {
    if (activeTab === 'logs') fetchLogs();
  }, [activeTab, logsPage, logSearch, logStatusFilter, logTypeFilter]);

  // Fetch events when filters or page change
  useEffect(() => {
    if (activeTab === 'events') fetchEvents();
  }, [activeTab, eventsPage, eventSearch, eventTypeFilter]);

  // Reset page to 1 when filters change
  useEffect(() => { setLogsPage(1); }, [logSearch, logStatusFilter, logTypeFilter]);
  useEffect(() => { setEventsPage(1); }, [eventSearch, eventTypeFilter]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    if (activeTab === 'logs') {
      await fetchLogs();
    } else {
      await fetchEvents();
    }
    setRefreshing(false);
  };

  const logsTotalPages = Math.max(1, Math.ceil(logsTotal / PAGE_SIZE));
  const eventsTotalPages = Math.max(1, Math.ceil(eventsTotal / PAGE_SIZE));

  const statCards = stats
    ? [
        {
          label: 'Total Sent',
          value: stats.total_sent ?? 0,
          color: 'text-emerald-400',
          icon: Mail,
        },
        {
          label: 'Failed',
          value: stats.total_failed ?? 0,
          color: 'text-red-400',
          icon: AlertTriangle,
        },
        {
          label: 'Bounces',
          value: stats.total_bounces ?? 0,
          color: 'text-amber-400',
          sub: `${stats.total_soft_bounces ?? 0} soft / ${stats.total_hard_bounces ?? 0} hard`,
          icon: AlertTriangle,
        },
        {
          label: 'Open Rate',
          value: `${((stats.open_rate ?? 0) * 100).toFixed(1)}%`,
          color: 'text-blue-400',
          icon: Eye,
        },
        {
          label: 'Click Rate',
          value: `${((stats.click_rate ?? 0) * 100).toFixed(1)}%`,
          color: 'text-purple-400',
          icon: MousePointerClick,
        },
        {
          label: 'Bounce Rate',
          value: `${((stats.bounce_rate ?? 0) * 100).toFixed(1)}%`,
          color: 'text-red-400',
          icon: AlertTriangle,
        },
      ]
    : [];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-base font-medium text-[#f1f1f1]">Email Delivery</h1>
          <p className="text-sm text-[#6b6b6b] mt-0.5">
            Monitor sent emails, bounces, opens, and clicks
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-2 rounded-lg border border-[#282828] bg-[#111111] text-[#6b6b6b] hover:text-[#f1f1f1] hover:border-[#3a3a3a] transition-colors disabled:opacity-50"
        >
          <RefreshCw
            className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`}
            strokeWidth={1.5}
          />
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-3 rounded-lg text-sm mb-5 border bg-red-950/30 text-red-400 border-red-900/30">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {statsLoading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          : statCards.map(({ label, value, color, sub, icon: Icon }) => (
              <div
                key={label}
                className="bg-[#111111] border border-[#282828] rounded-xl p-4 sm:p-5"
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[10px] font-medium text-[#6b6b6b] uppercase tracking-wider">
                    {label}
                  </p>
                  <Icon className="w-3.5 h-3.5 text-[#282828]" strokeWidth={1.5} />
                </div>
                <p className={`text-xl sm:text-2xl font-medium ${color} mt-1 truncate`}>
                  {value}
                </p>
                {sub && (
                  <p className="text-xs text-[#4a4a4a] mt-1 truncate">{sub}</p>
                )}
              </div>
            ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-5">
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
            activeTab === 'logs'
              ? 'text-[#f1f1f1] bg-[#1c1c1c] border-[#282828]'
              : 'text-[#6b6b6b] bg-transparent border-transparent hover:text-[#c4c4c4]'
          }`}
        >
          Send Log
        </button>
        <button
          onClick={() => setActiveTab('events')}
          className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
            activeTab === 'events'
              ? 'text-[#f1f1f1] bg-[#1c1c1c] border-[#282828]'
              : 'text-[#6b6b6b] bg-transparent border-transparent hover:text-[#c4c4c4]'
          }`}
        >
          Webhook Events
        </button>
      </div>

      {/* Send Log Tab */}
      {activeTab === 'logs' && (
        <div>
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <div className="relative w-full sm:w-auto">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#4a4a4a]"
                strokeWidth={1.5}
              />
              <input
                type="text"
                placeholder="Search email or subject..."
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                className="pl-9 pr-3 h-9 w-full sm:w-[240px] bg-[#111111] border border-[#282828] rounded-lg text-sm text-[#f1f1f1] placeholder-[#4a4a4a] outline-none focus:border-[#3ECF8E] transition-colors"
              />
            </div>
            <select
              value={logStatusFilter}
              onChange={(e) => setLogStatusFilter(e.target.value)}
              className="h-9 px-3 bg-[#171717] border border-[#282828] rounded-lg text-sm text-[#a0a0a0] outline-none focus:border-[#3ECF8E] transition-colors cursor-pointer"
            >
              {LOG_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            <select
              value={logTypeFilter}
              onChange={(e) => setLogTypeFilter(e.target.value)}
              className="h-9 px-3 bg-[#171717] border border-[#282828] rounded-lg text-sm text-[#a0a0a0] outline-none focus:border-[#3ECF8E] transition-colors cursor-pointer"
            >
              {EMAIL_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Table */}
          <div className="bg-[#111111] border border-[#282828] rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#282828]">
                    <th className="px-4 py-3 text-[#6b6b6b] text-xs uppercase font-medium tracking-wider">
                      Email
                    </th>
                    <th className="px-4 py-3 text-[#6b6b6b] text-xs uppercase font-medium tracking-wider">
                      Type
                    </th>
                    <th className="px-4 py-3 text-[#6b6b6b] text-xs uppercase font-medium tracking-wider">
                      Subject
                    </th>
                    <th className="px-4 py-3 text-[#6b6b6b] text-xs uppercase font-medium tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-[#6b6b6b] text-xs uppercase font-medium tracking-wider">
                      Sent At
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {logsLoading ? (
                    Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
                  ) : logs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-16 text-center">
                        <Mail
                          className="w-10 h-10 text-[#282828] mx-auto mb-3"
                          strokeWidth={1}
                        />
                        <p className="text-sm text-[#4a4a4a]">No email logs found</p>
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr
                        key={log.id}
                        className="border-b border-[#1e1e1e] hover:bg-[#1a1a1a] transition-colors"
                      >
                        <td className="px-4 py-3">
                          <span className="block truncate max-w-[200px] text-[#f1f1f1]">
                            {log.user_email || '\u2014'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[#a0a0a0] whitespace-nowrap">
                          {formatType(log.email_type)}
                        </td>
                        <td className="px-4 py-3">
                          <span className="block truncate max-w-[200px] text-[#a0a0a0]">
                            {log.subject || '\u2014'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Badge value={log.status} colors={STATUS_BADGE} />
                        </td>
                        <td className="px-4 py-3 text-[#6b6b6b] whitespace-nowrap">
                          {formatDateTime(log.sent_at)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {logsTotalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-[#282828]">
                <p className="text-xs text-[#4a4a4a]">
                  Page {logsPage} of {logsTotalPages}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setLogsPage((p) => Math.max(1, p - 1))}
                    disabled={logsPage <= 1}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg border border-[#282828] bg-[#171717] text-[#a0a0a0] hover:text-[#f1f1f1] hover:border-[#3a3a3a] transition-colors disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    Previous
                  </button>
                  <button
                    onClick={() => setLogsPage((p) => Math.min(logsTotalPages, p + 1))}
                    disabled={logsPage >= logsTotalPages}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg border border-[#282828] bg-[#171717] text-[#a0a0a0] hover:text-[#f1f1f1] hover:border-[#3a3a3a] transition-colors disabled:opacity-30 disabled:pointer-events-none"
                  >
                    Next
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Webhook Events Tab */}
      {activeTab === 'events' && (
        <div>
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <div className="relative w-full sm:w-auto">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#4a4a4a]"
                strokeWidth={1.5}
              />
              <input
                type="text"
                placeholder="Search recipient or subject..."
                value={eventSearch}
                onChange={(e) => setEventSearch(e.target.value)}
                className="pl-9 pr-3 h-9 w-full sm:w-[240px] bg-[#111111] border border-[#282828] rounded-lg text-sm text-[#f1f1f1] placeholder-[#4a4a4a] outline-none focus:border-[#3ECF8E] transition-colors"
              />
            </div>
            <select
              value={eventTypeFilter}
              onChange={(e) => setEventTypeFilter(e.target.value)}
              className="h-9 px-3 bg-[#171717] border border-[#282828] rounded-lg text-sm text-[#a0a0a0] outline-none focus:border-[#3ECF8E] transition-colors cursor-pointer"
            >
              {EVENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Table */}
          <div className="bg-[#111111] border border-[#282828] rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#282828]">
                    <th className="px-4 py-3 text-[#6b6b6b] text-xs uppercase font-medium tracking-wider">
                      Event
                    </th>
                    <th className="px-4 py-3 text-[#6b6b6b] text-xs uppercase font-medium tracking-wider">
                      Recipient
                    </th>
                    <th className="px-4 py-3 text-[#6b6b6b] text-xs uppercase font-medium tracking-wider">
                      Subject
                    </th>
                    <th className="px-4 py-3 text-[#6b6b6b] text-xs uppercase font-medium tracking-wider">
                      Bounce Details
                    </th>
                    <th className="px-4 py-3 text-[#6b6b6b] text-xs uppercase font-medium tracking-wider">
                      Received At
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {eventsLoading ? (
                    Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
                  ) : events.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-16 text-center">
                        <Eye
                          className="w-10 h-10 text-[#282828] mx-auto mb-3"
                          strokeWidth={1}
                        />
                        <p className="text-sm text-[#4a4a4a]">No webhook events found</p>
                      </td>
                    </tr>
                  ) : (
                    events.map((event) => {
                      const isBounce =
                        event.event_type === 'softbounce' ||
                        event.event_type === 'hardbounce';
                      return (
                        <tr
                          key={event.id}
                          className="border-b border-[#1e1e1e] hover:bg-[#1a1a1a] transition-colors"
                        >
                          <td className="px-4 py-3">
                            <Badge value={event.event_type} colors={EVENT_BADGE} />
                          </td>
                          <td className="px-4 py-3">
                            <span className="block truncate max-w-[200px] text-[#f1f1f1]">
                              {event.recipient_email || '\u2014'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="block truncate max-w-[200px] text-[#a0a0a0]">
                              {event.subject || '\u2014'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {isBounce ? (
                              <div>
                                <p className="text-xs text-[#a0a0a0]">
                                  {formatType(event.bounce_type) || '\u2014'}
                                </p>
                                {event.bounce_reason && (
                                  <p className="text-xs text-[#6b6b6b] truncate max-w-[200px] mt-0.5">
                                    {event.bounce_reason}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <span className="text-[#4a4a4a]">{'\u2014'}</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-[#6b6b6b] whitespace-nowrap">
                            {formatDateTime(event.received_at)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {eventsTotalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-[#282828]">
                <p className="text-xs text-[#4a4a4a]">
                  Page {eventsPage} of {eventsTotalPages}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEventsPage((p) => Math.max(1, p - 1))}
                    disabled={eventsPage <= 1}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg border border-[#282828] bg-[#171717] text-[#a0a0a0] hover:text-[#f1f1f1] hover:border-[#3a3a3a] transition-colors disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    Previous
                  </button>
                  <button
                    onClick={() =>
                      setEventsPage((p) => Math.min(eventsTotalPages, p + 1))
                    }
                    disabled={eventsPage >= eventsTotalPages}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg border border-[#282828] bg-[#171717] text-[#a0a0a0] hover:text-[#f1f1f1] hover:border-[#3a3a3a] transition-colors disabled:opacity-30 disabled:pointer-events-none"
                  >
                    Next
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailManagement;
