const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    realName: {
        type: String,
        trim: true,
        default: null
    },
    message: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500
    },
    avatar: {
        type: String,
        default: 'https://ui-avatars.com/api/?name=Guest&background=random'
    },
    likes: [{
        type: String
    }],
    replies: [{
        name: String,
        message: String,
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Comment', commentSchema);