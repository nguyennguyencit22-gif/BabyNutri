// @ts-nocheck
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const jwt = require('jsonwebtoken');
const { Server: SocketIOServer } = require('socket.io');

const {
    testDatabaseConnection,
} = require('./db');
const chatController = require('./controllers/chatController');

const healthRoutes = require('./routes/healthRoutes');
const authRoutes = require('./routes/authRoutes');
const recipeRoutes = require('./routes/recipeRoutes');
const articleRoutes = require('./routes/articleRoutes');
const parentRoute = require('./routes/parentRoute');
const homeRoutes = require('./routes/homeRoutes');
const translationRoutes = require('./routes/translationRoutes');
const measurementRoutes = require('./routes/measurementRoutes');
const childRoutes = require('./routes/childRoutes');
const growthRoutes = require('./routes/growthRoutes');
const mealPlanRoutes = require('./routes/mealPlanRoutes');
const questionRoutes = require('./routes/questionRoutes');
const invitationRoutes = require('./routes/invitationRoutes');
const chatRoutes = require('./routes/chatRoutes');

const app = express();

app.use(cors());

app.use(express.json({
    limit: '2mb',
}));

app.use(express.urlencoded({
    extended: true,
}));

app.use("/images", express.static(path.join(__dirname, "../public/public/images")));

app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to BabyNutri API.',
    });
});

app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/parent', parentRoute);
app.use('/api/home', homeRoutes);
app.use('/api/translate', translationRoutes);
app.use('/api/measurement-settings', measurementRoutes);
app.use('/api/children', childRoutes);
app.use('/api/children', growthRoutes);
app.use('/api/mealplans', mealPlanRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/invitations', invitationRoutes);
app.use('/api/chat', chatRoutes);

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'API endpoint not found.',
    });
});

app.use((error, req, res, next) => {
    console.error('Unhandled server error:', error);

    res.status(500).json({
        success: false,
        message: 'Internal server error.',
    });
});

const httpServer = http.createServer(app);
const io = new SocketIOServer(httpServer, {
    cors: { origin: '*' },
});

// Socket handshake auth — same JWT used by the REST API's auth middleware,
// just verified once at connection time instead of per-request.
io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
        return next(new Error('Unauthorized'));
    }
    try {
        socket.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (err) {
        next(new Error('Unauthorized'));
    }
});

io.on('connection', (socket) => {
    socket.on('join_conversation', async (conversationId, callback) => {
        try {
            const convo = await chatController.assertParticipant(conversationId, socket.user.id);
            if (!convo) {
                callback?.({ error: 'Not a participant in this conversation' });
                return;
            }
            socket.join(`conversation:${conversationId}`);
            callback?.({ ok: true });
        } catch (err) {
            console.error('join_conversation error:', err);
            callback?.({ error: 'Failed to join conversation' });
        }
    });

    socket.on('send_message', async ({ conversationId, content }, callback) => {
        try {
            const convo = await chatController.assertParticipant(conversationId, socket.user.id);
            if (!convo) {
                callback?.({ error: 'Not a participant in this conversation' });
                return;
            }

            const trimmed = (content || '').trim();
            if (!trimmed) {
                callback?.({ error: 'Empty message' });
                return;
            }

            const messageId = await chatController.persistMessage(conversationId, socket.user.id, trimmed);
            const message = {
                id: messageId,
                conversationId: Number(conversationId),
                senderId: socket.user.id,
                content: trimmed,
                createdAt: new Date().toISOString(),
            };

            io.to(`conversation:${conversationId}`).emit('new_message', message);
            callback?.({ ok: true, message });
        } catch (err) {
            console.error('send_message error:', err);
            callback?.({ error: 'Failed to send message' });
        }
    });
});

const port = Number(process.env.PORT || 5000);

async function startServer() {
    try {
        await testDatabaseConnection();

        httpServer.listen(port, '0.0.0.0', () => {
            console.log(
                `BabyNutri API running at http://localhost:${port}`,
            );
        });
    } catch (error) {
        console.error(
            'Unable to start backend:',
            error,
        );

        process.exit(1);
    }
}

startServer();
