import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  HiOutlineHome, 
  HiOutlineArchiveBox, 
  HiOutlineTruck, 
  HiOutlineClipboardDocumentList,
  HiOutlineUsers,
  HiOutlineShieldCheck,
  HiOutlineArrowRightOnRectangle,
  HiOutlineDocumentText,
  HiOutlineDocumentMagnifyingGlass,
  HiOutlineFolder,
  HiOutlineSun,
  HiOutlineMoon
} from 'react-icons/hi2';

const Layout = () => {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navGroups = [
    {
      title: 'Overview',
      items: [
        { path: '/dashboard', icon: HiOutlineHome, label: 'Dashboard' },
      ]
    },
    {
      title: 'Management',
      items: [
        { path: '/cases', icon: HiOutlineFolder, label: 'Cases' },
        { path: '/evidence', icon: HiOutlineArchiveBox, label: 'Evidence' },
      ]
    },
    {
      title: 'Tracking',
      items: [
        { path: '/chain-of-custody', icon: HiOutlineDocumentText, label: 'Chain of Custody' },
        { path: '/movement-logs', icon: HiOutlineTruck, label: 'Movement Logs' },
        { path: '/access-logs', icon: HiOutlineClipboardDocumentList, label: 'Access Logs' },
      ]
    },
    {
      title: 'Security',
      items: [
        { path: '/audit-trail', icon: HiOutlineDocumentMagnifyingGlass, label: 'Audit Trail' },
        { path: '/verify', icon: HiOutlineShieldCheck, label: 'Verify Integrity' },
      ]
    }
  ];

  if (user?.role === 'admin') {
    navGroups.push({
      title: 'Admin',
      items: [
        { path: '/users', icon: HiOutlineUsers, label: 'User Management' }
      ]
    });
  }

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  };

  return (
    <div className="min-h-screen flex bg-surface dark:bg-slate-900 transition-colors duration-200">
      {/* Sidebar */}
      <aside className="w-64 bg-primary dark:bg-slate-950 flex flex-col fixed h-full">
        {/* Logo */}
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-accent flex items-center justify-center">
              <HiOutlineShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-wide">CUSTAIN</h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Evidence System</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {navGroups.map((group, idx) => (
            <div key={idx} className="mb-6">
              <p className="px-3 mb-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                {group.title}
              </p>
              <ul className="space-y-1">
                {group.items.map(({ path, icon: Icon, label }) => (
                  <li key={path}>
                    <NavLink
                      to={path}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                          isActive 
                            ? 'bg-accent text-white shadow-lg shadow-accent/25' 
                            : 'text-slate-400 hover:bg-white/5 hover:text-white'
                        }`
                      }
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span className="text-sm font-medium">{label}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-2 py-2 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
              {getInitials(user?.name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 capitalize truncate">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200"
          >
            <HiOutlineArrowRightOnRectangle className="w-5 h-5" />
            <span className="text-sm font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 min-h-screen">
        {/* Top Bar */}
        <header className="bg-white dark:bg-slate-800 border-b border-slate-200/60 dark:border-slate-700 sticky top-0 z-10 transition-colors duration-200">
          <div className="px-8 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-primary dark:text-white capitalize">
                {location.pathname.split('/')[1]?.replace(/-/g, ' ') || 'Dashboard'}
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted dark:text-slate-400">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {darkMode ? <HiOutlineSun className="w-5 h-5" /> : <HiOutlineMoon className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8 animate-fadeIn dark:text-slate-200">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
