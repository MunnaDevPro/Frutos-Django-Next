// src/app/wholesale/profile/_tabs/SettingsTab.jsx
import Card from '../_shared/Card'
import { Field } from '../_shared/StatBox'

export default function SettingsTab({ 
  profile, editForm, onChange, onSave, saving, success, error,
  pwForm, pwOnChange, pwOnSave, pwSaving, pwSuccess, pwError
}) {
  return (
    <div className="flex flex-col gap-6 lg:gap-8 max-w-5xl mx-auto">
      
      {/* Edit Profile Card */}
      <Card title="Edit Profile" icon={
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      }>
        <div className="flex flex-col gap-8">
          
          {/* Section: Account Information */}
          <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100/60">
            <h3 className="text-sm font-bold text-gray-900 mb-5 pb-3 border-b border-gray-200/50 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#085041]"></span>
              Account Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Business Name" value={profile.business_name} readOnly hint="Contact support to change business name." />
              <Field label="Email Address" value={profile.email} readOnly hint="Contact support to change email." />
            </div>
          </div>

          {/* Section: Contact & Preferences */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-5 pb-3 border-b border-gray-100 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#085041]"></span>
              Contact Details & Preferences
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Contact Name" name="contact_name" value={editForm.contact_name} onChange={onChange} />
              <Field label="Phone Number" name="phone" value={editForm.phone} onChange={onChange} type="tel" />
              <Field label="Delivery Postcode" name="postcode" value={editForm.postcode} onChange={onChange} />
              
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                  Monthly Volume
                </label>
                <div className="relative">
                  <select name="monthly_volume" value={editForm.monthly_volume} onChange={onChange} 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-[#151e13] focus:border-[#085041] focus:ring-4 focus:ring-[#085041]/10 outline-none transition-all text-sm appearance-none cursor-pointer shadow-sm hover:border-gray-300"
                  >
                    <option value="400_1000">€400 – €1,000 / month</option>
                    <option value="1000_3000">€1,000 – €3,000 / month</option>
                    <option value="3000_7000">€3,000 – €7,000 / month</option>
                    <option value="7000_plus">€7,000+ / month</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-400">
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Messages */}
        {success && (
          <div className="mt-6 p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm flex items-center gap-3 font-medium">
            <span className="material-symbols-outlined text-[20px] text-emerald-500">check_circle</span>
            Your profile details have been updated successfully.
          </div>
        )}
        {error && (
          <div className="mt-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm flex items-center gap-3 font-medium">
            <span className="material-symbols-outlined text-[20px] text-red-500">error</span>
            {error}
          </div>
        )}

        {/* Action Area */}
        <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
          <button 
            onClick={onSave} 
            disabled={saving} 
            className={`w-full md:w-auto px-8 py-3.5 rounded-xl font-bold text-white text-sm transition-all flex justify-center items-center gap-2 ${
              saving 
                ? 'bg-[#085041]/70 cursor-not-allowed' 
                : 'bg-[#085041] hover:bg-[#063d31] shadow-lg shadow-[#085041]/20 hover:shadow-[#085041]/30 hover:-translate-y-0.5 cursor-pointer'
            }`}
          >
            {saving ? (
               <><span className="animate-spin border-2 border-white/30 border-t-white rounded-full w-4 h-4"></span> Saving...</>
            ) : 'Save Profile Changes'}
          </button>
        </div>
      </Card>

      {/* Change Password Card */}
      <Card title="Security & Password" icon={
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0110 0v4" />
        </svg>
      }>
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="flex-1 max-w-md w-full bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-5 pb-3 border-b border-gray-100 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#085041]"></span>
              Update Password
            </h3>
            <div className="flex flex-col gap-5">
              {[
                { label: 'Current Password', name: 'old_password' },
                { label: 'New Password',     name: 'new_password' },
                { label: 'Confirm New',      name: 'confirm'      },
              ].map(({ label, name }) => (
                <Field key={name} label={label} name={name} type="password"
                  value={pwForm[name]} onChange={pwOnChange} />
              ))}
            </div>

            {pwSuccess && (
              <div className="mt-6 p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm flex items-center gap-3 font-medium">
                <span className="material-symbols-outlined text-[20px] text-emerald-500">check_circle</span>
                Password has been changed securely.
              </div>
            )}
            {pwError && (
              <div className="mt-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm flex items-center gap-3 font-medium">
                <span className="material-symbols-outlined text-[20px] text-red-500">error</span>
                {pwError}
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-gray-100">
              <button 
                onClick={pwOnSave} 
                disabled={pwSaving} 
                className={`w-full px-6 py-3.5 rounded-xl font-bold text-white text-sm transition-all flex justify-center items-center gap-2 ${
                  pwSaving 
                    ? 'bg-[#085041]/70 cursor-not-allowed' 
                    : 'bg-[#085041] hover:bg-[#063d31] shadow-lg shadow-[#085041]/20 hover:shadow-[#085041]/30 hover:-translate-y-0.5 cursor-pointer'
                }`}
              >
                {pwSaving ? (
                  <><span className="animate-spin border-2 border-white/30 border-t-white rounded-full w-4 h-4"></span> Updating...</>
                ) : 'Update Password'}
              </button>
            </div>
          </div>
          
          {/* Security tips section */}
          <div className="flex-1 bg-blue-50/50 p-6 rounded-2xl border border-blue-100/50 mt-4 md:mt-0 hidden md:block">
            <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <svg width="18" height="18" fill="none" stroke="#3b82f6" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              Security Tips
            </h4>
            <ul className="text-sm text-gray-600 space-y-3">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 w-1 h-1 rounded-full bg-blue-400 shrink-0"></span>
                <span>Use a minimum of 8 characters for your new password.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 w-1 h-1 rounded-full bg-blue-400 shrink-0"></span>
                <span>Include a mix of uppercase and lowercase letters, numbers, and symbols.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 w-1 h-1 rounded-full bg-blue-400 shrink-0"></span>
                <span>Avoid using common words or personal information like your business name.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 w-1 h-1 rounded-full bg-blue-400 shrink-0"></span>
                <span>Do not reuse passwords across multiple sites or applications.</span>
              </li>
            </ul>
          </div>
        </div>
      </Card>

    </div>
  )
}