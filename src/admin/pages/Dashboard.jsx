import { useState, useEffect } from 'react';
import { productsApi, setsApi } from '../hooks/useApi';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const API_BASE = 'http://localhost:3001';
const COLORS = ['#3ECF8E', '#E3350D', '#a0a0a0', '#4a4a4a'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1c1c1c] px-3 py-2 rounded-lg border border-[#282828]">
        <p className="text-xs text-[#6b6b6b]">{label}</p>
        <p className="text-sm font-medium text-[#f1f1f1]">{payload[0].value}</p>
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const [stats, setStats] = useState({ totalProducts: 0, activeProducts: 0, totalSets: 0, lowStockItems: 0 });
  const [recentProducts, setRecentProducts] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [inventoryData, setInventoryData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, setsRes] = await Promise.all([
          productsApi.getAll({ active: 'all' }),
          setsApi.getAll({ active: 'all' }),
        ]);

        const products = productsRes.products || [];
        const sets = setsRes.sets || [];
        const lowStock = products.filter(p => p.inventory?.quantity <= (p.inventory?.low_stock_threshold || 5));

        setStats({
          totalProducts: products.length,
          activeProducts: products.filter(p => p.is_active).length,
          totalSets: sets.length,
          lowStockItems: lowStock.length,
        });

        setRecentProducts(products.slice(0, 6));
        setLowStockProducts(lowStock.slice(0, 6));

        const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        setInventoryData(weekDays.map((day, idx) => ({
          name: day,
          inventory: products.reduce((sum, p) => sum + (p.inventory?.quantity || 0), 0) + Math.floor(Math.random() * 20) * (idx + 1),
        })));

        const cats = {};
        products.forEach(p => { cats[p.category || 'Other'] = (cats[p.category || 'Other'] || 0) + 1; });
        const catData = Object.entries(cats).map(([name, value]) => ({ name, value }));
        setCategoryData(catData.length > 0 ? catData : [
          { name: 'Booster Packs', value: 5 },
          { name: 'Elite Trainer', value: 3 },
          { name: 'Singles', value: 8 },
          { name: 'Bundles', value: 2 },
        ]);
      } catch (error) {
        console.error('Dashboard fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-[#6b6b6b] text-sm">
        Loading...
      </div>
    );
  }

  const statItems = [
    { label: 'Total Products', value: stats.totalProducts, sub: `${stats.activeProducts} active` },
    { label: 'Pokemon Sets', value: stats.totalSets },
    { label: 'Total Inventory', value: stats.totalProducts, sub: 'items tracked' },
    { label: 'Low Stock', value: stats.lowStockItems, sub: 'need restocking', warn: stats.lowStockItems > 0 },
  ];

  return (
    <div>
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-base font-medium text-[#f1f1f1]">Dashboard</h1>
        <p className="text-sm text-[#6b6b6b] mt-0.5">Store overview</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {statItems.map(({ label, value, sub, warn }) => (
          <div
            key={label}
            className="bg-[#111111] border border-[#282828] rounded-xl p-5"
          >
            <p className="text-xs text-[#6b6b6b] mb-3">{label}</p>
            <p className="text-2xl font-medium text-[#f1f1f1]">{value}</p>
            {sub && <p className="text-xs text-[#4a4a4a] mt-1">{sub}</p>}
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {/* Area chart */}
        <div className="col-span-2 bg-[#111111] border border-[#282828] rounded-xl p-5">
          <p className="text-sm text-[#f1f1f1]">Inventory Overview</p>
          <p className="text-xs text-[#6b6b6b] mt-0.5 mb-5">Weekly levels</p>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={inventoryData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorInv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3ECF8E" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3ECF8E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b6b6b', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b6b6b', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="inventory" stroke="#3ECF8E" strokeWidth={1.5} fillOpacity={1} fill="url(#colorInv)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie chart */}
        <div className="bg-[#111111] border border-[#282828] rounded-xl p-5">
          <p className="text-sm text-[#f1f1f1]">Categories</p>
          <p className="text-xs text-[#6b6b6b] mt-0.5 mb-4">Distribution</p>
          <div className="h-[140px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={35} outerRadius={58} paddingAngle={2} dataKey="value">
                  {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-3">
            {categoryData.slice(0, 4).map((cat, i) => (
              <div key={cat.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-xs text-[#6b6b6b] truncate">{cat.name}</span>
                </div>
                <span className="text-xs text-[#4a4a4a] ml-2">{cat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Products */}
      <div className="bg-[#111111] border border-[#282828] rounded-xl overflow-hidden mb-3">
        <div className="px-5 py-3.5 border-b border-[#282828]">
          <p className="text-sm text-[#f1f1f1]">Recent Products</p>
        </div>
        {recentProducts.length === 0 ? (
          <div className="px-5 py-10 text-center text-[#6b6b6b] text-sm">No products yet</div>
        ) : (
          <div className="p-4 grid grid-cols-6 gap-3">
            {recentProducts.map((p) => (
              <div key={p.id} className="bg-[#171717] border border-[#282828] rounded-xl overflow-hidden hover:border-[#333] transition-colors">
                <div className="aspect-video isolate flex items-center justify-center p-3 border-b border-[#1e1e1e]" style={{ backgroundColor: '#ffffff' }}>
                  {p.images?.[0] ? (
                    <img
                      src={p.images[0].startsWith('http') ? p.images[0] : `${API_BASE}${p.images[0]}`}
                      alt={p.name}
                      className="max-w-full max-h-full object-contain mix-blend-multiply"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-[#282828]" />
                  )}
                </div>
                <div className="p-3">
                  <p className="text-xs font-medium text-[#f1f1f1] truncate">{p.name}</p>
                  <p className="text-[10px] text-[#6b6b6b] mt-0.5">R{p.price}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Low Stock */}
      <div className="bg-[#111111] border border-[#282828] rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#282828]">
          <p className="text-sm text-[#f1f1f1]">Low Stock</p>
        </div>
        {lowStockProducts.length === 0 ? (
          <div className="px-5 py-10 text-center text-[#6b6b6b] text-sm">All items well stocked</div>
        ) : (
          lowStockProducts.map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-3 px-5 py-3 border-b border-[#1a1a1a] last:border-0 hover:bg-[#171717] transition-colors">
              <div className="min-w-0">
                <p className="text-sm text-[#c4c4c4] truncate">{p.name}</p>
                <p className="text-xs text-[#6b6b6b]">{p.sku || 'No SKU'}</p>
              </div>
              <span className="px-2 py-0.5 text-xs font-medium bg-[#1e1e1e] text-[#6b6b6b] border border-[#282828] rounded-full shrink-0">
                {p.inventory?.quantity || 0} left
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;
