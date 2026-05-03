const User = require("../models/User");

const COST = {
  military: 1,
  infrastructure: 1,
  health: 1
};

/**
 * Directly update user power stats (Admin or special use)
 */
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

/**
 * Upgrade power by spending economy
 */
exports.upgradePower = async (req, res) => {
  try {
    const userId = req.user.id;
    const { military = 0, infrastructure = 0, health = 0 } = req.body;

    const totalSpend = military + infrastructure + health;

    if (totalSpend <= 0) {
      return res.status(400).json({ message: "Nothing to upgrade" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.power.economy < totalSpend) {
      return res.status(400).json({
        message: "Not enough economy",
        required: totalSpend,
        available: user.power.economy
      });
    }

    // calculate gains
    const militaryGain = Math.floor(military / COST.military);
    const infraGain = Math.floor(infrastructure / COST.infrastructure);
    const healthGain = Math.floor(health / COST.health);

    if (militaryGain <= 0 && infraGain <= 0 && healthGain <= 0) {
      return res.status(400).json({ message: "Insufficient economy for upgrades" });
    }

    // apply updates
    const actualSpend = (militaryGain * COST.military) + (infraGain * COST.infrastructure) + (healthGain * COST.health);
    
    user.power.economy -= actualSpend;
    user.power.military += militaryGain;
    user.power.infrastructure += infraGain;
    user.power.health += healthGain;

    await user.save();

    res.json({
      message: "Power upgraded successfully",
      spentEconomy: actualSpend,
      gained: {
        military: militaryGain,
        infrastructure: infraGain,
        health: healthGain
      },
      power: user.power
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Send aid to another user
 */
exports.sendAid = async (req, res) => {
  try {
    const userId = req.user.id;
    const { targetId } = req.body;

    if (!targetId) return res.status(400).json({ message: "Target required" });
    if (userId === targetId) return res.status(400).json({ message: "Cannot aid yourself" });

    const user = await User.findById(userId);
    const target = await User.findById(targetId);

    if (!user || !target) return res.status(404).json({ message: "User not found" });

    // Initialize if undefined
    if (user.helpLeft === undefined) user.helpLeft = 5;

    if (user.helpLeft <= 0) {
      return res.status(400).json({ message: "No aid packages remaining!" });
    }

    // Cost Config
    const AID_COST = 2; // Economy
    const AID_GAIN = 8; // Economy (Boosted!)

    if (user.power.economy < AID_COST) {
      return res.status(400).json({ message: "Insufficient funds", required: AID_COST });
    }

    // Transaction
    user.power.economy -= AID_COST;
    user.helpLeft -= 1; // Decrement limit
    target.power.economy += AID_GAIN;

    await user.save();
    await target.save();

    res.json({
      message: `Aid sent to ${target.username}. [${user.helpLeft} Left]`,
      attackerStats: user.power, // Return updated stats for sender
      helpLeft: user.helpLeft,
      targetStats: target.power
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
