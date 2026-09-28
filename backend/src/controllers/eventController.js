const Event = require('../models/Event');
const Client = require('../models/Client');

// @desc    Create a new event
// @route   POST /api/events
exports.createEvent = async (req, res) => {
    try {
        const { 
            title, eventType, date, endDate, startTime, endTime, venue, location,
            client, customClientName, customClientPhone, customClientEmail,
            folders, packageDetails, extraServices, assignedCrew,
            financials, timeline, notes, status 
        } = req.body;

        // If a client ObjectId was provided, verify existence
        if (client) {
            const existingClient = await Client.findById(client);
            if (!existingClient) return res.status(404).json({ message: 'Selected client not found' });
        }

        const balanceDue = (financials?.totalAmount || 0) - (financials?.advancePaid || 0);

        const event = await Event.create({
            title, eventType, date, endDate, startTime, endTime, venue, 
            location: location || 'Coimbatore',
            client: client || undefined,
            customClientName, customClientPhone, customClientEmail,
            folders: folders || [],
            packageDetails, extraServices, assignedCrew,
            financials: { ...financials, balanceDue },
            timeline, notes,
            status: status || 'Confirmed'
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
        const events = await Event.find()
            .populate('client', 'name email phone')
            .sort({ date: -1 });
            
        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching events', error: error.message });
    }
};

// @desc    Update an event
// @route   PUT /api/events/:id
exports.updateEvent = async (req, res) => {
    try {
        // Auto-recalculate balance if financials are modified
        if (req.body.financials) {
            const total = req.body.financials.totalAmount || 0;
            const advance = req.body.financials.advancePaid || 0;
            req.body.financials.balanceDue = total - advance;
        }

        const updatedEvent = await Event.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { returnDocument: 'after', runValidators: true }
        );
        
        if (!updatedEvent) {
            return res.status(404).json({ message: 'Event not found' });
        }
        
        res.status(200).json(updatedEvent);
    } catch (error) {
        res.status(400).json({ message: 'Error updating event', error: error.message });
    }
};

// @desc    Delete an event
// @route   DELETE /api/events/:id
exports.deleteEvent = async (req, res) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);
        
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        
        res.status(200).json({ message: 'Event deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: 'Error deleting event', error: error.message });
    }
};