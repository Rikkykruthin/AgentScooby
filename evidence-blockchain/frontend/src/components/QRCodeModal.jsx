import { useState, useEffect } from 'react';
import axios from 'axios';

const QRCodeModal = ({ evidence, isOpen, onClose }) => {
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [printMode, setPrintMode] = useState(false);

  useEffect(() => {
    if (isOpen && evidence) {
      setQrData(null);
      setError(null);
      fetchQRCode();
    }
  }, [isOpen, evidence?._id]);

  const fetchQRCode = async () => {
    setLoading(true);
    setError(null);
    try {
      // Token is already set in axios defaults by AuthContext
      console.log('Fetching QR for evidence:', evidence._id);
      const response = await axios.get(`/api/qr/printable/${evidence._id}`);
      console.log('QR response:', response.data);
      setQrData(response.data);
    } catch (err) {
      console.error('Error fetching QR code:', err);
      setError(err.response?.data?.message || 'Failed to load QR code');
    }
    setLoading(false);
  };

  const handlePrint = () => {
    setPrintMode(true);
    setTimeout(() => {
      window.print();
      setPrintMode(false);
    }, 100);
  };

  const handleDownload = () => {
    if (!qrData) return;
    
    const link = document.createElement('a');
    link.download = `QR-${evidence.evidenceId}.png`;
    link.href = qrData.qrCode;
    link.click();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Print Styles */}
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            .print-area, .print-area * {
              visibility: visible;
            }
            .print-area {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
            .no-print {
              display: none !important;
            }
          }
        `}
      </style>

      {/* Modal Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 ${printMode ? 'print-hidden' : ''}`}
        onClick={onClose}
      >
        <div 
          className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200 no-print">
            <h3 className="text-lg font-semibold text-slate-800">QR Code Tag</h3>
            <button 
              onClick={onClose}
              className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6 print-area">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-700"></div>
              </div>
            ) : qrData ? (
              <div className="text-center">
                {/* QR Code */}
                <div className="bg-white p-4 border-2 border-dashed border-slate-300 rounded-lg inline-block mb-4">
                  <img 
                    src={qrData.qrCode} 
                    alt="QR Code" 
                    className="w-48 h-48 mx-auto"
                  />
                </div>

                {/* Evidence Info for Label */}
                <div className="bg-slate-50 rounded-lg p-4 text-left mb-4">
                  <div className="text-center mb-3">
                    <span className="text-2xl font-bold text-slate-800">{qrData.evidence.evidenceId}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-slate-500">Name:</span>
                      <p className="font-medium text-slate-700 truncate">{qrData.evidence.name}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Case No:</span>
                      <p className="font-medium text-slate-700">{qrData.evidence.caseNo}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Type:</span>
                      <p className="font-medium text-slate-700">{qrData.evidence.evidenceType || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Date:</span>
                      <p className="font-medium text-slate-700">
                        {qrData.evidence.collectionDate 
                          ? new Date(qrData.evidence.collectionDate).toLocaleDateString() 
                          : 'N/A'}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-500">Storage:</span>
                      <p className="font-medium text-slate-700">{qrData.evidence.storageLocation || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-400 mb-4">
                  Scan QR code to view evidence details
                </p>

                {/* Action Buttons */}
                <div className="flex gap-3 no-print">
                  <button
                    onClick={handlePrint}
                    className="flex-1 flex items-center justify-center gap-2 bg-slate-800 text-white px-4 py-2.5 rounded-lg hover:bg-slate-700 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Print Label
                  </button>
                  <button
                    onClick={handleDownload}
                    className="flex-1 flex items-center justify-center gap-2 bg-slate-100 text-slate-700 px-4 py-2.5 rounded-lg hover:bg-slate-200 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download
                  </button>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-500 mb-2">{error}</p>
                <button 
                  onClick={fetchQRCode}
                  className="text-sm text-slate-600 underline hover:text-slate-800"
                >
                  Try again
                </button>
              </div>
            ) : (
              <p className="text-center text-slate-500">Failed to load QR code</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default QRCodeModal;
