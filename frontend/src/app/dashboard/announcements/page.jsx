"use client";

import { useState, useEffect } from "react";
import { useDashboardAuth } from "@/app/dashboard/_context/DashboardAuthContext";
import { announcementsService } from "@/app/dashboard/_lib/services";
import { useToastContext } from "@/app/dashboard/_components/Toaster";
import Container from "@/app/dashboard/_components/Container";
import Link from "next/link";
import { Megaphone, Clock, Loader2, Plus, ChevronDown, Search, Store, Users, Trash2, Forward } from "lucide-react";

export default function AnnouncementsPage() {
  const { user } = useDashboardAuth();
  const { error, success } = useToastContext();
  
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [announcementToDelete, setAnnouncementToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const isAdmin = user?.userType === "ADMIN" || user?.isSuperuser;

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await announcementsService.list();
      const data = Array.isArray(res) ? res : res.results || [];
      setAnnouncements(data);
      if (data.length > 0) {
        setExpandedId(data[0].id); // Expand the first one by default
      }
    } catch (err) {
      console.error(err);
      error("Failed to load announcements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();

    const handleNewAnnouncement = () => {
      fetchAnnouncements();
    };
    window.addEventListener("new_announcement", handleNewAnnouncement);
    return () => window.removeEventListener("new_announcement", handleNewAnnouncement);
  }, []);

  const toggleAccordion = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const confirmDelete = async () => {
    if (!announcementToDelete) return;
    
    try {
      setIsDeleting(true);
      await announcementsService.delete(announcementToDelete);
      success("Announcement deleted successfully");
      setAnnouncements(announcements.filter(a => a.id !== announcementToDelete));
      if (expandedId === announcementToDelete) setExpandedId(null);
      setAnnouncementToDelete(null);
    } catch (err) {
      console.error(err);
      error("Failed to delete announcement");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredAnnouncements = announcements.filter(ann => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    
    // Check title
    if (ann.title.toLowerCase().includes(query)) return true;
    
    // Check target store names
    if (ann.target_stores_names?.some(name => name.toLowerCase().includes(query))) return true;
    
    // Check target staff names
    if (ann.target_staff_names?.some(name => name.toLowerCase().includes(query))) return true;
    
    return false;
  });

  return (
    <Container 
      title="Announcements" 
      actions={
        isAdmin && (
          <Link
            href="/dashboard/announcements/create"
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all hover:shadow-md"
          >
            <Plus className="w-4 h-4" />
            Create Announcement
          </Link>
        )
      }
    >
      <div className="flex flex-col gap-4">
        
        {/* Search & Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-3 flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Filter by title, store name, or staff name..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-slate-50 focus:bg-white"
            />
          </div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-2">
            {filteredAnnouncements.length} {filteredAnnouncements.length === 1 ? 'Result' : 'Results'}
          </div>
        </div>
        
        {/* Announcements List */}
        <div>
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center bg-white rounded-2xl shadow-sm border border-slate-100">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-600 mb-3" />
              <p className="text-sm font-medium text-slate-500">Loading announcements...</p>
            </div>
          ) : announcements.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center bg-white rounded-2xl shadow-sm border border-slate-100 text-slate-400">
              <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
                <Megaphone className="w-8 h-8 opacity-40 text-emerald-600" />
              </div>
              <p className="text-base font-semibold text-slate-700">No announcements found</p>
            </div>
          ) : filteredAnnouncements.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center bg-white rounded-2xl shadow-sm border border-slate-100 text-slate-400">
              <Search className="w-8 h-8 mb-3 opacity-20 text-slate-500" />
              <p className="text-sm font-semibold text-slate-600">No matching announcements</p>
              <p className="text-xs mt-1">Try adjusting your search filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
              {filteredAnnouncements.map(ann => {
                const isExpanded = expandedId === ann.id;
                
                return (
                  <div 
                    key={ann.id} 
                    className={`bg-white rounded-2xl transition-all duration-300 border overflow-hidden ${
                      isExpanded ? 'shadow-md border-emerald-600/20 ring-1 ring-emerald-600/5' : 'shadow-sm border-slate-200 hover:border-emerald-600/30 hover:shadow'
                    }`}
                  >
                    <div 
                      className={`flex items-center justify-between p-4 cursor-pointer transition-colors duration-300 select-none ${
                        isExpanded ? 'bg-gradient-to-r from-emerald-50/50 to-white' : 'bg-white hover:bg-slate-50'
                      }`}
                      onClick={() => toggleAccordion(ann.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 shadow-sm ${
                          isExpanded 
                            ? 'bg-gradient-to-br from-emerald-600 to-emerald-800 text-white scale-110' 
                            : 'bg-emerald-50 text-emerald-600'
                        }`}>
                          <Megaphone className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className={`font-semibold text-sm tracking-tight leading-tight transition-colors duration-300 ${
                            isExpanded ? 'text-emerald-700' : 'text-slate-800'
                          }`}>
                            {ann.title}
                          </h3>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-1.5 py-0.5 rounded">
                              {ann.created_by_name || 'Admin'}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                            <span className="text-[10px] font-medium text-slate-400">
                              {new Date(ann.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {isAdmin && (
                          <div className="hidden sm:flex gap-1 text-[9px] font-bold uppercase tracking-wider">
                            {ann.target_all_stores ? (
                              <span className="bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded border border-emerald-100">All Stores</span>
                            ) : (
                              <>
                                {ann.target_stores?.length > 0 && (
                                  <span className="bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded border border-emerald-100">{ann.target_stores.length} Stores</span>
                                )}
                                {ann.target_staff?.length > 0 && (
                                  <span className="bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded border border-emerald-100">{ann.target_staff.length} Staff</span>
                                )}
                              </>
                            )}
                          </div>
                        )}
                        {isAdmin && (
                          <>
                            <Link 
                              href={`/dashboard/announcements/create?title=${encodeURIComponent(ann.title)}&message=${encodeURIComponent(ann.message)}`}
                              onClick={(e) => e.stopPropagation()}
                              className="w-7 h-7 rounded-full flex items-center justify-center text-slate-300 hover:text-indigo-500 hover:bg-indigo-50 transition-all duration-300 mr-1 cursor-pointer"
                              title="Forward announcement"
                            >
                              <Forward className="w-4 h-4" />
                            </Link>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setAnnouncementToDelete(ann.id);
                              }}
                              className="w-7 h-7 rounded-full flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all duration-300 mr-1 cursor-pointer"
                              title="Delete announcement"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${
                          isExpanded ? 'bg-emerald-50 text-emerald-600' : 'text-slate-300 group-hover:text-emerald-600 group-hover:bg-slate-100'
                        }`}>
                          <ChevronDown className={`w-4 h-4 transition-transform duration-500 ease-[cubic-bezier(0.87,0,0.13,1)] ${isExpanded ? 'rotate-180' : ''}`} />
                        </div>
                      </div>
                    </div>
                    
                    {/* Animated Accordion Body using CSS Grid */}
                    <div 
                      className={`grid transition-all duration-500 ease-[cubic-bezier(0.87,0,0.13,1)] ${
                        isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div className="p-4 pt-0 sm:px-5 sm:pb-5">
                          <div className="relative mt-2">
                             {/* Subtle left border accent */}
                             <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-emerald-500/40 to-transparent rounded-full"></div>
                             <p className="text-xs text-slate-600 whitespace-pre-wrap leading-relaxed pl-4 font-medium">
                               {ann.message}
                             </p>
                          </div>
                          
                          {isAdmin && !ann.target_all_stores && (ann.target_stores_names?.length > 0 || ann.target_staff_names?.length > 0) && (
                            <div className="mt-4 pt-3 border-t border-slate-100 pl-4">
                              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Targeted Audience</h4>
                              <div className="flex flex-wrap gap-1.5">
                                {ann.target_stores_names?.map((name, i) => (
                                  <span key={`store-${i}`} className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded shadow-sm border border-emerald-100 flex items-center gap-1">
                                    <Store className="w-3 h-3" /> {name}
                                  </span>
                                ))}
                                {ann.target_staff_names?.map((name, i) => (
                                  <span key={`staff-${i}`} className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-1 rounded shadow-sm border border-indigo-100 flex items-center gap-1">
                                    <Users className="w-3 h-3" /> {name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Delete Confirmation Modal */}
      {announcementToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4 mx-auto">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 text-center mb-2">Delete Announcement?</h3>
              <p className="text-sm text-slate-500 text-center font-medium">
                Are you sure you want to delete this announcement? It will be removed immediately from all staff dashboards.
              </p>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-3">
              <button 
                onClick={() => setAnnouncementToDelete(null)}
                disabled={isDeleting}
                className="flex-1 py-2.5 px-4 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 px-4 bg-red-600 rounded-xl text-sm font-semibold text-white hover:bg-red-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </Container>
  );
}
