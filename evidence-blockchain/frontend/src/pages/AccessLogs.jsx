import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlineArrowRightOnRectangle } from 'react-icons/hi2';

const AccessLogs = () => {
  const [logs, setLogs] = useState([]);
  const [evidence, setEvidence] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    evidenceId: '',
    caseNo: '',
    purpose: 'To Store Evidence',
    count: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [logsRes, evidenceRes] = await Promise.all([
        axios.get('/api/logs/access'),
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
      await axios.post('/api/logs/access', formData);
      toast.success('Access log created - Officer entered');
      setShowModal(false);
      setFormData({ evidenceId: '', caseNo: '', purpose: 'To Store Evidence', count: 0 });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create log');
    }
  };

  const handleExit = async (id) => {
    try {
      await axios.put(`/api/logs/access/${id}/exit`);
      toast.success('Officer exit recorded');
      fetchData();
    } catch (error) {
      toast.error('Failed to record exit');
    }
  };

  const purposes = [
    'To Store Evidence',
    'To Take Evidence',
    'For Analysis',
    'For Court',
    'Inspection'
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary">Access Logs</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all"
        >
          <HiOutlinePlus className="w-5 h-5" />
          Record Entry
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-muted uppercase">Log ID</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-muted uppercase">Officer</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-muted uppercase">Department</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-muted uppercase">Purpose</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-muted uppercase">Entry Time</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-muted uppercase">Exit Time</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-muted uppercase">Status</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-muted uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.map((log) => (
                <tr key={log._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm mono text-primary">{log.logId}</td>
                  <td className="px-6 py-4 text-sm font-medium text-primary">{log.officer?.name}</td>
                  <td className="px-6 py-4 text-sm text-muted capitalize">{log.department}</td>
                  <td className="px-6 py-4 text-sm text-muted">{log.purpose}</td>
                  <td className="px-6 py-4 text-sm text-muted">
                    {new Date(log.entryTime).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted">
                    {log.exitTime ? new Date(log.exitTime).toLocaleString() : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      log.status === 'Officer Exited' 
                        ? 'bg-gray-100 text-gray-700' 
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {log.status === 'Officer Entered' && (
                      <button
                        onClick={() => handleExit(log._id)}
                        className="flex items-center gap-1 text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                      >
                        <HiOutlineArrowRightOnRectangle className="w-3 h-3" />
                        Exit
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-muted">No access logs found</td>
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
              <h2 className="text-lg font-semibold text-primary">Record Entry</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Evidence (Optional)</label>
                <select
                  value={formData.evidenceId}
                  onChange={(e) => setFormData({...formData, evidenceId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary outline-none"
                >
                  <option value="">General Access</option>
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
                  onChange={(e) => setFormData({...formData, caseNo: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
                <select
                  value={formData.purpose}
                  onChange={(e) => setFormData({...formData, purpose: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary outline-none"
                  required
                >
                  {purposes.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Evidence Count</label>
                <input
                  type="number"
                  value={formData.count}
                  onChange={(e) => setFormData({...formData, count: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary outline-none"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
                  Record Entry
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

export default AccessLogs;
