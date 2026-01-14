import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';
import { HiOutlineShieldCheck, HiOutlineEye, HiOutlineEyeSlash, HiOutlineSun, HiOutlineMoon } from 'react-icons/hi2';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('admin');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const result = await login(email, password, role);
    
    if (result.success) {
      toast.success('Login successful');
      navigate('/dashboard');
    } else {
      toast.error(result.message);
    }
    
    setLoading(false);
  };

  const roles = [
    { value: 'admin', label: 'Admin', desc: 'Full access' },
    { value: 'forensic', label: 'Forensic', desc: 'Lab access' },
    { value: 'police', label: 'Police', desc: 'Field access' },
    { value: 'staff', label: 'Staff', desc: 'Basic access' }
  ];

  return (
    <div className="min-h-screen flex relative">
      {/* Theme Toggle */}
      <button
        onClick={toggleDarkMode}
        className="absolute top-6 right-6 z-50 p-3 rounded-xl bg-white/10 dark:bg-slate-800 backdrop-blur-sm text-slate-600 dark:text-slate-300 hover:bg-white/20 dark:hover:bg-slate-700 transition-colors shadow-lg"
        title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        {darkMode ? <HiOutlineSun className="w-5 h-5" /> : <HiOutlineMoon className="w-5 h-5" />}
      </button>

      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-accent rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 flex flex-col justify-center px-16">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-2xl gradient-accent flex items-center justify-center shadow-lg shadow-accent/30">
              <HiOutlineShieldCheck className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">CUSTAIN</h1>
              <p className="text-slate-400 text-sm">Evidence Management System</p>
            </div>
          </div>
          
          <h2 className="text-4xl font-bold text-white leading-tight mb-6">
            Secure Evidence<br />Management with<br />
            <span className="text-accent">Blockchain</span>
          </h2>
          
          <p className="text-slate-400 text-lg max-w-md mb-8">
            Protect digital evidence integrity with cryptographic hash chains, 
            Merkle trees, and digital signatures.
          </p>

          <div className="flex gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-white">SHA-256</p>
              <p className="text-slate-500 text-sm">Hash Algorithm</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-white">ECDSA</p>
              <p className="text-slate-500 text-sm">Digital Signatures</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-white">Merkle</p>
              <p className="text-slate-500 text-sm">Tree Verification</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-surface dark:bg-slate-900 transition-colors duration-200">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl gradient-accent flex items-center justify-center">
                <HiOutlineShieldCheck className="w-7 h-7 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-2xl font-bold text-primary">CUSTAIN</h1>
                <p className="text-muted text-xs">Evidence Management</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card border border-slate-200/60 dark:border-slate-700 p-8 transition-colors duration-200">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-primary dark:text-white">Welcome back</h2>
              <p className="text-muted dark:text-slate-400 mt-1">Sign in to your account to continue</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  Select Role
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {roles.map(({ value, label, desc }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRole(value)}
                      className={`p-3 rounded-xl text-left transition-all duration-200 border-2 ${
                        role === value
                          ? 'border-accent bg-accent/5 dark:bg-accent/10'
                          : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 bg-white dark:bg-slate-700'
                      }`}
                    >
                      <p className={`font-medium text-sm ${role === value ? 'text-accent' : 'text-slate-700 dark:text-slate-200'}`}>
                        {label}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all text-primary dark:text-white bg-white dark:bg-slate-700"
                  placeholder="you@example.com"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 dark:border-slate-600 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all text-primary dark:text-white bg-white dark:bg-slate-700"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    {showPassword ? <HiOutlineEyeSlash className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 gradient-accent text-white rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-50 shadow-lg shadow-accent/25"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Signing in...
                  </span>
                ) : 'Sign In'}
              </button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600">
              <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-2">Demo Credentials</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Email: admin@custain.com</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Password: admin123</p>
            </div>
          </div>

          <p className="text-center text-sm text-muted dark:text-slate-500 mt-6">
            Blockchain-secured evidence management system
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
