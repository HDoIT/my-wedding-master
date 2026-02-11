const mongoose = require('mongoose');

// Simple function to generate a random 8-character string
const generateSlug = () => {
    return Math.random().toString(36).substring(2, 10);
};

const GuestSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    side: {
        type: String,
        enum: ['Nhà Trai', 'Nhà Gái'],
        default: 'Nhà Trai'
    },
    slug: {
        type: String,
        unique: true,
        default: generateSlug
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Guest', GuestSchema);
