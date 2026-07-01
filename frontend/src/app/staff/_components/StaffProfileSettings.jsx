"use client";

import { useState } from "react";
import api from "@/app/dashboard/_lib/api";
import { User, Phone, Lock, Save, Camera, Check } from "lucide-react";
import { useToastContext } from "@/app/dashboard/_components/Toaster";
import { useStaffAuth } from "../_context/StaffAuthContext";

export default function StaffProfileSettings({ profile, user }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(profile?.photo || null);
  const { success: successToast, error: errorToast } = useToastContext();
  const { fetchUser } = useStaffAuth(); // To re-fetch user if photo changes globally

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    const formData = new FormData(e.target);
    const password = formData.get("password");
    if (!password) {
      formData.delete("password");
    }

    try {
      await api.patch("/api/staff/me/profile/", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setSuccess(true);
      successToast("Profile updated successfully");
      
      // Update global user state (which affects sidebar/header photo)
      if (fetchUser) await fetchUser();
      
      setTimeout(() => setSuccess(false), 3000);
      e.target.reset(); // Reset form but keep existing values as default
    } catch (err) {
      errorToast(err.response?.data?.detail || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPhotoPreview(url);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 md:p-8 border-b border-slate-100">
          <h2 className="font-serif text-2xl font-bold text-emerald-900">Profile Settings</h2>
          <p className="text-slate-500 text-sm mt-1">Update your personal information and profile photo.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
          
          {/* Photo Section */}
          <div className="flex items-center gap-6 pb-6 border-b border-slate-100">
            <div className="w-24 h-24 rounded-full bg-slate-100 border-2 border-white shadow-md overflow-hidden shrink-0 relative group">
              {photoPreview ? (
                <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <User size={32} />
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="text-white w-6 h-6" />
              </div>
              <input 
                type="file" 
                name="photo" 
                accept="image/*" 
                onChange={handlePhotoChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                title="Change Photo"
              />
            </div>
            <div>
              <h3 className="font-semibold text-slate-700">Profile Photo</h3>
              <p className="text-sm text-slate-500 mb-2">Click the image to upload a new photo.</p>
              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                {profile?.role || "Staff Member"}
              </span>
            </div>
          </div>

          <div className="space-y-5">
            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-slate-400" />
                </div>
                <input 
                  name="name" 
                  defaultValue={user?.name}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" 
                />
              </div>
            </div>

            {/* Email (Read Only) */}
            <div className="space-y-1.5 opacity-70">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Email (Read-Only)</label>
              <div className="relative">
                <input 
                  disabled
                  defaultValue={user?.email}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-500 cursor-not-allowed" 
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-4 w-4 text-slate-400" />
                </div>
                <input 
                  name="phone" 
                  defaultValue={profile?.phone}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" 
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5 pt-4 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Change Password</label>
              <p className="text-xs text-slate-500 mb-2">Leave this blank if you don't want to change your password.</p>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input 
                  name="password" 
                  type="password"
                  placeholder="New password"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" 
                />
              </div>
            </div>
          </div>
          
          <div className="pt-4 flex items-center justify-end">
            <button 
              type="submit" 
              disabled={loading}
              className={`px-6 py-2.5 rounded-xl font-bold text-sm text-white flex items-center gap-2 transition-all ${
                success ? 'bg-green-500' : 'bg-emerald-600 hover:bg-emerald-700'
              } disabled:opacity-70 disabled:cursor-not-allowed`}
            >
              {loading ? (
                <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : success ? (
                <Check size={16} />
              ) : (
                <Save size={16} />
              )}
              {success ? 'Saved!' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
