import { useState, useEffect } from 'react';
import api from '../services/api';

const Galleries = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Custom Premium Toast Notification System
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  
  // Dynamic Email State
  const [serviceEmail, setServiceEmail] = useState('Fetching config...');
  
  const [isLegacyFormOpen, setIsLegacyFormOpen] = useState(false);
  const [legacyForm, setLegacyForm] = useState({ 
    clientName: '', eventTitle: '', date: new Date().toISOString().split('T')[0] 
  });

  const [activeFolderEdits, setActiveFolderEdits] = useState({});

  // Sync Modal State
  const [syncModalOpen, setSyncModalOpen] = useState(false);
  const [selectedEventForSync, setSelectedEventForSync] = useState(null);
  const [destinationFolderInput, setDestinationFolderInput] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('Generating Pipeline...');
  const [syncSuccessData, setSyncSuccessData] = useState(null);
  const [syncPollInterval, setSyncPollInterval] = useState(null);

  useEffect(() => {
    fetchConfig();
    fetchGalleries();
    return () => {
      if (syncPollInterval) clearInterval(syncPollInterval);
    };
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  const fetchConfig = async () => {
    try {
      const res = await api.get('/galleries/config');
      setServiceEmail(res.data.serviceEmail);
    } catch (err) {
      setServiceEmail('Error fetching backend email. Ensure /config route is mapped.');
    }
  };

  const extractDriveId = (input) => {
    if (!input) return '';
    const trimmed = input.trim();
    const folderMatch = trimmed.match(/folders\/([a-zA-Z0-9_-]+)/);
    if (folderMatch && folderMatch[1]) return folderMatch[1];
    const idMatch = trimmed.match(/\?id=([a-zA-Z0-9_-]+)/);
    if (idMatch && idMatch[1]) return idMatch[1];
    const rawMatch = trimmed.match(/[-\w]{25,}/);
    return rawMatch ? rawMatch[0] : trimmed;
  };

  const fetchGalleries = async () => {
    try {
      const res = await api.get('/events');
      const sorted = res.data.sort((a, b) => new Date(b.date) - new Date(a.date));
      setEvents(sorted);
      
      const editState = {};
      sorted.forEach(ev => { editState[ev._id] = ev.folders || []; });
      setActiveFolderEdits(editState);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch gallery records.');
      setLoading(false);
    }
  };

  const handleAddFolderRow = (eventId) => {
    setActiveFolderEdits(prev => ({
      ...prev, [eventId]: [...(prev[eventId] || []), { name: '', driveFolderId: '' }]
    }));
  };

  const handleFolderChange = (eventId, index, field, value) => {
    const processedValue = field === 'driveFolderId' ? extractDriveId(value) : value;
    setActiveFolderEdits(prev => {
      const updated = [...(prev[eventId] || [])];
      updated[index] = { ...updated[index], [field]: processedValue };
      return { ...prev, [eventId]: updated };
    });
  };

  const handleRemoveFolderRow = async (eventId, index) => {
    if (!window.confirm("Remove this directory mapping permanently?")) return;
    const currentFolders = activeFolderEdits[eventId] || [];
    const updatedFolders = currentFolders.filter((_, i) => i !== index);
    
    setActiveFolderEdits(prev => ({ ...prev, [eventId]: updatedFolders }));
    
    try {
      await api.put(`/events/${eventId}`, { folders: updatedFolders });
      showToast("Directory node removed successfully.", "success");
    } catch (err) {
      showToast("Failed to remove mapping.", "error");
      fetchGalleries();
    }
  };

  const handleSaveFolders = async (eventId) => {
    try {
      const validFolders = (activeFolderEdits[eventId] || []).filter(
        f => f.name.trim() !== '' && f.driveFolderId.trim() !== ''
      );
      await api.put(`/events/${eventId}`, { folders: validFolders });
      showToast("Directory tree committed successfully.", "success");
      await fetchGalleries();
    } catch (err) {
      showToast("Error updating mapped folders.", "error");
    }
  };

  const handleCreateLegacyGallery = async (e) => {
    e.preventDefault();
    try {
      await api.post('/events', {
        title: legacyForm.eventTitle, customClientName: legacyForm.clientName, date: legacyForm.date,
        folders: [], eventType: 'Legacy Archive', venue: 'Archive Import', location: 'Studio Vault',
        status: 'Completed', financials: { totalAmount: 0, advancePaid: 0, paymentMode: 'N/A' }
      });
      showToast("Archive initialized successfully.");
      await fetchGalleries();
      setIsLegacyFormOpen(false);
      setLegacyForm({ clientName: '', eventTitle: '', date: new Date().toISOString().split('T')[0] });
    } catch (err) {
      showToast(err.response?.data?.message || 'Error generating legacy portal.', "error");
    }
  };

  const handleDeleteEvent = async (eventId, title) => {
    if (!window.confirm(`Purge "${title}" permanently?`)) return;
    try {
      await api.delete(`/events/${eventId}`);
      showToast("Archive purged completely.");
      await fetchGalleries();
    } catch (err) {
      showToast("Failed to delete the archive.", "error");
    }
  };

  const openSyncModal = (event) => {
    setSelectedEventForSync(event);
    setDestinationFolderInput('');
    setSyncSuccessData(null);
    setSyncMessage('Generating Pipeline...');
    setSyncModalOpen(true);
  };

  const closeSyncModal = () => {
    if (isSyncing) return;
    if (syncPollInterval) {
      clearInterval(syncPollInterval);
      setSyncPollInterval(null);
    }
    setSyncModalOpen(false);
    setSelectedEventForSync(null);
    setSyncSuccessData(null);
  };

  const checkSyncStatus = async (eventId) => {
    try {
      // RESTORED: Matches the original legacy working route[cite: 13]
      const res = await api.get(`/galleries/sync/status/${eventId}`);
      const data = res.data;

      if (data.status === 'PROCESSING') {
        setSyncMessage(data.message || 'Processing...');
      } else if (data.status === 'COMPLETED') {
        if (syncPollInterval) clearInterval(syncPollInterval);
        setIsSyncing(false);
        setSyncSuccessData({ link: data.link });
        fetchGalleries();
        showToast("Drive compilation complete!", "success");
      } else if (data.status === 'ERROR') {
        if (syncPollInterval) clearInterval(syncPollInterval);
        setIsSyncing(false);
        showToast(`Sync failed: ${data.message}`, "error");
      }
    } catch (err) {
      console.error("Polling error", err);
    }
  };

  const handleExecuteSync = async (e) => {
    e.preventDefault();
    const cleanFolderId = extractDriveId(destinationFolderInput);
    if (!cleanFolderId) {
      showToast('Valid Drive target required.', "error");
      return;
    }

    setIsSyncing(true);
    try {
      // RESTORED: Matches the original legacy working route[cite: 13]
      await api.post(`/galleries/sync/execute/${selectedEventForSync._id}`, {
        targetFolderId: cleanFolderId
      });
      
      const interval = setInterval(() => checkSyncStatus(selectedEventForSync._id), 2000);
      setSyncPollInterval(interval);
    } catch (err) {
      showToast('Failed to initialize synchronization.', "error");
      setIsSyncing(false);
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    showToast(`${label} copied to clipboard!`);
  };

  const getGalleryStatus = (event) => {
    if (!event.folders || event.folders.length === 0) return { label: 'Awaiting Directories', color: 'text-zinc-500 bg-zinc-800/80 border-zinc-700' };
    if (event.syncStatus === 'Synced' || event.syncStatus === 'COMPLETED') return { label: 'Selections Compiled', color: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30' };
    if (event.syncStatus === 'PROCESSING') return { label: 'Generating Nodes...', color: 'text-amber-400 bg-amber-950/40 border-amber-500/30 animate-pulse' };
    if (event.clientSelections?.length > 0) return { label: 'Selections Ready', color: 'text-indigo-400 bg-indigo-950/40 border-indigo-500/30' };
    return { label: 'Awaiting Client', color: 'text-zinc-400 bg-zinc-800/40 border-zinc-700' };
  };

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto pb-12 animate-fade-in relative">
      
      {/* Floating Toast Notification */}
      <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ${toast.show ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10 pointer-events-none'}`}>
        <div className={`px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 backdrop-blur-xl border ${toast.type === 'error' ? 'bg-red-950/80 border-red-500/50 text-red-200' : 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'}`}>
          {toast.type === 'success' ? (
            <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
          ) : (
            <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          )}
          <span className="text-[11px] font-mono uppercase tracking-widest font-bold">{toast.message}</span>
        </div>
      </div>

      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white font-serif">Client Galleries</h2>
          <p className="text-xs md:text-sm text-zinc-400 mt-1">Manage directory trees, monitor selection telemetry, and compile Drive assets.</p>
        </div>
        <button onClick={() => setIsLegacyFormOpen(!isLegacyFormOpen)} className="px-5 py-2.5 text-xs font-mono uppercase tracking-widest font-bold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition shadow-lg shadow-indigo-900/20">
          {isLegacyFormOpen ? 'Cancel' : '+ Quick-Add Archive'}
        </button>
      </header>

      {/* Permissions Callout */}
      <div className="bg-zinc-900/40 border border-zinc-800/80 p-5 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 backdrop-blur-sm">
        <div>
          <h3 className="text-xs font-mono uppercase tracking-widest text-white font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse"></span> Google Drive Pipeline Link
          </h3>
          <p className="text-xs text-zinc-400 mt-1.5 max-w-2xl leading-relaxed">
            Ensure every source folder and destination directory is shared with <strong className="text-white">Editor</strong> permissions to this service account:
          </p>
          <code className="inline-block bg-black/50 border border-zinc-800 text-zinc-300 font-mono text-[11px] px-4 py-2 rounded mt-2 select-all shadow-inner">
            {serviceEmail}
          </code>
        </div>
        <button onClick={() => copyToClipboard(serviceEmail, 'Delegation ID')} className="bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 px-5 py-2.5 rounded-lg text-[11px] font-mono uppercase tracking-widest font-bold transition whitespace-nowrap shadow-sm">
          Copy Delegation ID
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-950/20 border border-red-900/50 text-red-400 rounded-lg text-xs font-mono uppercase tracking-wide">
          {error}
        </div>
      )}

      {/* Galleries Registry Table */}
      <div className="bg-zinc-950 border border-zinc-800/80 rounded-2xl overflow-hidden shadow-2xl min-h-[400px]">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center space-y-4">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs font-mono uppercase tracking-widest text-zinc-500">Decrypting Vault...</span>
          </div>
        ) : events.length === 0 ? (
          <div className="p-20 text-center flex flex-col items-center justify-center border border-dashed border-zinc-800 m-8 rounded-xl bg-zinc-900/20">
            <span className="text-xs font-mono uppercase tracking-widest text-zinc-500">No archives available.</span>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/50">
            {events.map((ev) => {
              const status = getGalleryStatus(ev);
              const clientUrl = `${window.location.origin}/gallery/${ev._id}`;
              const currentFolders = activeFolderEdits[ev._id] || [];

              return (
                <div key={ev._id} className="p-6 md:p-8 flex flex-col lg:flex-row gap-8 hover:bg-zinc-900/20 transition-colors">
                  
                  {/* Column 1: Metadata */}
                  <div className="lg:w-1/4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="font-serif font-bold text-white text-xl tracking-tight leading-tight pr-2">{ev.title}</h3>
                        <button onClick={() => handleDeleteEvent(ev._id, ev.title)} className="text-zinc-600 hover:text-red-500 transition-colors p-1 bg-zinc-900 hover:bg-red-950/50 rounded-md">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                      <p className="text-[11px] font-mono text-zinc-400 mt-2 font-medium uppercase tracking-wider">{ev.client?.name || ev.customClientName} &bull; {new Date(ev.date).toLocaleDateString()}</p>
                      
                      <div className="mt-4">
                        <span className={`inline-block border px-3 py-1.5 rounded text-[10px] font-mono uppercase tracking-widest font-bold shadow-sm ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                    </div>

                    {currentFolders.length > 0 && (
                      <div className="mt-8 pt-5 border-t border-zinc-800/80">
                        <label className="block text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-2 font-bold">Client Portal Setup</label>
                        <div className="flex gap-2 items-center bg-black/50 border border-zinc-800 rounded-lg p-1.5 shadow-inner backdrop-blur-sm">
                          <input 
                            type="text" 
                            readOnly 
                            value={clientUrl} 
                            className="w-full bg-transparent text-zinc-400 text-[10px] font-mono outline-none px-2 truncate selection:bg-indigo-500/30" 
                          />
                          <a 
                            href={clientUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-zinc-400 hover:text-indigo-400 p-2 bg-zinc-900 rounded-md transition hover:bg-indigo-950/50"
                            title="Open Client Portal"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                          </a>
                          <button 
                            onClick={() => copyToClipboard(clientUrl, 'Portal Link')} 
                            className="text-zinc-400 hover:text-emerald-400 p-2 bg-zinc-900 rounded-md transition hover:bg-emerald-950/50"
                            title="Copy Link"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Column 2: Folder Tree Mapping Engine */}
                  <div className="lg:w-1/2 space-y-4 lg:border-l lg:border-zinc-800/80 lg:pl-8">
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 font-bold">Directory Hierarchy Tree</label>
                      <span className="text-[10px] font-mono text-zinc-400 font-bold bg-zinc-900/80 border border-zinc-800 px-2 py-0.5 rounded">{currentFolders.length} Active Nodes</span>
                    </div>

                    <div className="space-y-2">
                      {currentFolders.map((folder, index) => (
                        <div key={index} className="flex gap-2 items-center group">
                          <input 
                            type="text" 
                            placeholder="Name (e.g. Ceremony)" 
                            value={folder.name} 
                            onChange={e => handleFolderChange(ev._id, index, 'name', e.target.value)} 
                            className="w-2/5 bg-zinc-950 border border-zinc-800 text-white px-3 py-2.5 rounded-lg text-xs focus:border-indigo-500 focus:outline-none transition-colors shadow-inner" 
                          />
                          <input 
                            type="text" 
                            placeholder="Drive URI / Folder ID" 
                            value={folder.driveFolderId} 
                            onChange={e => handleFolderChange(ev._id, index, 'driveFolderId', e.target.value)} 
                            className="w-3/5 bg-zinc-950 border border-zinc-800 text-zinc-400 font-mono text-[11px] px-3 py-2.5 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors shadow-inner" 
                          />
                          <button 
                            onClick={() => handleRemoveFolderRow(ev._id, index)} 
                            className="text-zinc-600 hover:text-red-500 p-2.5 bg-zinc-900 hover:bg-red-950/50 rounded-lg transition-colors border border-transparent hover:border-red-900/50"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                          </button>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex justify-between items-center pt-3 border-t border-zinc-800/50">
                      <button onClick={() => handleAddFolderRow(ev._id)} className="text-[10px] font-mono uppercase tracking-widest font-bold text-zinc-400 hover:text-white transition flex items-center gap-1.5 bg-zinc-900 px-4 py-2 rounded-lg hover:bg-zinc-800 border border-zinc-800">
                        <span className="text-sm leading-none mt-[-1px]">+</span> Add Node
                      </button>
                      <button onClick={() => handleSaveFolders(ev._id)} className="bg-zinc-800 hover:bg-indigo-600 text-white border border-zinc-700 hover:border-indigo-500 px-5 py-2 rounded-lg text-[10px] font-mono uppercase tracking-widest font-bold transition shadow-sm">
                        Commit Tree
                      </button>
                    </div>
                  </div>

                  {/* Column 3: Telemetry & Drive Synchronization */}
                  <div className="lg:w-1/4 flex flex-col justify-between lg:border-l lg:border-zinc-800/80 lg:pl-8">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 font-bold block mb-2">Curation Yield</span>
                      <div className="flex items-baseline gap-3 bg-zinc-950 border border-zinc-800 rounded-xl p-5 shadow-inner">
                        <span className="text-4xl font-serif font-bold text-white tracking-tight leading-none">{ev.clientSelections?.length || 0}</span>
                        <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-bold">Assets</span>
                      </div>
                    </div>
                    <div className="mt-8">
                      <button 
                        onClick={() => openSyncModal(ev)} 
                        disabled={!ev.clientSelections?.length} 
                        className={`w-full py-3.5 px-4 rounded-xl text-[11px] font-mono uppercase tracking-widest font-bold transition-all flex items-center justify-center gap-2 ${ev.clientSelections?.length ? 'bg-white text-black hover:bg-zinc-200 shadow-[0_4px_20px_rgba(255,255,255,0.15)] hover:-translate-y-0.5' : 'bg-zinc-900 text-zinc-600 border border-zinc-800 cursor-not-allowed'}`}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                        Export to Drive
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Destination Sync Modal */}
      {syncModalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl max-w-lg w-full p-8 shadow-2xl relative shadow-indigo-900/20">
            <button onClick={closeSyncModal} disabled={isSyncing} className="absolute top-6 right-6 text-zinc-500 hover:text-white transition disabled:opacity-40 bg-zinc-900 p-2.5 rounded-full hover:bg-zinc-800">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
            <h3 className="text-2xl font-serif font-bold text-white mb-2 flex items-center gap-3">
              <svg className="w-6 h-6 text-indigo-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM17 13l-5 5-1.41-1.41L14.17 13H6v-2h8.17l-3.58-3.59L12 6l5 7z"/>
              </svg>
              Drive Sync Compiler
            </h3>
            
            <div className="inline-flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-md mb-8">
              <span className="text-[10px] text-zinc-400 font-mono uppercase tracking-widest">Target:</span>
              <span className="text-[11px] text-white font-bold font-mono tracking-wider">{selectedEventForSync?.title}</span>
              <span className="text-[10px] text-zinc-500">&bull;</span>
              <span className="text-[10px] text-indigo-400 font-mono font-bold">{selectedEventForSync?.clientSelections?.length} Assets</span>
            </div>

            {syncSuccessData ? (
              <div className="space-y-6">
                <div className="p-5 bg-emerald-950/30 border border-emerald-500/40 rounded-xl flex items-start gap-4">
                  <div className="bg-emerald-500/20 p-2.5 rounded-full shrink-0">
                    <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <div>
                    <p className="text-emerald-400 font-bold tracking-widest uppercase text-xs font-mono mb-1">Compilation Successful</p>
                    <p className="text-[11px] text-emerald-500/80 leading-relaxed">
                      A parent folder and structured sub-directories have been successfully mapped in Google Drive.
                    </p>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-6 border-t border-zinc-800">
                  <button onClick={closeSyncModal} className="px-6 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-[10px] font-mono uppercase tracking-widest font-bold transition">Dismiss</button>
                  {syncSuccessData.link && (
                    <a href={syncSuccessData.link} target="_blank" rel="noopener noreferrer" className="px-8 py-2.5 bg-white text-black font-mono text-[10px] uppercase tracking-widest font-bold rounded-lg hover:bg-zinc-200 transition shadow-[0_0_15px_rgba(255,255,255,0.2)]">Open in Drive &rarr;</a>
                  )}
                </div>
              </div>
            ) : (
              <form onSubmit={handleExecuteSync} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-zinc-400 mb-2 font-bold">
                    Destination Drive URL / ID <span className="text-red-500">*</span>
                  </label>
                  <input type="text" required placeholder="https://drive.google.com/drive/folders/..." value={destinationFolderInput} onChange={e => setDestinationFolderInput(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 text-white font-mono text-xs px-4 py-3.5 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors shadow-inner" />
                  <div className="mt-4 bg-indigo-950/20 border border-indigo-900/30 p-4 rounded-xl text-[10px] text-indigo-300 font-mono leading-relaxed flex items-start gap-3">
                    <svg className="w-4 h-4 shrink-0 mt-0.5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span>A master directory named <code className="text-white bg-black/50 px-1.5 py-0.5 rounded ml-1 mr-1">[Client Name] - Final Selections</code> will be dynamically generated here, alongside categorized sub-nodes.</span>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-zinc-800">
                  <button type="button" onClick={closeSyncModal} disabled={isSyncing} className="px-6 py-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-[10px] font-mono uppercase tracking-widest font-bold transition">Abort</button>
                  <button type="submit" disabled={isSyncing} className="px-8 py-3 bg-white text-black font-mono text-[10px] uppercase tracking-widest font-bold rounded-lg hover:bg-zinc-200 transition disabled:bg-zinc-800 disabled:text-zinc-600 flex items-center gap-2 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                    {isSyncing ? <><div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin"></div> Generating Pipeline...</> : 'Execute Compilation'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default Galleries;