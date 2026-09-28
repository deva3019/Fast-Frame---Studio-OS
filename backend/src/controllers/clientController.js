const Client = require('../models/Client');

exports.createClient = async (req, res) => {
    try {
        const { name, email, phone, notes } = req.body;

        if (!name || !email) {
            return res.status(400).json({ message: 'Name and email are required' });
        }

        const clientExists = await Client.findOne({ email });
        if (clientExists) {
            return res.status(400).json({ message: 'Client with this email already exists' });
        }

        const client = await Client.create({ name, email, phone, notes });
        res.status(201).json(client);

    } catch (error) {
        res.status(500).json({ message: 'Error creating client', error: error.message });
    }
};

exports.getClients = async (req, res) => {
    try {
        const clients = await Client.find().sort({ createdAt: -1 });
        res.status(200).json(clients);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching clients', error: error.message });
    }
};