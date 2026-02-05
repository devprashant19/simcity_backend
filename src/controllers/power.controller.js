const User = require("../models/User");

const COST = {
  military: 5,
  infrastructure: 5,
  health: 5
};

exports.upgradePower = async (req, res) => {
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
  user.power.economy -=
    militaryGain * COST.military +
    infraGain * COST.infrastructure +
    healthGain * COST.health;

  user.power.military += militaryGain;
  user.power.infrastructure += infraGain;
  user.power.health += healthGain;

  await user.save();

  res.json({
    message: "Power upgraded successfully",
    spentEconomy:
      militaryGain * COST.military +
      infraGain * COST.infrastructure +
      healthGain * COST.health,
    gained: {
      military: militaryGain,
      infrastructure: infraGain,
      health: healthGain
    },
    power: user.power
  });
};
