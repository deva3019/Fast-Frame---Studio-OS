import { Outlet, Link } from 'react-router-dom';

const Layout = () => {
  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans">
      
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold tracking-tight text-indigo-600">StudioOS</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <Link to="/" className="block px-4 py-2 rounded-md hover:bg-gray-100 text-gray-700 font-medium">Dashboard</Link>
          <Link to="/clients" className="block px-4 py-2 rounded-md hover:bg-gray-100 text-gray-700 font-medium">Clients</Link>
          <Link to="/events" className="block px-4 py-2 rounded-md hover:bg-gray-100 text-gray-700 font-medium">Events</Link>
          <Link to="/galleries" className="block px-4 py-2 rounded-md hover:bg-gray-100 text-gray-700 font-medium">Galleries</Link>
          <Link to="/invoices" className="block px-4 py-2 rounded-md hover:bg-gray-100 text-gray-700 font-medium">Invoices</Link>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-end px-8">
            <span className="text-sm text-gray-500 font-medium">Photographer Admin</span>
        </header>
        
        {/* Dynamic Page Content goes here */}
        <div className="flex-1 overflow-y-auto p-8">
            <Outlet /> 
        </div>
      </main>

    </div>
  );
};

export default Layout;