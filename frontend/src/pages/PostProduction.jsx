import { useState, useEffect } from 'react';
import api from '../services/api';

const DEFAULT_STAGES = ['Selections Received', 'Culling & Prep', 'Color Grading', 'Retouching', 'Client Review', 'Delivered'];

const PostProduction = () => {
  const [events, setEvents] = useState([]);
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Custom Stage Input State
  const [isAddingStage, setIsAddingStage] = useState(false);
  const [newStageName, setNewStageName] = useState('');

  useEffect(() => {
    // Load custom workflow stages from local storage, or use defaults
    const savedStages = localStorage.getItem('studioOS_workflow_stages');
    if (savedStages) {
      setStages(JSON.parse(savedStages));
    } else {
      setStages(DEFAULT_STAGES);
      localStorage.setItem('studioOS_workflow_stages', JSON.stringify(DEFAULT_STAGES));
    }

    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await api.get('/events');
      // Filter out events that don't have any selections yet to keep the board clean
      const activeEvents = res.data.filter(ev => ev.clientSelections && ev.clientSelections.length > 0);
      setEvents(activeEvents);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch events for post-production");
      setLoading(false);
    }
  };

  // --- CRUD for Stages (Processes) ---
  const handleAddStage = (e) => {
    e.preventDefault();
    if (!newStageName.trim()) return;
    const updatedStages = [...stages, newStageName.trim()];
    setStages(updatedStages);
    localStorage.setItem('studioOS_workflow_stages', JSON.stringify(updatedStages));
    setNewStageName('');
    setIsAddingStage(false);
  };

  const handleRemoveStage = (stageToRemove) => {
    if (!window.confirm(`Delete the "${stageToRemove}" stage? Events in this stage will be moved to the first column.`)) return;
    
    const updatedStages = stages.filter(s => s !== stageToRemove);
    setStages(updatedStages);
    localStorage.setItem('studioOS_workflow_stages', JSON.stringify(updatedStages));

    // Reset events that were in the deleted stage
    events.forEach(ev => {
      if (ev.workflowStage === stageToRemove) {
        updateEventStage(ev._id, updatedStages[0]);
      }
    });
  };

  // --- Event Progression ---
  const updateEventStage = async (eventId, newStage) => {
    // Optimistic UI update for instant snappiness
    setEvents(events.map(ev => ev._id === eventId ? { ...ev, workflowStage: newStage } : ev));
    
    try {
      // Your existing PUT route can safely accept new arbitrary fields like workflowStage
      await api.put(`/events/${eventId}`, { workflowStage: newStage });
    } catch (err) {
      alert("Failed to move event. Syncing with server...");
      fetchEvents(); // Revert on failure
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-zinc-700 border-t-white rounded-full animate-spin"></div></div>;

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] animate-fade-in w-full max-w-[1600px] mx-auto pb-4">
      
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 shrink-0">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white font-serif">Post-Production Pipeline</h2>
          <p className="text-xs md:text-sm text-zinc-400 mt-1">Track editing progress, manage deliverables, and customize your studio's workflow.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsAddingStage(true)}
            className="px-4 py-2.5 text-xs font-mono uppercase tracking-widest font-semibold rounded-lg bg-zinc-900 border border-zinc-700 text-white hover:bg-zinc-800 transition-colors shadow-sm"
          >
            + Add Custom Process
          </button>
        </div>
      </header>

      {/* Add Stage Inline Form */}
      {isAddingStage && (
        <form onSubmit={handleAddStage} className="mb-6 flex gap-3 animate-fade-in shrink-0 bg-zinc-900/50 p-4 border border-zinc-800 rounded-lg">
          <input 
            type="text" 
            autoFocus
            value={newStageName}
            onChange={e => setNewStageName(e.target.value)}
            placeholder="e.g. Album Designing..." 
            className="bg-zinc-950 border border-zinc-700 text-white px-4 py-2 rounded text-sm font-mono w-64 focus:border-indigo-500 focus:outline-none"
          />
          <button type="submit" className="bg-white text-black font-mono text-xs uppercase font-bold px-4 py-2 rounded hover:bg-zinc-200">Save Stage</button>
          <button type="button" onClick={() => setIsAddingStage(false)} className="text-zinc-500 font-mono text-xs uppercase hover:text-white px-2">Cancel</button>
        </form>
      )}

      {/* Kanban Board Area */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden flex gap-6 pb-4 items-start snap-x">
        {stages.map((stage, index) => {
          // Find events currently in this stage (or unassigned events in the first stage)
          const stageEvents = events.filter(ev => 
            ev.workflowStage === stage || (!ev.workflowStage && index === 0)
          );

          return (
            <div key={stage} className="w-[320px] min-w-[320px] max-h-full flex flex-col bg-zinc-900/40 border border-zinc-800/60 rounded-xl snap-center shrink-0">
              
              {/* Column Header */}
              <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/80 rounded-t-xl">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                  <h3 className="font-mono text-xs uppercase tracking-widest font-bold text-white">{stage}</h3>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono text-zinc-500 bg-zinc-950 px-2 py-0.5 rounded">{stageEvents.length}</span>
                  {stages.length > 1 && (
                    <button onClick={() => handleRemoveStage(stage)} className="text-zinc-600 hover:text-red-400" title="Delete Process">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Column Cards */}
              <div className="p-3 flex-1 overflow-y-auto space-y-3 custom-scrollbar">
                {stageEvents.length === 0 ? (
                  <div className="h-24 border-2 border-dashed border-zinc-800/50 rounded-lg flex items-center justify-center">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-600">Empty Queue</span>
                  </div>
                ) : (
                  stageEvents.map(ev => (
                    <div key={ev._id} className="bg-zinc-950 border border-zinc-800 p-4 rounded-lg shadow-xl hover:border-zinc-600 transition-colors group relative">
                      
                      {/* Urgency Indicator (Simulated based on selection date) */}
                      <div className="absolute top-0 right-0 w-12 h-12 overflow-hidden rounded-tr-lg">
                        <div className="absolute top-1 -right-4 bg-zinc-800 text-zinc-400 text-[8px] font-mono uppercase font-bold w-16 text-center rotate-45 transform origin-top-left">
                          Active
                        </div>
                      </div>

                      <h4 className="font-bold text-white text-sm pr-8">{ev.title}</h4>
                      <p className="text-xs text-zinc-400 mt-0.5">{ev.client?.name || ev.customClientName}</p>
                      
                      <div className="flex justify-between items-end mt-4 pt-4 border-t border-zinc-800/60">
                        <div>
                          <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500 block mb-1">Target Yield</span>
                          <span className="font-mono text-xs font-bold text-emerald-400">{ev.clientSelections.length} Assets</span>
                        </div>
                        
                        {/* Stage Progression Dropdown */}
                        <select 
                          value={stage}
                          onChange={(e) => updateEventStage(ev._id, e.target.value)}
                          className="bg-zinc-900 border border-zinc-700 text-zinc-300 text-[10px] font-mono uppercase tracking-wider px-2 py-1.5 rounded cursor-pointer hover:bg-zinc-800 focus:outline-none transition-colors"
                        >
                          {stages.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
        
        {/* Empty space at the end of the scroll container to ensure the last column isn't cut off */}
        <div className="w-4 shrink-0"></div>
      </div>

    </div>
  );
};

export default PostProduction;