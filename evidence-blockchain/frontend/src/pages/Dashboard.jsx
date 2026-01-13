import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  HiOutlineArchiveBox, 
  HiOutlineTruck, 
  HiOutlineClipboardDocumentList,
  HiOutlineShieldCheck,
  HiOutlineFolder,
  HiOutlineArrowTrendingUp,
  HiOutlineArrowRight,
  HiOutlineCheckBadge
} from 'react-icons/hi2';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    evidenceCount: 0,
    movementCount: 0,
    accessCount: 0,
    caseCount: 0,
    merkleRoot: null
  });
  const [recentEvidence, setRecentEvidence] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [evidenceRes, movementRes, accessRes, merkleRes, casesRes] = await Promise.all([
        axios.get('/api/evidence'),
        axios.get('/api/logs/movement'),
        axios.get('/api/logs/access'),
        axios.get('/api/evidence/merkle/root'),
        axios.get('/api/cases')
      ]);

      setStats({
        evidenceCount: evidenceRes.data.length,
        movementCount: movementRes.data.length,
        accessCount: accessRes.data.length,
        caseCount: casesRes.data.length,
        merkleRoot: merkleRes.data.root || null
      });

      setRecentEvidence(evidenceRes.data.slice(0, 5));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { 
      label: 'Active Cases', 
      value: stats.caseCount, 
      icon: HiOutlineFolder, 
      color: 'from-violet-500 to-purple-600',
      bgColor: 'bg-violet-50',
      link: '/cases'
    },
    { 
      label: 'Evidence Items', 
      value: stats.evidenceCount, 
      icon: HiOutlineArchiveBox, 
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      link: '/evidence'
    },
    { 
      label: 'Movement Logs', 
      value: stats.movementCount, 
      icon: HiOutlineTruck, 
      color: 'from-emerald-500 to-teal-500',
      bgColor: 'bg-emerald-50',
      link: '/movement-logs'
    },
    { 
      label: 'Access Events', 
      value: stats.accessCount, 
      icon: HiOutlineClipboardDocumentList, 
      color: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-50',
      link: '/access-logs'
    },
  ];

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'collected': return 'badge-info';
      case 'in storage': return 'badge-success';
      case 'under analysis': return 'badge-warning';
      default: return 'badge-info';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-muted mt-1">Here's what's happening with your evidence management</p>
        </div>
        <Link 
          to="/evidence"
          className="btn btn-primary"
        >
          <HiOutlineArchiveBox className="w-5 h-5" />
          View Evidence
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map(({ label, value, icon: Icon, color, bgColor, link }) => (
          <Link 
            key={label} 
            to={link}
            className="card p-5 group hover:shadow-card-hover"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted font-medium">{label}</p>
                <p className="text-3xl font-bold text-primary mt-2">{value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-muted group-hover:text-accent transition-colors">
              <span>View details</span>
              <HiOutlineArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>

      {/* Blockchain Status & Recent Evidence */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Merkle Root */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
              <HiOutlineCheckBadge className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-primary">Blockchain Status</h2>
              <p className="text-xs text-muted">Merkle tree verification</p>
            </div>
          </div>
          
          {stats.merkleRoot ? (
            <>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-[10px] uppercase tracking-wider text-muted font-semibold mb-1">Current Root Hash</p>
                <p className="mono text-xs text-slate-600 break-all leading-relaxed">
                  {stats.merkleRoot}
                </p>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-sm text-emerald-600 font-medium">Chain Integrity Verified</span>
              </div>
            </>
          ) : (
            <div className="text-center py-6 text-muted">
              <HiOutlineShieldCheck className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No evidence in chain yet</p>
            </div>
          )}
        </div>

        {/* Recent Evidence */}
        <div className="card lg:col-span-2">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-primary">Recent Evidence</h2>
            <Link to="/evidence" className="text-sm text-accent hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-slate-100">
            {recentEvidence.length > 0 ? (
              recentEvidence.map((ev) => (
                <div key={ev._id} className="px-5 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                      <HiOutlineArchiveBox className="w-5 h-5 text-slate-500" />
                    </div>
                    <div>
                      <p className="font-medium text-primary text-sm">{ev.name}</p>
                      <p className="text-xs text-muted">
                        <span className="mono">{ev.evidenceId}</span> • Case {ev.caseNo}
                      </p>
                    </div>
                  </div>
                  <span className={`badge ${getStatusColor(ev.status)}`}>
                    {ev.status}
                  </span>
                </div>
              ))
            ) : (
              <div className="px-5 py-12 text-center text-muted">
                <HiOutlineArchiveBox className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>No evidence records yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card p-6">
        <h2 className="font-semibold text-primary mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/cases" className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors text-center group">
            <HiOutlineFolder className="w-8 h-8 mx-auto text-violet-500 mb-2" />
            <p className="text-sm font-medium text-primary">New Case</p>
          </Link>
          <Link to="/evidence" className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors text-center group">
            <HiOutlineArchiveBox className="w-8 h-8 mx-auto text-blue-500 mb-2" />
            <p className="text-sm font-medium text-primary">Add Evidence</p>
          </Link>
          <Link to="/verify" className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors text-center group">
            <HiOutlineShieldCheck className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
            <p className="text-sm font-medium text-primary">Verify Integrity</p>
          </Link>
          <Link to="/audit-trail" className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors text-center group">
            <HiOutlineClipboardDocumentList className="w-8 h-8 mx-auto text-amber-500 mb-2" />
            <p className="text-sm font-medium text-primary">Audit Trail</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
