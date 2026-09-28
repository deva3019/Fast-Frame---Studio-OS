const Crew = require('../models/Crew');

// @desc    Get all crew members
// @route   GET /api/crew
exports.getCrew = async (req, res) => {
    try {
        const crew = await Crew.find().sort({ name: 1 });
        res.status(200).json(crew);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create new crew member
// @route   POST /api/crew
exports.createCrewMember = async (req, res) => {
    try {
        const crewMember = await Crew.create(req.body);
        res.status(201).json(crewMember);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update crew member
// @route   PUT /api/crew/:id
exports.updateCrewMember = async (req, res) => {
    try {
        const updatedCrew = await Crew.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedCrew);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete crew member
// @route   DELETE /api/crew/:id
exports.deleteCrewMember = async (req, res) => {
    try {
        await Crew.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Crew member deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};