import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineMagnifyingGlass, HiOutlineQrCode, HiOutlineDocumentArrowDown } from 'react-icons/hi2';
import QRCodeModal from '../components/QRCodeModal';

const Evidence = () => {
  const { user } = useAuth();
  const [evidence, setEvidence] = useState([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [files, setFiles] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    caseNo: '',
    evidenceType: 'Physical',
    description: '',
    collectionLocation: '',
    storageLocation: '',
    storagePointer: '',
    status: 'Collected'
  });
  const [qrEvidence, setQrEvidence] = useState(null);
  const [reportEvidence, setReportEvidence] = useState(null);

  const downloadReport = async (evidenceId, type) => {
    try {
      const endpoint = type === 'evidence' ? `/api/reports/evidence/${evidenceId}` : `/api/reports/custody/${evidenceId}`;
      const response = await axios.get(endpoint, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `${type === 'evidence' ? 'Evidence-Report' : 'Chain-of-Custody'}-${evidenceId}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success('Report downloaded');
    } catch (error) {
      toast.error('Failed to download report');
    }
  };

  useEffect(() => {
    fetchEvidence();
  }, []);

  const fetchEvidence = async () => {
    try {
      const { data } = await axios.get('/api/evidence', { params: { search } });
      setEvidence(data);
    } catch (error) {
      toast.error('Failed to fetch evidence');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchEvidence();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`/api/evidence/${editingId}`, formData);
        toast.success('Evidence updated');
      } else {
        // Create FormData for file upload
        const data = new FormData();
        Object.keys(formData).forEach(key => {
          data.append(key, formData[key]);
        });
        
        // Append files
        files.forEach(file => {
          data.append('files', file);
        });

        await axios.post('/api/evidence', data, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        toast.success('Evidence added with files');
      }
      setShowModal(false);
      resetForm();
      setFiles([]);
      fetchEvidence();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (ev) => {
    setEditingId(ev._id);
    setFormData({
      name: ev.name,
      caseNo: ev.caseNo,
      evidenceType: ev.evidenceType,
      description: ev.description,
      collectionLocation: ev.collectionLocation,
      storageLocation: ev.storageLocation,
      storagePointer: ev.storagePointer,
      status: ev.status
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this evidence?')) return;
    try {
      await axios.delete(`/api/evidence/${id}`);
      toast.success('Evidence deleted');
      fetchEvidence();
    } catch (error) {
      toast.error('Failed to delete evidence');
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFiles([]);
    setFormData({
      name: '',
      caseNo: '',
      evidenceType: 'Physical',
      description: '',
      collectionLocation: '',
      storageLocation: '',
      storagePointer: '',
      status: 'Collected'
    });
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
  };

  const canEdit = ['admin', 'forensic'].includes(user?.role);
  const canAdd = ['admin', 'forensic', 'police', 'staff'].includes(user?.role);
  const canDelete = user?.role === 'admin';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary dark:text-white">Evidence Management</h1>
          <p className="text-muted dark:text-slate-400 text-sm mt-1">Manage and track all evidence items</p>
        </div>
        {canAdd && (
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="btn btn-primary"
          >
            <HiOutlinePlus className="w-5 h-5" />
            Add Evidence
          </button>
        )}
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="relative flex-1 max-w-md">
          <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted dark:text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, case number, or ID..."
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none bg-white dark:bg-slate-700 dark:text-white"
          />
        </div>
        <button type="submit" className="btn btn-secondary">
          Search
        </button>
      </form>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="table-header">
              <tr>
                <th className="text-left px-6 py-4">ID</th>
                <th className="text-left px-6 py-4">Name</th>
                <th className="text-left px-6 py-4">Case No</th>
                <th className="text-left px-6 py-4">Type</th>
                <th className="text-left px-6 py-4">Collected By</th>
                <th className="text-left px-6 py-4">Storage</th>
                <th className="text-left px-6 py-4">Status</th>
                <th className="text-left px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {evidence.map((ev) => (
                <tr key={ev._id} className="table-row">
                  <td className="px-6 py-4">
                    <span className="mono text-sm font-medium text-accent">{ev.evidenceId}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-primary dark:text-white">{ev.name}</div>
                    {ev.attachments && ev.attachments.length > 0 && (
                      <div className="mt-1 text-xs text-muted dark:text-slate-400">
                        {ev.attachments.length} file{ev.attachments.length > 1 ? 's' : ''} attached
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted dark:text-slate-400">{ev.caseNo}</td>
                  <td className="px-6 py-4">
                    <span className="badge badge-info">{ev.evidenceType}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted">{ev.collectedBy?.name || 'Unknown'}</td>
                  <td className="px-6 py-4 text-sm text-muted">{ev.storageLocation}</td>
                  <td className="px-6 py-4">
                    <span className="badge badge-success">{ev.status}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setQrEvidence(ev)} 
                        className="p-1 text-slate-600 hover:bg-slate-50 rounded"
                        title="Generate QR Code"
                      >
                        <HiOutlineQrCode className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setReportEvidence(ev)} 
                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                        title="Download Reports"
                      >
                        <HiOutlineDocumentArrowDown className="w-4 h-4" />
                      </button>
                      {canEdit && (
                        <button onClick={() => handleEdit(ev)} className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                          <HiOutlinePencil className="w-4 h-4" />
                        </button>
                      )}
                      {canDelete && (
                        <button onClick={() => handleDelete(ev._id)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                          <HiOutlineTrash className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {evidence.length === 0 && (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-muted">
                    <HiOutlineMagnifyingGlass className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No evidence found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700">
              <h2 className="text-xl font-semibold text-primary dark:text-white">
                {editingId ? 'Edit Evidence' : 'Add New Evidence'}
              </h2>
              <p className="text-sm text-muted dark:text-slate-400 mt-1">Fill in the details below</p>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Evidence Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Case Number</label>
                  <input
                    type="text"
                    value={formData.caseNo}
                    onChange={(e) => setFormData({...formData, caseNo: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Evidence Type</label>
                  <select
                    value={formData.evidenceType}
                    onChange={(e) => setFormData({...formData, evidenceType: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary outline-none"
                  >
                    <option value="Digital">Digital</option>
                    <option value="Physical">Physical</option>
                    <option value="Biological">Biological</option>
                    <option value="Documentary">Documentary</option>
                    <option value="Weapon">Weapon</option>
                    <option value="Drug">Drug</option>
                    <option value="Financial">Financial</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary outline-none"
                  >
                    <option value="Collected">Collected</option>
                    <option value="In Storage">In Storage</option>
                    <option value="In Transit">In Transit</option>
                    <option value="Under Analysis">Under Analysis</option>
                    <option value="In Court">In Court</option>
                    <option value="Disposed">Disposed</option>
                  </select>
                </div>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Collection Location</label>
                  <input
                    type="text"
                    value={formData.collectionLocation}
                    onChange={(e) => setFormData({...formData, collectionLocation: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Storage Location</label>
                  <input
                    type="text"
                    value={formData.storageLocation}
                    onChange={(e) => setFormData({...formData, storageLocation: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary outline-none"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Storage Pointer (File path/IPFS hash/Location code)</label>
                <input
                  type="text"
                  value={formData.storagePointer}
                  onChange={(e) => setFormData({...formData, storagePointer: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary outline-none"
                  placeholder="e.g., /evidence/case123/item1 or QmXxx..."
                  required
                />
              </div>
              
              {!editingId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Files (Images, Documents, etc.)
                  </label>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary outline-none"
                    accept="*/*"
                  />
                  {files.length > 0 && (
                    <div className="mt-2 text-xs text-muted">
                      <p className="font-medium">Selected files ({files.length}):</p>
                      <ul className="list-disc list-inside">
                        {files.map((file, idx) => (
                          <li key={idx}>{file.name} ({(file.size / 1024).toFixed(2)} KB)</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 py-3 btn btn-primary justify-center">
                  {editingId ? 'Update Evidence' : 'Add Evidence'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 btn btn-secondary justify-center">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      <QRCodeModal 
        evidence={qrEvidence}
        isOpen={!!qrEvidence}
        onClose={() => setQrEvidence(null)}
      />

      {/* Report Download Modal */}
      {reportEvidence && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setReportEvidence(null)}>
          <div className="bg-white rounded-xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-primary mb-4">Download Reports</h3>
            <p className="text-sm text-muted mb-4">Evidence: {reportEvidence.evidenceId} - {reportEvidence.name}</p>
            <div className="space-y-3">
              <button
                onClick={() => { downloadReport(reportEvidence._id, 'evidence'); setReportEvidence(null); }}
                className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <HiOutlineDocumentArrowDown className="w-5 h-5" />
                <div className="text-left">
                  <p className="font-medium">Evidence Report</p>
                  <p className="text-xs text-blue-600">Complete evidence details & blockchain verification</p>
                </div>
              </button>
              <button
                onClick={() => { downloadReport(reportEvidence._id, 'custody'); setReportEvidence(null); }}
                className="w-full flex items-center gap-3 px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
              >
                <HiOutlineDocumentArrowDown className="w-5 h-5" />
                <div className="text-left">
                  <p className="font-medium">Chain of Custody Certificate</p>
                  <p className="text-xs text-green-600">Complete custody history & access logs</p>
                </div>
              </button>
            </div>
            <button
              onClick={() => setReportEvidence(null)}
              className="w-full mt-4 py-2 text-muted hover:text-primary transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Evidence;
