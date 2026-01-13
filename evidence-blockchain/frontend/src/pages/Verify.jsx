import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  HiOutlineShieldCheck, 
  HiOutlineShieldExclamation,
  HiOutlineCheckCircle,
  HiOutlineXCircle
} from 'react-icons/hi2';

const Verify = () => {
  const [evidence, setEvidence] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [merkleRoot, setMerkleRoot] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [evidenceRes, merkleRes] = await Promise.all([
        axios.get('/api/evidence'),
        axios.get('/api/evidence/merkle/root')
      ]);
      setEvidence(evidenceRes.data);
      setMerkleRoot(merkleRes.data);
    } catch (error) {
      console.error('Error fetching data');
    }
  };

  const verifyEvidence = async () => {
    if (!selectedId) {
      toast.error('Please select evidence to verify');
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.get(`/api/evidence/${selectedId}/verify`);
      setVerificationResult(data);
      
      if (data.integrityStatus === 'VERIFIED') {
        toast.success('Evidence integrity verified!');
      } else {
        toast.error('Evidence may have been tampered!');
      }
    } catch (error) {
      toast.error('Verification failed');
    }
    setLoading(false);
  };

  const StatusIcon = ({ valid }) => valid ? (
    <HiOutlineCheckCircle className="w-5 h-5 text-green-500" />
  ) : (
    <HiOutlineXCircle className="w-5 h-5 text-red-500" />
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Verify Evidence Integrity</h1>
        <p className="text-muted mt-1">Check if evidence has been tampered with using blockchain verification</p>
      </div>

      {/* Merkle Root Info */}
      {merkleRoot?.root && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <HiOutlineShieldCheck className="w-6 h-6 text-green-500" />
            <h2 className="text-lg font-semibold text-primary">Current Merkle Root</h2>
          </div>
          <p className="mono text-sm bg-gray-50 p-4 rounded-lg break-all text-muted">
            {merkleRoot.root}
          </p>
          <p className="text-xs text-muted mt-3">
            Evidence Count: {merkleRoot.evidenceCount} | Last Updated: {new Date(merkleRoot.computedAt).toLocaleString()}
          </p>
        </div>
      )}

      {/* Verification Form */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-primary mb-4">Select Evidence to Verify</h2>
        
        <div className="flex gap-4">
          <select
            value={selectedId}
            onChange={(e) => { setSelectedId(e.target.value); setVerificationResult(null); }}
            className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:border-primary outline-none"
          >
            <option value="">Select Evidence</option>
            {evidence.map(ev => (
              <option key={ev._id} value={ev._id}>
                {ev.evidenceId} - {ev.name} (Case: {ev.caseNo})
              </option>
            ))}
          </select>
          <button
            onClick={verifyEvidence}
            disabled={loading || !selectedId}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
          >
            <HiOutlineShieldCheck className="w-5 h-5" />
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </div>
      </div>

      {/* Verification Result */}
      {verificationResult && (
        <div className={`rounded-xl p-6 shadow-sm ${
          verificationResult.integrityStatus === 'VERIFIED' 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center gap-3 mb-6">
            {verificationResult.integrityStatus === 'VERIFIED' ? (
              <>
                <HiOutlineShieldCheck className="w-8 h-8 text-green-500" />
                <div>
                  <h2 className="text-xl font-bold text-green-700">Integrity Verified</h2>
                  <p className="text-green-600 text-sm">This evidence has not been tampered with</p>
                </div>
              </>
            ) : (
              <>
                <HiOutlineShieldExclamation className="w-8 h-8 text-red-500" />
                <div>
                  <h2 className="text-xl font-bold text-red-700">Integrity Compromised</h2>
                  <p className="text-red-600 text-sm">This evidence may have been tampered with</p>
                </div>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted">Digital Signature</span>
                <StatusIcon valid={verificationResult.signatureValid} />
              </div>
              <p className="font-medium text-primary">
                {verificationResult.signatureValid ? 'Valid' : 'Invalid'}
              </p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted">Merkle Proof</span>
                <StatusIcon valid={verificationResult.merkleValid} />
              </div>
              <p className="font-medium text-primary">
                {verificationResult.merkleValid ? 'Valid' : 'Invalid'}
              </p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted">Hash Chain</span>
                <StatusIcon valid={verificationResult.hashChainValid} />
              </div>
              <p className="font-medium text-primary">
                {verificationResult.hashChainValid ? 'Valid' : 'Broken'}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 space-y-3">
            <div>
              <span className="text-xs text-muted">Evidence ID</span>
              <p className="mono text-sm text-primary">{verificationResult.evidenceId}</p>
            </div>
            <div>
              <span className="text-xs text-muted">Signed By</span>
              <p className="text-sm text-primary">{verificationResult.signedBy}</p>
            </div>
            <div>
              <span className="text-xs text-muted">Current Hash</span>
              <p className="mono text-xs text-muted break-all">{verificationResult.currentHash}</p>
            </div>
            <div>
              <span className="text-xs text-muted">Previous Hash</span>
              <p className="mono text-xs text-muted break-all">{verificationResult.previousHash}</p>
            </div>
            {verificationResult.merkleRoot && (
              <div>
                <span className="text-xs text-muted">Merkle Root</span>
                <p className="mono text-xs text-muted break-all">{verificationResult.merkleRoot}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Verify;
