const mongoose = require("mongoose");

const battleSchema = new mongoose.Schema(
  {
    attacker: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    defender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // Jo log actually help kar rahe hain
    helpers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // 🔥 NEW: Specific help requests
    helpRequests: [
      {
        to: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        status: {
          type: String,
          enum: ["pending", "accepted", "expired"],
          default: "pending"
        }
      }
    ],

    status: {
      type: String,
      enum: ["pending", "resolved"],
      default: "pending"
    },

    expiresAt: Date // now + 5 min
  },
  { timestamps: true }
);

module.exports = mongoose.model("Battle", battleSchema);











// const mongoose = require("mongoose");

// const battleSchema = new mongoose.Schema(
//   {
//     attacker: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//     defender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

//     helpers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

//     status: {
//       type: String,
//       enum: ["pending", "resolved"],
//       default: "pending"
//     },

//     expiresAt: Date // now + 5 min
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Battle", battleSchema);

