const mongoose = require('mongoose');

const lineItemSchema = new mongoose.Schema({
    description: { type: String, required: true },
    quantity: { type: Number, required: true, default: 1 },
    price: { type: Number, required: true }
});

const invoiceSchema = new mongoose.Schema({
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' }, // Optional: link to specific shoot
    invoiceNumber: { type: String, required: true, unique: true },
    issueDate: { type: Date, default: Date.now },
    dueDate: { type: Date, required: true },
    
    // Array of services/products
    items: [lineItemSchema],
    
    // Calculations
    subtotal: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    total: { type: Number, required: true },
    
    status: {
        type: String,
        enum: ['Draft', 'Sent', 'Paid', 'Overdue'],
        default: 'Draft'
    },
    notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Invoice', invoiceSchema);