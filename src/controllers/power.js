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
