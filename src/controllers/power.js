const User = require("../models/User");

exports.updatePower = async (req, res) => {
  try {
    const userId = req.user.id;
    const { economy, military, health, infrastructure } = req.body;

    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    if (economy !== undefined) user.power.economy = economy;
    if (military !== undefined) user.power.military = military;
    if (health !== undefined) user.power.health = health;
    if (infrastructure !== undefined) user.power.infrastructure = infrastructure;

    await user.save();

    res.json({
      message: "Power updated",
      power: user.power
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.upgradePower = async (req, res) => {
  try {
    const userId = req.user.id;
    const { military = 0, health = 0, infrastructure = 0 } = req.body;

    // Calculate Total Cost
    // Cost is 5 Economy per 1 Point
    const COST_PER_POINT = 5;
    const totalPointsToBuy = military + health + infrastructure;

    if (totalPointsToBuy <= 0) {
      return res.status(400).json({ message: "No upgrades selected" });
    }

    const totalCost = totalPointsToBuy * COST_PER_POINT;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check Funds
    if (user.power.economy < totalCost) {
      return res.status(400).json({
        message: "Insufficient Economy",
        required: totalCost,
        current: user.power.economy
      });
    }

    // Execute Transaction
    user.power.economy -= totalCost;
    if (military) user.power.military += military;
    if (health) user.power.health += health;
    if (infrastructure) user.power.infrastructure += infrastructure;

    await user.save();

    res.json({
      message: "Power upgraded successfully",
      spentEconomy: totalCost,
      gained: {
        military,
        health,
        infrastructure
      },
      power: user.power
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
