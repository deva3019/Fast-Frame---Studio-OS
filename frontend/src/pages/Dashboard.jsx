import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({ clients: 0, events: 0, revenue: 0, balance: 0 });
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [clientsRes, eventsRes] = await Promise.all([
          api.get('/clients'),
          api.get('/events')
        ]);
        
        const clients = clientsRes.data || [];
        const events = eventsRes.data || [];

        // Aggregate Financials
        let totalRevenue = 0;
        let totalBalance = 0;
        events.forEach(ev => {
          totalRevenue += (ev.financials?.totalAmount || 0);
          totalBalance += (ev.financials?.balanceDue || 0);
        });

        // Filter Upcoming Events (Next 30 days)
        const today = new Date();
        const upcoming = events
          .filter(ev => new Date(ev.date) >= today)
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .slice(0, 4);

        setStats({ clients: clients.length, events: events.length, revenue: totalRevenue, balance: totalBalance });
        setUpcomingEvents(upcoming);
        setLoading(false);
      } catch (error) {
        console.error("Dashboard data error:", error);
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-zinc-500 animate-pulse">
        <div className="flex flex-col items-center gap-3">
          <svg className="w-8 h-8 animate-spin text-indigo-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-sm font-medium">Syncing Atlas Data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Header section adapts spacing for mobile */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Studio Overview</h1>
          <p className="text-xs md:text-sm text-zinc-400 mt-1">Real-time metrics from your MongoDB cluster.</p>
        </div>
        <Link 
          to="/dashboard/events" 
          className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-indigo-500/20 w-full sm:w-auto"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          New Event
        </Link>
      </header>

      {/* KPI Metric Cards - Fluid Grid System */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-zinc-950 border border-zinc-800 p-5 md:p-6 rounded-2xl hover:border-zinc-700 transition-all duration-200 shadow-sm hover:shadow-xl hover:shadow-black/50 group">
          <div className="flex justify-between items-start">
            <p className="text-[10px] md:text-xs font-semibold uppercase tracking-wider text-zinc-500 group-hover:text-zinc-400 transition-colors">Total Contract Value</p>
            <span className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></span>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-white mt-3 font-mono">₹{stats.revenue.toLocaleString()}</p>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 p-5 md:p-6 rounded-2xl hover:border-zinc-700 transition-all duration-200 shadow-sm hover:shadow-xl hover:shadow-black/50 group">
          <div className="flex justify-between items-start">
            <p className="text-[10px] md:text-xs font-semibold uppercase tracking-wider text-zinc-500 group-hover:text-zinc-400 transition-colors">Outstanding Balance</p>
            <span className="p-2 bg-amber-500/10 text-amber-400 rounded-lg"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg></span>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-amber-400 mt-3 font-mono">₹{stats.balance.toLocaleString()}</p>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 p-5 md:p-6 rounded-2xl hover:border-zinc-700 transition-all duration-200 shadow-sm hover:shadow-xl hover:shadow-black/50 group">
          <div className="flex justify-between items-start">
            <p className="text-[10px] md:text-xs font-semibold uppercase tracking-wider text-zinc-500 group-hover:text-zinc-400 transition-colors">Active Clients</p>
            <span className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg></span>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-white mt-3">{stats.clients}</p>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 p-5 md:p-6 rounded-2xl hover:border-zinc-700 transition-all duration-200 shadow-sm hover:shadow-xl hover:shadow-black/50 group">
          <div className="flex justify-between items-start">
            <p className="text-[10px] md:text-xs font-semibold uppercase tracking-wider text-zinc-500 group-hover:text-zinc-400 transition-colors">Total Events</p>
            <span className="p-2 bg-purple-500/10 text-purple-400 rounded-lg"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></span>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-white mt-3">{stats.events}</p>
        </div>
      </div>

      {/* Upcoming Schedule - Adapts to flex-col on mobile, flex-row on desktop */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="px-5 md:px-6 py-4 md:py-5 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/30">
          <h2 className="text-sm md:text-base font-bold uppercase tracking-wider text-zinc-300">Upcoming Schedule</h2>
          <Link to="/dashboard/events" className="text-xs md:text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors">View All Calendar &rarr;</Link>
        </div>
        
        {upcomingEvents.length === 0 ? (
          <div className="p-10 text-center flex flex-col items-center">
            <svg className="w-12 h-12 text-zinc-700 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            <p className="text-zinc-500 text-sm md:text-base font-medium">No upcoming events scheduled.</p>
            <p className="text-zinc-600 text-xs mt-1">Bookings added to the CRM will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/60">
            {upcomingEvents.map(ev => (
              <div key={ev._id} className="p-5 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5 hover:bg-zinc-900/50 transition-colors group">
                
                <div className="flex items-start sm:items-center gap-4 md:gap-6">
                  {/* Calendar Date Block */}
                  <div className="bg-zinc-900 border border-zinc-700/50 rounded-xl p-2 md:p-3 text-center min-w-[65px] md:min-w-[80px] shadow-inner group-hover:border-indigo-500/30 transition-colors">
                    <p className="text-[10px] md:text-xs uppercase text-zinc-400 font-bold tracking-widest">{new Date(ev.date).toLocaleString('default', { month: 'short' })}</p>
                    <p className="text-xl md:text-2xl font-black text-white mt-0.5">{new Date(ev.date).getDate()}</p>
                  </div>
                  
                  {/* Event Details */}
                  <div>
                    <h3 className="text-base md:text-lg font-bold text-white leading-tight">{ev.title}</h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1.5 md:mt-2 text-xs text-zinc-400">
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        {ev.startTime} - {ev.endTime}
                      </span>
                      <span className="hidden sm:inline text-zinc-700">&bull;</span>
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>
                        {ev.eventType}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status & Location */}
                <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t border-zinc-800/50 sm:border-t-0 pt-4 sm:pt-0">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-md border ${
                    ev.status === 'Confirmed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                    ev.status === 'Tentative' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                    'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                  }`}>
                    {ev.status || 'Scheduled'}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-zinc-500 sm:mt-2 max-w-[150px] md:max-w-[200px]">
                    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    <span className="truncate">{ev.venue || 'TBD'}</span>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;