import { useState, useEffect } from 'react';
import api from '../services/api';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Reordered to prioritize Phone Number
  const [formData, setFormData] = useState({ phone: '', name: '', email: '', notes: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false); // Mobile toggle for form

  useEffect(() => {
    fetchClients();
  }, []);

  // Filter clients instantly when search term changes
  useEffect(() => {
    const results = clients.filter(client => 
      client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone?.includes(searchTerm) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredClients(results);
  }, [searchTerm, clients]);

  const fetchClients = async () => {
    try {
      const response = await api.get('/clients');
      // Sort newest first assuming MongoDB _id timestamp
      const sorted = response.data.sort((a, b) => (a._id < b._id ? 1 : -1));
      setClients(sorted);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch clients from Atlas.');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await api.post('/clients', formData);
      setClients([response.data, ...clients]); 
      setFormData({ phone: '', name: '', email: '', notes: '' });
      setIsFormOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating client');
    }
  };

  // Helper to strip non-numeric characters for the WhatsApp API link
  const getWhatsAppLink = (phone) => {
    if (!phone) return '#';
    const cleanPhone = phone.replace(/\D/g, '');
    return `https://wa.me/${cleanPhone}`;
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in w-full max-w-7xl mx-auto">
      
      {/* Header & Mobile Form Toggle */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Client Roster</h2>
          <p className="text-xs md:text-sm text-zinc-400 mt-1">Manage contacts and initiate communications.</p>
        </div>
        <button 
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="md:hidden inline-flex items-center justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-indigo-500/20 w-full"
        >
          {isFormOpen ? 'Close Form' : '+ Add New Client'}
        </button>
      </header>

      {error && <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Add Client Form - Hidden on mobile unless toggled */}
        <div className={`lg:col-span-4 bg-zinc-950 p-5 md:p-6 rounded-2xl border border-zinc-800 shadow-xl transition-all ${isFormOpen ? 'block' : 'hidden md:block'}`}>
          <div className="flex items-center justify-between mb-5 border-b border-zinc-800/80 pb-4">
            <h3 className="text-base font-bold text-white">Register Client</h3>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400">CRM Sync</span>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* PHONE FIRST */}
            <div className="space-y-1.5 group">
              <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider group-focus-within:text-indigo-400 transition-colors">
                Primary Phone Number <span className="text-red-500">*</span>
              </label>
              <input 
                type="tel" name="phone" placeholder="+91 98765 43210" required
                value={formData.phone} onChange={handleInputChange}
                className="w-full bg-zinc-900/50 border border-zinc-800 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono text-sm placeholder:text-zinc-700" 
              />
            </div>
            
            <div className="space-y-1.5 group">
              <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider group-focus-within:text-indigo-400 transition-colors">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" name="name" placeholder="Client or Couple Name" required
                value={formData.name} onChange={handleInputChange}
                className="w-full bg-zinc-900/50 border border-zinc-800 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm placeholder:text-zinc-700" 
              />
            </div>
            
            <div className="space-y-1.5 group">
              <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider group-focus-within:text-indigo-400 transition-colors">
                Email Address
              </label>
              <input 
                type="email" name="email" placeholder="client@example.com"
                value={formData.email} onChange={handleInputChange}
                className="w-full bg-zinc-900/50 border border-zinc-800 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm placeholder:text-zinc-700" 
              />
            </div>
            
            <div className="space-y-1.5 group">
              <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider group-focus-within:text-indigo-400 transition-colors">
                Shoot Notes / Requirements
              </label>
              <textarea 
                name="notes" placeholder="E.g., Prefers golden hour outdoor shots..." rows="3"
                value={formData.notes} onChange={handleInputChange}
                className="w-full bg-zinc-900/50 border border-zinc-800 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm placeholder:text-zinc-700 resize-none" 
              ></textarea>
            </div>
            
            <button type="submit" className="w-full bg-indigo-600 text-white font-medium text-sm py-3 rounded-lg hover:bg-indigo-700 transition shadow-lg shadow-indigo-600/20 mt-2">
              Save to Database
            </button>
          </form>
        </div>

        {/* Client Database View */}
        <div className="lg:col-span-8 flex flex-col space-y-4">
          
          {/* Smart Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <input
              type="text"
              placeholder="Search clients by name, phone, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 text-white pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm placeholder:text-zinc-600 shadow-sm"
            />
          </div>

          {/* Responsive Card Grid (Replaces standard table for better mobile UX) */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl min-h-[400px]">
            {loading ? (
              <div className="p-10 text-center flex flex-col items-center justify-center h-full">
                <svg className="w-8 h-8 animate-spin text-indigo-600 mb-3" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                <p className="text-zinc-500 text-sm font-medium">Fetching Records...</p>
              </div>
            ) : filteredClients.length === 0 ? (
              <div className="p-10 text-center flex flex-col items-center">
                <svg className="w-12 h-12 text-zinc-700 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                <p className="text-zinc-500 text-sm">No clients found matching your search.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-zinc-800">
                {filteredClients.map((client) => (
                  <div key={client._id} className="bg-zinc-950 p-5 hover:bg-zinc-900/50 transition-colors group">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="text-base font-bold text-white leading-tight">{client.name}</h4>
                        <p className="text-[11px] text-zinc-500 font-mono mt-1">{client.email || 'No email provided'}</p>
                      </div>
                      
                      {/* Avatar initial */}
                      <div className="w-10 h-10 rounded-full bg-indigo-900/40 border border-indigo-700/50 flex items-center justify-center text-indigo-300 font-bold text-sm uppercase flex-shrink-0">
                        {client.name.charAt(0)}
                      </div>
                    </div>
                    
                    {/* Notes Area */}
                    <div className="mb-4 min-h-[2.5rem]">
                      <p className="text-xs text-zinc-400 line-clamp-2">
                        {client.notes ? client.notes : <span className="italic opacity-50">No shoot notes provided.</span>}
                      </p>
                    </div>
                    
                    {/* Communication Action Bar */}
                    <div className="flex items-center justify-between border-t border-zinc-800/80 pt-3 mt-auto">
                      <div className="font-mono text-sm font-medium text-zinc-300">
                        {client.phone}
                      </div>
                      
                      <div className="flex gap-2">
                        {/* WhatsApp Quick Action */}
                        <a 
                          href={getWhatsAppLink(client.phone)}
                          target="_blank" 
                          rel="noopener noreferrer"
                          title="Message on WhatsApp"
                          className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300 transition-colors border border-emerald-500/20"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                          </svg>
                        </a>
                        
                        {/* Email Quick Action */}
                        <a 
                          href={`mailto:${client.email}`}
                          title="Send Email"
                          className="p-1.5 rounded-md bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-300 transition-colors border border-indigo-500/20"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Clients;