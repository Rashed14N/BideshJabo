import React from 'react';
import { 
  Users, 
  GraduationCap, 
  Award, 
  ClipboardList, 
  TrendingUp, 
  TrendingDown,
  Plus,
  Bell,
  FileText,
  Eye
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const regData = [
  { name: 'Mar 10', users: 40 },
  { name: 'Mar 15', users: 70 },
  { name: 'Mar 20', users: 120 },
  { name: 'Mar 25', users: 190 },
  { name: 'Mar 30', users: 250 },
  { name: 'Apr 05', users: 310 },
  { name: 'Apr 08', users: 345 },
];

const countryData = [
  { name: 'USA', value: 400 },
  { name: 'UK', value: 300 },
  { name: 'Canada', value: 300 },
  { name: 'Australia', value: 200 },
  { name: 'Germany', value: 150 },
];

const COLORS = ['#141414', '#F27D26', '#3b82f6', '#10b981', '#f59e0b'];

export default function AdminDashboardHome() {
  const stats = [
    { label: "Total Students", value: "1,284", trend: "+12%", up: true, icon: <Users size={24} /> },
    { label: "Active Users (7d)", value: "456", trend: "+5%", up: true, icon: <TrendingUp size={24} /> },
    { label: "Universities", value: "85", trend: "0%", up: true, icon: <GraduationCap size={24} /> },
    { label: "Scholarships", value: "124", trend: "+8", up: true, icon: <Award size={24} /> },
    { label: "Applications", value: "3,412", trend: "+18%", up: true, icon: <ClipboardList size={24} /> },
    { label: "New Signups", value: "24", trend: "-2%", up: false, icon: <Users size={24} /> },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-extrabold tracking-tight">Dashboard Overview</h1>
          <p className="text-slate-500 text-sm font-medium">Welcome back, Admin. Here's what's happening today.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white border border-[#141414] px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors flex items-center gap-2">
            <Plus size={18} /> Add University
          </button>
          <button className="bg-[#141414] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors flex items-center gap-2">
            <Bell size={18} /> Send Announcement
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 lg:gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-4 lg:p-6 border border-[#141414] rounded-xl shadow-[4px_4px_0px_0px_#141414]">
            <div className="flex items-center justify-between mb-3 lg:mb-4">
              <div className="p-1.5 lg:p-2 bg-slate-50 rounded-lg">
                {React.cloneElement(stat.icon as React.ReactElement, { size: 18 })}
              </div>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${stat.up ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {stat.trend}
              </span>
            </div>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">{stat.label}</p>
            <h3 className="text-lg lg:text-2xl font-display font-extrabold mt-1">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Registration Chart */}
        <div className="bg-white p-8 border border-[#141414] rounded-2xl">
          <h3 className="text-lg font-display font-extrabold mb-6">User Registrations (30 Days)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={regData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid #141414', boxShadow: '4px 4px 0px 0px #141414' }}
                />
                <Line type="monotone" dataKey="users" stroke="#141414" strokeWidth={3} dot={{ r: 4, fill: '#141414' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Country Pie Chart */}
        <div className="bg-white p-8 border border-[#141414] rounded-2xl">
          <h3 className="text-lg font-display font-extrabold mb-6">Students by Target Country</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={countryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {countryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {countryData.map((entry, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="text-xs font-bold text-slate-600">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Latest Students Table */}
      <div className="bg-white border border-[#141414] rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-[#141414] flex items-center justify-between">
          <h3 className="text-lg font-display font-extrabold">Latest Registered Students</h3>
          <button className="text-sm font-bold text-blue-primary hover:underline">View All Students</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-[#141414]">
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Student</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest hidden sm:table-cell">Target</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest hidden md:table-cell">CGPA</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Profile %</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest hidden lg:table-cell">Status</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Action</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5].map((_, i) => (
                <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-200 rounded-full shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-bold truncate">Student Name {i + 1}</p>
                        <p className="text-[10px] text-slate-500 truncate">student{i+1}@example.com</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 hidden sm:table-cell">
                    <p className="text-sm font-medium">Master's in CS</p>
                    <p className="text-xs text-slate-500">USA</p>
                  </td>
                  <td className="p-4 text-sm font-mono hidden md:table-cell">3.85 / 4.0</td>
                  <td className="p-4">
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-gold h-full" style={{ width: '85%' }} />
                    </div>
                    <p className="text-[10px] font-bold text-slate-500 mt-1">85%</p>
                  </td>
                  <td className="p-4 hidden lg:table-cell">
                    <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">Active</span>
                  </td>
                  <td className="p-4">
                    <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-[#141414]">
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
