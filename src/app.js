const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const pointRoutes = require("./routes/point.routes");
const leaderboardRoutes = require("./routes/leaderboard.routes");



const battleRoutes = require("./routes/battle.routes");
const adminRoutes = require("./routes/admin.routes");



const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/point", pointRoutes);
app.use("/api/game", require("./routes/game.routes"));
app.use("/api/attack", require("./routes/attack.routes"));
app.use("/api/war", require("./routes/war.routes"));
app.use("/api/battle", battleRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/advisor", require("./routes/advisor.routes"));

module.exports = app;
