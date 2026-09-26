const Dashboard = () => {
    return (
      <div>
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <p className="text-sm text-gray-500 font-medium">Active Clients</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">12</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <p className="text-sm text-gray-500 font-medium">Upcoming Events</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">4</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <p className="text-sm text-gray-500 font-medium">Pending Invoices</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">$2,450</p>
            </div>
        </div>
      </div>
    );
  };
  
  export default Dashboard;