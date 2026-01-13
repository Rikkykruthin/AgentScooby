import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineMagnifyingGlass, HiOutlineEye, HiOutlineFolder, HiOutlineArrowPath } from 'react-icons/hi2';

const Cases = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    caseNo: '',
    title: '',
    description: '',
    type: 'Other',
    status: 'Open',
    priority: 'Medium',
    assignedOfficer: '',
    location: '',
    notes: ''
  });

  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    fetchCases();
    fetchUsers();
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const { data } = await axios.post('/api/cases/sync');
      toast.success(data.message);
      fetchCases();
    } catch (error) {
      toast.error('Failed to sync cases');
    }
    setSyncing(false);
  };

  const fetchCases = async () => {
    try {
      const { data } = await axios.get('/api/cases', { 
        params: { search, status: statusFilter } 
      });
      setCases(data);
    } catch (error) {
      toast.error('Failed to fetch cases');
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

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCases();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`/api/cases/${editingId}`, formData);
        toast.success('Case updated');
      } else {
        await axios.post('/api/cases', formData);
        toast.success('Case created');
      }
      setShowModal(false);
      resetForm();
      fetchCases();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (c) => {
    setEditingId(c._id);
    setFormData({
      caseNo: c.caseNo,
      title: c.title,
      description: c.description,
      type: c.type,
      status: c.status,
      priority: c.priority,
      assignedOfficer: c.assignedOfficer?._id || '',
      location: c.location || '',
      notes: c.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this case?')) return;
    try {
      await axios.delete(`/api/cases/${id}`);
      toast.success('Case deleted');
      fetchCases();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete case');
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      caseNo: '',
      title: '',
      description: '',
      type: 'Other',
      status: 'Open',
      priority: 'Medium',
      assignedOfficer: '',
      location: '',
      notes: ''
    });
  };

  const canCreate = ['admin', 'forensic', 'police'].includes(user?.role);
  const canDelete = user?.role === 'admin';

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical': return 'bg-red-100 text-red-700';
      case 'High': return 'bg-orange-100 text-orange-700';
      case 'Medium': return 'bg-yellow-100 text-yellow-700';
      case 'Low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open': return 'bg-blue-100 text-blue-700';
      case 'Under Investigation': return 'bg-purple-100 text-purple-700';
      case 'Pending Trial': return 'bg-amber-100 text-amber-700';
      case 'Closed': return 'bg-green-100 text-green-700';
      case 'Archived': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Case Management</h1>
          <p className="text-muted text-sm mt-1">Create and manage investigation cases</p>
        </div>
        <div className="flex gap-2">
          {canCreate && (
            <button
              onClick={handleSync}
              disabled={syncing}
              className="btn btn-secondary disabled:opacity-50"
              title="Sync cases from existing evidence"
            >
              <HiOutlineArrowPath className={`w-5 h-5 ${syncing ? 'animate-spin' : ''}`} />
              Sync
            </button>
          )}
          {canCreate && (
            <button
              onClick={() => { resetForm(); setShowModal(true); }}
              className="btn btn-primary"
            >
              <HiOutlinePlus className="w-5 h-5" />
              New Case
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <form onSubmit={handleSearch} className="flex gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search cases..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all">
            Search
          </button>
        </form>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); }}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:border-primary outline-none"
        >
          <option value="">All Status</option>
          <option value="Open">Open</option>
          <option value="Under Investigation">Under Investigation</option>
          <option value="Pending Trial">Pending Trial</option>
          <option value="Closed">Closed</option>
          <option value="Archived">Archived</option>
        </select>
      </div>

      {/* Cases Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {cases.map((c) => (
          <div key={c._id} className="card p-5 hover:shadow-card-hover">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <HiOutlineFolder className="w-5 h-5 text-slate-400" />
                <span className="text-xs font-medium text-slate-500">{c.caseId}</span>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(c.priority)}`}>
                {c.priority}
              </span>
            </div>
            
            <h3 className="font-semibold text-primary mb-1 truncate">{c.title}</h3>
            <p className="text-sm text-muted mb-3">Case No: {c.caseNo}</p>
            
            <p className="text-sm text-slate-600 mb-4 line-clamp-2">{c.description}</p>
            
            <div className="flex items-center justify-between mb-4">
              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(c.status)}`}>
                {c.status}
              </span>
              <span className="text-xs text-muted">
                {c.evidenceCount} evidence
              </span>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <span className="text-xs text-muted">
                {c.assignedOfficer?.name || 'Unassigned'}
              </span>
              <div className="flex gap-1">
                <button 
                  onClick={() => navigate(`/cases/${c._id}`)}
                  className="p-1.5 text-slate-600 hover:bg-slate-50 rounded"
                  title="View Details"
                >
                  <HiOutlineEye className="w-4 h-4" />
                </button>
                {canCreate && (
                  <button 
                    onClick={() => handleEdit(c)} 
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                    title="Edit"
                  >
                    <HiOutlinePencil className="w-4 h-4" />
                  </button>
                )}
                {canDelete && (
                  <button 
                    onClick={() => handleDelete(c._id)} 
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                    title="Delete"
                  >
                    <HiOutlineTrash className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {cases.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted">
            No cases found
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-xl font-semibold text-primary">
                {editingId ? 'Edit Case' : 'Create New Case'}
              </h2>
              <p className="text-sm text-muted mt-1">Fill in the case details</p>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Case Number</label>
                  <input
                    type="text"
                    value={formData.caseNo}
                    onChange={(e) => setFormData({...formData, caseNo: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary outline-none"
                    placeholder="e.g., CR-2024-001"
                    required
                    disabled={editingId}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Case Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary outline-none"
                  >
                    <option value="Criminal">Criminal</option>
                    <option value="Civil">Civil</option>
                    <option value="Fraud">Fraud</option>
                    <option value="Theft">Theft</option>
                    <option value="Assault">Assault</option>
                    <option value="Homicide">Homicide</option>
                    <option value="Cybercrime">Cybercrime</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Case Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary outline-none"
                  rows="3"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary outline-none"
                  >
                    <option value="Open">Open</option>
                    <option value="Under Investigation">Under Investigation</option>
                    <option value="Pending Trial">Pending Trial</option>
                    <option value="Closed">Closed</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary outline-none"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Officer</label>
                <select
                  value={formData.assignedOfficer}
                  onChange={(e) => setFormData({...formData, assignedOfficer: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary outline-none"
                >
                  <option value="">Select Officer</option>
                  {users.map((u) => (
                    <option key={u._id} value={u._id}>{u.name} - {u.designation}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary outline-none"
                  placeholder="Incident location"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary outline-none"
                  rows="2"
                  placeholder="Additional notes..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 py-3 btn btn-primary justify-center">
                  {editingId ? 'Update Case' : 'Create Case'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 btn btn-secondary justify-center">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cases;
