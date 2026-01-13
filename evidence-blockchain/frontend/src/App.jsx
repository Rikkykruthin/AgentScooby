import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Evidence from './pages/Evidence';
import MovementLogs from './pages/MovementLogs';
import AccessLogs from './pages/AccessLogs';
import Users from './pages/Users';
import Verify from './pages/Verify';
import ChainOfCustody from './pages/ChainOfCustody';
import AuditTrail from './pages/AuditTrail';
import ScanEvidence from './pages/ScanEvidence';
import Cases from './pages/Cases';
import CaseDetail from './pages/CaseDetail';

// Components
import Layout from './components/Layout';

const ProtectedRoute = ({ children, roles }) => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
};

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
      <Route path="/scan/:id" element={<ScanEvidence />} />
      
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="cases" element={<Cases />} />
        <Route path="cases/:id" element={<CaseDetail />} />
        <Route path="evidence" element={<Evidence />} />
        <Route path="movement-logs" element={<MovementLogs />} />
        <Route path="access-logs" element={<AccessLogs />} />
        <Route path="chain-of-custody" element={<ChainOfCustody />} />
        <Route path="audit-trail" element={<AuditTrail />} />
        <Route path="verify" element={<Verify />} />
        <Route path="users" element={
          <ProtectedRoute roles={['admin']}>
            <Users />
          </ProtectedRoute>
        } />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
