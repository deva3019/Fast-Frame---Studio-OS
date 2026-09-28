import { useState, useEffect, useRef } from 'react';
import api from '../services/api';

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [events, setEvents] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [activeInvoice, setActiveInvoice] = useState(null);

  // Form State
  const [formData, setFormData] = useState(getEmptyForm());

  const printRef = useRef();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [invRes, evRes, setRes] = await Promise.all([
        api.get('/invoices'),
        api.get('/events'),
        api.get('/settings')
      ]);
      setInvoices(invRes.data);
      setEvents(evRes.data);
      setSettings(setRes.data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to load invoice data");
      setLoading(false);
    }
  };

  function getEmptyForm() {
    return {
      eventId: '',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      items: [{ description: 'Photography Services', amount: 0 }],
      discount: 0,
      advancePaid: 0,
      status: 'Draft',
      notes: ''
    };
  }

  // --- Math Calculations ---
  const calculateTotals = (items, discount, advancePaid) => {
    const subtotal = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const total = Math.max(0, subtotal - (Number(discount) || 0));
    const balance = Math.max(0, total - (Number(advancePaid) || 0));
    return { subtotal, total, balance };
  };

  // --- Form Handlers ---
  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData({ ...formData, items: newItems });
  };

  const addItemRow = () => {
    setFormData({ ...formData, items: [...formData.items, { description: '', amount: 0 }] });
  };

  const removeItemRow = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (activeInvoice) {
        await api.put(`/invoices/${activeInvoice._id}`, formData);
      } else {
        await api.post('/invoices', formData);
      }
      fetchData();
      closeForm();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving invoice');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this invoice permanently?')) return;
    try {
      await api.delete(`/invoices/${id}`);
      fetchData();
    } catch (err) {
      alert('Error deleting invoice');
    }
  };

  const openForm = (invoice = null) => {
    if (invoice) {
      setFormData({
        eventId: invoice.event?._id || '',
        issueDate: new Date(invoice.issueDate).toISOString().split('T')[0],
        dueDate: invoice.dueDate ? new Date(invoice.dueDate).toISOString().split('T')[0] : '',
        items: invoice.items,
        discount: invoice.discount,
        advancePaid: invoice.advancePaid,
        status: invoice.status,
        notes: invoice.notes
      });
      setActiveInvoice(invoice);
    } else {
      setFormData(getEmptyForm());
      setActiveInvoice(null);
    }
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setActiveInvoice(null);
  };

  const openView = (invoice) => {
    setActiveInvoice(invoice);
    setIsViewOpen(true);
  };

  const handlePrint = () => {
    const printContents = printRef.current.innerHTML;
    const originalContents = document.body.innerHTML;
    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload(); // Reload to restore React bindings after print hack
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'Partially Paid': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'Unpaid': return 'text-red-400 bg-red-500/10 border-red-500/20';
      default: return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20';
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-zinc-700 border-t-white rounded-full animate-spin"></div></div>;

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto pb-12 animate-fade-in">
      
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white font-serif">Invoices & Billing</h2>
          <p className="text-xs md:text-sm text-zinc-400 mt-1">Manage project finances, advances, and final balances.</p>
        </div>
        <button 
          onClick={() => openForm()}
          className="px-4 py-2.5 text-xs font-mono uppercase tracking-widest font-semibold rounded-lg bg-white text-black hover:bg-zinc-200 transition-colors shadow-sm"
        >
          + Generate Invoice
        </button>
      </header>

      {/* Invoice Ledger Grid */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
        {invoices.length === 0 ? (
          <div className="p-16 text-center text-xs font-mono uppercase tracking-widest text-zinc-500">
            No invoices generated yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-300">
              <thead className="bg-zinc-900/50 text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                <tr>
                  <th className="px-6 py-4">Invoice #</th>
                  <th className="px-6 py-4">Client / Event</th>
                  <th className="px-6 py-4">Issue Date</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4">Balance</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {invoices.map((inv) => {
                  const totals = calculateTotals(inv.items, inv.discount, inv.advancePaid);
                  return (
                    <tr key={inv._id} className="hover:bg-zinc-900/30 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs">{inv.invoiceNumber}</td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-white">{inv.event?.client?.name || inv.event?.customClientName || 'Unknown Client'}</p>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wide">{inv.event?.title || 'Unknown Event'}</p>
                      </td>
                      <td className="px-6 py-4 text-xs">{new Date(inv.issueDate).toLocaleDateString()}</td>
                      <td className="px-6 py-4 font-mono font-bold">${totals.total.toLocaleString()}</td>
                      <td className="px-6 py-4 font-mono font-bold text-indigo-400">${totals.balance.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 border rounded text-[10px] font-mono uppercase tracking-wider ${getStatusColor(inv.status)}`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-3">
                        <button onClick={() => openView(inv)} className="text-zinc-400 hover:text-white transition" title="View/Print">
                          <svg className="w-4 h-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                        </button>
                        <button onClick={() => openForm(inv)} className="text-zinc-400 hover:text-indigo-400 transition" title="Edit">
                          <svg className="w-4 h-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                        </button>
                        <button onClick={() => handleDelete(inv._id)} className="text-zinc-400 hover:text-red-400 transition" title="Delete">
                          <svg className="w-4 h-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE/EDIT MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl max-w-3xl w-full p-6 shadow-2xl my-8">
            <div className="flex justify-between items-center mb-6 border-b border-zinc-800 pb-4">
              <h3 className="text-xl font-serif font-bold text-white">{activeInvoice ? 'Edit Invoice' : 'Generate Invoice'}</h3>
              <button onClick={closeForm} className="text-zinc-500 hover:text-white"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg></button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-zinc-500 mb-1">Target Event *</label>
                  <select required value={formData.eventId} onChange={e => setFormData({...formData, eventId: e.target.value})} className="w-full bg-zinc-900 border border-zinc-700 text-white px-3 py-2 rounded-lg text-sm">
                    <option value="">-- Select Event --</option>
                    {events.map(ev => (
                      <option key={ev._id} value={ev._id}>{ev.title} ({ev.client?.name || ev.customClientName})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-zinc-500 mb-1">Payment Status</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-zinc-900 border border-zinc-700 text-white px-3 py-2 rounded-lg text-sm">
                    <option value="Draft">Draft</option>
                    <option value="Unpaid">Unpaid</option>
                    <option value="Partially Paid">Partially Paid</option>
                    <option value="Paid">Paid</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-zinc-500 mb-1">Issue Date *</label>
                  <input type="date" required value={formData.issueDate} onChange={e => setFormData({...formData, issueDate: e.target.value})} className="w-full bg-zinc-900 border border-zinc-700 text-white px-3 py-2 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-zinc-500 mb-1">Due Date</label>
                  <input type="date" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} className="w-full bg-zinc-900 border border-zinc-700 text-white px-3 py-2 rounded-lg text-sm" />
                </div>
              </div>

              {/* Line Items */}
              <div className="bg-zinc-900/50 p-4 border border-zinc-800 rounded-lg space-y-3">
                <label className="block text-[10px] font-mono uppercase tracking-widest text-zinc-400 border-b border-zinc-800 pb-2">Line Items</label>
                {formData.items.map((item, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <input type="text" placeholder="Description (e.g. Wedding Package)" required value={item.description} onChange={e => handleItemChange(index, 'description', e.target.value)} className="w-2/3 bg-zinc-900 border border-zinc-700 text-white px-3 py-2 rounded-lg text-sm" />
                    <div className="w-1/3 relative">
                      <span className="absolute left-3 top-2 text-zinc-500">$</span>
                      <input type="number" min="0" required value={item.amount} onChange={e => handleItemChange(index, 'amount', e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 text-white pl-8 pr-3 py-2 rounded-lg text-sm font-mono" />
                    </div>
                    {formData.items.length > 1 && (
                      <button type="button" onClick={() => removeItemRow(index)} className="text-zinc-600 hover:text-red-400 p-2"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg></button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={addItemRow} className="text-xs font-mono uppercase tracking-widest text-indigo-400 hover:text-indigo-300 mt-2">+ Add Item</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <label className="block text-[10px] font-mono uppercase text-zinc-500 mb-1">Discount Applied</label>
                  <span className="absolute left-3 top-7 text-zinc-500">$</span>
                  <input type="number" min="0" value={formData.discount} onChange={e => setFormData({...formData, discount: e.target.value})} className="w-full bg-zinc-900 border border-zinc-700 text-white pl-8 pr-3 py-2 rounded-lg text-sm font-mono" />
                </div>
                <div className="relative">
                  <label className="block text-[10px] font-mono uppercase text-zinc-500 mb-1">Advance / Deposit Paid</label>
                  <span className="absolute left-3 top-7 text-zinc-500">$</span>
                  <input type="number" min="0" value={formData.advancePaid} onChange={e => setFormData({...formData, advancePaid: e.target.value})} className="w-full bg-zinc-900 border border-zinc-700 text-white pl-8 pr-3 py-2 rounded-lg text-sm font-mono" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-zinc-500 mb-1">Internal Notes (Optional)</label>
                <textarea rows="2" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full bg-zinc-900 border border-zinc-700 text-white px-3 py-2 rounded-lg text-sm" placeholder="Client requested specific editing style..."></textarea>
              </div>

              <div className="flex justify-end pt-4 border-t border-zinc-800">
                <button type="button" onClick={closeForm} className="px-4 py-2 text-zinc-400 hover:text-white mr-3 text-sm font-mono uppercase tracking-widest">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-white text-black font-bold font-mono text-xs uppercase tracking-widest rounded hover:bg-zinc-200 transition">Save Invoice</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW & PRINT MODAL */}
      {isViewOpen && activeInvoice && (
        <div className="fixed inset-0 bg-zinc-900/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-4xl w-full my-8">
            
            {/* Action Bar (Not Printed) */}
            <div className="flex justify-end gap-4 mb-4">
              <button onClick={() => setIsViewOpen(false)} className="px-4 py-2 bg-zinc-800 text-white font-mono text-xs uppercase rounded hover:bg-zinc-700">Close</button>
              <button onClick={handlePrint} className="px-6 py-2 bg-indigo-600 text-white font-mono text-xs font-bold uppercase rounded hover:bg-indigo-500 shadow-lg flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
                Print / Save PDF
              </button>
            </div>

            {/* The Printable Canvas */}
            <div ref={printRef} className="bg-white text-black p-10 md:p-16 shadow-2xl print:shadow-none print:p-0 min-h-[800px] relative">
              
              {/* Header */}
              <div className="flex justify-between items-start border-b-2 border-black pb-8 mb-8">
                <div className="max-w-xs">
                  {settings?.logoUrl ? (
                    <img src={settings.logoUrl} alt="Studio Logo" className="h-16 object-contain mb-4" />
                  ) : (
                    <h1 className="text-3xl font-serif font-bold uppercase tracking-tight mb-2">{settings?.studioName || 'Studio Name'}</h1>
                  )}
                  <p className="text-xs text-gray-600 font-mono leading-relaxed whitespace-pre-wrap">{settings?.address || 'Studio Address'}</p>
                  <p className="text-xs text-gray-600 font-mono mt-1">{settings?.phone}</p>
                  <p className="text-xs text-gray-600 font-mono">{settings?.email}</p>
                  <p className="text-xs text-gray-600 font-mono">{settings?.website}</p>
                </div>
                <div className="text-right">
                  <h2 className="text-4xl font-serif text-gray-200 tracking-widest uppercase mb-4">Invoice</h2>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                    <span className="text-gray-500 font-mono text-xs uppercase text-right">Invoice No:</span>
                    <span className="font-bold font-mono">{activeInvoice.invoiceNumber}</span>
                    <span className="text-gray-500 font-mono text-xs uppercase text-right">Date Issued:</span>
                    <span className="font-mono">{new Date(activeInvoice.issueDate).toLocaleDateString()}</span>
                    {activeInvoice.dueDate && (
                      <>
                        <span className="text-gray-500 font-mono text-xs uppercase text-right">Due Date:</span>
                        <span className="font-mono">{new Date(activeInvoice.dueDate).toLocaleDateString()}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Bill To */}
              <div className="mb-10">
                <h3 className="text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-2">Billed To</h3>
                <p className="text-lg font-bold">{activeInvoice.event?.client?.name || activeInvoice.event?.customClientName}</p>
                <p className="text-sm text-gray-600 uppercase tracking-wide mt-1">Project: {activeInvoice.event?.title}</p>
              </div>

              {/* Line Items Table */}
              <table className="w-full text-left mb-10">
                <thead>
                  <tr className="border-b border-gray-300">
                    <th className="py-3 text-[10px] font-mono uppercase tracking-widest text-gray-500 w-3/4">Description</th>
                    <th className="py-3 text-[10px] font-mono uppercase tracking-widest text-gray-500 text-right w-1/4">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {activeInvoice.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-4 text-sm">{item.description}</td>
                      <td className="py-4 text-sm font-mono text-right">${Number(item.amount).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals Calculation */}
              {(() => {
                const totals = calculateTotals(activeInvoice.items, activeInvoice.discount, activeInvoice.advancePaid);
                return (
                  <div className="flex justify-end">
                    <div className="w-full md:w-1/2 lg:w-1/3">
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="text-xs font-mono uppercase text-gray-500">Subtotal</span>
                        <span className="font-mono">${totals.subtotal.toLocaleString()}</span>
                      </div>
                      {activeInvoice.discount > 0 && (
                        <div className="flex justify-between py-2 border-b border-gray-200">
                          <span className="text-xs font-mono uppercase text-gray-500">Discount</span>
                          <span className="font-mono text-red-500">-${Number(activeInvoice.discount).toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between py-2 border-b border-black">
                        <span className="text-xs font-mono uppercase font-bold">Total</span>
                        <span className="font-mono font-bold">${totals.total.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="text-xs font-mono uppercase text-gray-500">Advance Paid</span>
                        <span className="font-mono text-gray-500">-${Number(activeInvoice.advancePaid).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between py-4 bg-gray-50 px-4 mt-2">
                        <span className="text-sm font-mono uppercase font-bold text-indigo-600">Balance Due</span>
                        <span className="font-mono font-bold text-lg text-indigo-600">${totals.balance.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Terms & Footer */}
              <div className="mt-16 pt-8 border-t border-gray-200">
                <h3 className="text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-2">Terms & Conditions</h3>
                <p className="text-xs text-gray-600 whitespace-pre-wrap leading-relaxed font-mono">
                  {settings?.defaultInvoiceTerms || 'Payment is due upon receipt.'}
                </p>
                {activeInvoice.notes && (
                  <div className="mt-6">
                     <h3 className="text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-1">Notes</h3>
                     <p className="text-xs text-gray-600 font-mono italic">{activeInvoice.notes}</p>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoices;