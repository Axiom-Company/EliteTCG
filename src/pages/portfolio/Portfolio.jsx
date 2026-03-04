import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Search, TrendingUp, TrendingDown, Camera, Upload,
  Pencil, Trash2, Layers, DollarSign, BarChart3, X, Loader2
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { ELITE_API_URL } from '@/config/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog';
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem
} from '@/components/ui/select';

const CONDITIONS = [
  { value: 'mint', label: 'Mint', color: 'bg-green-100 text-green-700' },
  { value: 'near_mint', label: 'Near Mint', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'excellent', label: 'Excellent', color: 'bg-blue-100 text-blue-700' },
  { value: 'good', label: 'Good', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'played', label: 'Played', color: 'bg-orange-100 text-orange-700' },
  { value: 'poor', label: 'Poor', color: 'bg-red-100 text-red-700' },
];

const CONDITION_MAP = Object.fromEntries(CONDITIONS.map(c => [c.value, c]));

const PERIODS = [
  { value: '7d', label: '7D' },
  { value: '30d', label: '30D' },
  { value: '90d', label: '90D' },
  { value: '1y', label: '1Y' },
];

function formatZAR(value) {
  if (value == null || isNaN(value)) return 'R 0.00';
  return `R ${Number(value).toFixed(2)}`;
}

