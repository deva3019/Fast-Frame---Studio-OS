import { useState, useEffect } from 'react';
import api from '../services/api';

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form State
  const [formData, setFormData] = useState({ client: '', invoiceNumber: '', dueDate: '', notes: '' });
  
  // Dynamic Line Items State
  const [items, setItems] = useState([{ description: '', quantity: 1, price: 0 }]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [invoicesRes, clientsRes] = await Promise.all([
          api.get('/invoices'),
          api.get('/clients')
        ]);
        setInvoices(invoicesRes.data || []);
        setClients(clientsRes.data || []);
        setLoading(false);
      } catch (err) {
        setInvoices([]);
        setClients([]);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const addItemRow = () => {
    setItems([...items, { description: '', quantity: 1, price: 0 }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, items, taxRate: 0 };
      const response = await api.post('/invoices', payload);
      
      // Re-fetch invoices to get populated client data
      const updatedInvoicesRes = await api.get('/invoices');
      setInvoices(updatedInvoicesRes.data);
      
      // Reset form
      setFormData({ client: '', invoiceNumber: '', dueDate: '', notes: '' });
      setItems([{ description: '', quantity: 1, price: 0 }]);
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating invoice');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Billing & Invoices</h2>

      {error && <div className="p-4 bg-red-50 text-red-600 rounded-md">{error}</div>}

      {/* Create Invoice Form */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Invoice</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select 
              name="client" required
              value={formData.client} onChange={handleInputChange}
              className="border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            >
              <option value="" disabled>Select Client...</option>
              {clients.map(client => (
                <option key={client._id} value={client._id}>{client.name}</option>
              ))}
            </select>

            <input 
              type="text" name="invoiceNumber" placeholder="Invoice # (e.g., INV-001)" required
              value={formData.invoiceNumber} onChange={handleInputChange}
              className="border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500" 
            />

            <input 
              type="date" name="dueDate" required
              value={formData.dueDate} onChange={handleInputChange}
              className="border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-700" 
            />
          </div>

          {/* Dynamic Line Items */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-md space-y-3">
            <h4 className="text-sm font-semibold text-gray-700">Line Items</h4>
            {items.map((item, index) => (
              <div key={index} className="flex gap-2">
                <input 
                  type="text" placeholder="Description (e.g., Wedding Package)" required
                  value={item.description} onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                  className="flex-1 border border-gray-300 rounded-md p-2 text-sm" 
                />
                <input 
                  type="number" placeholder="Qty" required min="1"
                  value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                  className="w-20 border border-gray-300 rounded-md p-2 text-sm" 
                />
                <input 
                  type="number" placeholder="Price ($)" required min="0"
                  value={item.price} onChange={(e) => handleItemChange(index, 'price', Number(e.target.value))}
                  className="w-28 border border-gray-300 rounded-md p-2 text-sm" 
                />
              </div>
            ))}
            <button type="button" onClick={addItemRow} className="text-sm text-indigo-600 font-medium hover:text-indigo-800">
              + Add Line Item
            </button>
          </div>

          <button type="submit" className="w-full md:w-auto bg-indigo-600 text-white font-medium py-2 px-6 rounded-md hover:bg-indigo-700 transition">
            Generate Invoice
          </button>
        </form>
      </div>

      {/* Invoices List */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <p className="p-6 text-gray-500">Loading invoices...</p>
        ) : invoices.length === 0 ? (
          <p className="p-6 text-gray-500">No invoices found. Create your first invoice above.</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoices.map((invoice) => (
                <tr key={invoice._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{invoice.invoiceNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{invoice.client?.name || 'Unknown'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">${invoice.total.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {invoice.status}
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

export default Invoices;