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
  ChevronRight
} from 'lucide-react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { cn } from '../lib/utils';

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [admin, setAdmin] = useState<any>(null);

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
    { icon: <FileText size={20} />, label: "Content", path: "/admin/content" },
    { icon: <Star size={20} />, label: "Reviews", path: "/admin/reviews" },
    { icon: <Bell size={20} />, label: "Announcements", path: "/admin/announcements" },
    { icon: <BarChart3 size={20} />, label: "Analytics", path: "/admin/analytics" },
    { icon: <Settings size={20} />, label: "Settings", path: "/admin/settings" },
    { icon: <ShieldCheck size={20} />, label: "Admin Users", path: "/admin/users" },
    { icon: <History size={20} />, label: "Activity Log", path: "/admin/logs" },
  ];

  if (!admin) return <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy"></div>
  </div>;

  return (
    <div className={cn("min-h-screen flex bg-[#E4E3E0] text-[#141414]", isDarkMode && "dark bg-[#141414] text-[#E4E3E0]")}>
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-[#141414] transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0",
        !isSidebarOpen && "-translate-x-full lg:w-20"
      )}>
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-[#141414] flex items-center justify-between">
            <span className={cn("font-display font-extrabold text-xl tracking-tighter", !isSidebarOpen && "lg:hidden")}>
              UniPath <span className="text-gold">Admin</span>
            </span>
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1 hover:bg-slate-100 rounded">
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (window.innerWidth < 1024) setIsSidebarOpen(false);
                }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  location.pathname === item.path 
                    ? "bg-[#141414] text-white" 
                    : "hover:bg-slate-100"
                )}
              >
                {item.icon}
                {(isSidebarOpen || window.innerWidth < 1024) && <span>{item.label}</span>}
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-[#141414]">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut size={20} />
              {isSidebarOpen && <span>Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-[#141414] flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-4 flex-1">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className={cn("p-2 hover:bg-slate-100 rounded-lg lg:hidden", isSidebarOpen && "hidden")}
            >
              <Menu size={20} />
            </button>
            <div className="relative max-w-md w-full hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search everything..." 
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#141414]"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-4">
            <button className="p-2 hover:bg-slate-100 rounded-full sm:hidden">
              <Search size={20} />
            </button>
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 hover:bg-slate-100 rounded-full">
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className="flex items-center gap-3 pl-2 lg:pl-4 border-l border-slate-200">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold leading-none">{admin.email.split('@')[0]}</p>
                <p className="text-[10px] text-slate-500 font-mono uppercase mt-1">Admin</p>
              </div>
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-[#141414] rounded-full flex items-center justify-center text-white font-bold text-sm">
                {admin.email[0].toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
