const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

// Initialize the Google Gen AI SDK
// Note: It looks for process.env.GEMINI_API_KEY automatically
const ai = new GoogleGenAI({});

exports.getAdvice = async (req, res) => {
    try {
        const { message, username, faction, power } = req.body;

        if (!message) {
            return res.status(400).json({ message: "Message is required." });
        }

        const playerUsername = username || "Player";
        const playerFaction = faction || "Unaligned";
        const playerPower = power || { economy: 0, military: 0, health: 0, infrastructure: 0 };

        // 2. Construct Prompt Persona
        const systemPrompt = `You are the Royal City Advisor for the player "${playerUsername}" who leads the "${playerFaction}" faction in the game SimCity 2026.
You exist entirely within the game world to give strategic advice. Keep your responses short, punchy (2-3 sentences), engaging, and in character. DO NOT USE MARKDOWN (like **, #, or *).
Here is the current state of the player's city:
- Economy Power: ${playerPower.economy}
- Military Power: ${playerPower.military}
- Health: ${playerPower.health}
- Infrastructure: ${playerPower.infrastructure}

The player asks you: "${message}"

Give them your best strategic advice based on their current stats.`;

        // 3. Call Gemini
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: systemPrompt,
            });

            const advisorMessage = response.text;

            res.json({
                message: advisorMessage
            });
        } catch (aiError) {
            console.error("Gemini API Error:", aiError);
            res.status(500).json({ error: "The Advisor is currently unavailable. Please check your GEMINI_API_KEY." });
        }

    } catch (err) {
        console.error("Advisor Error:", err);
        res.status(500).json({ error: err.message });
    }
};
