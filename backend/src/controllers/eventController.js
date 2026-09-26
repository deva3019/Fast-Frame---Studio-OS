const Event = require('../models/Event');
const Client = require('../models/Client');

// @desc    Create a new event
// @route   POST /api/events
exports.createEvent = async (req, res) => {
    try {
        const { title, date, client, driveFolderId, coverPhotoUrl } = req.body;

        // Verify the client exists in the database before creating the event
        const existingClient = await Client.findById(client);
        if (!existingClient) {
            return res.status(404).json({ message: 'Client not found' });
        }

        const event = await Event.create({
            title,
            date,
            client, // Pass the MongoDB _id string of the Client here
            driveFolderId,
            coverPhotoUrl
        });

        res.status(201).json(event);
    } catch (error) {
        res.status(500).json({ message: 'Error creating event', error: error.message });
    }
};

// @desc    Get all events
// @route   GET /api/events
exports.getEvents = async (req, res) => {
    try {
        // .populate() automatically grabs the specific fields ('name email phone') from the related Client document
        const events = await Event.find()
            .populate('client', 'name email phone')
            .sort({ date: 1 });
            
        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching events', error: error.message });
    }
};