function formatChartDate(dateStr) {
  const d = new Date(dateStr);
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

function SkeletonBlock({ className }) {
  return <div className={`bg-gray-100 animate-pulse rounded ${className}`} />;
}

const Portfolio = () => {
  const navigate = useNavigate();
  const { isAuthenticated, getToken, loading: authLoading } = useAuth();

  const [summary, setSummary] = useState(null);
  const [history, setHistory] = useState(null);
  const [historyChange, setHistoryChange] = useState(null);
  const [cards, setCards] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [completion, setCompletion] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30d');
  const [historyLoading, setHistoryLoading] = useState(false);

  const [searchFilter, setSearchFilter] = useState('');
  const [conditionFilter, setConditionFilter] = useState('all');
  const [sortBy, setSortBy] = useState('value');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTab, setDialogTab] = useState('scan');

  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanResults, setScanResults] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [addForm, setAddForm] = useState({ quantity: 1, condition: 'near_mint', purchase_price: '' });
  const [adding, setAdding] = useState(false);

  const [editDialog, setEditDialog] = useState(null);
  const [editForm, setEditForm] = useState({ quantity: 1, condition: 'near_mint', purchase_price: '' });
  const [editing, setEditing] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const searchTimerRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login?redirect=/portfolio', { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate]);

  const authFetch = useCallback(async (url, options = {}) => {
    const token = await getToken();
    if (!token) {
      navigate('/login?redirect=/portfolio', { replace: true });
      return null;
    }
    const headers = { ...options.headers, 'Authorization': `Bearer ${token}` };
    if (!(options.body instanceof FormData) && options.body) {
      headers['Content-Type'] = 'application/json';
    }
    const res = await fetch(url, { ...options, headers });
    if (res.status === 401) {
      navigate('/login?redirect=/portfolio', { replace: true });
      return null;
    }
    return res;
  }, [getToken, navigate]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [sumRes, histRes, cardsRes, compRes] = await Promise.all([
        authFetch(`${ELITE_API_URL}/api/portfolio/summary`),
        authFetch(`${ELITE_API_URL}/api/portfolio/history?period=${period}`),
        authFetch(`${ELITE_API_URL}/api/portfolio?sort=${sortBy}&order=${sortOrder}&page=${page}&limit=50`),
        authFetch(`${ELITE_API_URL}/api/portfolio/completion`),
      ]);
      if (sumRes?.ok) {
        const d = await sumRes.json();
        setSummary(d.summary);
      }
      if (histRes?.ok) {
        const d = await histRes.json();
        setHistory(d.snapshots || []);
        setHistoryChange(d.change || null);
      }
      if (cardsRes?.ok) {
        const d = await cardsRes.json();
        setCards(d.cards || []);
        setPagination(d.pagination || null);
      }
      if (compRes?.ok) {
        const d = await compRes.json();
        setCompletion(d.sets || []);
      }
    } catch (err) {
      toast.error('Failed to load portfolio data');
    } finally {
      setLoading(false);
    }
  }, [authFetch, period, sortBy, sortOrder, page]);

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      fetchAll();
    }
  }, [isAuthenticated, authLoading, fetchAll]);

  const fetchHistory = useCallback(async (p) => {
    setHistoryLoading(true);
    try {
      const res = await authFetch(`${ELITE_API_URL}/api/portfolio/history?period=${p}`);
      if (res?.ok) {
        const d = await res.json();
        setHistory(d.snapshots || []);
        setHistoryChange(d.change || null);
      }
    } catch {
      toast.error('Failed to load history');
    } finally {
      setHistoryLoading(false);
    }
  }, [authFetch]);

  const handlePeriodChange = (p) => {
    setPeriod(p);
    fetchHistory(p);
  };

  const fetchCards = useCallback(async () => {
    try {
      const res = await authFetch(
        `${ELITE_API_URL}/api/portfolio?sort=${sortBy}&order=${sortOrder}&page=${page}&limit=50`
      );
      if (res?.ok) {
        const d = await res.json();
        setCards(d.cards || []);
        setPagination(d.pagination || null);
      }
    } catch {
      toast.error('Failed to load cards');
    }
  }, [authFetch, sortBy, sortOrder, page]);

  useEffect(() => {
    if (isAuthenticated && !loading) {
      fetchCards();
    }
  }, [sortBy, sortOrder, page]);

  const startCamera = useCallback(async () => {
    setCameraError(false);
    setCameraReady(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 960 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          setCameraReady(true);
        };
      }
    } catch {
      setCameraError(true);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setCameraReady(false);
  }, []);

  useEffect(() => {
    if (dialogOpen && dialogTab === 'scan') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [dialogOpen, dialogTab, startCamera, stopCamera]);

  const captureAndScan = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      await sendScan(blob);
    }, 'image/jpeg', 0.85);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await sendScan(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const sendScan = async (fileOrBlob) => {
    setScanning(true);
    setScanResults(null);
    try {
      const fd = new FormData();
      fd.append('card_image', fileOrBlob, fileOrBlob.name || 'capture.jpg');
      const res = await authFetch(`${ELITE_API_URL}/api/portfolio/scan`, {
        method: 'POST',
        body: fd,
      });
      if (res?.ok) {
        const d = await res.json();
        setScanResults(d.cards || []);
        if (!d.cards?.length) toast.info('No cards detected. Try a clearer image.');
      } else {
        toast.error('Scan failed. Please try again.');
      }
    } catch {
      toast.error('Scan failed. Please try again.');
    } finally {
      setScanning(false);
    }
  };

  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }
    searchTimerRef.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await authFetch(
          `${ELITE_API_URL}/api/portfolio/search?q=${encodeURIComponent(searchQuery.trim())}`
        );
        if (res?.ok) {
          const d = await res.json();
          setSearchResults(d.cards || []);
        }
      } catch {
        toast.error('Search failed');
      } finally {
        setSearchLoading(false);
      }
    }, 300);
    return () => clearTimeout(searchTimerRef.current);
  }, [searchQuery, authFetch]);

  const handleSelectCard = (card) => {
    setSelectedCard(card);
    setAddForm({ quantity: 1, condition: 'near_mint', purchase_price: '' });
  };

  const handleAddCard = async () => {
    if (!selectedCard) return;
    setAdding(true);
    try {
      const body = {
        pokemon_tcg_id: selectedCard.pokemon_tcg_id,
        quantity: Number(addForm.quantity) || 1,
        condition: addForm.condition,
      };
      if (addForm.purchase_price !== '') {
        body.purchase_price = Number(addForm.purchase_price);
      }
      const res = await authFetch(`${ELITE_API_URL}/api/portfolio/cards`, {
        method: 'POST',
        body: JSON.stringify(body),
      });
      if (res?.ok) {
        toast.success(`${selectedCard.card_name} added to portfolio`);
        setDialogOpen(false);
        resetDialogState();
        fetchAll();
      } else {
        const err = await res?.json().catch(() => null);
        toast.error(err?.error || 'Failed to add card');
      }
    } catch {
      toast.error('Failed to add card');
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteCard = async (card) => {
    if (!window.confirm(`Remove ${card.card_name} from your portfolio?`)) return;
    try {
      const res = await authFetch(`${ELITE_API_URL}/api/portfolio/cards/${card.id}`, {
        method: 'DELETE',
      });
      if (res?.ok) {
        toast.success('Card removed');
        const sumRes = await authFetch(`${ELITE_API_URL}/api/portfolio/summary`);
        if (sumRes?.ok) setSummary((await sumRes.json()).summary);
        fetchCards();
      } else {
        toast.error('Failed to remove card');
      }
    } catch {
      toast.error('Failed to remove card');
    }
  };

  const openEditDialog = (card) => {
    setEditDialog(card);
    setEditForm({
      quantity: card.quantity || 1,
      condition: card.condition || 'near_mint',
      purchase_price: card.purchase_price ?? '',
    });
  };

  const handleUpdateCard = async () => {
    if (!editDialog) return;
    setEditing(true);
    try {
      const body = {
        quantity: Number(editForm.quantity) || 1,
        condition: editForm.condition,
      };
      if (editForm.purchase_price !== '') {
        body.purchase_price = Number(editForm.purchase_price);
      }
      const res = await authFetch(`${ELITE_API_URL}/api/portfolio/cards/${editDialog.id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      });
      if (res?.ok) {
        toast.success('Card updated');
        setEditDialog(null);
        const sumRes = await authFetch(`${ELITE_API_URL}/api/portfolio/summary`);
        if (sumRes?.ok) setSummary((await sumRes.json()).summary);
        fetchCards();
      } else {
        toast.error('Failed to update card');
      }
    } catch {
      toast.error('Failed to update card');
    } finally {
      setEditing(false);
    }
  };

  const resetDialogState = () => {
    setDialogTab('scan');
    setScanResults(null);
    setSearchQuery('');
    setSearchResults(null);
    setSelectedCard(null);
    setAddForm({ quantity: 1, condition: 'near_mint', purchase_price: '' });
    stopCamera();
  };

  const handleDialogOpenChange = (open) => {
    setDialogOpen(open);
    if (!open) resetDialogState();
  };

  const filteredCards = cards.filter(c => {
    if (conditionFilter !== 'all' && c.condition !== conditionFilter) return false;
    if (searchFilter) {
      const q = searchFilter.toLowerCase();
      const name = (c.card_name || '').toLowerCase();
      const set = (c.set_name || '').toLowerCase();
      if (!name.includes(q) && !set.includes(q)) return false;
    }
    return true;
  });

  if (authLoading) return null;
  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-medium text-gray-900">My Portfolio</h1>
          <p className="text-sm text-gray-400 mt-1">Track your collection value and completion</p>
        </div>

        {loading ? (
          <LoadingSkeleton />
        ) : summary && (summary.total_cards > 0 || cards.length > 0) ? (
          <>
            <StatsRow summary={summary} />
            <ValueChart
              history={history}
              historyChange={historyChange}
              period={period}
              onPeriodChange={handlePeriodChange}
              historyLoading={historyLoading}
            />
            {completion.length > 0 && <SetCompletion sets={completion} />}
            <CardGrid
              cards={filteredCards}
              searchFilter={searchFilter}
              onSearchFilterChange={setSearchFilter}
              conditionFilter={conditionFilter}
              onConditionFilterChange={setConditionFilter}
              sortBy={sortBy}
              onSortByChange={(v) => { setSortBy(v); setPage(1); }}
              sortOrder={sortOrder}
              onSortOrderChange={(v) => { setSortOrder(v); setPage(1); }}
              onEdit={openEditDialog}
              onDelete={handleDeleteCard}
              pagination={pagination}
              page={page}
              onPageChange={setPage}
            />
          </>
        ) : (
          <EmptyState onAdd={() => setDialogOpen(true)} />
        )}
      </div>

      <button
        onClick={() => setDialogOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center justify-center w-14 h-14 rounded-full bg-[#FFCB32] text-gray-900 shadow-lg hover:shadow-xl hover:scale-105 transition-all"
        aria-label="Add card"
      >
        <Plus className="w-6 h-6" />
      </button>

      <AddCardDialog
        open={dialogOpen}
        onOpenChange={handleDialogOpenChange}
        tab={dialogTab}
        onTabChange={setDialogTab}
        videoRef={videoRef}
        canvasRef={canvasRef}
        fileInputRef={fileInputRef}
        cameraReady={cameraReady}
        cameraError={cameraError}
        scanning={scanning}
        scanResults={scanResults}
        onCapture={captureAndScan}
        onFileUpload={handleFileUpload}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        searchResults={searchResults}
        searchLoading={searchLoading}
        selectedCard={selectedCard}
        onSelectCard={handleSelectCard}
        onClearSelection={() => setSelectedCard(null)}
        addForm={addForm}
        onAddFormChange={setAddForm}
        onAdd={handleAddCard}
        adding={adding}
      />

      <Dialog open={!!editDialog} onOpenChange={(open) => !open && setEditDialog(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Edit Card</DialogTitle>
            <DialogDescription>Update quantity, condition, or purchase price.</DialogDescription>
          </DialogHeader>
          {editDialog && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-3">
                {editDialog.card_image_small && (
                  <img
                    src={editDialog.card_image_small}
                    alt={editDialog.card_name}
                    className="w-16 h-22 object-contain rounded"
                  />
                )}
                <div>
                  <p className="font-medium text-gray-900 text-sm">{editDialog.card_name}</p>
                  <p className="text-xs text-gray-400">{editDialog.set_name}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Quantity</label>
                  <Input
                    type="number"
                    min={1}
                    value={editForm.quantity}
                    onChange={(e) => setEditForm(p => ({ ...p, quantity: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Condition</label>
                  <Select value={editForm.condition} onValueChange={(v) => setEditForm(p => ({ ...p, condition: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CONDITIONS.map(c => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Purchase Price (ZAR)</label>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  placeholder="Optional"
                  value={editForm.purchase_price}
                  onChange={(e) => setEditForm(p => ({ ...p, purchase_price: e.target.value }))}
                />
              </div>
              <Button
                className="w-full bg-[#FFCB32] text-gray-900 hover:bg-[#e6b82d]"
                onClick={handleUpdateCard}
                disabled={editing}
              >
                {editing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

function StatsRow({ summary }) {
  const profit = summary.total_profit_usd ?? 0;
  const isPositive = profit >= 0;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <StatCard
        label="Total Value"
        value={formatZAR(summary.total_value_zar)}
        icon={<DollarSign className="w-4 h-4 text-gray-400" />}
      />
      <StatCard
        label="Total Cards"
        value={summary.total_cards?.toLocaleString() ?? '0'}
        sub={`${summary.unique_cards ?? 0} unique across ${summary.sets_collected ?? 0} sets`}
        icon={<Layers className="w-4 h-4 text-gray-400" />}
      />
      <StatCard
        label="Profit / Loss"
        value={`${isPositive ? '+' : ''}${formatZAR(profit)}`}
        valueColor={isPositive ? 'text-green-600' : 'text-red-600'}
        icon={<BarChart3 className="w-4 h-4 text-gray-400" />}
      />
    </div>
  );
}

function StatCard({ label, value, sub, icon, valueColor }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-[#FFCB32]" />
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</span>
        {icon}
      </div>
      <p className={`text-xl font-semibold ${valueColor || 'text-gray-900'}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

function ValueChart({ history, historyChange, period, onPeriodChange, historyLoading }) {
  const hasData = history && history.length > 0;
  const changePercent = historyChange?.percent_change;
  const direction = historyChange?.direction;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-medium text-gray-900">Portfolio Value</h2>
          {changePercent != null && (
            <Badge
              variant={direction === 'up' ? 'success' : 'destructive'}
              className="text-xs"
            >
              {direction === 'up' ? (
                <TrendingUp className="w-3 h-3 mr-1" />
              ) : (
                <TrendingDown className="w-3 h-3 mr-1" />
              )}
              {Math.abs(changePercent).toFixed(1)}%
            </Badge>
          )}
        </div>
        <div className="flex bg-gray-100 rounded-lg p-0.5">
          {PERIODS.map(p => (
            <button
              key={p.value}
              onClick={() => onPeriodChange(p.value)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                period === p.value
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
      {historyLoading ? (
        <div className="h-56 flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-gray-300" />
        </div>
      ) : hasData ? (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={history} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis
              dataKey="date"
              tickFormatter={formatChartDate}
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v) => `R${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`}
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
              width={55}
            />
            <Tooltip
              contentStyle={{
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              formatter={(value) => [formatZAR(value), 'Value']}
              labelFormatter={formatChartDate}
            />
            <Line
              type="monotone"
              dataKey="total_value_zar"
              stroke="#FFCB32"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: '#FFCB32', stroke: '#fff', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-56 flex items-center justify-center">
          <p className="text-sm text-gray-400">No history yet -- come back in a day</p>
        </div>
      )}
    </div>
  );
}

function SetCompletion({ sets }) {
  return (
    <div className="mb-6">
      <h2 className="text-sm font-medium text-gray-900 mb-3">Set Completion</h2>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
        {sets.map(s => (
          <div
            key={s.set_code}
            className="flex-shrink-0 bg-white rounded-xl border border-gray-200 p-4 w-48"
          >
            <p className="text-xs font-medium text-gray-900 truncate mb-2">{s.set_name}</p>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-1.5">
              <div
                className="h-full bg-[#FFCB32] rounded-full transition-all"
                style={{ width: `${Math.min(s.completion_percentage, 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">{s.owned}/{s.total}</span>
              <span className="text-xs font-medium text-gray-700">{s.completion_percentage?.toFixed(0)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CardGrid({
  cards, searchFilter, onSearchFilterChange, conditionFilter, onConditionFilterChange,
  sortBy, onSortByChange, sortOrder, onSortOrderChange, onEdit, onDelete,
  pagination, page, onPageChange,
}) {
  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search cards..."
            value={searchFilter}
            onChange={(e) => onSearchFilterChange(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={conditionFilter} onValueChange={onConditionFilterChange}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Condition" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Conditions</SelectItem>
            {CONDITIONS.map(c => (
              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={onSortByChange}>
          <SelectTrigger className="w-[120px]"><SelectValue placeholder="Sort" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="value">Value</SelectItem>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="date_added">Date Added</SelectItem>
            <SelectItem value="set">Set</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortOrder} onValueChange={onSortOrderChange}>
          <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">Desc</SelectItem>
            <SelectItem value="asc">Asc</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {cards.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-sm text-gray-400">No cards match your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {cards.map(card => (
            <PortfolioCard key={card.id} card={card} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </div>
      )}

      {pagination && pagination.total_pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            Previous
          </Button>
          <span className="text-xs text-gray-500">
            Page {page} of {pagination.total_pages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= pagination.total_pages}
            onClick={() => onPageChange(page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

function PortfolioCard({ card, onEdit, onDelete }) {
  const [hovered, setHovered] = useState(false);
  const cond = CONDITION_MAP[card.condition];

  return (
    <div
      className="group bg-white rounded-xl border border-gray-200 overflow-hidden transition-shadow hover:shadow-md relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="aspect-[2.5/3.5] bg-gray-50 flex items-center justify-center p-2">
        {card.card_image_small ? (
          <img
            src={card.card_image_small}
            alt={card.card_name}
            className="w-full h-full object-contain"
            loading="lazy"
          />
        ) : (
          <Layers className="w-10 h-10 text-gray-200" />
        )}
      </div>
      <div className="p-3">
        <p className="text-sm font-medium text-gray-900 truncate">{card.card_name}</p>
        <p className="text-xs text-gray-400 truncate">{card.set_name}</p>
        <div className="flex items-center justify-between mt-2">
          {cond && (
            <span className={`inline-block text-[10px] px-1.5 py-0.5 rounded-full font-medium ${cond.color}`}>
              {cond.label}
            </span>
          )}
          <span className="text-sm font-semibold text-gray-900">
            {formatZAR(card.latest_price_market_zar)}
          </span>
        </div>
        {card.quantity > 1 && (
          <p className="text-[10px] text-gray-400 mt-1">Qty: {card.quantity}</p>
        )}
      </div>
      {hovered && (
        <div className="absolute top-2 right-2 flex gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(card); }}
            className="flex items-center justify-center w-7 h-7 rounded-full bg-white/90 border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors"
            aria-label="Edit card"
          >
            <Pencil className="w-3.5 h-3.5 text-gray-600" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(card); }}
            className="flex items-center justify-center w-7 h-7 rounded-full bg-white/90 border border-gray-200 shadow-sm hover:bg-red-50 transition-colors"
            aria-label="Delete card"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-500" />
          </button>
        </div>
      )}
    </div>
  );
}

function EmptyState({ onAdd }) {
  return (
    <div className="py-24 text-center">
      <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
        <Layers className="w-7 h-7 text-gray-300" />
      </div>
      <p className="text-base font-medium text-gray-900 mb-1">No cards yet</p>
      <p className="text-sm text-gray-400 mb-6">Add your first card to start tracking your collection!</p>
      <Button
        className="bg-[#FFCB32] text-gray-900 hover:bg-[#e6b82d] rounded-full px-6"
        onClick={onAdd}
      >
        <Plus className="w-4 h-4 mr-1" />
        Add Your First Card
      </Button>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-5">
            <SkeletonBlock className="h-3 w-20 mb-3" />
            <SkeletonBlock className="h-6 w-28 mb-1" />
            <SkeletonBlock className="h-3 w-36" />
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <SkeletonBlock className="h-4 w-32 mb-4" />
        <SkeletonBlock className="h-56 w-full" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <SkeletonBlock className="aspect-[2.5/3.5] rounded-none" />
            <div className="p-3 space-y-2">
              <SkeletonBlock className="h-4 w-4/5" />
              <SkeletonBlock className="h-3 w-3/5" />
              <SkeletonBlock className="h-4 w-2/5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AddCardDialog({
  open, onOpenChange, tab, onTabChange,
  videoRef, canvasRef, fileInputRef,
  cameraReady, cameraError, scanning, scanResults,
  onCapture, onFileUpload,
  searchQuery, onSearchQueryChange, searchResults, searchLoading,
  selectedCard, onSelectCard, onClearSelection,
  addForm, onAddFormChange, onAdd, adding,
}) {
  if (selectedCard) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Add to Portfolio</DialogTitle>
            <DialogDescription>Set quantity, condition, and purchase price.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-3">
              {selectedCard.card_image_small && (
                <img
                  src={selectedCard.card_image_small}
                  alt={selectedCard.card_name}
                  className="w-20 h-28 object-contain rounded"
                />
              )}
              <div>
                <p className="font-medium text-gray-900 text-sm">{selectedCard.card_name}</p>
                <p className="text-xs text-gray-400">{selectedCard.set_name}</p>
                {selectedCard.price_market_zar != null && (
                  <p className="text-xs text-gray-500 mt-1">Market: {formatZAR(selectedCard.price_market_zar)}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Quantity</label>
                <Input
                  type="number"
                  min={1}
                  value={addForm.quantity}
                  onChange={(e) => onAddFormChange(p => ({ ...p, quantity: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Condition</label>
                <Select
                  value={addForm.condition}
                  onValueChange={(v) => onAddFormChange(p => ({ ...p, condition: v }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CONDITIONS.map(c => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Purchase Price (ZAR)</label>
              <Input
                type="number"
                min={0}
                step={0.01}
                placeholder="Optional"
                value={addForm.purchase_price}
                onChange={(e) => onAddFormChange(p => ({ ...p, purchase_price: e.target.value }))}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={onClearSelection}>
                Back
              </Button>
              <Button
                className="flex-1 bg-[#FFCB32] text-gray-900 hover:bg-[#e6b82d]"
                onClick={onAdd}
                disabled={adding}
              >
                {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add to Portfolio'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Card</DialogTitle>
          <DialogDescription>Scan a card or search by name to add it.</DialogDescription>
        </DialogHeader>
        <div className="pt-2">
          <div className="flex bg-gray-100 rounded-lg p-0.5 mb-4">
            <button
              onClick={() => onTabChange('scan')}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                tab === 'scan' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              Scan Card
            </button>
            <button
              onClick={() => onTabChange('search')}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                tab === 'search' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              Search
            </button>
          </div>

          {tab === 'scan' && (
            <div className="space-y-3">
              {!cameraError && (
                <div className="relative rounded-lg overflow-hidden bg-gray-900 aspect-[4/3]">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  {!cameraReady && !scanning && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                      <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
                    </div>
                  )}
                  {scanning && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/80">
                      <Loader2 className="w-6 h-6 animate-spin text-[#FFCB32] mb-2" />
                      <p className="text-xs text-white">Identifying card...</p>
                    </div>
                  )}
                </div>
              )}
              {cameraError && (
                <div className="rounded-lg bg-gray-50 border border-gray-200 p-6 text-center">
                  <Camera className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs text-gray-400 mb-3">Camera not available</p>
                </div>
              )}
              <div className="flex gap-2">
                {!cameraError && (
                  <Button
                    className="flex-1 bg-[#FFCB32] text-gray-900 hover:bg-[#e6b82d]"
                    onClick={onCapture}
                    disabled={!cameraReady || scanning}
                  >
                    <Camera className="w-4 h-4 mr-1" />
                    Capture
                  </Button>
                )}
                <Button
                  variant="outline"
                  className={cameraError ? 'w-full' : 'flex-1'}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={scanning}
                >
                  <Upload className="w-4 h-4 mr-1" />
                  Upload Image
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onFileUpload}
                />
              </div>
              <canvas ref={canvasRef} className="hidden" />
              {scanResults && <CardResultsList cards={scanResults} onSelect={onSelectCard} />}
            </div>
          )}

          {tab === 'search' && (
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by card name..."
                  value={searchQuery}
                  onChange={(e) => onSearchQueryChange(e.target.value)}
                  className="pl-9"
                  autoFocus
                />
              </div>
              {searchLoading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-gray-300" />
                </div>
              )}
              {!searchLoading && searchResults && (
                <CardResultsList cards={searchResults} onSelect={onSelectCard} />
              )}
              {!searchLoading && searchResults && searchResults.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-6">No cards found</p>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CardResultsList({ cards, onSelect }) {
  if (!cards || cards.length === 0) return null;
  return (
    <div className="max-h-64 overflow-y-auto space-y-1 border border-gray-100 rounded-lg">
      {cards.map((card, idx) => (
        <button
          key={card.pokemon_tcg_id || idx}
          onClick={() => onSelect(card)}
          className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg text-left transition-colors"
        >
          {card.card_image_small ? (
            <img
              src={card.card_image_small}
              alt={card.card_name}
              className="w-10 h-14 object-contain rounded flex-shrink-0"
            />
          ) : (
            <div className="w-10 h-14 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
              <Layers className="w-4 h-4 text-gray-300" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 truncate">{card.card_name}</p>
            <p className="text-xs text-gray-400 truncate">{card.set_name}{card.card_number ? ` #${card.card_number}` : ''}</p>
            {card.rarity && <p className="text-[10px] text-gray-400">{card.rarity}</p>}
          </div>
          {card.price_market_zar != null && (
            <span className="text-xs font-medium text-gray-700 flex-shrink-0">{formatZAR(card.price_market_zar)}</span>
          )}
        </button>
      ))}
    </div>
  );
}

export default Portfolio;
