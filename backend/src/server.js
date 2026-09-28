const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const settingsRoutes = require('./routes/settingsRoutes');

require('dotenv').config();

const app = express();

// Middleware
app.use(cors()); // CRITICAL: Allows your React frontend to communicate with this API
app.use(express.json()); // Parses incoming JSON payloads

connectDB();

// Wake-up endpoint for Render cold starts
app.get('/api/health', (req, res) => {
    res.status(200).json({ message: 'Server is awake' });
});

// API Routes
app.use('/api/clients', require('./routes/clientRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/galleries', require('./routes/galleryRoutes'));
app.use('/api/invoices', require('./routes/invoiceRoutes'));
app.use('/api/crew', require('./routes/crewRoutes')); 
app.use('/api/settings', settingsRoutes);

app.get('/', (req, res) => {
    res.send('FastFrame StudioOS Backend is running!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});