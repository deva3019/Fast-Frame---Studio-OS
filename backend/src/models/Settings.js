const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    studioName: { type: String, required: true, default: 'My Studio' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    website: { type: String, default: '' },
    // We will store the logo as a base64 string or a simple URL string
    logoUrl: { type: String, default: '' }, 
    defaultInvoiceTerms: { 
        type: String, 
        default: '1. 50% advance required to confirm booking.\n2. Final deliverables released upon full payment.' 
    }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);