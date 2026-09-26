const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    notes: { type: String }
}, { timestamps: true }); 
// timestamps automatically adds createdAt and updatedAt!

module.exports = mongoose.model('Client', clientSchema);