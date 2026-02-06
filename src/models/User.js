const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firebaseUid: { type: String, unique: true, required: true },
    username: { type: String, unique: true, required: true },
    email: { type: String, required: true },

    role: {
      type: String,
      enum: ["admin", "player"],
      default: "player"
    },

    password: { type: String, required: true },

    power: {
      economy: { type: Number, default: 10 },
      military: { type: Number, default: 10 },
      health: { type: Number, default: 10 },
      infrastructure: { type: Number, default: 10 }
    },

    // New Fields for Persistence
    faction: {
      type: String,
      enum: ["Ninja", "Dwarfs", "Elves"],
      default: null
    },

    currentQuestion: { type: String, default: null },

    attacksLeft: { type: Number, default: 5 },
    helpLeft: { type: Number, default: 5 },

    finished: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
