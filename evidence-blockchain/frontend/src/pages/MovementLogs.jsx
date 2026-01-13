import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlineTruck } from 'react-icons/hi2';

const MovementLogs = () => {
  const [logs, setLogs] = useState([]);
  const [evidence, setEvidence] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    evidenceId: '',
    caseNo: '',
    source: '',
    destination: '',
    purpose: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [logsRes, evidenceRes] = await Promise.all([
        axios.get('/api/logs/movement'),
        axios.get('/api/evidence')
      ]);
      setLogs(logsRes.data);
      setEvidence(evidenceRes.data);
    } catch (error) {
      toast.error('Failed to fetch data');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/logs/movement', formData);
      toast.success('Movement log created');
      setShowModal(false);
      setFormData({ evidenceId: '', caseNo: '', source: '', destination: '', purpose: '' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create log');
    }
  };

  const handleEvidenceSelect = (e) => {
    const selectedEv = evidence.find(ev => ev._id === e.target.value);
    setFormData({
      ...formData,
      evidenceId: e.target.value,
      caseNo: selectedEv?.caseNo || ''
    });
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`/api/logs/movement/${id}`, { status });
      toast.success('Status updated');
      fetchData();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary">Movement Logs</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all"
        >
          <HiOutlinePlus className="w-5 h-5" />
          New Movement
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-muted uppercase">Log ID</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-muted uppercase">Evidence</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-muted uppercase">Case No</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-muted uppercase">Source → Destination</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-muted uppercase">Officer</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-muted uppercase">Status</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-muted uppercase">Hash</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-muted uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.map((log) => (
                <tr key={log._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm mono text-primary">{log.logId}</td>
                  <td className="px-6 py-4 text-sm font-medium text-primary">{log.evidence?.name}</td>
                  <td className="px-6 py-4 text-sm text-muted">{log.caseNo}</td>
                  <td className="px-6 py-4 text-sm text-muted">
                    <div className="flex items-center gap-2">
                      <span>{log.source}</span>
                      <HiOutlineTruck className="w-4 h-4 text-muted" />
                      <span>{log.destination}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted">{log.officerIncharge?.name}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      log.status === 'Evidence Arrived' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="mono text-xs text-muted">{log.currentHash?.slice(0, 16)}...</span>
                  </td>
                  <td className="px-6 py-4">
                    {log.status !== 'Evidence Arrived' && (
                      <button
                        onClick={() => updateStatus(log._id, 'Evidence Arrived')}
                        className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                      >
                        Mark Arrived
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-muted">No movement logs found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-primary">New Movement Log</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Evidence</label>
                <select
                  value={formData.evidenceId}
                  onChange={handleEvidenceSelect}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary outline-none"
                  required
                >
                  <option value="">Select Evidence</option>
                  {evidence.map(ev => (
                    <option key={ev._id} value={ev._id}>{ev.name} ({ev.evidenceId})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Case Number</label>
                <input
                  type="text"
                  value={formData.caseNo}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Source Location</label>
                <input
                  type="text"
                  value={formData.source}
                  onChange={(e) => setFormData({...formData, source: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
                <input
                  type="text"
                  value={formData.destination}
                  onChange={(e) => setFormData({...formData, destination: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
                <input
                  type="text"
                  value={formData.purpose}
                  onChange={(e) => setFormData({...formData, purpose: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary outline-none"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
                  Create Log
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">
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

export default MovementLogs;
