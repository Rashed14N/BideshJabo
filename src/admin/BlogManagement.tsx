import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  CheckCircle2,
  Clock,
  X,
  Eye,
  FileText,
  Image as ImageIcon,
  User,
  Tag,
  Upload,
  RefreshCw,
  CheckSquare,
  Square,
  MoreVertical,
  AlertCircle,
  Calendar
} from 'lucide-react';
import { cn } from '../lib/utils';
import { db } from '../firebase';
import { useOutletContext } from 'react-router-dom';
import { collection, onSnapshot, query, orderBy, deleteDoc, doc, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

export default function BlogManagement() {
  const { isDarkMode } = useOutletContext<{ isDarkMode: boolean }>();
  const [search, setSearch] = useState("");
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBlogs, setSelectedBlogs] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBlogForView, setSelectedBlogForView] = useState<any>(null);
  const [editingBlog, setEditingBlog] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "", content: "", author: "Admin", image: "", tags: "", status: "Published"
  });
  const [imageType, setImageType] = useState<'url' | 'upload'>('url');

  useEffect(() => {
    const q = query(collection(db, "blogs"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setBlogs(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleOpenModal = (blog: any = null) => {
    if (blog) {
      setEditingBlog(blog);
      setFormData({
        title: blog.title || "",
        content: blog.content || "",
        author: blog.author || "Admin",
        image: blog.image || "",
        tags: blog.tags?.join(", ") || "",
        status: blog.status || "Published"
      });
    } else {
      setEditingBlog(null);
      setFormData({
        title: "", content: "", author: "Admin", image: "", tags: "", status: "Published"
      });
    }
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 800000) {
        alert("Image is too large. Please select an image under 800KB to ensure it fits in the database.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const generatePlaceholder = () => {
    const randomId = Math.floor(Math.random() * 1000);
    const url = `https://picsum.photos/seed/${randomId}/1200/800`;
    setFormData({ ...formData, image: url });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        title: formData.title,
        content: formData.content,
        author: formData.author,
        image: formData.image,
        tags: formData.tags.split(",").map(t => t.trim()).filter(t => t),
        status: formData.status,
        updatedAt: serverTimestamp()
      };

      if (editingBlog) {
        await updateDoc(doc(db, "blogs", editingBlog.id), data);
      } else {
        await addDoc(collection(db, "blogs"), {
          ...data,
          createdAt: serverTimestamp()
        });
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error saving blog:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this blog post?")) return;
    try {
      await deleteDoc(doc(db, "blogs", id));
    } catch (err) {
      console.error("Error deleting blog:", err);
    }
  };

  const filteredBlogs = blogs.filter(b => 
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.author.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelectAll = () => {
    if (selectedBlogs.length === filteredBlogs.length) {
      setSelectedBlogs([]);
    } else {
      setSelectedBlogs(filteredBlogs.map(b => b.id));
    }
  };

  const toggleSelectBlog = (id: string) => {
    setSelectedBlogs(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedBlogs.length} blog posts?`)) return;
    try {
      const promises = selectedBlogs.map(id => deleteDoc(doc(db, "blogs", id)));
      await Promise.all(promises);
      setSelectedBlogs([]);
    } catch (err) {
      console.error("Error bulk deleting:", err);
    }
  };

  const handleBulkPublish = async () => {
    try {
      const promises = selectedBlogs.map(id => updateDoc(doc(db, "blogs", id), { status: "Published", updatedAt: serverTimestamp() }));
      await Promise.all(promises);
      setSelectedBlogs([]);
    } catch (err) {
      console.error("Error bulk publishing:", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-extrabold tracking-tight dark:text-white">Blog Management</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">Create and manage educational articles for students.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-navy dark:bg-gold dark:text-navy text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 dark:hover:bg-gold-hover transition-all flex items-center gap-2 shadow-lg shadow-navy/10 dark:shadow-gold/10"
        >
          <Plus size={18} /> New Post
        </button>
      </div>

      {/* Filters & Search */}
      <div className={cn(
        "bg-white dark:bg-[#161B22] p-4 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center gap-4 transition-all shadow-sm",
        isDarkMode && "shadow-none"
      )}>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search blogs..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-[#0F1115] border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy/5 dark:focus:ring-gold/5 focus:border-navy dark:focus:border-gold dark:text-white transition-all"
          />
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedBlogs.length > 0 && (
        <div className="bg-navy dark:bg-gold p-4 rounded-2xl flex items-center justify-between shadow-xl animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 dark:bg-navy/10 p-2 rounded-lg">
              <CheckSquare size={20} className="text-white dark:text-navy" />
            </div>
            <div>
              <p className="text-sm font-bold text-white dark:text-navy">{selectedBlogs.length} Posts Selected</p>
              <p className="text-[10px] font-bold text-white/60 dark:text-navy/60 uppercase tracking-widest">Bulk Actions Available</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleBulkPublish}
              className="px-4 py-2 bg-white/10 dark:bg-navy/5 hover:bg-white/20 dark:hover:bg-navy/10 text-white dark:text-navy rounded-lg text-xs font-bold transition-colors flex items-center gap-2"
            >
              <CheckCircle2 size={16} /> Publish All
            </button>
            <button 
              onClick={handleBulkDelete}
              className="px-4 py-2 bg-red-500/20 dark:bg-red-500/10 hover:bg-red-500/30 dark:hover:bg-red-500/20 text-white dark:text-red-600 rounded-lg text-xs font-bold transition-colors flex items-center gap-2"
            >
              <Trash2 size={16} /> Delete All
            </button>
            <button 
              onClick={() => setSelectedBlogs([])}
              className="p-2 text-white/60 dark:text-navy/60 hover:text-white dark:hover:text-navy transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className={cn(
        "bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden transition-all shadow-sm",
        isDarkMode && "shadow-none"
      )}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-[#0F1115] border-b border-slate-200 dark:border-slate-800">
                <th className="p-4 w-10">
                  <button 
                    onClick={toggleSelectAll}
                    className="text-slate-400 hover:text-navy dark:hover:text-gold transition-colors"
                  >
                    {selectedBlogs.length === filteredBlogs.length && filteredBlogs.length > 0 ? (
                      <CheckSquare size={20} className="text-navy dark:text-gold" />
                    ) : (
                      <Square size={20} />
                    )}
                  </button>
                </th>
                <th className="p-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Post</th>
                <th className="p-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Author</th>
                <th className="p-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Status</th>
                <th className="p-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Date</th>
                <th className="p-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBlogs.map((blog) => (
                <tr key={blog.id} className={cn(
                  "border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group",
                  selectedBlogs.includes(blog.id) && "bg-blue-50/50 dark:bg-gold/5"
                )}>
                  <td className="p-4">
                    <button 
                      onClick={() => toggleSelectBlog(blog.id)}
                      className="text-slate-400 hover:text-navy dark:hover:text-gold transition-colors"
                    >
                      {selectedBlogs.includes(blog.id) ? (
                        <CheckSquare size={20} className="text-navy dark:text-gold" />
                      ) : (
                        <Square size={20} />
                      )}
                    </button>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-[#0F1115] overflow-hidden shrink-0 shadow-sm">
                        <img 
                          src={blog.image || `https://picsum.photos/seed/${blog.id}/400/400`} 
                          alt="" 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer" 
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold truncate dark:text-white group-hover:text-blue-primary dark:group-hover:text-gold transition-colors">{blog.title}</p>
                        <div className="flex gap-1 mt-1">
                          {blog.tags?.slice(0, 2).map((t: string) => (
                            <span key={t} className="text-[10px] font-bold uppercase tracking-tight bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500 dark:text-slate-400">#{t}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm font-bold dark:text-slate-300">{blog.author}</td>
                  <td className="p-4">
                    <span className={cn(
                      "text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider flex items-center gap-1.5 w-fit",
                      blog.status === 'Published' ? 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    )}>
                      {blog.status === 'Published' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                      {blog.status}
                    </span>
                  </td>
                  <td className="p-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    {blog.createdAt?.toDate ? blog.createdAt.toDate().toLocaleDateString() : 'Just now'}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button 
                        onClick={() => setSelectedBlogForView(blog)}
                        className="p-2 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm rounded-xl text-slate-400 hover:text-navy dark:hover:text-gold transition-all"
                      >
                        <Eye size={18} />
                      </button>
                      <button 
                        onClick={() => handleOpenModal(blog)}
                        className="p-2 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm rounded-xl text-slate-400 hover:text-navy dark:hover:text-gold transition-all"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(blog.id)}
                        className="p-2 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm rounded-xl text-slate-400 hover:text-red-600 transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit/Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#161B22] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-200 dark:border-slate-800">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-xl font-display font-extrabold dark:text-white">{editingBlog ? "Edit Post" : "New Blog Post"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full dark:text-slate-400 transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Title</label>
                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-2.5 bg-slate-50 dark:bg-[#0F1115] border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-navy/5 dark:focus:ring-gold/5 focus:border-navy dark:focus:border-gold dark:text-white transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Author</label>
                  <input type="text" value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})} className="w-full p-2.5 bg-slate-50 dark:bg-[#0F1115] border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-navy/5 dark:focus:ring-gold/5 focus:border-navy dark:focus:border-gold dark:text-white transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full p-2.5 bg-slate-50 dark:bg-[#0F1115] border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-navy/5 dark:focus:ring-gold/5 focus:border-navy dark:focus:border-gold dark:text-white transition-all">
                    <option value="Published" className="dark:bg-[#161B22]">Published</option>
                    <option value="Draft" className="dark:bg-[#161B22]">Draft</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Featured Image</label>
                <div className="flex gap-2 mb-2">
                  <button 
                    type="button"
                    onClick={() => setImageType('url')}
                    className={cn(
                      "flex-1 py-1.5 text-[10px] font-bold uppercase rounded-lg border transition-all",
                      imageType === 'url' ? "bg-navy text-white border-navy dark:bg-gold dark:text-navy dark:border-gold" : "bg-slate-50 dark:bg-[#0F1115] border-slate-200 dark:border-slate-800 text-slate-500"
                    )}
                  >
                    Image URL
                  </button>
                  <button 
                    type="button"
                    onClick={() => setImageType('upload')}
                    className={cn(
                      "flex-1 py-1.5 text-[10px] font-bold uppercase rounded-lg border transition-all",
                      imageType === 'upload' ? "bg-navy text-white border-navy dark:bg-gold dark:text-navy dark:border-gold" : "bg-slate-50 dark:bg-[#0F1115] border-slate-200 dark:border-slate-800 text-slate-500"
                    )}
                  >
                    Direct Upload
                  </button>
                </div>

                {imageType === 'url' ? (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="https://images.unsplash.com/..."
                        value={formData.image} 
                        onChange={e => setFormData({...formData, image: e.target.value})} 
                        className="flex-1 p-2.5 bg-slate-50 dark:bg-[#0F1115] border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-navy/5 dark:focus:ring-gold/5 focus:border-navy dark:focus:border-gold dark:text-white transition-all" 
                      />
                    </div>
                    <button 
                      type="button"
                      onClick={generatePlaceholder}
                      className="w-full py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
                    >
                      <RefreshCw size={14} />
                      Generate Random Placeholder
                    </button>
                  </div>
                ) : (
                  <div className="relative group">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden" 
                      id="blog-image-upload"
                    />
                    <label 
                      htmlFor="blog-image-upload"
                      className="flex items-center justify-center gap-2 w-full p-4 bg-slate-50 dark:bg-[#0F1115] border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer hover:border-navy dark:hover:border-gold transition-all"
                    >
                      <Upload size={20} className="text-slate-400" />
                      <span className="text-sm font-medium text-slate-500">Click to upload image (Max 800KB)</span>
                    </label>
                  </div>
                )}

                {formData.image && (
                  <div className="mt-3 relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 h-32 shadow-inner">
                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, image: ""})}
                      className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tags (Comma separated)</label>
                <input type="text" value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} className="w-full p-2.5 bg-slate-50 dark:bg-[#0F1115] border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-navy/5 dark:focus:ring-gold/5 focus:border-navy dark:focus:border-gold dark:text-white transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Content (Markdown/Text)</label>
                <textarea required rows={10} value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="w-full p-2.5 bg-slate-50 dark:bg-[#0F1115] border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-navy/5 dark:focus:ring-gold/5 focus:border-navy dark:focus:border-gold dark:text-white font-mono text-sm transition-all" />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 border border-slate-200 dark:border-slate-800 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 dark:text-white transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-navy dark:bg-gold dark:text-navy text-white rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-gold-hover transition-all shadow-lg shadow-navy/10 dark:shadow-gold/10">Save Post</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {selectedBlogForView && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-white dark:bg-[#161B22] w-full max-w-4xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-200 dark:border-slate-800">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-navy dark:bg-gold dark:text-navy rounded-xl flex items-center justify-center text-white font-bold">
                  {selectedBlogForView.author[0]}
                </div>
                <div>
                  <h3 className="text-lg font-display font-extrabold dark:text-white">Preview Post</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">By {selectedBlogForView.author}</p>
                </div>
              </div>
              <button onClick={() => setSelectedBlogForView(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full dark:text-slate-400 transition-colors"><X size={20} /></button>
            </div>
            <div className="p-0 overflow-y-auto custom-scrollbar">
              <div className="relative h-72 sm:h-96">
                <img 
                  src={selectedBlogForView.image || `https://picsum.photos/seed/${selectedBlogForView.id}/1200/800`} 
                  alt="" 
                  className="w-full h-full object-cover" 
                  referrerPolicy="no-referrer" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#161B22] via-[#161B22]/20 to-transparent" />
                <div className="absolute bottom-8 left-8 right-8">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedBlogForView.tags?.map((t: string) => (
                      <span key={t} className="bg-gold text-navy text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                        {t}
                      </span>
                    ))}
                  </div>
                  <h2 className="text-3xl md:text-5xl font-display font-extrabold text-white leading-tight drop-shadow-lg">
                    {selectedBlogForView.title}
                  </h2>
                </div>
              </div>

              <div className="p-8 md:p-12">
                <div className="flex items-center gap-6 pb-8 mb-8 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 dark:bg-gold/10 rounded-lg text-blue-primary dark:text-gold">
                      <User size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">Author</p>
                      <p className="text-sm font-bold text-navy dark:text-white">{selectedBlogForView.author}</p>
                    </div>
                  </div>
                  <div className="h-8 w-px bg-slate-100 dark:bg-slate-800" />
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-50 dark:bg-green-500/10 rounded-lg text-green-600 dark:text-green-400">
                      <Calendar size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">Published</p>
                      <p className="text-sm font-bold text-navy dark:text-white">
                        {selectedBlogForView.createdAt?.toDate ? selectedBlogForView.createdAt.toDate().toLocaleDateString() : 'Just now'}
                      </p>
                    </div>
                  </div>
                  <div className="h-8 w-px bg-slate-100 dark:bg-slate-800" />
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2 rounded-lg",
                      selectedBlogForView.status === 'Published' ? "bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400" : "bg-slate-50 dark:bg-slate-800 text-slate-400"
                    )}>
                      {selectedBlogForView.status === 'Published' ? <CheckCircle2 size={18} /> : <Clock size={18} />}
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">Status</p>
                      <p className="text-sm font-bold text-navy dark:text-white">{selectedBlogForView.status}</p>
                    </div>
                  </div>
                </div>
                
                <div className="markdown-body prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
                  <ReactMarkdown>
                    {selectedBlogForView.content}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#0F1115] flex justify-end">
              <button 
                onClick={() => setSelectedBlogForView(null)} 
                className="px-8 py-3 bg-navy dark:bg-gold dark:text-navy text-white rounded-xl font-bold text-sm transition-all hover:bg-slate-800 dark:hover:bg-gold-hover shadow-lg shadow-navy/10 dark:shadow-gold/10"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
