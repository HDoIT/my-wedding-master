const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const Comment = require('./models/Comment');
const Guest = require('./models/Guest');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(express.json());

// Phục vụ file tĩnh từ thư mục public
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Ping endpoint for Render cold start prevention
app.get('/ping', (req, res) => {
    res.send('pong');
});

// Kết nối MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/wedding-comments')
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// Socket.io connection
io.on('connection', (socket) => {
    console.log('🔌 New client connected:', socket.id);

    // Gửi comment history khi client kết nối
    Comment.find().sort({ createdAt: -1 }).limit(50)
        .then(comments => {
            socket.emit('comment-history', comments);
        });

    // Xử lý khi có comment mới
    socket.on('new-comment', async (commentData) => {
        try {
            const comment = new Comment({
                name: commentData.name,
                realName: commentData.realName,
                side: commentData.side,
                message: commentData.message,
                avatar: commentData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(commentData.name)}&background=random`,
                likes: [],
                replies: []
            });

            await comment.save();
            io.emit('new-comment', comment);
        } catch (error) {
            console.error('Error saving comment:', error);
            socket.emit('error', 'Failed to save comment');
        }
    });

    // Xử lý like comment (toggle)
    socket.on('like-comment', async ({ commentId, username }) => {
        try {
            const comment = await Comment.findById(commentId);
            if (comment) {
                let likes = Array.isArray(comment.likes) ? comment.likes : [];
                const userIndex = likes.indexOf(username);

                if (userIndex > -1) {
                    // Unlike - remove user from likes array
                    likes.splice(userIndex, 1);
                } else {
                    // Like - add user to likes array
                    likes.push(username);
                }

                comment.likes = likes;
                await comment.save();

                io.emit('comment-liked', {
                    commentId,
                    likes: likes,
                    likeCount: likes.length
                });
            }
        } catch (error) {
            console.error('Error liking comment:', error);
        }
    });

    // Xử lý reply
    socket.on('new-reply', async ({ parentId, name, message, side }) => {
        try {
            const comment = await Comment.findById(parentId);
            if (comment) {
                const reply = {
                    _id: new mongoose.Types.ObjectId(),
                    name,
                    side,
                    message,
                    createdAt: new Date()
                };

                comment.replies.push(reply);
                await comment.save();

                io.emit('new-reply', { ...reply, parentId });
            }
        } catch (error) {
            console.error('Error saving reply:', error);
        }
    });

    socket.on('disconnect', () => {
        console.log('🔌 Client disconnected:', socket.id);
    });
});

// API Routes
app.get('/api/comments', async (req, res) => {
    try {
        const comments = await Comment.find().sort({ createdAt: -1 }).limit(100);
        res.json(comments);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch comments' });
    }
});

app.post('/api/comments', async (req, res) => {
    try {
        const comment = new Comment({
            name: req.body.name,
            realName: req.body.realName,
            side: req.body.side,
            message: req.body.message,
            avatar: req.body.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(req.body.name)}&background=random`
        });

        await comment.save();
        io.emit('new-comment', comment);
        res.status(201).json(comment);
    } catch (error) {
        res.status(500).json({ error: 'Failed to save comment' });
    }
});

// Guest API Routes for Card Generator
app.post('/api/guests', async (req, res) => {
    try {
        const { name, side } = req.body;
        if (!name) return res.status(400).json({ error: 'Name is required' });

        const guest = new Guest({ name, side: side || 'Nhà Trai' });
        await guest.save();
        res.status(201).json(guest);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to save guest' });
    }
});

app.get('/api/guests/:slug', async (req, res) => {
    try {
        const guest = await Guest.findOne({ slug: req.params.slug });
        if (!guest) return res.status(404).json({ error: 'Guest not found' });
        res.json(guest);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch guest' });
    }
});

// Route fallback cho SPA
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;