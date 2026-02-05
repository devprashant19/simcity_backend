const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const pointRoutes = require("./routes/point.routes");
const leaderboardRoutes = require("./routes/leaderboard.routes");



const battleRoutes = require("./routes/battle.routes");
const adminRoutes = require("./routes/admin.routes");
const powerRoutes = require("./routes/power.routes");



const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/point", pointRoutes);
app.use("/api/power", powerRoutes);

app.use("/api/battle", battleRoutes);
app.use("/api/admin", adminRoutes);

module.exports = app;
