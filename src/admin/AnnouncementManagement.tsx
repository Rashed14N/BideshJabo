import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Trash2, 
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  Plus,
  Send
} from 'lucide-react';
import { db } from '../firebase';
import { useOutletContext } from 'react-router-dom';
import { collection, onSnapshot, query, orderBy, deleteDoc, doc, addDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { cn } from '../lib/utils';

export default function AnnouncementManagement() {
  const { isDarkMode } = useOutletContext<{ isDarkMode: boolean }>();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: "", message: "", type: "info" });
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "announcements"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setAnnouncements(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    try {
      await addDoc(collection(db, "announcements"), {
        ...formData,
        createdAt: serverTimestamp(),
        active: true
      });
      setIsModalOpen(false);
      setFormData({ title: "", message: "", type: "info" });
    } catch (err) {
      console.error("Error sending announcement:", err);
    } finally {
      setIsSending(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this announcement?")) {
      try {
        await deleteDoc(doc(db, "announcements", id));
      } catch (err) {
        console.error("Error deleting announcement:", err);
      }
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, "announcements", id), { active: !currentStatus });
    } catch (err) {
      console.error("Error toggling status:", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-extrabold tracking-tight dark:text-white">Announcements</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">Manage global notifications and updates for all students.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-navy dark:bg-gold dark:text-navy text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 dark:hover:bg-gold-hover transition-all flex items-center gap-2 shadow-lg shadow-navy/10 dark:shadow-gold/10"
        >
          <Plus size={18} /> New Announcement
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {announcements.map((ann) => (
          <div key={ann.id} className={cn(
            "bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden transition-all shadow-sm",
            isDarkMode && "shadow-none"
          )}>
            <div className="p-6 flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="flex gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm",
                  ann.type === 'info' ? "bg-blue-50 dark:bg-gold/10 text-blue-primary dark:text-gold" : 
                  ann.type === 'warning' ? "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400" : 
                  "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400"
                )}>
                  <Bell size={24} />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-display font-extrabold dark:text-white">{ann.title}</h3>
                    <span className={cn(
                      "text-[10px] font-bold px-2.5 py-0.5 rounded-lg uppercase tracking-wider",
                      ann.active ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                    )}>
                      {ann.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed font-medium">{ann.message}</p>
                  <div className="flex items-center gap-4 pt-2">
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">
                      <Clock size={14} /> {ann.createdAt?.toDate().toLocaleString() || "Just now"}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">
                      Type: {ann.type}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button 
                  onClick={() => toggleStatus(ann.id, ann.active)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-sm",
                    ann.active ? "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700" : "bg-green-600 text-white hover:bg-green-700"
                  )}
                >
                  {ann.active ? "Deactivate" : "Activate"}
                </button>
                <button 
                  onClick={() => handleDelete(ann.id)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {announcements.length === 0 && !loading && (
          <div className="bg-white dark:bg-[#161B22] border border-dashed border-slate-300 dark:border-slate-800 p-16 rounded-2xl text-center shadow-sm">
            <div className="w-20 h-20 bg-slate-50 dark:bg-[#0F1115] rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300 dark:text-slate-700 shadow-inner">
              <Bell size={40} />
            </div>
            <h3 className="text-xl font-display font-extrabold text-slate-400 dark:text-slate-500">No announcements yet</h3>
            <p className="text-slate-400 dark:text-slate-500 text-sm font-medium mt-2">Send your first global update to all students.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#161B22] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-xl font-display font-extrabold dark:text-white">New Global Announcement</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full dark:text-slate-400 transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Title</label>
                <input 
                  required 
                  type="text" 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})} 
                  placeholder="e.g. System Maintenance"
                  className="w-full p-2.5 bg-slate-50 dark:bg-[#0F1115] border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-navy/5 dark:focus:ring-gold/5 focus:border-navy dark:focus:border-gold dark:text-white transition-all" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Type</label>
                <select 
                  value={formData.type} 
                  onChange={e => setFormData({...formData, type: e.target.value})}
                  className="w-full p-2.5 bg-slate-50 dark:bg-[#0F1115] border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-navy/5 dark:focus:ring-gold/5 focus:border-navy dark:focus:border-gold dark:text-white transition-all"
                >
                  <option value="info" className="dark:bg-[#161B22]">Information</option>
                  <option value="warning" className="dark:bg-[#161B22]">Warning</option>
                  <option value="success" className="dark:bg-[#161B22]">Success / Update</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Message</label>
                <textarea 
                  required 
                  rows={4} 
                  value={formData.message} 
                  onChange={e => setFormData({...formData, message: e.target.value})} 
                  placeholder="Type your message here..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-[#0F1115] border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-navy/5 dark:focus:ring-gold/5 focus:border-navy dark:focus:border-gold dark:text-white resize-none transition-all" 
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 border border-slate-200 dark:border-slate-800 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 dark:text-white transition-colors">Cancel</button>
                <button 
                  type="submit" 
                  disabled={isSending}
                  className="flex-1 py-3 bg-navy dark:bg-gold dark:text-navy text-white rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-gold-hover transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-navy/10 dark:shadow-gold/10"
                >
                  {isSending ? "Sending..." : <><Send size={18} /> Send Now</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

