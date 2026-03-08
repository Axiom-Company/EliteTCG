import { useState, useEffect } from 'react';
import { ordersApi } from '../hooks/useApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Search,
  Package,
  Truck,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
} from 'lucide-react';

const ORDER_STATUSES = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'in_transit', label: 'In Transit' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'refunded', label: 'Refunded' },
];

const STATUS_COLORS = {
  pending: 'bg-amber-900/30 text-amber-400 border-amber-800/40',
  pending_payment: 'bg-amber-900/30 text-amber-400 border-amber-800/40',
  paid: 'bg-emerald-900/30 text-emerald-400 border-emerald-800/40',
  confirmed: 'bg-blue-900/30 text-blue-400 border-blue-800/40',
  shipped: 'bg-purple-900/30 text-purple-400 border-purple-800/40',
  in_transit: 'bg-indigo-900/30 text-indigo-400 border-indigo-800/40',
  out_for_delivery: 'bg-cyan-900/30 text-cyan-400 border-cyan-800/40',
  delivered: 'bg-green-900/30 text-green-400 border-green-800/40',
  cancelled: 'bg-red-900/30 text-red-400 border-red-800/40',
  refunded: 'bg-orange-900/30 text-orange-400 border-orange-800/40',
};

const PAYMENT_COLORS = {
  pending: 'bg-amber-900/30 text-amber-400 border-amber-800/40',
  complete: 'bg-emerald-900/30 text-emerald-400 border-emerald-800/40',
  completed: 'bg-emerald-900/30 text-emerald-400 border-emerald-800/40',
  failed: 'bg-red-900/30 text-red-400 border-red-800/40',
  cancelled: 'bg-red-900/30 text-red-400 border-red-800/40',
};

