import { useState, useEffect } from 'react';
import api from '../services/api';

const Crew = () => {
  const [crew, setCrew] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '', role: '', phone: '', email: '', isActive: true
  });

  const roles = ['Photographer', 'Videographer', 'Cinematographer', 'Drone Operator', 'Editor', 'Assistant', 'Manager'];

  useEffect(() => {
    fetchCrew();
  }, []);

  const fetchCrew = async () => {
    try {
      const response = await api.get('/crew');
      setCrew(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch crew data.');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const openForm = (crewMember = null) => {
    if (crewMember) {
      setFormData({
        name: crewMember.name, role: crewMember.role, phone: crewMember.phone || '', 
        email: crewMember.email || '', isActive: crewMember.isActive
      });
      setEditingId(crewMember._id);
    } else {
      setFormData({ name: '', role: '', phone: '', email: '', isActive: true });
      setEditingId(null);
    }
    setIsFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/crew/${editingId}`, formData);
      } else {
        await api.post('/crew', formData);
      }
      await fetchCrew();
      setIsFormOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving crew member.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this crew member?')) return;
    try {
      await api.delete(`/crew/${id}`);
      await fetchCrew();
    } catch (err) {
      setError('Error deleting crew member.');
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in w-full max-w-7xl mx-auto">
      
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Crew & Roster</h2>
          <p className="text-xs md:text-sm text-zinc-400 mt-1">Manage studio personnel and field operatives.</p>
        </div>
        <button 
          onClick={() => { setIsFormOpen(!isFormOpen); setEditingId(null); setFormData({ name: '', role: '', phone: '', email: '', isActive: true }); }}
          className={`inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium rounded-lg transition-all shadow-lg ${
            isFormOpen ? 'bg-zinc-800 text-white hover:bg-zinc-700' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-500/20'
          }`}
        >
          {isFormOpen ? 'Close Form' : '+ Add Crew Member'}
        </button>
      </header>

      {error && <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">{error}</div>}

      {isFormOpen && (
        <div className="bg-zinc-950 border border-indigo-500/30 shadow-xl shadow-indigo-900/10 rounded-2xl p-6 md:p-8 animate-fade-in">
          <div className="mb-6 border-b border-zinc-800 pb-4 flex justify-between items-center">
            <h3 className="text-base font-bold text-white">{editingId ? 'Edit Crew Member' : 'Register New Crew'}</h3>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 uppercase mb-1">Full Name *</label>
                <input type="text" name="name" required value={formData.name} onChange={handleInputChange} className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-2.5 rounded-lg text-sm" placeholder="e.g. Nandesh" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 uppercase mb-1">Primary Role *</label>
                <input type="text" name="role" required value={formData.role} onChange={handleInputChange} list="roleList" className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-2.5 rounded-lg text-sm" placeholder="Select or type..." />
                <datalist id="roleList">{roles.map(r => <option key={r} value={r} />)}</datalist>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 uppercase mb-1">Phone Number</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-2.5 rounded-lg text-sm font-mono" placeholder="+91 98765 43210" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 uppercase mb-1">Email Address</label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-2.5 rounded-lg text-sm" placeholder="crew@studio.com" />
              </div>
              <div className="md:col-span-2 flex items-center gap-3 bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
                <input type="checkbox" name="isActive" id="isActive" checked={formData.isActive} onChange={handleInputChange} className="w-4 h-4 rounded border-zinc-700 text-indigo-600 bg-zinc-900 focus:ring-indigo-600 focus:ring-offset-zinc-900" />
                <label htmlFor="isActive" className="text-sm text-zinc-300 font-medium cursor-pointer">Active Team Member (Available for assignment)</label>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button type="submit" className="bg-white text-black font-bold py-2.5 px-8 rounded-lg transition hover:bg-zinc-200">
                {editingId ? 'Save Changes' : 'Add to Roster'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Crew Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {loading ? (
          <div className="col-span-full p-10 text-center flex flex-col items-center">
            <svg className="w-8 h-8 animate-spin text-indigo-600 mb-3" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          </div>
        ) : crew.length === 0 ? (
          <div className="col-span-full p-10 text-center border border-zinc-800 rounded-2xl bg-zinc-950">
            <p className="text-zinc-500 text-sm">No crew members found. Add your first team member above.</p>
          </div>
        ) : (
          crew.map(member => (
            <div key={member._id} className="bg-zinc-950 border border-zinc-800 p-5 rounded-2xl hover:border-zinc-700 transition flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm uppercase flex-shrink-0 ${member.isActive ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-zinc-800 text-zinc-500'}`}>
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white leading-tight">{member.name}</h4>
                    <span className="text-[10px] uppercase font-mono text-zinc-400">{member.role}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openForm(member)} className="text-zinc-500 hover:text-indigo-400 transition"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg></button>
                  <button onClick={() => handleDelete(member._id)} className="text-zinc-500 hover:text-red-400 transition"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>
                </div>
              </div>
              
              <div className="space-y-1.5 mt-auto">
                <p className="text-xs text-zinc-400 flex items-center gap-2 font-mono"><svg className="w-3.5 h-3.5 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg> {member.phone || 'N/A'}</p>
                <p className="text-xs text-zinc-400 flex items-center gap-2"><svg className="w-3.5 h-3.5 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg> {member.email || 'N/A'}</p>
              </div>
              <div className="mt-4 pt-4 border-t border-zinc-800/80">
                <span className={`inline-flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider ${member.isActive ? 'text-emerald-500' : 'text-red-500'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${member.isActive ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                  {member.isActive ? 'Available' : 'Inactive'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Crew;