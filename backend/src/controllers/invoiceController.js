const Invoice = require('../models/Invoice');
const Event = require('../models/Event');

// Utility to generate a unique invoice number (e.g., INV-20261001-XXXX)
const generateInvoiceNumber = () => {
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomPart = Math.floor(1000 + Math.random() * 9000);
    return `INV-${datePart}-${randomPart}`;
};

// @desc    Get all invoices
// @route   GET /api/invoices
exports.getInvoices = async (req, res) => {
    try {
        // Populates the event and client details automatically
        const invoices = await Invoice.find()
            .populate({ path: 'event', select: 'title customClientName client', populate: { path: 'client', select: 'name' } })
            .sort({ createdAt: -1 });
        res.status(200).json(invoices);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching invoices', error: error.message });
    }
};

// @desc    Create a new invoice
// @route   POST /api/invoices
exports.createInvoice = async (req, res) => {
    try {
        const { eventId, issueDate, dueDate, items, discount, advancePaid, status, notes } = req.body;

        // Verify the event exists
        const event = await Event.findById(eventId);
        if (!event) return res.status(404).json({ message: 'Event not found.' });

        const newInvoice = await Invoice.create({
            invoiceNumber: generateInvoiceNumber(),
            event: eventId,
            issueDate,
            dueDate,
            items: items || [],
            discount: discount || 0,
            advancePaid: advancePaid || 0,
            status: status || 'Draft',
            notes: notes || ''
        });

        res.status(201).json(newInvoice);
    } catch (error) {
        res.status(400).json({ message: 'Error creating invoice', error: error.message });
    }
};

// @desc    Update an invoice
// @route   PUT /api/invoices/:id
exports.updateInvoice = async (req, res) => {
    try {
        const updatedInvoice = await Invoice.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { returnDocument: 'after' }
        ).populate({ path: 'event', select: 'title customClientName client', populate: { path: 'client', select: 'name' } });

        if (!updatedInvoice) return res.status(404).json({ message: 'Invoice not found.' });
        
        res.status(200).json(updatedInvoice);
    } catch (error) {
        res.status(400).json({ message: 'Error updating invoice', error: error.message });
    }
};

// @desc    Delete an invoice
// @route   DELETE /api/invoices/:id
exports.deleteInvoice = async (req, res) => {
    try {
        const invoice = await Invoice.findByIdAndDelete(req.params.id);
        if (!invoice) return res.status(404).json({ message: 'Invoice not found.' });
        
        res.status(200).json({ message: 'Invoice deleted successfully.' });
    } catch (error) {
        res.status(400).json({ message: 'Error deleting invoice', error: error.message });
    }
};