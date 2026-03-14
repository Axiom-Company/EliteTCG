import { useState, useEffect, useRef } from 'react';
import { dashboardApi } from '../hooks/useApi';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip as ChartTooltip,
  ArcElement,
  Legend,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, ChartTooltip, ArcElement, Legend);

// Global Chart.js defaults for dark theme
ChartJS.defaults.color = '#6b6b6b';
ChartJS.defaults.font.size = 11;
ChartJS.defaults.font.family = 'Inter, system-ui, sans-serif';

const STATUS_COLORS_MAP = {
  pending_payment: '#f59e0b',
  paid: '#10b981',
  confirmed: '#3b82f6',
  shipped: '#8b5cf6',
  in_transit: '#6366f1',
  delivered: '#22c55e',
  cancelled: '#ef4444',
  refunded: '#f97316',
};

const STATUS_BADGE_COLORS = {
  pending_payment: 'bg-amber-900/30 text-amber-400 border-amber-800/40',
  paid: 'bg-emerald-900/30 text-emerald-400 border-emerald-800/40',
  confirmed: 'bg-blue-900/30 text-blue-400 border-blue-800/40',
  shipped: 'bg-purple-900/30 text-purple-400 border-purple-800/40',
  in_transit: 'bg-indigo-900/30 text-indigo-400 border-indigo-800/40',
  delivered: 'bg-green-900/30 text-green-400 border-green-800/40',
  cancelled: 'bg-red-900/30 text-red-400 border-red-800/40',
  refunded: 'bg-orange-900/30 text-orange-400 border-orange-800/40',
};

const formatCurrency = (val) =>
  `R${(val || 0).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatDate = (dateStr) => {
  if (!dateStr) return '\u2014';
  return new Date(dateStr).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short' });
};

const formatChartDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${d.getDate()} ${d.toLocaleDateString('en-ZA', { month: 'short' })}`;
};

const SkeletonCard = () => (
  <div className="bg-[#111111] border border-[#282828] rounded-xl p-5 animate-pulse">
    <div className="h-2.5 bg-[#1e1e1e] rounded w-20 mb-3" />
    <div className="h-7 bg-[#1e1e1e] rounded w-24" />
  </div>
);

const SkeletonChart = () => (
  <div className="bg-[#111111] border border-[#282828] rounded-xl p-5 animate-pulse">
    <div className="h-3 bg-[#1e1e1e] rounded w-28 mb-2" />
    <div className="h-2.5 bg-[#1e1e1e] rounded w-20 mb-5" />
    <div className="h-[180px] bg-[#1e1e1e] rounded" />
  </div>
);

const StatusBadge = ({ status }) => (
  <span
    className={`inline-block px-2 py-0.5 text-[10px] font-medium rounded-full border capitalize ${
      STATUS_BADGE_COLORS[status] || 'bg-[#1e1e1e] text-[#6b6b6b] border-[#2e2e2e]'
    }`}
  >
    {(status || '').replace(/_/g, ' ')}
  </span>
);

/* ── Revenue Line Chart ── */
const RevenueChart = ({ data }) => {
  const chartRef = useRef(null);

  const labels = data.map((d) => formatChartDate(d.date));
  const values = data.map((d) => d.revenue_zar || 0);

  const chartData = {
    labels,
    datasets: [
      {
        data: values,
        borderColor: '#3ECF8E',
        borderWidth: 2,
        pointRadius: 3,
        pointBackgroundColor: '#3ECF8E',
        pointBorderColor: '#111111',
        pointBorderWidth: 2,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: '#3ECF8E',
        pointHoverBorderColor: '#111111',
        pointHoverBorderWidth: 2,
        fill: true,
        backgroundColor: (ctx) => {
          const chart = ctx.chart;
          const { ctx: canvasCtx, chartArea } = chart;
          if (!chartArea) return 'transparent';
          const gradient = canvasCtx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, 'rgba(62, 207, 142, 0.12)');
          gradient.addColorStop(1, 'rgba(62, 207, 142, 0)');
          return gradient;
        },
        tension: 0.35,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1c1c1c',
        borderColor: '#282828',
        borderWidth: 1,
        titleColor: '#6b6b6b',
        titleFont: { size: 11, weight: 'normal' },
        bodyColor: '#f1f1f1',
        bodyFont: { size: 13, weight: '500' },
        padding: { top: 8, bottom: 8, left: 12, right: 12 },
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          title: (items) => items[0]?.label || '',
          label: (item) => {
            const d = data[item.dataIndex];
            const lines = [formatCurrency(item.raw)];
            if (d?.order_count != null) {
              lines.push(`${d.order_count} order${d.order_count !== 1 ? 's' : ''}`);
            }
            return lines;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: {
          maxTicksLimit: 7,
          maxRotation: 0,
          color: '#6b6b6b',
          font: { size: 10 },
        },
      },
      y: {
        grid: {
          color: '#1e1e1e',
          drawBorder: false,
        },
        border: { display: false },
        ticks: {
          color: '#6b6b6b',
          font: { size: 10 },
          callback: (v) => (v >= 1000 ? `R${(v / 1000).toFixed(0)}k` : `R${v}`),
        },
        beginAtZero: true,
      },
    },
  };

  return <Line ref={chartRef} data={chartData} options={options} />;
};

