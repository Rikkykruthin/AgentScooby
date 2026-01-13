import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  HiOutlineArchiveBox, 
  HiOutlineTruck, 
  HiOutlineUserPlus,
  HiOutlineArrowRightOnRectangle,
  HiOutlinePencilSquare,
  HiOutlineCheckCircle
} from 'react-icons/hi2';

const ChainOfCustody = () => {
  const [searchParams] = useSearchParams();
  const evidenceIdFromUrl = searchParams.get('id');

  const [evidence, setEvidence] = useState([]);
  const [selectedEvidenceId, setSelectedEvidenceId] = useState(evidenceIdFromUrl || '');
  const [timeline, setTimeline] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEvidence();
  }, []);

  useEffect(() => {
    if (evidenceIdFromUrl) {
      fetchTimeline(evidenceIdFromUrl);
    }
  }, [evidenceIdFromUrl]);

  const fetchEvidence = async () => {
    try {
      const { data } = await axios.get('/api/evidence');
      setEvidence(data);
    } catch (error) {
      toast.error('Failed to fetch evidence');
    }
  };

  const fetchTimeline = async (id) => {
    if (!id) return;
    
    setLoading(true);
    try {
      const { data } = await axios.get(`/api/chain-of-custody/${id}`);
      setTimeline(data);
    } catch (error) {
      toast.error('Failed to fetch chain of custody');
    }
    setLoading(false);
  };

  const handleEvidenceSelect = (e) => {
    const id = e.target.value;
    setSelectedEvidenceId(id);
    if (id) {
      fetchTimeline(id);
    } else {
      setTimeline(null);
    }
  };

  const getEventIcon = (type) => {
    switch (type) {
      case 'COLLECTION':
        return <HiOutlineArchiveBox className="w-6 h-6 text-green-600" />;
      case 'MOVEMENT':
        return <HiOutlineTruck className="w-6 h-6 text-blue-600" />;
      case 'ACCESS':
        return <HiOutlineUserPlus className="w-6 h-6 text-purple-600" />;
      case 'ACCESS_EXIT':
        return <HiOutlineArrowRightOnRectangle className="w-6 h-6 text-orange-600" />;
      case 'MODIFICATION':
        return <HiOutlinePencilSquare className="w-6 h-6 text-yellow-600" />;
      default:
        return <HiOutlineCheckCircle className="w-6 h-6 text-gray-600" />;
    }
  };

  const getEventColor = (type) => {
    switch (type) {
      case 'COLLECTION':
        return 'border-green-500 bg-green-50';
      case 'MOVEMENT':
        return 'border-blue-500 bg-blue-50';
      case 'ACCESS':
        return 'border-purple-500 bg-purple-50';
      case 'ACCESS_EXIT':
        return 'border-orange-500 bg-orange-50';
      case 'MODIFICATION':
        return 'border-yellow-500 bg-yellow-50';
      default:
        return 'border-gray-500 bg-gray-50';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Chain of Custody Timeline</h1>
        <p className="text-muted mt-1">Complete history of evidence handling and movements</p>
      </div>

      {/* Evidence Selector */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Evidence to View Timeline
        </label>
        <select
          value={selectedEvidenceId}
          onChange={handleEvidenceSelect}
          className="w-full max-w-md px-4 py-3 border border-gray-200 rounded-lg focus:border-primary outline-none"
        >
          <option value="">Choose evidence...</option>
          {evidence.map(ev => (
            <option key={ev._id} value={ev._id}>
              {ev.evidenceId} - {ev.name} (Case: {ev.caseNo})
            </option>
          ))}
        </select>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted mt-4">Loading timeline...</p>
        </div>
      )}

      {/* Timeline Content */}
      {!loading && timeline && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="text-sm text-muted">Total Events</div>
              <div className="text-2xl font-bold text-primary mt-1">{timeline.summary.totalEvents}</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="text-sm text-muted">Movements</div>
              <div className="text-2xl font-bold text-blue-600 mt-1">{timeline.summary.movementsCount}</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="text-sm text-muted">Accesses</div>
              <div className="text-2xl font-bold text-purple-600 mt-1">{timeline.summary.accessesCount}</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="text-sm text-muted">Current Status</div>
              <div className="text-sm font-semibold text-green-600 mt-1">{timeline.currentStatus}</div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-primary mb-6">Event Timeline</h2>
            
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>

              {/* Timeline events */}
              <div className="space-y-8">
                {timeline.timeline.map((event, index) => (
                  <div key={index} className="relative flex gap-4">
                    {/* Icon */}
                    <div className={`relative z-10 flex-shrink-0 w-16 h-16 rounded-full border-4 ${getEventColor(event.type)} flex items-center justify-center`}>
                      {getEventIcon(event.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-primary">{event.details.action}</h3>
                          <p className="text-sm text-muted">{formatDate(event.timestamp)}</p>
                        </div>
                        <span className="text-xs mono bg-white px-2 py-1 rounded border">
                          #{event.sequence}
                        </span>
                      </div>

                      {/* Actor */}
                      {event.actor && (
                        <div className="mb-3">
                          <span className="text-sm font-medium text-gray-700">
                            {event.actor.name}
                          </span>
                          <span className="text-xs text-muted ml-2">
                            ({event.actor.role} - {event.actor.designation})
                          </span>
                        </div>
                      )}

                      {/* Details */}
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {event.details.location && (
                          <div>
                            <span className="text-muted">Location:</span>
                            <span className="ml-2 font-medium">{event.details.location}</span>
                          </div>
                        )}
                        {event.details.from && (
                          <div>
                            <span className="text-muted">From:</span>
                            <span className="ml-2 font-medium">{event.details.from}</span>
                          </div>
                        )}
                        {event.details.to && (
                          <div>
                            <span className="text-muted">To:</span>
                            <span className="ml-2 font-medium">{event.details.to}</span>
                          </div>
                        )}
                        {event.details.purpose && (
                          <div>
                            <span className="text-muted">Purpose:</span>
                            <span className="ml-2 font-medium">{event.details.purpose}</span>
                          </div>
                        )}
                        {event.details.duration && (
                          <div>
                            <span className="text-muted">Duration:</span>
                            <span className="ml-2 font-medium">{event.details.duration}</span>
                          </div>
                        )}
                        {event.details.status && (
                          <div>
                            <span className="text-muted">Status:</span>
                            <span className="ml-2 font-medium">{event.details.status}</span>
                          </div>
                        )}
                      </div>

                      {/* Blockchain Data */}
                      {event.blockchainData && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="text-xs text-muted mb-1">Blockchain Verification:</div>
                          {event.blockchainData.hash && (
                            <div className="mono text-xs text-gray-600">
                              Hash: {event.blockchainData.hash.substring(0, 32)}...
                            </div>
                          )}
                          {event.blockchainData.signature && (
                            <div className="mono text-xs text-gray-600">
                              Signature: {event.blockchainData.signature}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Empty State */}
      {!loading && !timeline && selectedEvidenceId && (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-lg font-semibold text-primary mb-2">No Timeline Data</h3>
          <p className="text-muted">This evidence has no recorded events yet.</p>
        </div>
      )}

      {!selectedEvidenceId && !loading && (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold text-primary mb-2">Select Evidence</h3>
          <p className="text-muted">Choose an evidence item above to view its complete chain of custody timeline.</p>
        </div>
      )}
    </div>
  );
};

export default ChainOfCustody;
