"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDashboardAuth } from "@/app/dashboard/_context/DashboardAuthContext";
import { announcementsService } from "@/app/dashboard/_lib/services";
import { useToastContext } from "@/app/dashboard/_components/Toaster";
import Container from "@/app/dashboard/_components/Container";
import Link from "next/link";
import Image from "next/image";
import { Send, Store, Users, CheckSquare, Square, Loader2, ArrowLeft, CheckCircle2, Megaphone, Search } from "lucide-react";

export default function CreateAnnouncementPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useDashboardAuth();
  const { success, error } = useToastContext();
  
  const [title, setTitle] = useState(searchParams.get("title") || "");
  const [message, setMessage] = useState(searchParams.get("message") || "");
  const [targetAllStores, setTargetAllStores] = useState(false);
  const [targetsData, setTargetsData] = useState([]);
  const [selectedStores, setSelectedStores] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [loadingTargets, setLoadingTargets] = useState(true);

  // Search states
  const [storeSearch, setStoreSearch] = useState("");
  const [staffSearches, setStaffSearches] = useState({});

  const isAdmin = user?.userType === "ADMIN" || user?.isSuperuser;

  useEffect(() => {
    if (!isAdmin) {
      router.push("/dashboard/announcements");
      return;
    }

    const fetchTargets = async () => {
      try {
        const res = await announcementsService.targets();
        setTargetsData(Array.isArray(res) ? res : res.results || []);
      } catch (err) {
        console.error(err);
        error("Failed to load staff list");
      } finally {
        setLoadingTargets(false);
      }
    };

    fetchTargets();
  }, [isAdmin, router, error]);

  const handleStoreSelect = (storeId) => {
    if (selectedStores.includes(storeId)) {
      setSelectedStores(prev => prev.filter(id => id !== storeId));
      // Remove all staff belonging to this store
      const storeStaffIds = targetsData.find(s => s.id === storeId)?.staff_list.map(st => st.id) || [];
      setSelectedStaff(prev => prev.filter(id => !storeStaffIds.includes(id)));
    } else {
      setSelectedStores(prev => [...prev, storeId]);
      // Select all staff belonging to this store
      const storeStaffIds = targetsData.find(s => s.id === storeId)?.staff_list.map(st => st.id) || [];
      setSelectedStaff(prev => {
        const newSet = new Set([...prev, ...storeStaffIds]);
        return Array.from(newSet);
      });
    }
  };

  const handleStaffSelect = (staffId, storeId) => {
    if (selectedStaff.includes(staffId)) {
      setSelectedStaff(prev => prev.filter(id => id !== staffId));
      // Deselect store if a staff is deselected
      setSelectedStores(prev => prev.filter(id => id !== storeId));
    } else {
      setSelectedStaff(prev => [...prev, staffId]);
      
      // If all staff in the store are now selected, also select the store
      const storeStaff = targetsData.find(s => s.id === storeId)?.staff_list || [];
      const currentSelected = [...selectedStaff, staffId];
      const allSelected = storeStaff.length > 0 && storeStaff.every(st => currentSelected.includes(st.id));
      if (allSelected && !selectedStores.includes(storeId)) {
        setSelectedStores(prev => [...prev, storeId]);
      }
    }
  };

  const handleStaffSearchChange = (storeId, value) => {
    setStaffSearches(prev => ({ ...prev, [storeId]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      return error("Title and message are required.");
    }
    
    if (!targetAllStores && selectedStores.length === 0 && selectedStaff.length === 0) {
      return error("Select at least one store or staff member to notify.");
    }

    try {
      setSubmitting(true);
      await announcementsService.create({
        title,
        message,
        target_all_stores: targetAllStores,
        target_stores: targetAllStores ? [] : selectedStores,
        target_staff: targetAllStores ? [] : selectedStaff
      });
      success("Announcement sent successfully!");
      router.push("/dashboard/announcements");
    } catch (err) {
      console.error(err);
      error("Failed to send announcement");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAdmin) return null;

  const filteredStores = targetsData.filter(store => 
    store.name.toLowerCase().includes(storeSearch.toLowerCase())
  );

  return (
    <Container 
      title="Create Announcement" 
      description="Send a targeted message to your staff members in real-time."
      actions={
        <Link
          href="/dashboard/announcements"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-md shadow-sm transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 max-w-5xl">
        
        {/* Message Content Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-3 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-800">Message Content</h2>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Title</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm transition-all bg-slate-50/50 focus:bg-white"
                placeholder="e.g. Important Update: New Store Hours"
                required
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Message</label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm resize-none transition-all bg-slate-50/50 focus:bg-white"
                placeholder="Type your detailed announcement here..."
                required
              />
            </div>
          </div>
        </div>

        {/* Target Audience Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" />
              <h2 className="text-sm font-bold text-slate-800">Target Audience</h2>
            </div>
            <span className="text-xs font-medium text-slate-500 bg-white px-2 py-1 rounded-md border border-slate-200">
              {targetAllStores ? 'All Staff' : `${selectedStaff.length} Staff Selected`}
            </span>
          </div>
          
          <div className="p-4">
            <div 
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer mb-5 transition-all ${targetAllStores ? 'bg-emerald-50 border-emerald-500 shadow-sm' : 'bg-white border-slate-200 hover:border-emerald-200 hover:bg-slate-50'}`}
              onClick={() => setTargetAllStores(!targetAllStores)}
            >
              <div className={`flex items-center justify-center w-5 h-5 rounded border ${targetAllStores ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 text-transparent'}`}>
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1">
                <p className={`text-sm font-bold ${targetAllStores ? 'text-emerald-900' : 'text-slate-800'}`}>Broadcast to Everyone</p>
                <p className={`text-xs ${targetAllStores ? 'text-emerald-700/80' : 'text-slate-500'}`}>Send this message to every single staff member across all stores.</p>
              </div>
            </div>

            <div className={`transition-all duration-300 ${targetAllStores ? 'opacity-40 pointer-events-none grayscale-[50%]' : 'opacity-100'}`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Or Select Specific Staff</h3>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    placeholder="Search stores..." 
                    value={storeSearch}
                    onChange={(e) => setStoreSearch(e.target.value)}
                    className="pl-8 pr-3 py-1.5 border border-slate-200 rounded-md text-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none w-48 transition-all"
                  />
                </div>
              </div>
              
              {loadingTargets ? (
                <div className="py-8 flex flex-col items-center justify-center text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin mb-2" />
                  <p className="text-xs">Loading stores and staff...</p>
                </div>
              ) : filteredStores.length === 0 ? (
                <div className="p-6 bg-slate-50 border border-dashed border-slate-300 rounded-lg text-center">
                  <Store className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-500 font-medium">No stores matched your search.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredStores.map(store => {
                    const isStoreSelected = selectedStores.includes(store.id);
                    const currentStaffSearch = staffSearches[store.id] || "";
                    const filteredStaff = store.staff_list.filter(staff => 
                      staff.name.toLowerCase().includes(currentStaffSearch.toLowerCase()) || 
                      staff.role.toLowerCase().includes(currentStaffSearch.toLowerCase())
                    );

                    return (
                      <div key={store.id} className={`rounded-lg border overflow-hidden transition-all ${isStoreSelected ? 'border-emerald-500/50 bg-emerald-50/10' : 'border-slate-200 bg-white'}`}>
                        <div className="flex items-center justify-between bg-slate-50 border-b border-slate-100 pr-3">
                          <div 
                            className="flex items-center gap-2 p-3 cursor-pointer hover:bg-slate-100 transition-colors flex-1"
                            onClick={() => handleStoreSelect(store.id)}
                          >
                            <div className={`flex items-center justify-center w-4 h-4 rounded border ${isStoreSelected ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 text-transparent bg-white'}`}>
                              <CheckCircle2 className="w-3 h-3" />
                            </div>
                            <Store className={`w-4 h-4 ${isStoreSelected ? 'text-emerald-600' : 'text-slate-400'}`} />
                            <div className="flex-1">
                              <h4 className="font-bold text-slate-800 text-sm">{store.name}</h4>
                            </div>
                            <div className="text-[10px] font-bold text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                              Select All
                            </div>
                          </div>
                          <div className="relative ml-2">
                            <Search className="w-3 h-3 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
                            <input 
                              type="text" 
                              placeholder="Search staff..." 
                              value={currentStaffSearch}
                              onChange={(e) => handleStaffSearchChange(store.id, e.target.value)}
                              className="pl-6 pr-2 py-1 border border-slate-200 rounded text-[10px] focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none w-32 transition-all bg-white"
                            />
                          </div>
                        </div>

                        <div className="p-3">
                          {store.staff_list.length === 0 ? (
                            <p className="text-xs text-slate-400 italic text-center py-2 bg-slate-50 rounded border border-dashed border-slate-200">No staff assigned to this store.</p>
                          ) : filteredStaff.length === 0 ? (
                            <p className="text-xs text-slate-400 italic text-center py-2 bg-slate-50 rounded border border-dashed border-slate-200">No staff matched your search.</p>
                          ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                              {filteredStaff.map(staff => {
                                const isStaffSelected = selectedStaff.includes(staff.id);
                                return (
                                  <div 
                                    key={staff.id} 
                                    onClick={() => handleStaffSelect(staff.id, store.id)}
                                    className={`relative flex flex-col items-center p-2 rounded-lg border cursor-pointer transition-all hover:shadow-sm ${isStaffSelected ? 'border-emerald-500 bg-emerald-50/50 shadow-sm' : 'border-slate-200 bg-white hover:border-emerald-200'}`}
                                  >
                                    <div className="relative w-10 h-10 rounded-full overflow-hidden mb-2 border border-white shadow-sm ring-1 ring-slate-100 shrink-0 bg-slate-100 flex items-center justify-center">
                                      {staff.photo ? (
                                        <Image src={staff.photo.startsWith('http') ? staff.photo : `http://127.0.0.1:8000${staff.photo}`} alt={staff.name} fill className="object-cover" />
                                      ) : (
                                        <Users className="w-4 h-4 text-slate-300" />
                                      )}
                                    </div>
                                    <span className="font-bold text-xs text-slate-800 text-center line-clamp-1 w-full">{staff.name}</span>
                                    <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded uppercase mt-1 w-full text-center truncate">{staff.role}</span>
                                    
                                    {isStaffSelected && (
                                      <div className="absolute top-1 right-1 bg-white rounded-full">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-1 pb-8">
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg font-bold text-xs transition-all shadow-sm hover:shadow-md disabled:opacity-50 cursor-pointer"
          >
            {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            {submitting ? "Sending..." : "Send Announcement Now"}
          </button>
        </div>

      </form>
    </Container>
  );
}
