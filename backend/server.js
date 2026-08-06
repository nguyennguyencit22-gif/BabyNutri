// require("dotenv").config();

// const express = require("express");
// const cors = require("cors");

// const authRoutes = require("./routes/authRoutes");
// const recipeRoutes = require("./routes/recipeRoutes");
// const articleRoutes = require("./routes/articleRoutes");
// const parentRoute = require("./routes/parentRoute");
// const app = express();

// app.use(cors());
// app.use(express.json());

// app.get("/api/health", (req, res) => {
//     res.status(200).json({
//         message: "BabyNutri API is running",
//     });
// });

// app.use("/api/auth", authRoutes);
// app.use("/api/recipes", recipeRoutes);
// app.use("/api/articles", articleRoutes);
// app.use("/api/parent", parentRoute);
// app.listen(process.env.PORT, () => {
//     console.log(
//         `Server running on port ${process.env.PORT}`
//     );
// });


// @ts-nocheck
require('dotenv').config();

const express = require('express');
const cors = require('cors');

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

const app = express();

app.use(cors());

app.use(express.json({
    limit: '2mb',
}));

app.use(express.urlencoded({
    extended: true,
}));

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

const port = Number(process.env.PORT || 3000);

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