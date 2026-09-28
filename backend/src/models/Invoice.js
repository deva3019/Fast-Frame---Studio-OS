const mongoose = require('mongoose');

const invoiceItemSchema = new mongoose.Schema({
    description: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 }
});

const invoiceSchema = new mongoose.Schema({
    invoiceNumber: { type: String, required: true, unique: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    issueDate: { type: Date, default: Date.now },
    dueDate: { type: Date },
    items: [invoiceItemSchema],
    discount: { type: Number, default: 0, min: 0 },
    advancePaid: { type: Number, default: 0, min: 0 },
    status: { 
        type: String, 
        enum: ['Draft', 'Unpaid', 'Partially Paid', 'Paid'], 
        default: 'Draft' 
    },
    notes: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Invoice', invoiceSchema);