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
import { collection, onSnapshot, query, orderBy, deleteDoc, doc, addDoc, serverTimestamp, updateDoc } from 'firebase/firestore';

export default function AnnouncementManagement() {
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
          <h1 className="text-2xl font-display font-extrabold tracking-tight">Announcements</h1>
          <p className="text-slate-500 text-sm font-medium">Manage global notifications and updates for all students.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#141414] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors flex items-center gap-2"
        >
          <Plus size={18} /> New Announcement
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {announcements.map((ann) => (
          <div key={ann.id} className="bg-white border border-[#141414] rounded-2xl overflow-hidden shadow-[4px_4px_0px_0px_#141414]">
            <div className="p-6 flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="flex gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                  ann.type === 'info' ? "bg-blue-50 text-blue-primary" : 
                  ann.type === 'warning' ? "bg-orange-50 text-orange-600" : "bg-green-50 text-green-600"
                )}>
                  <Bell size={24} />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-display font-extrabold">{ann.title}</h3>
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",
                      ann.active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
                    )}>
                      {ann.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed">{ann.message}</p>
                  <div className="flex items-center gap-4 pt-2">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                      <Clock size={14} /> {ann.createdAt?.toDate().toLocaleString() || "Just now"}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium uppercase tracking-widest">
                      Type: {ann.type}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button 
                  onClick={() => toggleStatus(ann.id, ann.active)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-xs font-bold transition-all",
                    ann.active ? "bg-slate-100 text-slate-600 hover:bg-slate-200" : "bg-green-600 text-white hover:bg-green-700"
                  )}
                >
                  {ann.active ? "Deactivate" : "Activate"}
                </button>
                <button 
                  onClick={() => handleDelete(ann.id)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {announcements.length === 0 && !loading && (
          <div className="bg-white border border-dashed border-slate-300 p-12 rounded-2xl text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
              <Bell size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-400">No announcements yet</h3>
            <p className="text-slate-400 text-sm">Send your first global update to all students.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-display font-extrabold">New Global Announcement</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Title</label>
                <input 
                  required 
                  type="text" 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})} 
                  placeholder="e.g. System Maintenance"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-[#141414]" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Type</label>
                <select 
                  value={formData.type} 
                  onChange={e => setFormData({...formData, type: e.target.value})}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-[#141414]"
                >
                  <option value="info">Information</option>
                  <option value="warning">Warning</option>
                  <option value="success">Success / Update</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Message</label>
                <textarea 
                  required 
                  rows={4} 
                  value={formData.message} 
                  onChange={e => setFormData({...formData, message: e.target.value})} 
                  placeholder="Type your message here..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-[#141414] resize-none" 
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 border border-slate-200 rounded-xl font-bold hover:bg-slate-50">Cancel</button>
                <button 
                  type="submit" 
                  disabled={isSending}
                  className="flex-1 py-3 bg-[#141414] text-white rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
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

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
