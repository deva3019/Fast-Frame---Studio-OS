import { useState, useEffect } from 'react';
import api from '../services/api';

const Galleries = () => {
  const [galleries, setGalleries] = useState([]);
  const [events, setEvents] = useState([]);
  const [formData, setFormData] = useState({ event: '', driveFolderId: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch both galleries and events to populate the dropdown
        const [galleriesRes, eventsRes] = await Promise.all([
          api.get('/galleries'),
          api.get('/events')
        ]);
        
        // Ensure we default to an empty array if the API returns 404 or empty on day 1
        setGalleries(galleriesRes.data || []);
        setEvents(eventsRes.data || []);
        setLoading(false);
      } catch (err) {
        // Since we haven't built a GET /galleries route in the backend yet, we handle the error gracefully
        setGalleries([]);
        setEvents([]);
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
      const response = await api.post('/galleries', formData);
      setGalleries([response.data, ...galleries]);
      setFormData({ event: '', driveFolderId: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating gallery');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Gallery Deliverables</h2>

      {error && <div className="p-4 bg-red-50 text-red-600 rounded-md">{error}</div>}

      {/* Create Gallery Form */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Link Google Drive Gallery</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select 
            name="event" required
            value={formData.event} onChange={handleInputChange}
            className="border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
          >
            <option value="" disabled>Select the Associated Event...</option>
            {events.map(event => (
              <option key={event._id} value={event._id}>
                {event.title} - {new Date(event.date).toLocaleDateString()}
              </option>
            ))}
          </select>

          <input 
            type="text" name="driveFolderId" placeholder="Google Drive Folder ID" required
            value={formData.driveFolderId} onChange={handleInputChange}
            className="border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500" 
          />
          <button type="submit" className="md:col-span-2 bg-indigo-600 text-white font-medium py-2 px-4 rounded-md hover:bg-indigo-700 transition">
            Generate Gallery Link
          </button>
        </form>
      </div>

      {/* Galleries List */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <p className="p-6 text-gray-500">Loading galleries...</p>
        ) : galleries.length === 0 ? (
          <p className="p-6 text-gray-500">No galleries found. Link your first Google Drive folder above.</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Drive ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {galleries.map((gallery) => (
                <tr key={gallery._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {gallery.event?.title || gallery.event}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                    {gallery.driveFolderId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      {gallery.status}
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

export default Galleries;