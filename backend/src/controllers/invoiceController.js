const Invoice = require('../models/Invoice');
const Client = require('../models/Client');

// @desc    Create a new invoice
// @route   POST /api/invoices
exports.createInvoice = async (req, res) => {
    try {
        const { client, event, invoiceNumber, dueDate, items, taxRate = 0, notes } = req.body;

        // Verify client exists
        const existingClient = await Client.findById(client);
        if (!existingClient) {
            return res.status(404).json({ message: 'Client not found' });
        }

        // Calculate totals dynamically to prevent frontend calculation spoofing
        const subtotal = items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
        const tax = subtotal * (taxRate / 100);
        const total = subtotal + tax;

        const invoice = await Invoice.create({
            client,
            event,
            invoiceNumber,
            dueDate,
            items,
            subtotal,
            tax,
            total,
            notes
        });

        res.status(201).json(invoice);
    } catch (error) {
        res.status(500).json({ message: 'Error creating invoice', error: error.message });
    }
};

// @desc    Get all invoices
// @route   GET /api/invoices
exports.getInvoices = async (req, res) => {
    try {
        const invoices = await Invoice.find()
            .populate('client', 'name email')
            .populate('event', 'title date')
            .sort({ createdAt: -1 });
            
        res.status(200).json(invoices);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching invoices', error: error.message });
    }
};