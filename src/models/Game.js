const mongoose = require("mongoose");

/* =======================
   EFFECTS (4 STATS ONLY)
======================= */
const EffectsSchema = new mongoose.Schema(
    {
        economy: { type: Number, default: 0 },
        health: { type: Number, default: 0 },
        military: { type: Number, default: 0 },
        infrastructure: { type: Number, default: 0 }
    },
    { _id: false }
);

/* =======================
   OPTION (DECISION ONLY)
======================= */
const OptionSchema = new mongoose.Schema(
    {
        text: { type: String, required: true },
        effects: { type: EffectsSchema, default: () => ({}) },
        nextQid: { type: String, required: true }
    },
    { _id: false }
);

/* =======================
   QUESTION
======================= */
const QuestionSchema = new mongoose.Schema(
    {
        qid: { type: String, required: true },

        type: {
            type: String,
            enum: ["decision", "input"],
            required: true
        },

        text: { type: String, required: true },

        /* ---- INPUT ONLY ---- */
        correctAnswer: { type: String },

        /* ---- DECISION ONLY ---- */
        options: {
            type: [OptionSchema],
            validate: {
                validator: function (v) {
                    if (this.type === "decision") {
                        return Array.isArray(v) && v.length > 0;
                    }
                    return true;
                },
                message: "Decision questions must have options"
            }
        },

        /* ---- SHARED ---- */
        effects: { type: EffectsSchema, default: () => ({}) },

        // Forces linear progression
        nextQid: {
            type: String,
            validate: {
                validator: function (v) {
                    if (this.type === "input") return typeof v === "string";
                    return true;
                },
                message: "Input questions must define nextQid"
            }
        },

        /* ---- END ---- */
        isEnd: { type: Boolean, default: false },
        endType: {
            type: String,
            enum: ["success", "failure"],
            required: function () {
                return this.isEnd === true;
            }
        }
    },
    { _id: false }
);

/* =======================
   GAME (ROOT)
======================= */
const GameSchema = new mongoose.Schema(
    {
        version: { type: String, default: "1.0" },

        startQid: {
            type: String,
            required: true
        },

        // Keyed by qid for O(1) access
        questions: {
            type: Map,
            of: QuestionSchema,
            required: true
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Game", GameSchema);