/* ── Status Doughnut Chart ── */
const StatusChart = ({ data }) => {
  const chartData = {
    labels: data.map((d) => (d.status || '').replace(/_/g, ' ')),
    datasets: [
      {
        data: data.map((d) => d.count),
        backgroundColor: data.map((d) => STATUS_COLORS_MAP[d.status] || '#4a4a4a'),
        borderColor: '#111111',
        borderWidth: 2,
        hoverBorderColor: '#111111',
        hoverOffset: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '60%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#6b6b6b',
          font: { size: 10 },
          boxWidth: 8,
          boxHeight: 8,
          borderRadius: 4,
          useBorderRadius: true,
          padding: 12,
        },
      },
      tooltip: {
        backgroundColor: '#1c1c1c',
        borderColor: '#282828',
        borderWidth: 1,
        titleColor: '#6b6b6b',
        titleFont: { size: 11, weight: 'normal' },
        bodyColor: '#f1f1f1',
        bodyFont: { size: 13, weight: '500' },
        padding: { top: 8, bottom: 8, left: 12, right: 12 },
        cornerRadius: 8,
        displayColors: true,
        boxWidth: 8,
        boxHeight: 8,
        callbacks: {
          title: (items) => items[0]?.label || '',
          label: (item) => ` ${item.raw} order${item.raw !== 1 ? 's' : ''}`,
        },
      },
    },
  };

  return <Doughnut data={chartData} options={options} />;
};

