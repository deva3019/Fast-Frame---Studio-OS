import { useState, useEffect, useMemo } from 'react';
import api from '../services/api';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [clients, setClients] = useState([]);
  const [crewMembers, setCrewMembers] = useState([]); // Mocked crew data; replace with API fetch when Crew backend is ready
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // UI States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [viewingEvent, setViewingEvent] = useState(null); // Controls the View Modal
  const [filters, setFilters] = useState({ search: '', status: 'all', type: '', from: '', to: '' });

  // Form State
  const initialFormState = {
    _id: null,
    title: '', eventType: '', date: '', endDate: '', startTime: '', endTime: '', venue: '', location: 'Coimbatore',
    client: '', customClientName: '', customClientPhone: '', customClientEmail: '',
    packageDetails: { name: '' }, status: 'Confirmed',
    services: [], extraServices: '',
    assignedCrew: [],
    financials: { totalAmount: 0, advancePaid: 0, paymentMode: 'Cash' },
    timeline: '', notes: ''
  };
  const [formData, setFormData] = useState(initialFormState);

  const serviceOptions = ['Traditional Photo', 'Traditional Video', 'Candid Photo', 'Cinematic Video', 'Drone / Helicam', 'Live Streaming', 'Premium Album', 'Outdoor Shoot'];
  const pipelineStatuses = ['Enquiry', 'Tentative', 'Confirmed', 'Completed', 'Post-Production', 'Cancelled'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
  try {
    const [eventsRes, clientsRes, crewRes] = await Promise.all([
      api.get('/events'),
      api.get('/clients'),
      api.get('/crew') // Fetch real crew data
    ]);
    
    setEvents(eventsRes.data.sort((a, b) => new Date(b.date) - new Date(a.date)));
    setClients(clientsRes.data);
    
    // Only load active crew members for assignment
    setCrewMembers(crewRes.data.filter(c => c.isActive));
    
    setLoading(false);
  } catch (err) {
    setError('Failed to fetch data from Atlas.');
    setLoading(false);
  }
};

  const filteredEvents = useMemo(() => {
    return events.filter(ev => {
      // 1. Status Filter
      if (filters.status !== 'all' && ev.status !== filters.status) return false;
      
      // 2. Date Range Filters (Added)
      if (filters.from && new Date(ev.date) < new Date(filters.from)) return false;
      if (filters.to && new Date(ev.date) > new Date(filters.to)) return false;
      
      // 3. Text Search Filter
      if (filters.search) {
        const query = filters.search.toLowerCase();
        // Fallback to empty string to prevent crashes if customClientName is used instead of a linked client
        const clientName = ev.client?.name || ev.customClientName || ''; 
        const haystack = `${ev.title} ${clientName} ${ev.venue}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      
      return true;
    });
  }, [events, filters]);

  // Form Handlers
  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleNestedChange = (category, field, value) => setFormData({ ...formData, [category]: { ...formData[category], [field]: value } });
  
  const handleServiceToggle = (service) => {
    setFormData(prev => ({
      ...prev, 
      services: prev.services.includes(service) ? prev.services.filter(s => s !== service) : [...prev.services, service]
    }));
  };

  const handleCrewToggle = (crewName) => {
    setFormData(prev => ({
      ...prev,
      assignedCrew: prev.assignedCrew.includes(crewName) ? prev.assignedCrew.filter(c => c !== crewName) : [...prev.assignedCrew, crewName]
    }));
  };

  const openEditForm = (event) => {
    setFormData({
      _id: event._id,
      title: event.title || '',
      eventType: event.eventType || '',
      date: event.date ? new Date(event.date).toISOString().split('T')[0] : '',
      endDate: event.endDate ? new Date(event.endDate).toISOString().split('T')[0] : '',
      startTime: event.startTime || '',
      endTime: event.endTime || '',
      venue: event.venue || '',
      location: event.location || 'Coimbatore',
      client: event.client?._id || '',
      status: event.status || 'Confirmed',
      packageDetails: { name: event.packageDetails?.name || '' },
      services: event.packageDetails?.services || [],
      extraServices: event.extraServices || '',
      assignedCrew: event.assignedCrew || [],
      financials: {
        totalAmount: event.financials?.totalAmount || 0,
        advancePaid: event.financials?.advancePaid || 0,
        paymentMode: event.financials?.paymentMode || 'Cash'
      },
      timeline: event.timeline || '',
      notes: event.notes || ''
    });
    setViewingEvent(null);
    setIsFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: formData.title, eventType: formData.eventType, date: formData.date, endDate: formData.endDate,
        startTime: formData.startTime, endTime: formData.endTime, venue: formData.venue, location: formData.location,
        client: formData.client, status: formData.status,
        packageDetails: { name: formData.packageDetails.name, services: formData.services },
        extraServices: formData.extraServices,
        assignedCrew: formData.assignedCrew,
        financials: formData.financials,
        timeline: formData.timeline, notes: formData.notes
      };

      if (formData._id) {
        await api.put(`/events/${formData._id}`, payload);
      } else {
        await api.post('/events', payload);
      }
      
      await fetchData();
      setIsFormOpen(false);
      setFormData(initialFormState);
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving event.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event? This action cannot be undone.")) return;
    try {
      await api.delete(`/events/${id}`);
      setViewingEvent(null);
      await fetchData();
    } catch (err) {
      setError('Error deleting event.');
    }
  };

  const updatePipelineStatus = async (id, newStatus) => {
    try {
      await api.put(`/events/${id}`, { status: newStatus });
      setViewingEvent(prev => ({ ...prev, status: newStatus }));
      await fetchData();
    } catch (err) {
      setError('Error updating status.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmed': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Tentative': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Completed': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Post-Production': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'Cancelled': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in w-full max-w-7xl mx-auto">
      
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Event Management</h2>
          <p className="text-xs md:text-sm text-zinc-400 mt-1">Manage photoshoots, weddings, bookings & schedules</p>
        </div>
        <button 
          onClick={() => { setIsFormOpen(!isFormOpen); setFormData(initialFormState); }}
          className={`inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium rounded-lg transition-all shadow-lg ${
            isFormOpen ? 'bg-zinc-800 text-white hover:bg-zinc-700' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-500/20'
          }`}
        >
          {isFormOpen ? 'Cancel & Close Form' : '+ Add New Event'}
        </button>
      </header>

      {error && <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">{error}</div>}

      {/* Slide-Down Creation Form */}
      {isFormOpen && (
        <div className="bg-zinc-950 border border-indigo-500/30 shadow-xl shadow-indigo-900/10 rounded-2xl p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* 1. EVENT DETAILS */}
            <div>
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-4 border-b border-zinc-800 pb-2">1. Event Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="lg:col-span-2">
                  <label className="block text-[11px] font-semibold text-zinc-400 uppercase mb-1">Event Title *</label>
                  <input type="text" name="title" required value={formData.title} onChange={handleInputChange} className="w-full bg-zinc-900 border border-zinc-700 text-white px-3 py-2.5 rounded-lg text-sm" placeholder="e.g. Arun & Divya Wedding" />
                </div>
                <div className="lg:col-span-2">
                  <label className="block text-[11px] font-semibold text-zinc-400 uppercase mb-1">Event Type *</label>
                  <input type="text" name="eventType" required value={formData.eventType} onChange={handleInputChange} className="w-full bg-zinc-900 border border-zinc-700 text-white px-3 py-2.5 rounded-lg text-sm" placeholder="Select or type..." list="eventTypes" />
                  <datalist id="eventTypes"><option value="Wedding"/><option value="Engagement"/><option value="Reception"/></datalist>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 uppercase mb-1">From Date *</label>
                  <input type="date" name="date" required value={formData.date} onChange={handleInputChange} className="w-full bg-zinc-900 border border-zinc-700 text-white px-3 py-2.5 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 uppercase mb-1">To Date (Optional)</label>
                  <input type="date" name="endDate" value={formData.endDate} onChange={handleInputChange} className="w-full bg-zinc-900 border border-zinc-700 text-white px-3 py-2.5 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 uppercase mb-1">Start Time</label>
                  <input type="time" name="startTime" value={formData.startTime} onChange={handleInputChange} className="w-full bg-zinc-900 border border-zinc-700 text-white px-3 py-2.5 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 uppercase mb-1">End Time</label>
                  <input type="time" name="endTime" value={formData.endTime} onChange={handleInputChange} className="w-full bg-zinc-900 border border-zinc-700 text-white px-3 py-2.5 rounded-lg text-sm" />
                </div>
                <div className="lg:col-span-2">
                  <label className="block text-[11px] font-semibold text-zinc-400 uppercase mb-1">Venue *</label>
                  <input type="text" name="venue" required value={formData.venue} onChange={handleInputChange} className="w-full bg-zinc-900 border border-zinc-700 text-white px-3 py-2.5 rounded-lg text-sm" placeholder="e.g. Green Meadows Hall" />
                </div>
                <div className="lg:col-span-2">
                  <label className="block text-[11px] font-semibold text-zinc-400 uppercase mb-1">Location / City *</label>
                  <input type="text" name="location" required value={formData.location} onChange={handleInputChange} className="w-full bg-zinc-900 border border-zinc-700 text-white px-3 py-2.5 rounded-lg text-sm" />
                </div>
              </div>
            </div>

            {/* 2. CLIENT & CONTACT */}
            <div>
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-4 border-b border-zinc-800 pb-2">2. Client & Contact</h3>
              <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-7 gap-4 items-center">
                  <div className="md:col-span-3">
                    <label className="block text-[11px] font-semibold text-zinc-400 uppercase mb-1">Select Existing Client</label>
                    <select name="client" value={formData.client} onChange={handleInputChange} className="w-full bg-zinc-900 border border-zinc-700 text-white px-3 py-2.5 rounded-lg text-sm">
                      <option value="">-- Choose Client from Database --</option>
                      {clients.map(c => <option key={c._id} value={c._id}>{c.name} ({c.phone})</option>)}
                    </select>
                  </div>
                  <div className="text-center text-zinc-600 font-bold text-xs">- OR -</div>
                  <div className="md:col-span-3">
                    <label className="block text-[11px] font-semibold text-zinc-400 uppercase mb-1">Custom Client Name *</label>
                    <input type="text" name="customClientName" value={formData.customClientName} onChange={handleInputChange} className="w-full bg-zinc-900 border border-zinc-700 text-white px-3 py-2.5 rounded-lg text-sm" placeholder="Enter name manually" />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 uppercase mb-1">Phone Number *</label>
                  <input type="tel" name="customClientPhone" value={formData.customClientPhone} onChange={handleInputChange} className="w-full bg-zinc-900 border border-zinc-700 text-white px-3 py-2.5 rounded-lg text-sm" placeholder="+91 98765 43210" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 uppercase mb-1">Email Address</label>
                  <input type="email" name="customClientEmail" value={formData.customClientEmail} onChange={handleInputChange} className="w-full bg-zinc-900 border border-zinc-700 text-white px-3 py-2.5 rounded-lg text-sm" placeholder="client@example.com" />
                </div>
              </div>
            </div>

            {/* 3. PACKAGE & SERVICES */}
            <div>
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-4 border-b border-zinc-800 pb-2">3. Package & Services</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 uppercase mb-1">Package Name</label>
                  <input type="text" value={formData.packageDetails.name} onChange={e => handleNestedChange('packageDetails', 'name', e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 text-white px-3 py-2.5 rounded-lg text-sm" placeholder="e.g. Platinum Wedding Package" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 uppercase mb-1">Status *</label>
                  <select name="status" required value={formData.status} onChange={handleInputChange} className="w-full bg-zinc-900 border border-indigo-500/50 text-white px-3 py-2.5 rounded-lg text-sm font-semibold">
                    {pipelineStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <label className="block text-[11px] font-semibold text-zinc-400 uppercase mb-2">Included Services</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                {serviceOptions.map(svc => (
                  <label key={svc} className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer p-2 rounded hover:bg-zinc-900 border border-zinc-800 transition">
                    <input type="checkbox" checked={formData.services.includes(svc)} onChange={() => handleServiceToggle(svc)} className="rounded border-zinc-700 text-indigo-600 bg-zinc-950" />
                    <span className="truncate">{svc}</span>
                  </label>
                ))}
              </div>
              <label className="block text-[11px] font-semibold text-zinc-400 uppercase mb-1">Extra / Custom Services</label>
              <input type="text" name="extraServices" value={formData.extraServices} onChange={handleInputChange} className="w-full bg-zinc-900 border border-zinc-700 text-white px-3 py-2.5 rounded-lg text-sm" placeholder="e.g. LED Wall, Instant Prints, 360 Photobooth..." />
            </div>

            {/* 4. CREW & FINANCIALS */}
            <div>
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-4 border-b border-zinc-800 pb-2">4. Crew & Financials</h3>
              <div className="mb-4">
                <label className="block text-[11px] font-semibold text-zinc-400 uppercase mb-2">Assign Crew Members (Database)</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-zinc-900/50 p-3 rounded-lg border border-zinc-800 max-h-[120px] overflow-y-auto">
  {crewMembers.map(crew => {
    const crewLabel = `${crew.name} (${crew.role})`;
    return (
      <label key={crew._id} className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
        <input 
          type="checkbox" 
          checked={formData.assignedCrew.includes(crewLabel)} 
          onChange={() => handleCrewToggle(crewLabel)} 
          className="rounded border-zinc-700 text-indigo-600 bg-zinc-950" 
        />
        <span className="truncate">{crewLabel}</span>
      </label>
    );
  })}
</div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 uppercase mb-1">Total Amount (₹) *</label>
                  <input type="number" required min="0" value={formData.financials.totalAmount} onChange={e => handleNestedChange('financials', 'totalAmount', Number(e.target.value))} className="w-full bg-zinc-900 border border-zinc-700 text-white px-3 py-2.5 rounded-lg text-base font-bold font-mono" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 uppercase mb-1">Advance Paid (₹)</label>
                  <input type="number" min="0" value={formData.financials.advancePaid} onChange={e => handleNestedChange('financials', 'advancePaid', Number(e.target.value))} className="w-full bg-zinc-900 border border-zinc-700 text-emerald-400 px-3 py-2.5 rounded-lg text-base font-bold font-mono" />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-[11px] font-semibold text-zinc-400 uppercase mb-1">Payment Mode</label>
                    <select value={formData.financials.paymentMode} onChange={e => handleNestedChange('financials', 'paymentMode', e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 text-white px-3 py-2.5 rounded-lg text-sm">
                      <option value="Cash">Cash</option>
                      <option value="UPI">UPI</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                    </select>
                  </div>
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-[11px] font-semibold text-zinc-400 uppercase mb-1">Balance Due (₹)</label>
                  <div className="w-full bg-zinc-950 border border-zinc-800 text-amber-400 px-3 py-2.5 rounded-lg text-base font-bold font-mono">
                    ₹ {(formData.financials.totalAmount - formData.financials.advancePaid).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* 5. SCHEDULING & NOTES */}
            <div>
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-4 border-b border-zinc-800 pb-2">5. Scheduling & Notes</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 uppercase mb-1">Event Timeline</label>
                  <textarea name="timeline" value={formData.timeline} onChange={handleInputChange} rows="3" className="w-full bg-zinc-900 border border-zinc-700 text-white px-3 py-2 rounded-lg text-sm placeholder:text-zinc-600" placeholder="e.g. 06:00 AM - Bride Prep"></textarea>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 uppercase mb-1">Internal Notes</label>
                  <textarea name="notes" value={formData.notes} onChange={handleInputChange} rows="3" className="w-full bg-zinc-900 border border-zinc-700 text-white px-3 py-2 rounded-lg text-sm placeholder:text-zinc-600" placeholder="Lighting setup notes..."></textarea>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
              <button type="button" onClick={() => setIsFormOpen(false)} className="px-6 py-2.5 rounded-lg text-sm font-medium bg-zinc-800 text-white hover:bg-zinc-700">Cancel</button>
              <button type="submit" className="bg-white text-black font-bold py-2.5 px-8 rounded-lg transition hover:bg-zinc-200">
                {formData._id ? 'Save Changes' : 'Create Event'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Events Table / Grid */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl min-h-[400px]">
        {loading ? (
          <div className="p-10 text-center flex flex-col items-center justify-center h-full">
             <svg className="w-8 h-8 animate-spin text-indigo-600 mb-3" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="p-10 text-center text-zinc-500 text-sm">No events found matching your criteria.</div>
        ) : (
          <div className="divide-y divide-zinc-800/60">
            <div className="hidden md:grid grid-cols-7 gap-4 p-4 bg-zinc-900/50 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
              <div className="col-span-2">Event & Client</div>
              <div>Type</div>
              <div>Date & Time</div>
              <div>Location</div>
              <div>Status</div>
              <div className="text-right">Action</div>
            </div>
            
            {filteredEvents.map((ev) => (
              <div key={ev._id} onClick={() => setViewingEvent(ev)} className="grid grid-cols-1 md:grid-cols-7 gap-4 p-4 hover:bg-zinc-900/40 transition items-center cursor-pointer group">
                <div className="col-span-1 md:col-span-2 flex flex-col">
                  <span className="font-bold text-white text-sm md:text-base group-hover:text-indigo-400 transition-colors">{ev.title}</span>
                  <span className="text-xs text-zinc-400 mt-0.5">{ev.client?.name || ev.customClientName}</span>
                </div>
                <div className="hidden md:block text-xs font-bold text-zinc-300">{ev.eventType}</div>
                <div className="hidden md:block">
                  <p className="text-sm font-bold text-white">{new Date(ev.date).toLocaleDateString()}</p>
                  <p className="text-xs text-zinc-500">{ev.startTime || 'TBD'}</p>
                </div>
                <div className="hidden md:block"><p className="text-xs font-medium text-white truncate pr-4">{ev.venue}</p></div>
                <div className="flex items-center justify-between md:block">
                  <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(ev.status)}`}>{ev.status}</span>
                </div>
                <div className="text-right hidden md:block">
                  <button className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-white text-xs rounded border border-zinc-700">View</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ================= MODAL: EVENT DETAILS VIEW ================= */}
      {viewingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setViewingEvent(null)}></div>
          
          <div className="relative bg-zinc-950 border border-zinc-800 w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden z-10 animate-fade-in">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-zinc-800 bg-zinc-900/50 flex flex-col sm:flex-row justify-between gap-4 shrink-0">
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-xl font-bold text-white">{viewingEvent.title}</h3>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getStatusColor(viewingEvent.status)}`}>{viewingEvent.status}</span>
                </div>
                <p className="text-xs text-zinc-500 font-mono mt-1">ID: {viewingEvent._id}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => window.open('/dashboard/invoices', '_blank')} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded-lg text-sm font-semibold transition">
                  Invoice
                </button>
                <button onClick={() => setViewingEvent(null)} className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
              
              {/* Pipeline Status Quick Update */}
              <div className="p-3 bg-zinc-900 rounded-xl flex items-center justify-between border border-zinc-800">
                <span className="text-zinc-400 font-semibold uppercase text-[10px] tracking-widest">Pipeline Status:</span>
                <select 
                  value={viewingEvent.status} 
                  onChange={(e) => updatePipelineStatus(viewingEvent._id, e.target.value)}
                  className="bg-zinc-950 border border-zinc-700 text-white text-sm font-bold px-3 py-1.5 rounded-lg focus:outline-none focus:border-indigo-500"
                >
                  {pipelineStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Client Card */}
                <div className="p-4 bg-zinc-900/30 border border-zinc-800 rounded-xl">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-2">Client Details</p>
                  <p className="font-bold text-base text-white">{viewingEvent.client?.name || viewingEvent.customClientName}</p>
                  <p className="text-zinc-400 font-mono text-sm mt-1">{viewingEvent.client?.phone || viewingEvent.customClientPhone || 'No Phone'}</p>
                  <p className="text-zinc-500 text-sm">{viewingEvent.client?.email || viewingEvent.customClientEmail}</p>
                </div>
                {/* Schedule Card */}
                <div className="p-4 bg-zinc-900/30 border border-zinc-800 rounded-xl">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-2">Schedule & Venue</p>
                  <p className="font-bold text-base text-white">
                    {new Date(viewingEvent.date).toLocaleDateString()} {viewingEvent.endDate ? ` - ${new Date(viewingEvent.endDate).toLocaleDateString()}` : ''}
                  </p>
                  <p className="text-indigo-400 font-medium text-sm mt-0.5">{viewingEvent.startTime || 'TBD'} {viewingEvent.endTime ? `- ${viewingEvent.endTime}` : ''}</p>
                  <p className="text-zinc-400 mt-1">{viewingEvent.venue}</p>
                  <p className="text-zinc-500 text-sm">{viewingEvent.location}</p>
                </div>
              </div>

              {/* Package Card */}
              <div className="p-4 bg-zinc-900/30 border border-zinc-800 rounded-xl">
                <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-2">Package & Services</p>
                <div className="border border-zinc-800 bg-zinc-950 p-4 rounded-lg">
                  <p className="font-bold text-white mb-3">{viewingEvent.packageDetails?.name || 'Custom Package'}</p>
                  <div className="flex flex-wrap gap-2">
                    {viewingEvent.packageDetails?.services?.length > 0 ? viewingEvent.packageDetails.services.map(s => (
                      <span key={s} className="px-2.5 py-1 bg-zinc-800 text-zinc-300 rounded text-[11px] font-medium border border-zinc-700">{s}</span>
                    )) : <span className="text-zinc-600 text-xs italic">No specific services tagged.</span>}
                  </div>
                  {viewingEvent.extraServices && (
                    <p className="mt-3 text-zinc-400 text-xs border-l-2 border-indigo-500 pl-2 italic">Extras: {viewingEvent.extraServices}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Crew Card */}
                <div className="p-4 bg-zinc-900/30 border border-zinc-800 rounded-xl">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-2">Assigned Crew</p>
                  <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-lg min-h-[70px]">
                    {viewingEvent.assignedCrew?.length > 0 ? (
                      <ul className="list-disc pl-4 text-zinc-300 text-sm space-y-1">
                        {viewingEvent.assignedCrew.map(c => <li key={c}>{c}</li>)}
                      </ul>
                    ) : <p className="text-zinc-600 text-sm">No crew assigned.</p>}
                  </div>
                </div>
                {/* Finance Card */}
                <div className="p-4 bg-zinc-900/30 border border-zinc-800 rounded-xl">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-2">Financial Summary</p>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-zinc-950 border border-zinc-800 p-2 rounded-lg text-center">
                      <span className="text-zinc-500 text-[9px] uppercase font-bold block">Total</span>
                      <span className="text-white text-sm font-bold mt-1 block">₹{viewingEvent.financials?.totalAmount?.toLocaleString() || 0}</span>
                    </div>
                    <div className="bg-zinc-950 border border-zinc-800 p-2 rounded-lg text-center">
                      <span className="text-zinc-500 text-[9px] uppercase font-bold block">Adv <span className="text-emerald-500">({viewingEvent.financials?.paymentMode})</span></span>
                      <span className="text-emerald-400 text-sm font-bold mt-1 block">₹{viewingEvent.financials?.advancePaid?.toLocaleString() || 0}</span>
                    </div>
                    <div className="bg-amber-500/10 border border-amber-500/20 p-2 rounded-lg text-center">
                      <span className="text-amber-500/70 text-[9px] uppercase font-bold block">Balance</span>
                      <span className="text-amber-400 text-sm font-bold mt-1 block">₹{((viewingEvent.financials?.totalAmount || 0) - (viewingEvent.financials?.advancePaid || 0)).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-zinc-900/30 border border-zinc-800 rounded-xl">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-2">Timeline Schedule</p>
                  <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-lg text-zinc-300 text-sm min-h-[80px] whitespace-pre-wrap">
                    {viewingEvent.timeline || <span className="text-zinc-600 italic">No timeline recorded.</span>}
                  </div>
                </div>
                <div className="p-4 bg-zinc-900/30 border border-zinc-800 rounded-xl">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-2">Internal Notes</p>
                  <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-lg text-zinc-300 text-sm min-h-[80px] whitespace-pre-wrap">
                    {viewingEvent.notes || <span className="text-zinc-600 italic">No notes recorded.</span>}
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-zinc-800 bg-zinc-900/50 flex justify-between shrink-0">
              <button onClick={() => handleDelete(viewingEvent._id)} className="flex items-center gap-1.5 px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg text-sm font-semibold transition">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                Delete
              </button>
              <button onClick={() => openEditForm(viewingEvent)} className="px-6 py-2 bg-white text-black hover:bg-zinc-200 rounded-lg text-sm font-bold transition">
                Edit Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;