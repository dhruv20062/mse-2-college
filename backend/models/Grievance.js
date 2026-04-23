const mongoose = require('mongoose');

const grievanceSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { 
        type: String, 
        required: true, 
        enum: ['Academic', 'Hostel', 'Transport', 'Other'] 
    },
    date: { type: Date, default: Date.now },
    status: { 
        type: String, 
        default: 'Pending', 
        enum: ['Pending', 'Resolved'] 
    },
    student: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    }
});

module.exports = mongoose.model('Grievance', grievanceSchema);
