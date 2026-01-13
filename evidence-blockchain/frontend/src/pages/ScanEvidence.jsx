import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const ScanEvidence = () => {
  const { id } = useParams();
  const [evidence, setEvidence] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvidence = async () => {
      try {
        const response = await axios.get(`/api/qr/scan/${id}`);
        setEvidence(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Evidence not found');
        setLoading(false);
      }
    };

    if (id) {
      fetchEvidence();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-700"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Evidence Not Found</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <Link to="/login" className="text-slate-700 hover:text-slate-900 underline">
            Login to access system
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg mb-4">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
            <span className="font-medium">QR Code Verified</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Evidence Details</h1>
          <p className="text-slate-500 text-sm mt-1">CUSTAIN - Evidence Management System</p>
        </div>

        {/* Evidence Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Status Banner */}
          <div className={`px-6 py-3 ${evidence.isVerified ? 'bg-green-500' : 'bg-amber-500'} text-white flex items-center justify-between`}>
            <span className="font-medium">
              {evidence.isVerified ? 'Blockchain Verified' : 'Pending Verification'}
            </span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {evidence.isVerified ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              )}
            </svg>
          </div>

          {/* Main Info */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl font-bold text-slate-800">{evidence.evidenceId}</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                evidence.status === 'active' ? 'bg-green-100 text-green-800' :
                evidence.status === 'archived' ? 'bg-slate-100 text-slate-800' :
                'bg-amber-100 text-amber-800'
              }`}>
                {evidence.status}
              </span>
            </div>

            <h2 className="text-xl font-semibold text-slate-700 mb-1">{evidence.name}</h2>
            <p className="text-slate-500 mb-4">Case No: {evidence.caseNo}</p>

            {evidence.description && (
              <p className="text-slate-600 mb-4 bg-slate-50 p-3 rounded-lg">{evidence.description}</p>
            )}

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Evidence Type</p>
                <p className="font-medium text-slate-800">{evidence.evidenceType || 'N/A'}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Collected By</p>
                <p className="font-medium text-slate-800">{evidence.collectedBy}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Collection Date</p>
                <p className="font-medium text-slate-800">
                  {evidence.collectionDate ? new Date(evidence.collectionDate).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Location</p>
                <p className="font-medium text-slate-800">{evidence.collectionLocation || 'N/A'}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg col-span-2">
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Storage Location</p>
                <p className="font-medium text-slate-800">{evidence.storageLocation || 'N/A'}</p>
              </div>
            </div>

            {/* Hash */}
            <div className="mt-6 pt-4 border-t border-slate-200">
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Blockchain Hash</p>
              <code className="text-xs bg-slate-100 p-2 rounded block break-all text-slate-600">
                {evidence.currentHash || 'Not yet hashed'}
              </code>
            </div>

            {/* Timestamp */}
            <div className="mt-4 text-center text-sm text-slate-400">
              Created: {new Date(evidence.createdAt).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <Link 
            to="/login" 
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            Login for full access
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ScanEvidence;
