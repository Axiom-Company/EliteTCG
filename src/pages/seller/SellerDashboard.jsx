import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';
import { getSellerOrders, updateOrderStatus, bookShipment } from '../../services/orderApi';
import { ELITE_API_URL, getImageUrl } from '../../config/api';
import SEO from '../../components/SEO/SEO';

const ORDER_STATUS_OPTIONS = [
  { value: 'paid', label: 'Paid' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'in_transit', label: 'In Transit' },
  { value: 'out_for_delivery', label: 'Out for Delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

const statusColors = {
  pending_payment: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  confirmed: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  in_transit: 'bg-indigo-100 text-indigo-800',
  out_for_delivery: 'bg-orange-100 text-orange-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-800',
};

const SellerDashboard = () => {
  const { isAuthenticated, isSeller, user, getToken } = useCustomerAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('listings');
  const [stats, setStats] = useState(null);
  const [listings, setListings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/seller/dashboard' } } });
      return;
    }
    if (!isSeller) {
      navigate('/become-seller');
      return;
    }
    fetchListingsData();
  }, [isAuthenticated, isSeller, navigate]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchListingsData = async () => {
    const token = getToken();
    const headers = { 'Authorization': `Bearer ${token}` };

    try {
      const [statsRes, listingsRes] = await Promise.all([
        fetch(`${ELITE_API_URL}/api/seller/analytics/overview`, { headers }),
        fetch(`${ELITE_API_URL}/api/seller/analytics/listings`, { headers })
      ]);
      const [statsData, listingsData] = await Promise.all([statsRes.json(), listingsRes.json()]);
      setStats(statsData.stats);
      setListings(listingsData.listings || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async (status = '') => {
    setOrdersLoading(true);
    try {
      const token = getToken();
      const data = await getSellerOrders(token, status || null);
      setOrders(Array.isArray(data) ? data : data.items || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders(statusFilter);
    }
  }, [activeTab, statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDelete = async (listingId) => {
    setDeleting(true);
    const token = getToken();
    try {
      const res = await fetch(`${ELITE_API_URL}/api/marketplace/listings/${listingId}`, {
        method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setListings(prev => prev.filter(l => l.id !== listingId));
        setDeleteConfirm(null);
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete listing');
      }
    } catch {
      alert('Failed to delete listing');
    } finally {
      setDeleting(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    setActionLoading(orderId);
    try {
      const token = getToken();
      await updateOrderStatus(token, orderId, newStatus);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, order_status: newStatus } : o));
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleBookShipment = async (orderId) => {
    setActionLoading(orderId);
    try {
      const token = getToken();
      const result = await bookShipment(token, orderId);
      alert(`Shipment booked! Tracking: ${result.tracking_number}`);
      fetchOrders(statusFilter);
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-gray-900 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <SEO title="Seller Dashboard" noindex />
      {/* Header */}
      <div className="bg-[#FFCB32]">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-gray-800 text-sm font-medium mb-1">Seller Dashboard</p>
              <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name || 'Seller'}</h1>
            </div>
            <Link
              to="/seller/create-listing"
              className="inline-flex items-center justify-center px-6 py-3 bg-gray-900 text-white font-medium rounded-full hover:bg-gray-800 transition-colors"
            >
              New Listing
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="border-l-4 border-[#FFCB32] pl-6 py-2">
            <p className="text-sm text-gray-500 mb-1">Active Listings</p>
            <p className="text-4xl font-bold text-gray-900">{stats?.active_listings || 0}</p>
            <p className="text-sm text-gray-400 mt-1">{stats?.total_listings || 0} total</p>
          </div>
          <div className="border-l-4 border-gray-200 pl-6 py-2">
            <p className="text-sm text-gray-500 mb-1">Total Views</p>
            <p className="text-4xl font-bold text-gray-900">{stats?.total_views?.toLocaleString() || 0}</p>
            <p className="text-sm text-gray-400 mt-1">{stats?.views_today || 0} today</p>
          </div>
          <div className="border-l-4 border-gray-200 pl-6 py-2">
            <p className="text-sm text-gray-500 mb-1">This Week</p>
            <p className="text-4xl font-bold text-gray-900">{stats?.views_this_week?.toLocaleString() || 0}</p>
            <p className="text-sm text-gray-400 mt-1">views</p>
          </div>
          <div className="border-l-4 border-gray-200 pl-6 py-2">
            <p className="text-sm text-gray-500 mb-1">Total Sales</p>
            <p className="text-4xl font-bold text-gray-900">{stats?.total_sales || 0}</p>
            <p className="text-sm text-gray-400 mt-1">
              {stats?.revenue_this_month ? `R${stats.revenue_this_month.toLocaleString()} this month` : 'No sales yet'}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-gray-100 rounded-lg p-1 max-w-xs">
          <button
            onClick={() => setActiveTab('listings')}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all ${
              activeTab === 'listings' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Listings
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all ${
              activeTab === 'orders' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Orders
          </button>
        </div>

        {/* ── Listings Tab ── */}
        {activeTab === 'listings' && (
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Your Listings</h2>
                <span className="text-sm text-gray-500">{listings.length} listing{listings.length !== 1 ? 's' : ''}</span>
              </div>

              {listings.length === 0 ? (
                <div className="py-16 text-center border border-gray-200 rounded-lg">
                  <p className="text-gray-500 mb-4">No listings yet</p>
                  <Link to="/seller/create-listing"
                    className="inline-flex px-6 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors">
                    Create your first listing
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                  {listings.map((listing) => (
                    <div key={listing.id} className="group">
                      <Link to={`/marketplace/${listing.id}`} className="block">
                        <div className="aspect-3/4 bg-gray-100 rounded-2xl overflow-hidden relative mb-3">
                          {listing.images?.[0] ? (
                            <img src={getImageUrl(listing.images[0])} alt={listing.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">No Image</div>
                          )}
                          <span className={`absolute top-3 left-3 px-2.5 py-1 text-xs font-semibold rounded-full ${
                            listing.status === 'active' ? 'bg-green-500 text-white'
                              : listing.status === 'sold' ? 'bg-gray-800 text-white'
                              : 'bg-yellow-500 text-white'
                          }`}>
                            {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
                          </span>
                        </div>
                      </Link>
                      <div>
                        <Link to={`/marketplace/${listing.id}`}>
                          <h3 className="font-medium text-gray-900 truncate group-hover:text-gray-600 transition-colors">
                            {listing.title}
                          </h3>
                        </Link>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-lg font-bold text-gray-900">R{listing.price?.toLocaleString()}</span>
                          <span className="text-sm text-gray-400">{listing.view_count || 0} views</span>
                        </div>
                        <div className="flex items-center gap-2 mt-3">
                          <Link to={`/seller/edit-listing/${listing.id}`}
                            className="flex-1 py-2 text-center text-sm font-medium text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                            Edit
                          </Link>
                          <button onClick={() => setDeleteConfirm(listing)}
                            className="flex-1 py-2 text-center text-sm font-medium text-red-600 bg-red-50 rounded-full hover:bg-red-100 transition-colors">
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
              <div className="space-y-3">
                <Link to="/seller/create-listing"
                  className="block w-full py-4 px-6 bg-[#FFCB32] text-gray-900 font-medium rounded-lg hover:bg-[#e6b82d] transition-colors text-center">
                  Create New Listing
                </Link>
                <Link to="/marketplace"
                  className="block w-full py-4 px-6 border border-gray-200 text-gray-900 font-medium rounded-lg hover:border-gray-900 transition-colors text-center">
                  Browse Marketplace
                </Link>
              </div>
              <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-3">Seller Tips</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>Use high-quality photos to attract buyers</li>
                  <li>Price competitively by checking similar listings</li>
                  <li>Respond quickly to buyer inquiries</li>
                  <li>Keep your listings up to date</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ── Orders Tab ── */}
        {activeTab === 'orders' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <h2 className="text-xl font-bold text-gray-900">Order Management</h2>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
              >
                <option value="">All Orders</option>
                {ORDER_STATUS_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {ordersLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin h-8 w-8 border-2 border-gray-900 border-t-transparent rounded-full" />
              </div>
            ) : orders.length === 0 ? (
              <div className="py-16 text-center border border-gray-200 rounded-lg">
                <p className="text-gray-500">No orders found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id || order.order_number} className="p-6 bg-gray-50 rounded-2xl">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      {/* Order Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap mb-2">
                          <p className="text-sm font-medium text-gray-900">{order.order_number}</p>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[order.order_status] || 'bg-gray-100 text-gray-600'}`}>
                            {order.order_status?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                          </span>
                          {order.payment_status && (
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                              order.payment_status === 'complete' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {order.payment_status === 'complete' ? 'Paid' : 'Payment ' + order.payment_status}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          {new Date(order.created_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })}
                          {order.guest_name && ` · ${order.guest_name}`}
                          {order.guest_email && ` · ${order.guest_email}`}
                        </p>
                        {order.shipping_address_line1 && (
                          <p className="text-xs text-gray-400 mt-1">
                            Ship to: {order.shipping_address_line1}, {order.shipping_city} {order.shipping_postal_code}
                          </p>
                        )}
                        {order.courier_tracking_number && (
                          <p className="text-xs text-purple-600 mt-1 font-mono">
                            Tracking: {order.courier_tracking_number}
                          </p>
                        )}
                      </div>

                      {/* Total */}
                      <div className="text-left lg:text-right shrink-0">
                        <p className="text-lg font-medium text-gray-900">R{Number(order.total_zar).toLocaleString()}</p>
                        <p className="text-xs text-gray-400">
                          {order.shipping_method === 'courier_guy' ? 'Courier Guy' : 'Collection'}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <select
                          value={order.order_status}
                          onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                          disabled={actionLoading === order.id}
                          className="px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-gray-200 disabled:opacity-50"
                        >
                          {ORDER_STATUS_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>

                        {order.shipping_method === 'courier_guy' && !order.courier_tracking_number && order.payment_status === 'complete' && (
                          <button
                            onClick={() => handleBookShipment(order.id)}
                            disabled={actionLoading === order.id}
                            className="px-4 py-2 bg-gray-900 text-white text-xs font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 whitespace-nowrap"
                          >
                            {actionLoading === order.id ? 'Booking...' : 'Book Courier'}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Order Items preview */}
                    {order.items && order.items.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex gap-3 overflow-x-auto pb-2">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex items-center gap-2 shrink-0">
                              <div className="w-10 h-10 bg-white rounded overflow-hidden">
                                {(item.photo_url || item.tcg_image_small) ? (
                                  <img src={getImageUrl(item.photo_url || item.tcg_image_small)} alt={item.product_name} className="w-full h-full object-contain" />
                                ) : (
                                  <div className="w-full h-full bg-gray-200" />
                                )}
                              </div>
                              <div>
                                <p className="text-xs font-medium text-gray-700 max-w-[120px] truncate">{item.product_name}</p>
                                <p className="text-xs text-gray-400">x{item.quantity}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Delete Listing</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{deleteConfirm.title}"? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} disabled={deleting}
                className="flex-1 py-2.5 border border-gray-300 rounded-full text-gray-700 font-medium hover:border-gray-900 transition-colors disabled:opacity-50">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteConfirm.id)} disabled={deleting}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-full font-medium hover:bg-red-700 transition-colors disabled:opacity-50">
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;
