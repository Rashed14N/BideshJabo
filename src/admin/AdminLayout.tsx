import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  GraduationCap, 
  Award, 
  Users, 
  FileText, 
  Star, 
  Bell, 
  BarChart3, 
  Settings, 
  ShieldCheck, 
  History,
  LogOut,
  Menu,
  X,
  Search,
  Moon,
  Sun,
  ChevronRight,
  ClipboardList
} from 'lucide-react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { cn } from '../lib/utils';
import Logo from '../components/Logo';

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [admin, setAdmin] = useState<any>(null);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    fetch('/api/admin/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) setAdmin(data.user);
        else navigate('/admin/login');
      })
      .catch(() => navigate('/admin/login'));
  }, [navigate]);

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    navigate('/admin/login');
  };

  const navItems = [
    { icon: <LayoutDashboard size={20} />, label: "Dashboard", path: "/admin" },
    { icon: <GraduationCap size={20} />, label: "Universities", path: "/admin/universities" },
    { icon: <Award size={20} />, label: "Scholarships", path: "/admin/scholarships" },
    { icon: <Users size={20} />, label: "Students", path: "/admin/students" },
    { icon: <ClipboardList size={20} />, label: "Applications", path: "/admin/applications" },
    { icon: <FileText size={20} />, label: "Blogs", path: "/admin/blogs" },
    { icon: <Bell size={20} />, label: "Announcements", path: "/admin/announcements" },
    { icon: <FileText size={20} />, label: "Content", path: "/admin/content" },
    { icon: <Star size={20} />, label: "Reviews", path: "/admin/reviews" },
    { icon: <BarChart3 size={20} />, label: "Analytics", path: "/admin/analytics" },
    { icon: <Settings size={20} />, label: "Settings", path: "/admin/settings" },
    { icon: <ShieldCheck size={20} />, label: "Admin Users", path: "/admin/users" },
    { icon: <History size={20} />, label: "Activity Log", path: "/admin/logs" },
  ];

  if (!admin) return <div className="h-screen w-screen flex items-center justify-center bg-slate-50 dark:bg-[#141414]">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy dark:border-gold"></div>
  </div>;

  return (
    <div className={cn(
      "min-h-screen flex transition-colors duration-300",
      isDarkMode ? "dark bg-[#0F1115] text-slate-100" : "bg-[#F8F9FA] text-slate-900"
    )}>
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-[#161B22] border-r border-slate-200 dark:border-slate-800 transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0",
        !isSidebarOpen && "-translate-x-full lg:w-20"
      )}>
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <Logo 
              iconSize={24} 
              textSize="text-xl" 
              showText={isSidebarOpen || window.innerWidth < 1024} 
              className={cn(!isSidebarOpen && "lg:justify-center", isDarkMode && "text-white")}
            />
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors dark:text-slate-400 dark:hover:text-white">
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (window.innerWidth < 1024) setIsSidebarOpen(false);
                }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 group",
                  location.pathname === item.path 
                    ? "bg-navy dark:bg-gold dark:text-navy text-white shadow-lg shadow-navy/20 dark:shadow-gold/20" 
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-navy dark:hover:text-white"
                )}
              >
                <span className={cn(
                  "transition-colors",
                  location.pathname === item.path ? "text-inherit" : "text-slate-400 group-hover:text-navy dark:group-hover:text-gold"
                )}>
                  {item.icon}
                </span>
                {(isSidebarOpen || window.innerWidth < 1024) && <span>{item.label}</span>}
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-slate-200 dark:border-slate-800">
            <div className="bg-slate-50 dark:bg-[#0F1115] p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">System Status</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs font-bold dark:text-slate-300">Operational</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white dark:bg-[#161B22] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4 flex-1">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className={cn("p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg lg:hidden dark:text-slate-400", isSidebarOpen && "hidden")}
            >
              <Menu size={20} />
            </button>
            <div className="relative max-w-md w-full hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search everything..." 
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-[#0F1115] border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy/5 dark:focus:ring-gold/5 focus:border-navy dark:focus:border-gold dark:text-white transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-4">
            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full sm:hidden dark:text-slate-400">
              <Search size={20} />
            </button>
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
              {isDarkMode ? <Sun size={20} className="text-gold" /> : <Moon size={20} className="text-slate-600" />}
            </button>
            
            <div className="relative">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 pl-2 lg:pl-4 border-l border-slate-200 dark:border-slate-800 group"
              >
                <div className="text-right hidden md:block">
                  <p className="text-sm font-bold leading-none dark:text-white group-hover:text-navy dark:group-hover:text-gold transition-colors">{admin.email.split('@')[0]}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-1">Administrator</p>
                </div>
                <div className="w-8 h-8 lg:w-10 lg:h-10 bg-navy dark:bg-gold dark:text-navy rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md group-hover:scale-105 transition-transform">
                  {admin.email[0].toUpperCase()}
                </div>
              </button>

              {isProfileOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Account</p>
                      <p className="text-sm font-bold truncate dark:text-white mt-1">{admin.email}</p>
                    </div>
                    <div className="p-2">
                      <button className="w-full flex items-center gap-2 px-3 py-2 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors">
                        <Settings size={16} /> Settings
                      </button>
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <LogOut size={16} /> Logout
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet context={{ isDarkMode }} />
          </div>
        </main>
      </div>
    </div>
  );
}
