import { useState, useEffect } from 'react';
import api from '../services/api';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [clients, setClients] = useState([]);
  const [formData, setFormData] = useState({ title: '', date: '', client: '', driveFolderId: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch both Events and Clients when the page loads
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsRes, clientsRes] = await Promise.all([
          api.get('/events'),
          api.get('/clients')
        ]);
        setEvents(eventsRes.data);
        setClients(clientsRes.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch data.');
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/events', formData);
      
      // We need to re-fetch events to get the populated client data for the new row
      const updatedEventsRes = await api.get('/events');
      setEvents(updatedEventsRes.data);
      
      setFormData({ title: '', date: '', client: '', driveFolderId: '' }); // Clear form
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating event');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Event Management</h2>

      {error && <div className="p-4 bg-red-50 text-red-600 rounded-md">{error}</div>}

      {/* Add Event Form */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Schedule New Event</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input 
            type="text" name="title" placeholder="Event Title (e.g., Smith Wedding)" required
            value={formData.title} onChange={handleInputChange}
            className="border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500" 
          />
          <input 
            type="date" name="date" required
            value={formData.date} onChange={handleInputChange}
            className="border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-700" 
          />
          
          {/* Relational Dropdown for Clients */}
          <select 
            name="client" required
            value={formData.client} onChange={handleInputChange}
            className="border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
          >
            <option value="" disabled>Select a Client...</option>
            {clients.map(client => (
              <option key={client._id} value={client._id}>
                {client.name} ({client.email})
              </option>
            ))}
          </select>

          <input 
            type="text" name="driveFolderId" placeholder="Google Drive Folder ID String" required
            value={formData.driveFolderId} onChange={handleInputChange}
            className="border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500" 
          />
          <button type="submit" className="md:col-span-2 bg-indigo-600 text-white font-medium py-2 px-4 rounded-md hover:bg-indigo-700 transition">
            Create Event
          </button>
        </form>
      </div>

      {/* Event List */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <p className="p-6 text-gray-500">Loading events...</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {events.map((event) => (
                <tr key={event._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{event.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(event.date).toLocaleDateString()}
                  </td>
                  {/* Because we used .populate() in the backend, event.client is an object with the name! */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{event.client?.name || 'Unknown'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {event.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Events;