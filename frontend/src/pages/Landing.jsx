import { useState } from 'react';
import { Link } from 'react-router-dom';

const Landing = () => {
  const [activeDemo, setActiveDemo] = useState('galleries');
  const [selectedPhotos, setSelectedPhotos] = useState([1, 3]);

  const togglePhotoSelection = (id) => {
    if (selectedPhotos.includes(id)) {
      setSelectedPhotos(selectedPhotos.filter((item) => item !== id));
    } else {
      setSelectedPhotos([...selectedPhotos, id]);
    }
  };

  const samplePhotos = [
    { id: 1, title: 'Ceremony Ring Exchange', url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80', tag: 'Ceremony' },
    { id: 2, title: 'Golden Hour Couple Portrait', url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=600&q=80', tag: 'Portraits' },
    { id: 3, title: 'Reception First Dance', url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=80', tag: 'Reception' },
    { id: 4, title: 'Bridal Detail & Bouquet', url: 'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=600&q=80', tag: 'Details' }
  ];

  return (
    <div className="min-h-screen bg-[#070709] text-zinc-100 font-sans selection:bg-indigo-600 selection:text-white antialiased">
      
      {/* Top Banner Notice */}
      <aside className="bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-black border-b border-indigo-900/30 text-center py-2 px-4 text-xs text-indigo-300">
        <span className="font-semibold text-white">FastFrame v1.2</span> &bull; Zero-storage-cost Google Drive API integration enabled for up to 5,000+ photos per gallery.
      </aside>

      {/* Main Navbar */}
      <header className="sticky top-0 z-50 bg-[#070709]/85 backdrop-blur-xl border-b border-zinc-800/80">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-transform">
              <span className="text-white font-black text-lg tracking-tighter">F</span>
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white block leading-tight">FastFrame</span>
              <span className="text-[10px] tracking-widest uppercase text-indigo-400 font-mono font-medium">StudioOS</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-zinc-400">
            <a href="#features" className="hover:text-white transition-colors">Architecture</a>
            <a href="#demo" className="hover:text-white transition-colors">Interactive Demo</a>
            <a href="#workflow" className="hover:text-white transition-colors">Workflow</a>
            <a href="#metrics" className="hover:text-white transition-colors">Performance</a>
          </nav>

          <div className="flex items-center space-x-3">
            <Link 
              to="/login" 
              className="text-xs font-semibold uppercase tracking-wider text-zinc-300 hover:text-white px-3 py-2 transition"
            >
              Sign In
            </Link>
            <Link 
              to="/dashboard" 
              className="text-xs font-semibold uppercase tracking-wider bg-white text-black px-4 py-2 rounded-md hover:bg-zinc-200 transition shadow-sm"
            >
              Live App
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative pt-20 pb-16 px-6 max-w-7xl mx-auto text-center">
          <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-b from-indigo-600/20 via-purple-600/10 to-transparent rounded-full blur-[130px] -z-10 pointer-events-none"></div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-700 text-xs text-zinc-300 mb-8 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Production-Ready MERN Architecture</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight max-w-5xl mx-auto leading-[1.1]">
            Turn Google Drive into a <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-white to-purple-300">
              High-Speed Client Gallery & CRM
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg md:text-xl text-zinc-400 max-w-3xl mx-auto leading-relaxed font-normal">
            FastFrame unifies client tracking, automated invoicing, and zero-cost photo proofing. Offload 5,000+ photo deliveries directly through Google Drive API thumbnails without paying monthly SaaS storage fees.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/dashboard" 
              className="w-full sm:w-auto px-7 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold text-sm transition-all shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2"
            >
              Open Studio Workspace
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
            </Link>
            <a 
              href="#demo" 
              className="w-full sm:w-auto px-7 py-3.5 bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-lg font-semibold text-sm transition"
            >
              Test Interactive Demo
            </a>
          </div>

          {/* Realistic Dashboard Mockup */}
          <div className="mt-14 relative mx-auto max-w-5xl rounded-xl border border-zinc-800 bg-[#0e0e12] shadow-2xl overflow-hidden text-left">
            {/* macOS Chrome Header */}
            <div className="h-10 border-b border-zinc-800/80 bg-zinc-950/70 px-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                <span className="text-[11px] text-zinc-500 font-mono ml-2">studio.fastframe.internal/dashboard</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
                <span className="text-[11px] text-zinc-400 font-mono">Render API: 200 OK</span>
              </div>
            </div>

            {/* Inner Dashboard Layout */}
            <div className="grid grid-cols-12 min-h-[460px]">
              {/* Fake Sidebar */}
              <div className="col-span-3 border-r border-zinc-800/80 p-4 bg-zinc-950/40 hidden md:block">
                <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3 px-2">StudioOS</div>
                <div className="space-y-1 text-sm">
                  <div className="px-3 py-2 rounded-md bg-indigo-600/20 text-indigo-300 font-medium flex items-center justify-between">
                    <span>Overview</span>
                    <span className="text-[10px] bg-indigo-500/30 text-indigo-200 px-1.5 py-0.5 rounded">Live</span>
                  </div>
                  <div className="px-3 py-2 text-zinc-400 hover:text-white rounded-md">Clients (24)</div>
                  <div className="px-3 py-2 text-zinc-400 hover:text-white rounded-md">Galleries (18)</div>
                  <div className="px-3 py-2 text-zinc-400 hover:text-white rounded-md">Invoices ($14.2k)</div>
                </div>

                <div className="mt-12 p-3 rounded-lg border border-zinc-800 bg-zinc-900/60">
                  <p className="text-[11px] text-zinc-400">Drive Cloud Quota</p>
                  <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-indigo-500 h-full w-[28%]"></div>
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-1">4.2 GB of 15 GB Used (Free Tier)</p>
                </div>
              </div>

              {/* Fake Main Content */}
              <div className="col-span-12 md:col-span-9 p-6 bg-zinc-900/20 flex flex-col justify-between">
                <div>
                  {/* Top Stats Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                    <div className="p-4 rounded-lg bg-zinc-950 border border-zinc-800">
                      <span className="text-xs text-zinc-400 font-medium">Monthly Shoot Volume</span>
                      <p className="text-2xl font-bold text-white mt-1">14 Shoots</p>
                      <span className="text-[11px] text-emerald-400 font-medium">&uarr; +24% vs last month</span>
                    </div>
                    <div className="p-4 rounded-lg bg-zinc-950 border border-zinc-800">
                      <span className="text-xs text-zinc-400 font-medium">Synced Drive Deliverables</span>
                      <p className="text-2xl font-bold text-white mt-1">8,420 Photos</p>
                      <span className="text-[11px] text-indigo-400 font-medium">0 Server Storage Cost</span>
                    </div>
                    <div className="p-4 rounded-lg bg-zinc-950 border border-zinc-800">
                      <span className="text-xs text-zinc-400 font-medium">Pending Payments</span>
                      <p className="text-2xl font-bold text-white mt-1">$3,850</p>
                      <span className="text-[11px] text-amber-400 font-medium">3 Invoices Awaiting</span>
                    </div>
                  </div>

                  {/* Active Deliverables Table */}
                  <div className="rounded-lg border border-zinc-800 overflow-hidden bg-zinc-950">
                    <div className="px-4 py-3 border-b border-zinc-800 flex justify-between items-center">
                      <span className="text-xs font-semibold uppercase text-zinc-300 tracking-wider">Active Client Events</span>
                      <span className="text-[11px] text-zinc-500">Auto-populated via MongoDB Atlas</span>
                    </div>
                    <div className="divide-y divide-zinc-800/60 text-xs">
                      <div className="px-4 py-3 flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-white">Kavya & Rohan Wedding Reception</p>
                          <p className="text-zinc-500 text-[11px]">Drive ID: 1A9z_Xkd92837Lqp &bull; 1,420 Photos</p>
                        </div>
                        <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">Selections Ready</span>
                      </div>
                      <div className="px-4 py-3 flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-white">Ananya Verma - Corporate Brand Headshots</p>
                          <p className="text-zinc-500 text-[11px]">Drive ID: 1Bz8_Mmo44120Ytt &bull; 340 Photos</p>
                        </div>
                        <span className="px-2 py-1 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">Client Proofing</span>
                      </div>
                      <div className="px-4 py-3 flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-white">Vikram S. - Pre-Wedding Outdoor Shoot</p>
                          <p className="text-zinc-500 text-[11px]">Drive ID: 1Cp4_Qrk00921Bmm &bull; 890 Photos</p>
                        </div>
                        <span className="px-2 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">Invoice Due</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-between items-center text-xs text-zinc-500 pt-4 border-t border-zinc-800/60">
                  <span>MongoDB Atlas Shard: Primary Connected</span>
                  <span>Average Proofing Latency: 180ms</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Performance Metrics Strip */}
        <section id="metrics" className="border-y border-zinc-800 bg-zinc-950 py-10">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-3xl font-extrabold text-white">0.00&#8377;</p>
              <p className="text-xs text-zinc-400 mt-1 uppercase tracking-wider">Cloud Storage Cost</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-indigo-400">5,000+</p>
              <p className="text-xs text-zinc-400 mt-1 uppercase tracking-wider">Photos Per Gallery</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-white">&lt; 200ms</p>
              <p className="text-xs text-zinc-400 mt-1 uppercase tracking-wider">Thumbnail Load Latency</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-emerald-400">1-Click</p>
              <p className="text-xs text-zinc-400 mt-1 uppercase tracking-wider">Client Proofing & Invoicing</p>
            </div>
          </div>
        </section>

        {/* Architectural Features Grid */}
        <section id="features" className="py-24 max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Architected for high-volume photography workloads.
            </h2>
            <p className="mt-4 text-zinc-400 text-sm sm:text-base">
              Traditional SaaS gallery tools charge hefty recurring tiers for raw file storage. FastFrame handles metadata in MongoDB Atlas and proxies thumbnails through the Google Drive API.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <article className="p-6 rounded-xl border border-zinc-800 bg-zinc-950 flex flex-col justify-between hover:border-zinc-700 transition">
              <div>
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold mb-4">
                  01
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Drive API Thumbnail Streaming</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Instead of paying $40/month for AWS S3 or dedicated CDN buckets, FastFrame saves only the Google Drive Folder IDs in MongoDB and streams lazy-loaded image previews securely to your clients.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-zinc-900 text-[11px] text-zinc-500 font-mono">
                Tech: Node.js &bull; Google Drive REST API v3
              </div>
            </article>

            <article className="p-6 rounded-xl border border-zinc-800 bg-zinc-950 flex flex-col justify-between hover:border-zinc-700 transition">
              <div>
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold mb-4">
                  02
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Relational CRM Schema</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Events, Clients, and Invoices are linked via Mongoose object references. Populated endpoints ensure one query provides full contact data, shoot notes, and delivery links without redundant joins.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-zinc-900 text-[11px] text-zinc-500 font-mono">
                Tech: MongoDB Atlas &bull; Mongoose Populate
              </div>
            </article>

            <article className="p-6 rounded-xl border border-zinc-800 bg-zinc-950 flex flex-col justify-between hover:border-zinc-700 transition">
              <div>
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold mb-4">
                  03
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Dynamic Line-Item Billing</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Generate professional, printable invoices. The backend calculates subtotal, applied tax rates, and final balances dynamically to prevent client-side data tampering.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-zinc-900 text-[11px] text-zinc-500 font-mono">
                Tech: Express Controller &bull; React Dynamic State
              </div>
            </article>
          </div>
        </section>

        {/* Interactive Feature Demo */}
        <section id="demo" className="py-20 bg-zinc-950 border-t border-zinc-800">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-mono uppercase tracking-widest text-indigo-400">Interactive Playground</span>
              <h2 className="text-3xl font-extrabold text-white mt-2">Test the Client & Studio Workflow</h2>
              <p className="text-sm text-zinc-400 mt-2">Click between the tabs to test how FastFrame operates in production.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Tab Selector */}
              <div className="lg:col-span-4 space-y-3">
                <button
                  onClick={() => setActiveDemo('galleries')}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    activeDemo === 'galleries'
                      ? 'bg-zinc-900 border-indigo-500 shadow-lg shadow-indigo-600/10'
                      : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-white">1. Photo Proofing Gallery</span>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">Client View</span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                    Test image selection. The client picks favorites for final retouching without downloading raw gigabytes.
                  </p>
                </button>

                <button
                  onClick={() => setActiveDemo('clients')}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    activeDemo === 'clients'
                      ? 'bg-zinc-900 border-indigo-500 shadow-lg shadow-indigo-600/10'
                      : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-white">2. Relational Client CRM</span>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">Studio View</span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                    Store contact details, track shoots, and inspect notes directly tied to each client record.
                  </p>
                </button>

                <button
                  onClick={() => setActiveDemo('invoicing')}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    activeDemo === 'invoicing'
                      ? 'bg-zinc-900 border-indigo-500 shadow-lg shadow-indigo-600/10'
                      : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-white">3. Automated Invoicing</span>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">Finance</span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                    Dynamic line-item breakdown with real-time tax calculation and export capability.
                  </p>
                </button>
              </div>

              {/* Dynamic Interactive Display Window */}
              <div className="lg:col-span-8 rounded-xl border border-zinc-800 bg-[#0c0c10] p-6 shadow-2xl min-h-[460px]">
                
                {/* 1. GALLERY INTERACTIVE TAB */}
                {activeDemo === 'galleries' && (
                  <div>
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-4 border-b border-zinc-800 mb-6">
                      <div>
                        <h3 className="text-base font-bold text-white">Priya & Aarav &mdash; Wedding Highlights</h3>
                        <p className="text-xs text-zinc-400">Google Drive Folder: <span className="font-mono text-indigo-400">1F7x_WedGallery902</span> &bull; 4 of 1,240 loaded</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-zinc-400">
                          Selected: <strong className="text-white">{selectedPhotos.length}</strong> photos
                        </span>
                        <button 
                          onClick={() => alert(`Selection confirmed for ${selectedPhotos.length} photos! Saved to MongoDB.`)}
                          className="px-3 py-1.5 bg-indigo-600 text-white rounded text-xs font-semibold hover:bg-indigo-500 transition"
                        >
                          Submit Selections
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
                      {samplePhotos.map((photo) => {
                        const isSelected = selectedPhotos.includes(photo.id);
                        return (
                          <div 
                            key={photo.id}
                            onClick={() => togglePhotoSelection(photo.id)}
                            className={`group relative rounded-lg overflow-hidden border cursor-pointer transition-all aspect-video ${
                              isSelected ? 'border-indigo-500 ring-2 ring-indigo-500/50' : 'border-zinc-800 hover:border-zinc-600'
                            }`}
                          >
                            <img 
                              src={photo.url} 
                              alt={photo.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90"></div>
                            
                            {/* Checkbox badge */}
                            <div className="absolute top-2.5 right-2.5">
                              <div className={`w-5 h-5 rounded flex items-center justify-center text-xs font-bold ${
                                isSelected ? 'bg-indigo-600 text-white' : 'bg-black/60 text-transparent border border-white/40'
                              }`}>
                                &check;
                              </div>
                            </div>

                            <div className="absolute bottom-2.5 left-2.5 right-2.5 flex justify-between items-end">
                              <div>
                                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-black/60 text-zinc-300 backdrop-blur-sm">
                                  {photo.tag}
                                </span>
                                <p className="text-xs font-medium text-white mt-1 truncate">{photo.title}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-4 text-center">
                      Tip: Click any photo card above to test real-time proofing selection state.
                    </p>
                  </div>
                )}

                {/* 2. CLIENT CRM TAB */}
                {activeDemo === 'clients' && (
                  <div>
                    <div className="flex justify-between items-center pb-4 border-b border-zinc-800 mb-6">
                      <div>
                        <h3 className="text-base font-bold text-white">Photographer CRM & Event Roster</h3>
                        <p className="text-xs text-zinc-400">Directly fetched from MongoDB Atlas Client collection</p>
                      </div>
                      <span className="text-xs px-2.5 py-1 bg-zinc-800 text-zinc-300 rounded font-mono">3 Active</span>
                    </div>

                    <div className="space-y-3">
                      <div className="p-3.5 rounded-lg border border-zinc-800 bg-zinc-950 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-900/60 border border-indigo-700/50 flex items-center justify-center font-bold text-indigo-300 text-sm">
                            RD
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white">Rohan Das</p>
                            <p className="text-xs text-zinc-400 font-mono">rohan.das@gmail.com &bull; +91 98401 22910</p>
                          </div>
                        </div>
                        <div className="text-left sm:text-right">
                          <span className="px-2 py-0.5 rounded text-[11px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                            Wedding Package &bull; $1,850
                          </span>
                          <p className="text-[10px] text-zinc-500 mt-1">Event: Dec 14, 2026</p>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-lg border border-zinc-800 bg-zinc-950 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-purple-900/60 border border-purple-700/50 flex items-center justify-center font-bold text-purple-300 text-sm">
                            SK
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white">Sneha Kulkarni</p>
                            <p className="text-xs text-zinc-400 font-mono">sneha.photo@outlook.com &bull; +91 99200 48112</p>
                          </div>
                        </div>
                        <div className="text-left sm:text-right">
                          <span className="px-2 py-0.5 rounded text-[11px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
                            Brand Editorial &bull; $950
                          </span>
                          <p className="text-[10px] text-zinc-500 mt-1">Event: Nov 02, 2026</p>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-lg border border-zinc-800 bg-zinc-950 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-900/60 border border-emerald-700/50 flex items-center justify-center font-bold text-emerald-300 text-sm">
                            AM
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white">Arjun Menon</p>
                            <p className="text-xs text-zinc-400 font-mono">arjun.menon@techhub.in &bull; +91 97112 00192</p>
                          </div>
                        </div>
                        <div className="text-left sm:text-right">
                          <span className="px-2 py-0.5 rounded text-[11px] bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                            Corporate Event &bull; $600
                          </span>
                          <p className="text-[10px] text-zinc-500 mt-1">Event: Oct 28, 2026</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. INVOICE TAB */}
                {activeDemo === 'invoicing' && (
                  <div>
                    <div className="flex justify-between items-center pb-4 border-b border-zinc-800 mb-4">
                      <div>
                        <span className="text-[10px] uppercase font-mono text-zinc-400">Invoice Document</span>
                        <h3 className="text-base font-bold text-white">INV-2026-089</h3>
                      </div>
                      <span className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
                        Status: Paid
                      </span>
                    </div>

                    <div className="text-xs space-y-1 mb-4 text-zinc-400">
                      <p><strong className="text-white">Billed To:</strong> Rohan Das (Wedding Photography)</p>
                      <p><strong className="text-white">Issue Date:</strong> Sep 26, 2026 &bull; <strong className="text-white">Due Date:</strong> Oct 10, 2026</p>
                    </div>

                    <table className="w-full text-xs text-left mb-4">
                      <thead>
                        <tr className="border-b border-zinc-800 text-zinc-400">
                          <th className="py-2">Description</th>
                          <th className="py-2 text-center">Qty</th>
                          <th className="py-2 text-right">Unit Price</th>
                          <th className="py-2 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/60">
                        <tr>
                          <td className="py-2.5 text-white font-medium">Full-Day Wedding Coverage (2 Shooters)</td>
                          <td className="py-2.5 text-center text-zinc-400">1</td>
                          <td className="py-2.5 text-right font-mono text-zinc-300">$1,400.00</td>
                          <td className="py-2.5 text-right font-mono text-white">$1,400.00</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 text-white font-medium">4K Drone Aerial Shoot (Reception)</td>
                          <td className="py-2.5 text-center text-zinc-400">1</td>
                          <td className="py-2.5 text-right font-mono text-zinc-300">$350.00</td>
                          <td className="py-2.5 text-right font-mono text-white">$350.00</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 text-white font-medium">Rush Delivery Gallery Processing (48h)</td>
                          <td className="py-2.5 text-center text-zinc-400">1</td>
                          <td className="py-2.5 text-right font-mono text-zinc-300">$100.00</td>
                          <td className="py-2.5 text-right font-mono text-white">$100.00</td>
                        </tr>
                      </tbody>
                    </table>

                    <div className="border-t border-zinc-800 pt-3 flex flex-col items-end text-xs space-y-1">
                      <div className="flex justify-between w-48 text-zinc-400">
                        <span>Subtotal:</span>
                        <span className="font-mono text-white">$1,850.00</span>
                      </div>
                      <div className="flex justify-between w-48 text-zinc-400">
                        <span>Tax (0% Service Exemption):</span>
                        <span className="font-mono text-white">$0.00</span>
                      </div>
                      <div className="flex justify-between w-48 text-sm font-bold text-white pt-2 border-t border-zinc-800">
                        <span>Total Paid:</span>
                        <span className="font-mono text-indigo-400">$1,850.00</span>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        </section>

        {/* Workflow Steps Section */}
        <section id="workflow" className="py-24 max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-white">How FastFrame Simplifies Operations</h2>
            <p className="text-sm text-zinc-400 mt-2">Built to take a photographer from shoot day to final payment in three clean stages.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative p-6 rounded-xl border border-zinc-800 bg-zinc-950">
              <span className="text-4xl font-extrabold text-zinc-800 font-mono">01</span>
              <h3 className="text-lg font-bold text-white mt-3">Register Client & Shoot</h3>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                Capture the couple or client's phone, email, event date, and custom notes in the StudioOS CRM view.
              </p>
            </div>

            <div className="relative p-6 rounded-xl border border-zinc-800 bg-zinc-950">
              <span className="text-4xl font-extrabold text-zinc-800 font-mono">02</span>
              <h3 className="text-lg font-bold text-white mt-3">Attach Google Drive ID</h3>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                Paste the folder string from Google Drive. FastFrame maps the files and automatically provisions a gallery URL for the client.
              </p>
            </div>

            <div className="relative p-6 rounded-xl border border-zinc-800 bg-zinc-950">
              <span className="text-4xl font-extrabold text-zinc-800 font-mono">03</span>
              <h3 className="text-lg font-bold text-white mt-3">Deliver & Issue Invoice</h3>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                The client selects favorites in their clean proofing portal. Generate and send the final calculated invoice directly from your dashboard.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Developer Signature & Footer */}
      <footer className="border-t border-zinc-800/80 bg-[#050507] pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            {/* Developer Avatar */}
            <div className="relative">
              <img 
                src="public\deva.png" 
                alt="Deva Veera Kumaran" 
                className="w-16 h-16 rounded-full border-2 border-indigo-500/50 object-cover shadow-xl shadow-indigo-600/20"
              />
              <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-[#050507] rounded-full"></span>
            </div>

            <div>
              <p className="text-[11px] font-mono uppercase tracking-widest text-indigo-400 font-semibold">Architected & Engineered By</p>
              <a 
                href="https://deva3019.netlify.app" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-lg sm:text-xl font-bold text-white hover:text-indigo-300 transition-colors inline-flex items-center gap-1.5"
              >
                Deva Veera Kumaran
                <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
              </a>
              <p className="text-xs text-zinc-500 mt-0.5">
                Full-Stack MERN Developer &bull; <a href="https://deva3019.netlify.app" target="_blank" rel="noopener noreferrer" className="underline hover:text-zinc-300">deva3019.netlify.app</a>
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center md:items-end gap-2 text-xs text-zinc-500">
            <div className="flex items-center space-x-6">
              <Link to="/dashboard" className="hover:text-white transition">Dashboard</Link>
              <Link to="/login" className="hover:text-white transition">Login Portal</Link>
              <a href="https://deva3019.netlify.app" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">Portfolio</a>
            </div>
            <p className="mt-2 text-[11px] text-zinc-600">
              &copy; {new Date().getFullYear()} FastFrame StudioOS &bull; Built with MongoDB, Express, React & Node.js.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;