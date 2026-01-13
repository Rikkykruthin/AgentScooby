import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  HiOutlineMagnifyingGlass,
  HiOutlineAdjustmentsHorizontal,
  HiOutlineDocumentMagnifyingGlass,
  HiOutlineCheckCircle,
  HiOutlineXCircle
} from 'react-icons/hi2';

const AuditTrail = () => {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 0 });

  // Filters
  const [filters, setFilters] = useState({
    action: '',
    actor: '',
    targetType: '',
    status: '',
    search: '',
    startDate: '',
    endDate: '',
    page: 1
  });

  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchLogs();
    fetchStats();
    fetchUsers();
  }, []);

  const fetchLogs = async (newFilters = filters) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.keys(newFilters).forEach(key => {
        if (newFilters[key]) {
          params.append(key, newFilters[key]);
        }
      });

      const { data } = await axios.get(`/api/audit?${params.toString()}`);
      setLogs(data.logs);
      setPagination(data.pagination);
    } catch (error) {
      toast.error('Failed to fetch audit logs');
    }
    setLoading(false);
  };

  const fetchStats = async () => {
    try {
      const { data } = await axios.get('/api/audit/stats');
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats');
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get('/api/auth/users');
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users');
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value, page: 1 };
    setFilters(newFilters);
    fetchLogs(newFilters);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchLogs();
  };

  const clearFilters = () => {
    const clearedFilters = {
      action: '',
      actor: '',
      targetType: '',
      status: '',
      search: '',
      startDate: '',
      endDate: '',
      page: 1
    };
    setFilters(clearedFilters);
    fetchLogs(clearedFilters);
  };

  const handlePageChange = (newPage) => {
    const newFilters = { ...filters, page: newPage };
    setFilters(newFilters);
    fetchLogs(newFilters);
  };

  const getActionBadge = (action) => {
    const colors = {
      LOGIN: 'bg-blue-100 text-blue-700',
      LOGOUT: 'bg-gray-100 text-gray-700',
      EVIDENCE_CREATED: 'bg-green-100 text-green-700',
      EVIDENCE_UPDATED: 'bg-yellow-100 text-yellow-700',
      EVIDENCE_DELETED: 'bg-red-100 text-red-700',
      EVIDENCE_VERIFIED: 'bg-purple-100 text-purple-700',
      MOVEMENT_LOG_CREATED: 'bg-blue-100 text-blue-700',
      ACCESS_LOG_CREATED: 'bg-indigo-100 text-indigo-700'
    };
    return colors[action] || 'bg-gray-100 text-gray-700';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Audit Trail Dashboard</h1>
          <p className="text-muted mt-1">Complete activity log of all system actions</p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          <HiOutlineAdjustmentsHorizontal className="w-5 h-5" />
          Filters
        </button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="text-sm text-muted">Total Activity Logs</div>
            <div className="text-2xl font-bold text-primary mt-1">{stats.totalLogs}</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="text-sm text-muted">Evidence Operations</div>
            <div className="text-2xl font-bold text-green-600 mt-1">
              {stats.actionCounts.filter(a => a._id.startsWith('EVIDENCE')).reduce((sum, a) => sum + a.count, 0)}
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="text-sm text-muted">Access Events</div>
            <div className="text-2xl font-bold text-blue-600 mt-1">
              {stats.actionCounts.filter(a => a._id.includes('LOG') || a._id === 'LOGIN').reduce((sum, a) => sum + a.count, 0)}
            </div>
          </div>
        </div>
      )}

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Action Type</label>
              <select
                value={filters.action}
                onChange={(e) => handleFilterChange('action', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary outline-none"
              >
                <option value="">All Actions</option>
                <option value="LOGIN">Login</option>
                <option value="EVIDENCE_CREATED">Evidence Created</option>
                <option value="EVIDENCE_UPDATED">Evidence Updated</option>
                <option value="EVIDENCE_DELETED">Evidence Deleted</option>
                <option value="EVIDENCE_VERIFIED">Evidence Verified</option>
                <option value="MOVEMENT_LOG_CREATED">Movement Log</option>
                <option value="ACCESS_LOG_CREATED">Access Log</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
              <select
                value={filters.actor}
                onChange={(e) => handleFilterChange('actor', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary outline-none"
              >
                <option value="">All Users</option>
                {users.map(user => (
                  <option key={user._id} value={user._id}>{user.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary outline-none"
              >
                <option value="">All Status</option>
                <option value="SUCCESS">Success</option>
                <option value="FAILED">Failed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary outline-none"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="relative flex-1">
          <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            placeholder="Search by evidence name or case number..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
          />
        </div>
        <button type="submit" className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
          Search
        </button>
      </form>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-medium text-muted uppercase">Timestamp</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-muted uppercase">Action</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-muted uppercase">User</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-muted uppercase">Target</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-muted uppercase">Details</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-muted uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {logs.map((log) => (
                    <tr key={log._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-muted">{formatDate(log.createdAt)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${getActionBadge(log.action)}`}>
                          {log.action.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-primary">{log.actor?.name}</div>
                        <div className="text-xs text-muted">{log.actor?.role}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-primary">{log.targetName || '-'}</div>
                        <div className="text-xs text-muted">{log.targetType || '-'}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted">
                        {log.details?.caseNo && <div>Case: {log.details.caseNo}</div>}
                        {log.details?.evidenceId && <div>ID: {log.details.evidenceId}</div>}
                        {log.details?.filesCount && <div>Files: {log.details.filesCount}</div>}
                      </td>
                      <td className="px-6 py-4">
                        {log.status === 'SUCCESS' ? (
                          <HiOutlineCheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <HiOutlineXCircle className="w-5 h-5 text-red-500" />
                        )}
                      </td>
                    </tr>
                  ))}
                  {logs.length === 0 && (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center">
                        <HiOutlineDocumentMagnifyingGlass className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                        <p className="text-muted">No audit logs found</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-muted">
                  Showing {((pagination.page - 1) * 50) + 1} to {Math.min(pagination.page * 50, pagination.total)} of {pagination.total} logs
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1">
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                    className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AuditTrail;
