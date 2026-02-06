const Game = require("../models/Game");
const User = require("../models/User");
const fs = require('fs');
const path = require('path');

// Helper to load faction data
const loadFactionData = (faction) => {
    try {
        const filePath = path.join(__dirname, '../data', `${faction.toLowerCase()}.json`);
        // Handle "dwarves" vs "dwarfs" filename mismatch if any, but assuming dwarfs.json based on previous context
        if (!fs.existsSync(filePath)) {
            // Fallback for pluralization check
            const altPath = path.join(__dirname, '../data', `${faction.toLowerCase().replace('ves', 'fs')}.json`);
            if (fs.existsSync(altPath)) return JSON.parse(fs.readFileSync(altPath, 'utf8'));
            return null;
        }
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (err) {
        console.error("Error loading faction data:", err);
        return null;
    }
};

exports.getGame = async (req, res) => {
    // Deprecated or keep for "Global" game settings if needed
    try {
        const game = await Game.findOne().sort({ createdAt: -1 });
        if (!game) return res.status(404).json({ message: "No game data found" });
        res.json(game);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getCurrentQuestion = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (!user.faction) return res.status(400).json({ message: "No faction selected" });

        const data = loadFactionData(user.faction);
        if (!data) return res.status(500).json({ message: "Faction data not found" });

        const questionId = user.currentQuestion || data.startQid;
        const question = data.questions[questionId];

        if (!question) {
            return res.status(404).json({ message: "Question not found", qid: questionId });
        }

        // SECURITY: Strip sensitive data (nextQid, correctAnswer)
        const safeQuestion = {
            qid: question.qid,
            type: question.type,
            text: question.text,
            options: question.options ? question.options.map(opt => ({
                text: opt.text,
                // We DO NOT send effects here to prevent spoiling outcomes before choice
                // Only if UI absolutely needs it for "preview" on hover, but user wanted "secure".
                // We will rely on server to return effects AFTER submission.
            })) : undefined
        };

        res.json(safeQuestion);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.submitAnswer = async (req, res) => {
    try {
        const userId = req.user.id;
        const { answer } = req.body; // answer can be index (for decision) or string (for input)

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        const data = loadFactionData(user.faction);
        if (!data) return res.status(500).json({ message: "Faction data not found" });

        const currentQid = user.currentQuestion || data.startQid;
        const question = data.questions[currentQid];

        if (!question) return res.status(404).json({ message: "Current question invalid" });

        let effects = {};
        let nextQid = null;
        let message = "Answer recorded";

        // LOGIC: Validate and Process Answer
        if (question.type === 'decision') {
            const selectedOption = question.options[answer]; // answer is index
            if (!selectedOption) return res.status(400).json({ message: "Invalid option index" });

            effects = selectedOption.effects || {};
            nextQid = selectedOption.nextQid;

            // Handle random nextQid (if it's an array) - logic referenced from frontend
            if (Array.isArray(nextQid)) {
                nextQid = nextQid[Math.floor(Math.random() * nextQid.length)];
            }

        } else if (question.type === 'input') {
            const isCorrect = answer.trim().toLowerCase() === question.correctAnswer.toLowerCase();

            if (isCorrect) {
                effects = question.effects || {};
                nextQid = question.nextQid;
                message = "Correct answer!";
            } else {
                // If wrong, usually stays on same question or penalties?
                // Frontend logic implied loop until correct or specific fail state?
                // Simplest backend logic: Return success=false if strict, 
                // OR return empty effects and keep same QID.
                // Let's assume strict validation:
                return res.json({
                    success: false,
                    message: "Incorrect answer",
                    isCorrect: false
                });
            }
        } else if (question.type === 'outcome') {
            // Outcome usually just auto-transitions or waits for ack
            nextQid = question.nextQid;
        }

        // Apply Effects to User Stats
        const currentPower = user.power || { economy: 10, military: 10, health: 10, infrastructure: 10 };
        const newPower = { ...currentPower };

        Object.keys(effects).forEach(stat => {
            if (newPower[stat] !== undefined) {
                newPower[stat] += effects[stat];
                // Clamp? (Optional, maybe 0-100)
                if (newPower[stat] < 0) newPower[stat] = 0;
            }
        });

        // Update User
        user.power = newPower;
        if (nextQid) {
            user.currentQuestion = nextQid;

            // Check if End of Game
            if (nextQid === 'END' || (data.questions[nextQid] && data.questions[nextQid].isEnd)) {
                // Handle End Game Logic if needed
            }
        }

        await user.save();

        res.json({
            success: true,
            isCorrect: true,
            effects: effects,
            nextQid: nextQid,
            newPower: newPower,
            message: message
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.seedGame = async (req, res) => {
    // ... existing seed logic if needed or deprecated
    try {
        // Just return success for now as we use file-based
        res.json({ message: "Seeding not required with file-based system" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateProgress = async (req, res) => {
    // Reverted to simple update if needed manual override, but submitAnswer should handle it
    try {
        const userId = req.user.id;
        const { faction, currentQuestion } = req.body;
        const user = await User.findById(userId);
        if (faction) user.faction = faction;
        if (currentQuestion) user.currentQuestion = currentQuestion;
        await user.save();
        res.json({ message: "Progress updated manually" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
