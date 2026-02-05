const User = require("../models/User");

exports.infrastructureLeaderboard = async (req, res) => {
  try {
    const users = await User.find(
      {},
      {
        username: 1,
        power: 1
      }
    ).sort({ "power.infrastructure": -1 });

    let leaderboard = [];
    let rank = 1;
    let prevInfra = null;

    users.forEach((user, index) => {
      const infra = user.power.infrastructure;

      if (infra !== prevInfra) {
        rank = index + 1;
      }

      leaderboard.push({
        rank,
        username: user.username,
        id: user._id,
        economy: user.power.economy,
        military: user.power.military,
        health: user.power.health,
        infrastructure: user.power.infrastructure
      });

      prevInfra = infra;
    });

    res.json({
      totalPlayers: leaderboard.length,
      leaderboard
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