const StatusBadge = ({ status, colors }) => (
  <span
    className={`inline-block px-2 py-0.5 text-[10px] font-medium rounded-full border capitalize ${
      colors[status] || 'bg-[#1e1e1e] text-[#6b6b6b] border-[#2e2e2e]'
    }`}
  >
    {(status || '').replace(/_/g, ' ')}
  </span>
);

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleString('en-ZA', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const SkeletonRow = () => (
  <div className="flex items-center gap-4 px-4 py-3.5 border-b border-[#1e1e1e] animate-pulse">
    <div className="h-3.5 bg-[#1e1e1e] rounded w-20" />
    <div className="h-3.5 bg-[#1e1e1e] rounded w-32 flex-1" />
    <div className="h-4 bg-[#1e1e1e] rounded-full w-20" />
    <div className="h-4 bg-[#1e1e1e] rounded-full w-16" />
    <div className="h-3.5 bg-[#1e1e1e] rounded w-16" />
    <div className="h-3.5 bg-[#1e1e1e] rounded w-20" />
  </div>
);

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [message, setMessage] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Detail form state
  const [newStatus, setNewStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [sellerNotes, setSellerNotes] = useState('');
  const [copied, setCopied] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = { page };
      if (statusFilter !== 'all') params.status = statusFilter;
      const data = await ordersApi.getAll(params);
      setOrders(data.items || []);
      setPagination(data);
    } catch (error) {
      console.error('Fetch orders error:', error);
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { setPage(1); }, [statusFilter]);
  useEffect(() => { fetchOrders(); }, [statusFilter, page]);

  const filteredOrders = orders.filter((o) =>
    o.order_number.toLowerCase().includes(search.toLowerCase()) ||
    (o.guest_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (o.guest_email || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleViewOrder = async (order) => {
    try {
      const detail = await ordersApi.get(order.id);
      setSelectedOrder(detail);
      setNewStatus(detail.order_status);
      setTrackingNumber(detail.courier_tracking_number || '');
      setSellerNotes(detail.seller_notes || '');
      setShowDetail(true);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load order details' });
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder || newStatus === selectedOrder.order_status) return;
    setActionLoading(true);
    try {
      await ordersApi.updateStatus(selectedOrder.id, newStatus);
      setSelectedOrder({ ...selectedOrder, order_status: newStatus });
      setMessage({ type: 'success', text: 'Status updated' });
      fetchOrders();
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddTracking = async () => {
    if (!selectedOrder || !trackingNumber.trim()) return;
    setActionLoading(true);
    try {
      await ordersApi.addTracking(selectedOrder.id, trackingNumber.trim());
      setSelectedOrder({
        ...selectedOrder,
        courier_tracking_number: trackingNumber.trim(),
        order_status: 'shipped',
      });
      setNewStatus('shipped');
      setMessage({ type: 'success', text: 'Tracking added — order marked as shipped' });
      fetchOrders();
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateNotes = async () => {
    if (!selectedOrder) return;
    setActionLoading(true);
    try {
      await ordersApi.updateNotes(selectedOrder.id, sellerNotes);
      setSelectedOrder({ ...selectedOrder, seller_notes: sellerNotes });
      setMessage({ type: 'success', text: 'Notes saved' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleBookCourier = async () => {
    if (!selectedOrder) return;
    setActionLoading(true);
    try {
      const result = await ordersApi.bookCourier(selectedOrder.id);
      setSelectedOrder({
        ...selectedOrder,
        courier_tracking_number: result.tracking_number,
        courier_booking_reference: result.booking_reference,
        order_status: 'shipped',
      });
      setTrackingNumber(result.tracking_number || '');
      setNewStatus('shipped');
      setMessage({ type: 'success', text: `Courier booked — tracking: ${result.tracking_number}` });
      fetchOrders();
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setActionLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const totalCount = pagination?.total_count || 0;
  const totalPages = pagination?.total_pages || 1;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-base font-medium text-[#f1f1f1]">Orders</h1>
          <p className="text-sm text-[#6b6b6b] mt-0.5">
            {loading ? '—' : `${totalCount} order${totalCount !== 1 ? 's' : ''}`}
          </p>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`px-4 py-3 rounded-lg text-sm mb-5 border ${
            message.type === 'success'
              ? 'bg-[#3ECF8E]/10 text-[#3ECF8E] border-[#3ECF8E]/20'
              : 'bg-red-950/30 text-red-400 border-red-900/30'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#4a4a4a]" strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Search orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-3 h-9 w-full sm:w-[220px] bg-[#111111] border border-[#282828] rounded-lg text-sm text-[#f1f1f1] placeholder-[#4a4a4a] outline-none focus:border-[#3ECF8E] transition-colors"
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {ORDER_STATUSES.map((s) => (
            <button
              key={s.value}
              onClick={() => setStatusFilter(s.value)}
              className={`px-3 py-1.5 text-xs rounded-lg border transition-colors whitespace-nowrap ${
                statusFilter === s.value
                  ? 'bg-[#1e1e1e] text-[#f1f1f1] border-[#3a3a3a]'
                  : 'bg-transparent text-[#6b6b6b] border-[#282828] hover:border-[#333] hover:text-[#c4c4c4]'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden space-y-2 mb-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-[#111111] border border-[#282828] rounded-xl p-4 animate-pulse space-y-2">
              <div className="h-3.5 bg-[#1e1e1e] rounded w-24" />
              <div className="h-3 bg-[#1e1e1e] rounded w-36" />
              <div className="h-3 bg-[#1e1e1e] rounded w-20" />
            </div>
          ))
        ) : filteredOrders.length === 0 ? (
          <div className="py-16 text-center">
            <Package className="w-10 h-10 text-[#282828] mx-auto mb-3" strokeWidth={1} />
            <p className="text-sm text-[#4a4a4a]">
              {search ? `No orders matching "${search}"` : 'No orders yet'}
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <button
              key={order.id}
              onClick={() => handleViewOrder(order)}
              className="w-full text-left bg-[#111111] border border-[#282828] rounded-xl p-4 hover:border-[#3a3a3a] transition-colors"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-sm font-medium text-[#3ECF8E]">{order.order_number}</span>
                <StatusBadge status={order.order_status} colors={STATUS_COLORS} />
              </div>
              <p className="text-sm text-[#f1f1f1] truncate">{order.guest_name || '—'}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-[#6b6b6b]">{formatDate(order.created_at)}</span>
                <span className="text-sm font-medium text-[#a0a0a0]">R{order.total_zar?.toFixed(2)}</span>
              </div>
            </button>
          ))
        )}
      </div>

      {/* Table (desktop only) */}
      <div className="hidden sm:block bg-[#111111] border border-[#282828] rounded-xl overflow-hidden">
        {/* Table Header */}
        <div className="flex items-center gap-4 px-4 py-2.5 border-b border-[#282828] text-[10px] font-medium text-[#6b6b6b] uppercase tracking-wider">
          <div className="w-24">Order</div>
          <div className="flex-1">Customer</div>
          <div className="w-14 text-right">Items</div>
          <div className="w-20 text-right">Total</div>
          <div className="w-28">Status</div>
          <div className="w-24">Payment</div>
          <div className="w-24">Shipping</div>
          <div className="w-24">Date</div>
        </div>

        {/* Rows */}
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
        ) : filteredOrders.length === 0 ? (
          <div className="py-16 text-center">
            <Package className="w-10 h-10 text-[#282828] mx-auto mb-3" strokeWidth={1} />
            <p className="text-sm text-[#4a4a4a]">
              {search ? `No orders matching "${search}"` : 'No orders yet'}
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <button
              key={order.id}
              onClick={() => handleViewOrder(order)}
              className="flex items-center gap-4 px-4 py-3.5 border-b border-[#1e1e1e] last:border-b-0 w-full text-left hover:bg-[#1a1a1a] transition-colors"
            >
              <div className="w-24 text-sm font-medium text-[#3ECF8E]">
                {order.order_number}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#f1f1f1] truncate">{order.guest_name || '—'}</p>
                <p className="text-xs text-[#4a4a4a] truncate">{order.guest_email || '—'}</p>
              </div>
              <div className="w-14 text-sm text-[#a0a0a0] text-right">
                {order.items?.length || '—'}
              </div>
              <div className="w-20 text-sm font-medium text-[#f1f1f1] text-right">
                R{order.total_zar?.toFixed(2)}
              </div>
              <div className="w-28">
                <StatusBadge status={order.order_status} colors={STATUS_COLORS} />
              </div>
              <div className="w-24">
                <StatusBadge status={order.payment_status} colors={PAYMENT_COLORS} />
              </div>
              <div className="w-24">
                <span className="text-xs text-[#6b6b6b] capitalize">
                  {(order.shipping_method || '').replace(/_/g, ' ')}
                </span>
              </div>
              <div className="w-24 text-xs text-[#6b6b6b]">
                {formatDate(order.created_at)}
              </div>
            </button>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-[#4a4a4a]">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="h-8"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="h-8"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Order Detail Dialog */}
      <Dialog open={showDetail} onOpenChange={(open) => { if (!open) setShowDetail(false); }}>
        <DialogContent className="max-w-[640px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-normal flex items-center gap-2">
              Order {selectedOrder?.order_number}
              <StatusBadge status={selectedOrder?.order_status || ''} colors={STATUS_COLORS} />
            </DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Customer + Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-medium text-[#6b6b6b] uppercase tracking-wider mb-1.5">
                    Customer
                  </p>
                  <p className="text-sm text-[#f1f1f1]">{selectedOrder.guest_name || '—'}</p>
                  <p className="text-xs text-[#6b6b6b]">{selectedOrder.guest_email || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-medium text-[#6b6b6b] uppercase tracking-wider mb-1.5">
                    Created
                  </p>
                  <p className="text-sm text-[#a0a0a0]">{formatDateTime(selectedOrder.created_at)}</p>
                </div>
              </div>

              {/* Items */}
              <div>
                <p className="text-[10px] font-medium text-[#6b6b6b] uppercase tracking-wider mb-2">
                  Items ({selectedOrder.items?.length || 0})
                </p>
                <div className="border border-[#282828] rounded-lg overflow-hidden">
                  {selectedOrder.items?.map((item, i) => (
                    <div
                      key={item.id || i}
                      className="flex items-center gap-3 px-3 py-2.5 border-b border-[#1e1e1e] last:border-b-0"
                    >
                      <div className="w-10 h-10 bg-white rounded-md overflow-hidden shrink-0 flex items-center justify-center">
                        {item.photo_url || item.tcg_image_small ? (
                          <img
                            src={item.photo_url || item.tcg_image_small}
                            alt={item.product_name}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <Package className="w-4 h-4 text-[#ccc]" strokeWidth={1} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[#f1f1f1] truncate">{item.product_name}</p>
                        <p className="text-xs text-[#4a4a4a]">
                          {item.quantity} &times; R{item.unit_price_zar?.toFixed(2)}
                          {item.condition && (
                            <span className="ml-2 text-[#6b6b6b]">{item.condition}</span>
                          )}
                        </p>
                      </div>
                      <p className="text-sm font-medium text-[#a0a0a0] shrink-0">
                        R{item.line_total_zar?.toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
                {/* Totals */}
                <div className="mt-2 space-y-1 text-right">
                  <p className="text-xs text-[#6b6b6b]">
                    Subtotal: R{selectedOrder.subtotal_zar?.toFixed(2)}
                  </p>
                  <p className="text-xs text-[#6b6b6b]">
                    Shipping: R{selectedOrder.shipping_cost_zar?.toFixed(2)}
                  </p>
                  <p className="text-sm font-medium text-[#f1f1f1]">
                    Total: R{selectedOrder.total_zar?.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Shipping Address */}
              {selectedOrder.shipping_method === 'courier_guy' && selectedOrder.shipping_address_line1 && (
                <div>
                  <p className="text-[10px] font-medium text-[#6b6b6b] uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Shipping Address
                  </p>
                  <div className="text-sm text-[#a0a0a0] space-y-0.5">
                    <p>{selectedOrder.shipping_address_line1}</p>
                    {selectedOrder.shipping_address_line2 && (
                      <p>{selectedOrder.shipping_address_line2}</p>
                    )}
                    <p>
                      {selectedOrder.shipping_city}, {selectedOrder.shipping_province}{' '}
                      {selectedOrder.shipping_postal_code}
                    </p>
                  </div>
                </div>
              )}

              {/* Tracking */}
              {selectedOrder.courier_tracking_number && (
                <div>
                  <p className="text-[10px] font-medium text-[#6b6b6b] uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <Truck className="w-3 h-3" /> Tracking
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="text-sm text-[#3ECF8E] bg-[#1c1c1c] px-2 py-1 rounded">
                      {selectedOrder.courier_tracking_number}
                    </code>
                    <button
                      onClick={() => copyToClipboard(selectedOrder.courier_tracking_number)}
                      className="text-[#6b6b6b] hover:text-[#f1f1f1] transition-colors"
                    >
                      {copied ? (
                        <Check className="w-3.5 h-3.5 text-[#3ECF8E]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" strokeWidth={1.5} />
                      )}
                    </button>
                  </div>
                  {selectedOrder.courier_booking_reference && (
                    <p className="text-[10px] text-[#4a4a4a] mt-1">
                      Ref: {selectedOrder.courier_booking_reference}
                    </p>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="border-t border-[#282828] pt-5 space-y-4">
                {/* Update Status */}
                <div className="flex items-end gap-3">
                  <div className="flex-1 space-y-1.5">
                    <Label className="text-xs">Update Status</Label>
                    <Select value={newStatus} onValueChange={setNewStatus}>
                      <SelectTrigger className="cursor-pointer">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ORDER_STATUSES.filter((s) => s.value !== 'all').map((s) => (
                          <SelectItem key={s.value} value={s.value}>
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={handleUpdateStatus}
                    disabled={actionLoading || newStatus === selectedOrder.order_status}
                    size="sm"
                  >
                    Update
                  </Button>
                </div>

                {/* Add Tracking (only for courier orders without tracking) */}
                {selectedOrder.shipping_method === 'courier_guy' &&
                  !selectedOrder.courier_tracking_number && (
                    <>
                      <div className="flex items-end gap-3">
                        <div className="flex-1 space-y-1.5">
                          <Label className="text-xs">Tracking Number</Label>
                          <Input
                            value={trackingNumber}
                            onChange={(e) => setTrackingNumber(e.target.value)}
                            placeholder="Enter tracking number"
                          />
                        </div>
                        <Button
                          onClick={handleAddTracking}
                          disabled={actionLoading || !trackingNumber.trim()}
                          size="sm"
                        >
                          Add
                        </Button>
                      </div>
                      <div>
                        <Button
                          onClick={handleBookCourier}
                          disabled={actionLoading}
                          variant="outline"
                          size="sm"
                          className="gap-2"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          Book Courier Guy
                        </Button>
                        <p className="text-[10px] text-[#4a4a4a] mt-1">
                          Auto-books collection and assigns tracking number
                        </p>
                      </div>
                    </>
                  )}

                {/* Seller Notes */}
                <div className="space-y-1.5">
                  <Label className="text-xs">Internal Notes</Label>
                  <Textarea
                    value={sellerNotes}
                    onChange={(e) => setSellerNotes(e.target.value)}
                    placeholder="Add internal notes about this order..."
                    rows={3}
                  />
                  <div className="flex justify-end">
                    <Button
                      onClick={handleUpdateNotes}
                      disabled={actionLoading}
                      size="sm"
                      variant="outline"
                    >
                      Save Notes
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Orders;
