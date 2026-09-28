require('dotenv').config();
const mongoose = require('mongoose');

// Import your models
const Event = require('./src/models/Event');
const Invoice = require('./src/models/Invoice');
const Settings = require('./src/models/Settings');

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error("❌ MONGO_URI is not defined in your .env file.");
    process.exit(1);
}

const seedDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB for Seeding...');

        // 1. Clear existing dummy data to avoid duplicates
        await Event.deleteMany({});
        await Invoice.deleteMany({});
        await Settings.deleteMany({});
        console.log('🗑️  Cleared old records.');

        // 2. Seed Studio Settings
        await Settings.create({
            studioName: 'FastFrame Studios',
            email: 'hello@fastframestudios.com',
            phone: '+1 (555) 123-4567',
            address: '123 Creative Lane, Suite 100\nNew York, NY 10001',
            website: 'https://fastframestudios.com',
            logoUrl: 'https://via.placeholder.com/400x100?text=FastFrame+Studios',
            defaultInvoiceTerms: '1. 50% advance required to confirm booking.\n2. Final deliverables released upon full payment clearance.'
        });
        console.log('⚙️  Settings seeded.');

        // 3. Seed Events (With dummy client selections to trigger the Kanban board)
        const event1 = await Event.create({
            title: 'Sarah & John Wedding',
            customClientName: 'Sarah Connor',
            date: new Date('2026-08-15'),
            eventType: 'Wedding',
            status: 'Active',
            // Adding dummy array elements so PostProduction.jsx detects it as "Ready to Edit"
            clientSelections: ['img_001', 'img_002', 'img_003', 'img_004', 'img_005'], 
            workflowStage: 'Culling & Prep',
            financials: { totalAmount: 4500, advancePaid: 2000, paymentMode: 'Bank Transfer' }
        });

        const event2 = await Event.create({
            title: 'TechCorp Product Shoot',
            customClientName: 'TechCorp Inc.',
            date: new Date('2026-09-10'),
            eventType: 'Commercial',
            status: 'Active',
            clientSelections: ['img_101', 'img_102'], 
            workflowStage: 'Color Grading',
            financials: { totalAmount: 1200, advancePaid: 0, paymentMode: 'Credit Card' }
        });

        const event3 = await Event.create({
            title: 'Emma & Liam Engagement',
            customClientName: 'Emma Watson',
            date: new Date('2026-07-22'),
            eventType: 'Engagement',
            status: 'Completed',
            clientSelections: ['img_201', 'img_202', 'img_203'],
            workflowStage: 'Delivered',
            financials: { totalAmount: 800, advancePaid: 800, paymentMode: 'Cash' }
        });
        console.log('📸 Events seeded.');

        // 4. Seed Invoices (Linked directly to the events above)
        await Invoice.create([
            {
                invoiceNumber: 'INV-20260901-1001',
                event: event1._id,
                issueDate: new Date('2026-09-01'),
                dueDate: new Date('2026-09-15'),
                items: [
                    { description: 'Full Day Wedding Coverage', amount: 3500 },
                    { description: 'Drone Videography Add-on', amount: 1000 }
                ],
                discount: 0,
                advancePaid: 2000,
                status: 'Partially Paid',
                notes: 'Client requested rush delivery for the teaser video.'
            },
            {
                invoiceNumber: 'INV-20260912-1002',
                event: event2._id,
                issueDate: new Date('2026-09-12'),
                dueDate: new Date('2026-10-12'),
                items: [
                    { description: 'Half-Day Commercial Studio Shoot', amount: 1200 }
                ],
                discount: 100,
                advancePaid: 0,
                status: 'Unpaid',
                notes: 'Net-30 terms agreed upon via email.'
            },
            {
                invoiceNumber: 'INV-20260725-1003',
                event: event3._id,
                issueDate: new Date('2026-07-25'),
                dueDate: new Date('2026-07-25'),
                items: [
                    { description: 'Engagement Session (2 Hours)', amount: 800 }
                ],
                discount: 0,
                advancePaid: 800,
                status: 'Paid',
                notes: 'Paid in full via cash on the day of the shoot.'
            }
        ]);
        console.log('💵 Invoices seeded.');

        console.log('🌱 Database seeding completed successfully!');
        process.exit();
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
};

seedDB();