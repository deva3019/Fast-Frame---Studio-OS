import { useState, useEffect } from 'react';
import api from '../services/api';

const Settings = () => {
  const [settings, setSettings] = useState({
    studioName: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    logoUrl: '',
    defaultInvoiceTerms: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/settings');
      if (res.data) {
        setSettings(res.data);
      }
      setIsLoading(false);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load studio settings.' });
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ type: '', text: '' });

    try {
      await api.put('/settings', settings);
      setMessage({ type: 'success', text: 'Studio settings synchronized successfully.' });
      
      // Clear success message after 3 seconds
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to save settings. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-2 border-zinc-700 border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      
      <header>
        <h2 className="text-3xl font-serif font-bold tracking-tight text-white">Studio Settings</h2>
        <p className="text-sm text-zinc-400 mt-1 font-mono uppercase tracking-widest">
          Global parameters and invoice branding
        </p>
      </header>

      {message.text && (
        <div className={`p-4 rounded-lg text-xs font-mono uppercase tracking-widest flex items-center gap-3 ${
          message.type === 'success' ? 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-400' : 'bg-red-950/40 border border-red-500/30 text-red-400'
        }`}>
          {message.type === 'success' ? (
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
          ) : (
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
          )}
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Core Identity Section */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
          <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-900/50">
            <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-300 font-bold">Core Identity</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-2">Studio Name *</label>
              <input 
                type="text" 
                name="studioName" 
                required 
                value={settings.studioName} 
                onChange={handleChange} 
                className="w-full bg-zinc-900 border border-zinc-800 text-white px-4 py-2.5 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors" 
                placeholder="e.g. FastFrame Studios"
              />
            </div>
            
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-2">Primary Email</label>
              <input 
                type="email" 
                name="email" 
                value={settings.email} 
                onChange={handleChange} 
                className="w-full bg-zinc-900 border border-zinc-800 text-white px-4 py-2.5 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors" 
                placeholder="hello@studio.com"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-2">Contact Number</label>
              <input 
                type="text" 
                name="phone" 
                value={settings.phone} 
                onChange={handleChange} 
                className="w-full bg-zinc-900 border border-zinc-800 text-white px-4 py-2.5 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors" 
                placeholder="+1 (555) 000-0000"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-2">Website URL</label>
              <input 
                type="url" 
                name="website" 
                value={settings.website} 
                onChange={handleChange} 
                className="w-full bg-zinc-900 border border-zinc-800 text-white px-4 py-2.5 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors font-mono text-sm" 
                placeholder="https://www.yourstudio.com"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-2">Physical Address</label>
              <textarea 
                name="address" 
                value={settings.address} 
                onChange={handleChange} 
                rows="2"
                className="w-full bg-zinc-900 border border-zinc-800 text-white px-4 py-2.5 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors resize-none" 
                placeholder="123 Creative Lane, Suite 100&#10;New York, NY 10001"
              ></textarea>
            </div>
          </div>
        </div>

        {/* Branding & Billing Section */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
          <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-900/50 flex justify-between items-center">
            <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-300 font-bold">Invoicing & Delivery</h3>
          </div>
          <div className="p-6 space-y-6">
            
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-2">Brand Logo URL</label>
              <div className="flex gap-4 items-start">
                <input 
                  type="url" 
                  name="logoUrl" 
                  value={settings.logoUrl} 
                  onChange={handleChange} 
                  className="flex-1 bg-zinc-900 border border-zinc-800 text-white px-4 py-2.5 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors font-mono text-sm" 
                  placeholder="https://imgur.com/your-logo.png"
                />
                {settings.logoUrl && (
                  <div className="w-12 h-12 shrink-0 bg-white rounded flex items-center justify-center overflow-hidden border border-zinc-700 p-1">
                    <img src={settings.logoUrl} alt="Logo Preview" className="max-w-full max-h-full object-contain" />
                  </div>
                )}
              </div>
              <p className="text-[10px] text-zinc-500 mt-2 font-mono">Provide a direct link to your transparent PNG logo. This will appear at the top of your PDF invoices.</p>
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-2">Default Invoice Terms & Conditions</label>
              <textarea 
                name="defaultInvoiceTerms" 
                value={settings.defaultInvoiceTerms} 
                onChange={handleChange} 
                rows="4"
                className="w-full bg-zinc-900 border border-zinc-800 text-white px-4 py-3 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors text-sm" 
                placeholder="1. 50% advance required to block dates.&#10;2. Final deliverables released only upon 100% payment clearance."
              ></textarea>
              <p className="text-[10px] text-zinc-500 mt-2 font-mono">These terms will automatically append to the footer of newly generated bills.</p>
            </div>

          </div>
        </div>

        {/* Action Footer */}
        <div className="flex justify-end pt-4">
          <button 
            type="submit" 
            disabled={isSaving}
            className="bg-white text-black font-mono text-xs uppercase tracking-widest font-bold px-8 py-3 rounded-lg hover:bg-zinc-200 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-white/5"
          >
            {isSaving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              'Save Global Settings'
            )}
          </button>
        </div>

      </form>
    </div>
  );
};

export default Settings;