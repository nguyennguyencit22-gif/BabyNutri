require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const recipeRoutes = require("./routes/recipeRoutes");
const articleRoutes = require("./routes/articleRoutes");
const parentRoute = require("./routes/parentRoute");
const childRoutes = require("./routes/childRoutes");
const mealPlanRoutes = require("./routes/mealPlanRoutes");
const questionRoutes = require("./routes/questionRoutes");
const app = express();

app.use(cors());
app.use(express.json());
app.use("/images", express.static(path.join(__dirname, "../public/public/images")));

app.get("/api/health", (req, res) => {
    res.status(200).json({
        message: "BabyNutri API is running",
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/parent", parentRoute);
app.use("/api/children", childRoutes);
app.use("/api/mealplans", mealPlanRoutes);
app.use("/api/questions", questionRoutes);
app.listen(process.env.PORT, () => {
    console.log(
        `Server running on port ${process.env.PORT}`
    );
});
// Nodemon reload trigger
