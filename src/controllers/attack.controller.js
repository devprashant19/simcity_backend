const User = require("../models/User");
const mongoose = require("mongoose");

exports.attackUser = async (req, res) => {
    try {
        const attackerId = req.user.id;
        const { defenderId } = req.body;

        if (!defenderId || !mongoose.Types.ObjectId.isValid(defenderId)) {
            return res.status(400).json({ message: "Invalid target ID format" });
        }

        const attacker = await User.findById(attackerId);
        const defender = await User.findById(defenderId);

        if (!attacker) return res.status(404).json({ message: "Attacker not found" });
        if (!defender) return res.status(404).json({ message: "Defender not found" });

        if (attackerId.toString() === defenderId.toString()) {
            return res.status(400).json({ message: "You cannot attack yourself!" });
        }

        // Initialize if undefined
        if (attacker.attacksLeft === undefined) attacker.attacksLeft = 5;

        // check attacks left
        if (attacker.attacksLeft <= 0) {
            return res.status(400).json({ message: "No attacks remaining!" });
        }

        // Check Military Requirements
        if (attacker.power.military < 10) {
            return res.status(400).json({ message: "You need at least 10 Military power to launch an attack!" });
        }

        // Combat Logic
        // Attacker Costs/Rewards
        attacker.power.military -= 5;
        attacker.power.economy += 8;
        attacker.attacksLeft -= 1; // Decrement limit

        // Defender Penalties
        defender.power.economy -= 3;
        defender.power.health -= 2;
        defender.power.military -= 3;
        defender.power.infrastructure -= 4;

        // Boundary Checks (Min 0)
        if (defender.power.economy < 0) defender.power.economy = 0;
        if (defender.power.health < 0) defender.power.health = 0;
        if (defender.power.military < 0) defender.power.military = 0;
        if (defender.power.infrastructure < 0) defender.power.infrastructure = 0;

        await attacker.save();
        await defender.save();

        res.json({
            message: `Strike successful! You raided ${defender.username}. [${attacker.attacksLeft} Attacks Left]`,
            attackerStats: attacker.power,
            attacksLeft: attacker.attacksLeft,
            targetUsername: defender.username
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
