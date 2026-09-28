const mongoose = require('mongoose');

const crewSchema = new mongoose.Schema({
    name: { type: String, required: true },
    role: { type: String, required: true }, // e.g., "Photographer", "Drone Operator"
    phone: { type: String },
    email: { type: String },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Crew', crewSchema);