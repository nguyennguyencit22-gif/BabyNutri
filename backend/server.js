// @ts-nocheck
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const {
    testDatabaseConnection,
} = require('./db');

const healthRoutes = require('./routes/healthRoutes');
const authRoutes = require('./routes/authRoutes');
const recipeRoutes = require('./routes/recipeRoutes');
const articleRoutes = require('./routes/articleRoutes');
const parentRoute = require('./routes/parentRoute');
const homeRoutes = require('./routes/homeRoutes');
const translationRoutes = require('./routes/translationRoutes');
const measurementRoutes = require('./routes/measurementRoutes');
const childRoutes = require('./routes/childRoutes');
const mealPlanRoutes = require('./routes/mealPlanRoutes');
const questionRoutes = require('./routes/questionRoutes');
const invitationRoutes = require('./routes/invitationRoutes');

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
app.use('/api/mealplans', mealPlanRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/invitations', invitationRoutes);

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

const port = Number(process.env.PORT || 5000);

async function startServer() {
    try {
        await testDatabaseConnection();

        app.listen(port, '0.0.0.0', () => {
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
