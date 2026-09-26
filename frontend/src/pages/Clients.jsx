import { useState, useEffect } from 'react';
import api from '../services/api';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', notes: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch clients on component mount
  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await api.get('/clients');
      setClients(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch clients.');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/clients', formData);
      // Add the new client to the top of the UI list without refreshing the page
      setClients([response.data, ...clients]); 
      setFormData({ name: '', email: '', phone: '', notes: '' }); // Clear form
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating client');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Client Management</h2>

      {error && <div className="p-4 bg-red-50 text-red-600 rounded-md">{error}</div>}

      {/* Add Client Form */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Client</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input 
            type="text" name="name" placeholder="Full Name" required
            value={formData.name} onChange={handleInputChange}
            className="border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500" 
          />
          <input 
            type="email" name="email" placeholder="Email Address" required
            value={formData.email} onChange={handleInputChange}
            className="border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500" 
          />
          <input 
            type="text" name="phone" placeholder="Phone Number"
            value={formData.phone} onChange={handleInputChange}
            className="border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500" 
          />
          <input 
            type="text" name="notes" placeholder="Notes (e.g., Wedding in Nov)"
            value={formData.notes} onChange={handleInputChange}
            className="border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500" 
          />
          <button type="submit" className="md:col-span-2 bg-indigo-600 text-white font-medium py-2 px-4 rounded-md hover:bg-indigo-700 transition">
            Save Client
          </button>
        </form>
      </div>

      {/* Client List */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <p className="p-6 text-gray-500">Loading clients...</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clients.map((client) => (
                <tr key={client._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{client.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>{client.email}</div>
                    <div>{client.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Clients;