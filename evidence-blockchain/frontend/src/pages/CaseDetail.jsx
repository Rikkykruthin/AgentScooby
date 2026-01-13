import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { HiOutlineArrowLeft, HiOutlineFolder, HiOutlineDocument, HiOutlineTruck, HiOutlineCheck, HiOutlineChartBar, HiOutlineDocumentArrowDown } from 'react-icons/hi2';

const CaseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCaseData();
    fetchAnalytics();
    fetchTimeline();
  }, [id]);

  const fetchCaseData = async () => {
    try {
      const { data } = await axios.get(`/api/cases/${id}`);
      setCaseData(data);
    } catch (error) {
      toast.error('Failed to fetch case details');
      navigate('/cases');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const { data } = await axios.get(`/api/cases/${id}/analytics`);
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to fetch analytics');
    }
  };

  const fetchTimeline = async () => {
    try {
      const { data } = await axios.get(`/api/cases/${id}/timeline`);
      setTimeline(data);
    } catch (error) {
      console.error('Failed to fetch timeline');
    }
  };

  const downloadCaseReport = async () => {
    try {
      const response = await axios.get(`/api/reports/case/${id}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `Case-Report-${caseData.caseId}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success('Case report downloaded');
    } catch (error) {
      toast.error('Failed to download report');
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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical': return 'bg-red-100 text-red-700';
      case 'High': return 'bg-orange-100 text-orange-700';
      case 'Medium': return 'bg-yellow-100 text-yellow-700';
      case 'Low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getTimelineIcon = (type) => {
    switch (type) {
      case 'case_created':
      case 'folder':
        return <HiOutlineFolder className="w-4 h-4" />;
      case 'evidence_added':
      case 'document':
        return <HiOutlineDocument className="w-4 h-4" />;
      case 'evidence_moved':
      case 'truck':
        return <HiOutlineTruck className="w-4 h-4" />;
      case 'case_closed':
      case 'check':
        return <HiOutlineCheck className="w-4 h-4" />;
      default:
        return <HiOutlineFolder className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!caseData) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/cases')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <HiOutlineArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-primary">{caseData.title}</h1>
            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(caseData.status)}`}>
              {caseData.status}
            </span>
            <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(caseData.priority)}`}>
              {caseData.priority}
            </span>
          </div>
          <p className="text-muted">{caseData.caseId} • Case No: {caseData.caseNo}</p>
        </div>
        <button
          onClick={downloadCaseReport}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          <HiOutlineDocumentArrowDown className="w-5 h-5" />
          Download Report
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {['overview', 'evidence', 'timeline', 'analytics'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
              activeTab === tab 
                ? 'text-primary border-b-2 border-primary' 
                : 'text-muted hover:text-primary'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-primary mb-4">Case Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted">Description</label>
                  <p className="text-primary mt-1">{caseData.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted">Type</label>
                    <p className="font-medium text-primary">{caseData.type}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted">Location</label>
                    <p className="font-medium text-primary">{caseData.location || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted">Filing Date</label>
                    <p className="font-medium text-primary">
                      {new Date(caseData.filingDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-muted">Assigned Officer</label>
                    <p className="font-medium text-primary">{caseData.assignedOfficer?.name || 'Unassigned'}</p>
                  </div>
                </div>
                {caseData.notes && (
                  <div>
                    <label className="text-sm text-muted">Notes</label>
                    <p className="text-primary mt-1">{caseData.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-primary mb-4">Quick Stats</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted">Evidence Items</span>
                  <span className="text-2xl font-bold text-primary">{caseData.evidenceCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted">Duration</span>
                  <span className="text-lg font-semibold text-primary">
                    {analytics?.durationDays || 0} days
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted">Movements</span>
                  <span className="text-lg font-semibold text-primary">{analytics?.movementCount || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted">Access Logs</span>
                  <span className="text-lg font-semibold text-primary">{analytics?.accessCount || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Evidence Tab */}
      {activeTab === 'evidence' && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-primary">Linked Evidence ({caseData.evidenceCount})</h2>
            <Link 
              to="/evidence" 
              className="text-sm text-primary hover:underline"
            >
              Add Evidence →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted uppercase">ID</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted uppercase">Name</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted uppercase">Type</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted uppercase">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted uppercase">Collected By</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {caseData.evidence?.map((ev) => (
                  <tr key={ev._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm mono text-primary">{ev.evidenceId}</td>
                    <td className="px-6 py-4 text-sm font-medium text-primary">{ev.name}</td>
                    <td className="px-6 py-4 text-sm text-muted">{ev.evidenceType}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                        {ev.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted">{ev.collectedBy?.name || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-muted">
                      {new Date(ev.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {(!caseData.evidence || caseData.evidence.length === 0) && (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-muted">
                      No evidence linked to this case
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Timeline Tab */}
      {activeTab === 'timeline' && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-primary mb-6">Case Timeline</h2>
          <div className="relative">
            {timeline.length > 0 ? (
              <div className="space-y-0">
                {timeline.map((event, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        event.type === 'case_created' ? 'bg-blue-100 text-blue-600' :
                        event.type === 'evidence_added' ? 'bg-green-100 text-green-600' :
                        event.type === 'evidence_moved' ? 'bg-amber-100 text-amber-600' :
                        event.type === 'case_closed' ? 'bg-purple-100 text-purple-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {getTimelineIcon(event.icon || event.type)}
                      </div>
                      {index < timeline.length - 1 && (
                        <div className="w-0.5 h-16 bg-gray-200"></div>
                      )}
                    </div>
                    <div className="flex-1 pb-8">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-primary">{event.title}</h3>
                        <span className="text-xs text-muted">
                          {new Date(event.date).toLocaleDateString()} {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-sm text-muted">{event.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted py-8">No timeline events yet</p>
            )}
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-primary mb-4">Evidence by Type</h2>
            {analytics.evidenceByType?.length > 0 ? (
              <div className="space-y-3">
                {analytics.evidenceByType.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-muted">{item._id || 'Unknown'}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${(item.count / analytics.totalEvidence) * 100}%` }}
                        ></div>
                      </div>
                      <span className="font-medium text-primary w-8 text-right">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted py-4">No evidence data</p>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-primary mb-4">Evidence by Status</h2>
            {analytics.evidenceByStatus?.length > 0 ? (
              <div className="space-y-3">
                {analytics.evidenceByStatus.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-muted">{item._id || 'Unknown'}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: `${(item.count / analytics.totalEvidence) * 100}%` }}
                        ></div>
                      </div>
                      <span className="font-medium text-primary w-8 text-right">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted py-4">No evidence data</p>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 md:col-span-2">
            <h2 className="text-lg font-semibold text-primary mb-4">Case Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-3xl font-bold text-blue-600">{analytics.totalEvidence}</p>
                <p className="text-sm text-blue-600">Total Evidence</p>
              </div>
              <div className="text-center p-4 bg-amber-50 rounded-lg">
                <p className="text-3xl font-bold text-amber-600">{analytics.movementCount}</p>
                <p className="text-sm text-amber-600">Movements</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-3xl font-bold text-purple-600">{analytics.accessCount}</p>
                <p className="text-sm text-purple-600">Access Logs</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-3xl font-bold text-green-600">{analytics.durationDays}</p>
                <p className="text-sm text-green-600">Days Active</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaseDetail;
