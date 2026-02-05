const Game = require("../models/Game");
const User = require("../models/User");

exports.getGame = async (req, res) => {
    try {
        // Fetch the latest game version (or specific one if needed)
        // For now, just get the most recently created one
        const game = await Game.findOne().sort({ createdAt: -1 });

        if (!game) {
            return res.status(404).json({ message: "No game data found" });
        }

        res.json(game);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.seedGame = async (req, res) => {
    try {
        const { startQid, questions } = req.body;

        if (!startQid || !questions) {
            return res.status(400).json({ message: "Missing startQid or questions" });
        }

        // Create new game instance
        const game = await Game.create({
            startQid,
            questions
        });

        res.status(201).json({
            message: "Game seeded successfully",
            game
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateProgress = async (req, res) => {
    try {
        const userId = req.user.id;
        const { faction, currentQuestion } = req.body;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (faction) user.faction = faction;
        if (currentQuestion) user.currentQuestion = currentQuestion;

        await user.save();

        res.json({
            message: "Progress saved",
            faction: user.faction,
            currentQuestion: user.currentQuestion
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
