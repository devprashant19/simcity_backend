const User = require("../models/User");

exports.infrastructureLeaderboard = async (req, res) => {
  try {
    // 1. Fetch all users
    const users = await User.find(
      {},
      {
        username: 1,
        power: 1
      }
    );

    // 2. Calculate Total Power & Sort in JS (easier than Aggregate for simple summation)
    const sortedUsers = users.map(user => {
      const power = user.power || {};
      const totalPower =
        (power.economy || 0) +
        (power.military || 0) +
        (power.health || 0) +
        (power.infrastructure || 0);

      return {
        ...user.toObject(),
        totalPower
      };
    }).sort((a, b) => b.totalPower - a.totalPower);

    let leaderboard = [];
    let rank = 1;
    let prevPower = null;

    sortedUsers.forEach((user, index) => {

      if (user.totalPower !== prevPower) {
        rank = index + 1;
      }

      leaderboard.push({
        rank,
        username: user.username,
        id: user._id,
        economy: user.power.economy,
        military: user.power.military,
        health: user.power.health,
        infrastructure: user.power.infrastructure,
        totalPower: user.totalPower
      });

      prevPower = user.totalPower;
    });

    res.json({
      totalPlayers: leaderboard.length,
      leaderboard
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
