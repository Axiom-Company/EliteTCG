import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../components/ui/dialog';
import { ELITE_API_URL } from '@/config/api';

const API_BASE_URL = ELITE_API_URL;

const statusStyles = {
  pending: 'bg-yellow-900/30 text-yellow-400 border border-yellow-800/30',
  approved: 'bg-[#3ECF8E]/10 text-[#3ECF8E] border border-[#3ECF8E]/20',
  rejected: 'bg-red-950/30 text-red-400 border border-red-900/30',
};

const SellerApplications = () => {
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selectedApp, setSelectedApp] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const getToken = () => localStorage.getItem('admin_token');

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const res = await fetch(
        `${API_BASE_URL}/api/admin/seller-applications?status=${statusFilter}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const data = await res.json();
      if (res.ok) setApplications(data.applications || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = getToken();
      const res = await fetch(
        `${API_BASE_URL}/api/admin/seller-applications/stats/overview`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const data = await res.json();
      if (res.ok) setStats(data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchApplications();
    fetchStats();
  }, [statusFilter]);

  const handleApprove = async () => {
    if (!selectedApp) return;
    setActionLoading(true);
    try {
      const token = getToken();
      const res = await fetch(
        `${API_BASE_URL}/api/admin/seller-applications/${selectedApp.id}/approve`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ admin_notes: adminNotes }),
        }
      );
      if (res.ok) {
        setShowReviewModal(false);
        setSelectedApp(null);
        setAdminNotes('');
        fetchApplications();
        fetchStats();
      }
    } catch (error) {
      console.error('Error approving application:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedApp || !rejectionReason.trim()) return;
    setActionLoading(true);
    try {
      const token = getToken();
      const res = await fetch(
        `${API_BASE_URL}/api/admin/seller-applications/${selectedApp.id}/reject`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ rejection_reason: rejectionReason, admin_notes: adminNotes }),
        }
      );
      if (res.ok) {
        setShowReviewModal(false);
        setSelectedApp(null);
        setRejectionReason('');
        setAdminNotes('');
        fetchApplications();
        fetchStats();
      }
    } catch (error) {
      console.error('Error rejecting application:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const openReviewModal = (app) => {
    setSelectedApp(app);
    setRejectionReason('');
    setAdminNotes('');
    setShowReviewModal(true);
  };

  const filterTabs = [
    { label: 'All', value: '', count: stats.total },
    { label: 'Pending', value: 'pending', count: stats.pending },
    { label: 'Approved', value: 'approved', count: stats.approved },
    { label: 'Rejected', value: 'rejected', count: stats.rejected },
  ];

  return (
    <div>
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-base font-medium text-[#f1f1f1]">Seller Applications</h1>
        <p className="text-sm text-[#6b6b6b] mt-0.5">Review and manage seller requests</p>
      </div>

      {/* Stat chips / filter tabs */}
      <div className="flex items-center gap-2 mb-6">
        {filterTabs.map(({ label, value, count }) => (
          <button
            key={label}
            onClick={() => setStatusFilter(value)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm transition-colors border ${
              statusFilter === value
                ? 'bg-[#1c1c1c] text-[#f1f1f1] border-[#333]'
                : 'bg-transparent text-[#6b6b6b] border-[#282828] hover:border-[#333] hover:text-[#c4c4c4]'
            }`}
          >
            {label}
            <span className={`text-xs px-1.5 py-0.5 rounded ${statusFilter === value ? 'bg-[#282828] text-[#a0a0a0]' : 'bg-[#1c1c1c] text-[#6b6b6b]'}`}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="border border-[#282828] rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin h-5 w-5 border-2 border-[#3ECF8E] border-t-transparent rounded-full" />
          </div>
        ) : applications.length === 0 ? (
          <div className="py-16 text-center text-[#6b6b6b] text-sm">
            No {statusFilter || ''} applications found
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#282828] bg-[#111111]">
                {['Applicant', 'Email', 'PayFast Email', 'Status', 'Date', ''].map((col) => (
                  <th key={col} className="px-4 py-3 text-left text-xs font-medium text-[#6b6b6b]">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.id} className="border-b border-[#1a1a1a] last:border-0 hover:bg-[#171717] transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-sm text-[#f1f1f1] font-medium">{app.display_name}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-[#a0a0a0]">{app.customer?.email || '—'}</td>
                  <td className="px-4 py-3 text-sm text-[#a0a0a0]">{app.payfast_email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 text-xs rounded-full ${statusStyles[app.status]}`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-[#6b6b6b]">
                    {new Date(app.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => openReviewModal(app)}
                      className="px-3 py-1.5 text-xs text-[#c4c4c4] border border-[#282828] rounded-lg hover:border-[#333] hover:text-[#f1f1f1] transition-colors"
                    >
                      {app.status === 'pending' ? 'Review' : 'View'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Review Modal */}
      <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-medium">Review Application</DialogTitle>
          </DialogHeader>

          {selectedApp && (
            <div className="space-y-5">
              {/* Applicant info grid */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Display Name', value: selectedApp.display_name },
                  { label: 'Customer Email', value: selectedApp.customer?.email || '—' },
                  { label: 'PayFast Email', value: selectedApp.payfast_email },
                  { label: 'Applied', value: new Date(selectedApp.created_at).toLocaleString() },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs text-[#6b6b6b] mb-1">{label}</p>
                    <p className="text-sm text-[#f1f1f1]">{value}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-[#282828]" />

              {/* Reason */}
              <div>
                <p className="text-xs text-[#6b6b6b] mb-2">Reason for Selling</p>
                <p className="p-3 bg-[#1c1c1c] border border-[#282828] rounded-lg text-sm text-[#c4c4c4]">
                  {selectedApp.reason}
                </p>
              </div>

              {/* Experience */}
              {selectedApp.experience && (
                <div>
                  <p className="text-xs text-[#6b6b6b] mb-2">Experience</p>
                  <p className="p-3 bg-[#1c1c1c] border border-[#282828] rounded-lg text-sm text-[#c4c4c4]">
                    {selectedApp.experience}
                  </p>
                </div>
              )}

              {/* Status */}
              <div className="flex items-center gap-3">
                <p className="text-xs text-[#6b6b6b]">Status</p>
                <span className={`px-2.5 py-1 text-xs rounded-full ${statusStyles[selectedApp.status]}`}>
                  {selectedApp.status}
                </span>
              </div>

              {/* Rejection reason (if already rejected) */}
              {selectedApp.status === 'rejected' && selectedApp.rejection_reason && (
                <div>
                  <p className="text-xs text-[#6b6b6b] mb-2">Rejection Reason</p>
                  <p className="p-3 bg-red-950/30 border border-red-900/30 rounded-lg text-sm text-red-400">
                    {selectedApp.rejection_reason}
                  </p>
                </div>
              )}

              {/* Action inputs for pending */}
              {selectedApp.status === 'pending' && (
                <>
                  <div className="border-t border-[#282828]" />
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-[#6b6b6b] block mb-2">Admin Notes (optional)</label>
                      <textarea
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        rows={2}
                        placeholder="Internal notes..."
                        className="w-full px-3 py-2 bg-[#1c1c1c] border border-[#282828] rounded-lg text-sm text-[#f1f1f1] placeholder-[#4a4a4a] outline-none focus:border-[#3ECF8E] transition-colors resize-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-[#6b6b6b] block mb-2">Rejection Reason <span className="text-[#4a4a4a]">(required if rejecting)</span></label>
                      <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        rows={2}
                        placeholder="Explain why this application is being rejected..."
                        className="w-full px-3 py-2 bg-[#1c1c1c] border border-[#282828] rounded-lg text-sm text-[#f1f1f1] placeholder-[#4a4a4a] outline-none focus:border-[#3ECF8E] transition-colors resize-none"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          <DialogFooter>
            <button
              onClick={() => setShowReviewModal(false)}
              className="px-4 py-2 text-sm text-[#c4c4c4] border border-[#282828] rounded-lg hover:border-[#333] transition-colors"
            >
              Close
            </button>
            {selectedApp?.status === 'pending' && (
              <>
                <button
                  onClick={handleReject}
                  disabled={actionLoading || !rejectionReason.trim()}
                  className="px-4 py-2 text-sm text-red-400 border border-red-900/40 bg-red-950/20 rounded-lg hover:bg-red-950/40 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {actionLoading ? 'Processing...' : 'Reject'}
                </button>
                <button
                  onClick={handleApprove}
                  disabled={actionLoading}
                  className="px-4 py-2 text-sm font-medium bg-[#3ECF8E] hover:bg-[#2db87a] text-[#0f0f0f] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? 'Processing...' : 'Approve'}
                </button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SellerApplications;
