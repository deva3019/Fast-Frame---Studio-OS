const Client = require('../models/Client');

// @desc    Create a new client
// @route   POST /api/clients
exports.createClient = async (req, res) => {
    try {
        const { name, email, phone, notes } = req.body;

        // Basic validation
        if (!name || !email) {
            return res.status(400).json({ message: 'Name and email are required' });
        }

        // Check if client already exists to prevent duplicate entries
        const clientExists = await Client.findOne({ email });
        if (clientExists) {
            return res.status(400).json({ message: 'Client with this email already exists' });
        }

        // Create and save the new client
        const client = await Client.create({ name, email, phone, notes });
        res.status(201).json(client);

    } catch (error) {
        res.status(500).json({ message: 'Error creating client', error: error.message });
    }
};

// @desc    Get all clients
// @route   GET /api/clients
exports.getClients = async (req, res) => {
    try {
        // Find all clients and sort by the newest ones first
        const clients = await Client.find().sort({ createdAt: -1 });
        res.status(200).json(clients);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching clients', error: error.message });
    }
};