/* ── Main Dashboard ── */
const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await dashboardApi.getStats();
        setData(result);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = data?.stats || {};
  const revenueByDay = data?.revenue_by_day || [];
  const statusBreakdown = data?.status_breakdown || [];
  const recentOrders = (data?.recent_orders || []).slice(0, 5);

  const statCards = [
    {
      label: 'Total Revenue',
      value: formatCurrency(stats.total_revenue_zar),
      sub: `${formatCurrency(stats.revenue_this_week_zar)} this week`,
    },
    {
      label: 'Total Orders',
      value: stats.total_orders ?? 0,
      sub: `${stats.orders_this_month ?? 0} this month`,
    },
    {
      label: 'Avg Order Value',
      value: formatCurrency(stats.avg_order_value_zar),
      sub: `${formatCurrency(stats.revenue_this_month_zar)} this month`,
    },
    {
      label: 'Orders Today',
      value: stats.orders_today ?? 0,
      sub: `${formatCurrency(stats.revenue_today_zar)} today`,
    },
  ];

  if (loading) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-base font-medium text-[#f1f1f1]">Dashboard</h1>
          <p className="text-sm text-[#6b6b6b] mt-0.5">Sales overview</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <SkeletonChart />
          <SkeletonChart />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-base font-medium text-[#f1f1f1]">Dashboard</h1>
          <p className="text-sm text-[#6b6b6b] mt-0.5">Sales overview</p>
        </div>
        <div className="px-4 py-3 rounded-lg text-sm mb-5 border bg-red-950/30 text-red-400 border-red-900/30">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-base font-medium text-[#f1f1f1]">Dashboard</h1>
        <p className="text-sm text-[#6b6b6b] mt-0.5">Sales overview</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {statCards.map(({ label, value, sub }) => (
          <div
            key={label}
            className="bg-[#111111] border border-[#282828] rounded-xl p-4 sm:p-5"
          >
            <p className="text-[10px] font-medium text-[#6b6b6b] uppercase tracking-wider">
              {label}
            </p>
            <p className="text-xl sm:text-2xl font-medium text-[#f1f1f1] mt-1 truncate">{value}</p>
            {sub && <p className="text-xs text-[#4a4a4a] mt-1 truncate">{sub}</p>}
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {/* Revenue Chart */}
        <div className="bg-[#111111] border border-[#282828] rounded-xl p-4 sm:p-5">
          <p className="text-sm text-[#f1f1f1]">Revenue</p>
          <p className="text-xs text-[#6b6b6b] mt-0.5 mb-4">Last 30 days</p>
          <div className="h-[180px] sm:h-[200px]">
            {revenueByDay.length === 0 ? (
              <div className="flex items-center justify-center h-full text-sm text-[#4a4a4a]">
                No revenue data
              </div>
            ) : (
              <RevenueChart data={revenueByDay} />
            )}
          </div>
        </div>

        {/* Status Chart */}
        <div className="bg-[#111111] border border-[#282828] rounded-xl p-4 sm:p-5">
          <p className="text-sm text-[#f1f1f1]">Order Status</p>
          <p className="text-xs text-[#6b6b6b] mt-0.5 mb-4">Breakdown</p>
          <div className="h-[180px] sm:h-[200px]">
            {statusBreakdown.length === 0 ? (
              <div className="flex items-center justify-center h-full text-sm text-[#4a4a4a]">
                No order data
              </div>
            ) : (
              <StatusChart data={statusBreakdown} />
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-[#111111] border border-[#282828] rounded-xl overflow-hidden">
        <div className="px-4 sm:px-5 py-3.5 border-b border-[#282828]">
          <p className="text-sm text-[#f1f1f1]">Recent Orders</p>
        </div>

        {recentOrders.length === 0 ? (
          <div className="py-12 text-center text-sm text-[#4a4a4a]">
            No orders yet
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block">
              <div className="flex items-center gap-4 px-4 py-2.5 border-b border-[#282828] text-[10px] font-medium text-[#6b6b6b] uppercase tracking-wider">
                <div className="w-24">Order #</div>
                <div className="flex-1">Customer</div>
                <div className="w-24 text-right">Total</div>
                <div className="w-24">Status</div>
                <div className="w-24">Date</div>
              </div>
              {recentOrders.map((order) => (
                <div
                  key={order.order_number}
                  className="flex items-center gap-4 px-4 py-3.5 border-b border-[#1e1e1e] last:border-b-0 hover:bg-[#1a1a1a] transition-colors"
                >
                  <div className="w-24 text-sm font-medium text-[#3ECF8E]">
                    {order.order_number}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#f1f1f1] truncate">
                      {order.guest_name || '\u2014'}
                    </p>
                    <p className="text-xs text-[#4a4a4a] truncate">
                      {order.guest_email || '\u2014'}
                    </p>
                  </div>
                  <div className="w-24 text-sm font-medium text-[#f1f1f1] text-right">
                    {formatCurrency(order.total_zar)}
                  </div>
                  <div className="w-24">
                    <StatusBadge status={order.order_status} />
                  </div>
                  <div className="w-24 text-xs text-[#6b6b6b]">
                    {formatDate(order.created_at)}
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden divide-y divide-[#1e1e1e]">
              {recentOrders.map((order) => (
                <div key={order.order_number} className="px-4 py-3.5">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-[#3ECF8E]">
                      {order.order_number}
                    </span>
                    <StatusBadge status={order.order_status} />
                  </div>
                  <p className="text-sm text-[#f1f1f1] truncate">
                    {order.guest_name || '\u2014'}
                  </p>
                  <p className="text-xs text-[#4a4a4a] truncate mb-1.5">
                    {order.guest_email || '\u2014'}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[#f1f1f1]">
                      {formatCurrency(order.total_zar)}
                    </span>
                    <span className="text-xs text-[#6b6b6b]">
                      {formatDate(order.created_at)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
