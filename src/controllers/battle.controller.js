const Battle = require("../models/Battle");
const User = require("../models/User");

// ATTACK
exports.attack = async (req, res) => {
  const attackerId = req.user.id;
  const { defenderId } = req.body;

  const attacker = await User.findById(attackerId);
  const defender = await User.findById(defenderId);

  if (!attacker || !defender)
    return res.status(404).json({ message: "User not found" });

  if (attacker.power.military <= 0)
    return res.status(400).json({ message: "No military power to attack" });

  const battle = await Battle.create({
    attacker: attackerId,
    defender: defenderId,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000)
  });

  res.json({
    message: "Attack initiated. Defender has 5 minutes to seek help.",
    battleId: battle._id
  });
};

// ACCEPT HELP
// exports.acceptHelp = async (req, res) => {
//   const helperId = req.user.id;
//   const { battleId } = req.body;

//   const battle = await Battle.findById(battleId);

//   if (!battle || battle.status !== "pending")
//     return res.status(400).json({ message: "Battle not active" });

//   if (Date.now() > battle.expiresAt)
//     return res.status(400).json({ message: "Help window expired" });

//   if (battle.helpers.includes(helperId))
//     return res.status(400).json({ message: "Already helping" });

//   battle.helpers.push(helperId);
//   await battle.save();

//   res.json({ message: "Help accepted" });
// };
exports.acceptHelp = async (req, res) => {
  const helperId = req.user.id;
  const { battleId } = req.body;

  const battle = await Battle.findById(battleId);

  if (!battle || battle.status !== "pending") {
    return res.status(400).json({ message: "Battle not active" });
  }

  const request = battle.helpRequests.find(
    r => r.to.toString() === helperId && r.status === "pending"
  );

  if (!request) {
    return res.status(403).json({
      message: "No help request for you"
    });
  }

  if (Date.now() > battle.expiresAt) {
    request.status = "expired";
    await battle.save();
    return res.status(400).json({ message: "Help window expired" });
  }

  battle.helpers.push(helperId);
  request.status = "accepted";

  await battle.save();

  res.json({ message: "Help accepted" });
};

// RESOLVE BATTLE
// RESOLVE BATTLE (FINAL + RESULT INCLUDED)
exports.resolveBattle = async (req, res) => {
  const { battleId } = req.body;

  const battle = await Battle.findById(battleId)
    .populate("attacker defender helpers");

  if (!battle || battle.status === "resolved")
    return res.status(400).json({ message: "Invalid battle" });

  const attacker = battle.attacker;
  const defender = battle.defender;
  const helpers = battle.helpers;

  const combinedDefenderPower =
    defender.power.military +
    helpers.reduce((s, h) => s + h.power.military, 0);

  const reduce30 = (u, full = true) => {
    u.power.military = Math.floor(u.power.military * 0.7);
    if (full) {
      u.power.health = Math.floor(u.power.health * 0.7);
      u.power.infrastructure = Math.floor(u.power.infrastructure * 0.7);
    }
  };

  let winner = "";
  let loser = "";

  // 🟩 DEFENDER WINS (GREATER OR EQUAL)
  if (combinedDefenderPower >= attacker.power.military) {
    reduce30(attacker);
    await attacker.save();

    winner = defender.username;
    loser = attacker.username;
  }
  // 🟥 ATTACKER WINS
  else {
    reduce30(defender, false);
    await defender.save();

    for (const h of helpers) {
      reduce30(h, false);
      await h.save();
    }

    winner = attacker.username;
    loser = defender.username;
  }

  battle.status = "resolved";
  await battle.save();

  // 🔥 FINAL RESULT RESPONSE
  res.json({
    message: "Battle resolved",
    winner,
    loser,
    attacker: {
      username: attacker.username,
      power: attacker.power
    },
    defender: {
      username: defender.username,
      power: defender.power
    },
    helpers: helpers.map(h => ({
      username: h.username,
      power: h.power
    }))
  });
};

// GET LIVE BATTLE STATUS
exports.getBattleStatus = async (req, res) => {
  const { battleId } = req.params;

  const battle = await Battle.findById(battleId)
    .populate("attacker", "username power.military")
    .populate("defender", "username power.military")
    .populate("helpers", "username power.military");

  if (!battle) {
    return res.status(404).json({ message: "Battle not found" });
  }

  const now = Date.now();
  const timeLeftMs = Math.max(0, battle.expiresAt - now);
  const timeLeftSeconds = Math.floor(timeLeftMs / 1000);

  const helpersTotalMilitary = battle.helpers.reduce(
    (sum, h) => sum + h.power.military,
    0
  );

  res.json({
    battleId: battle._id,
    status: battle.status,

    timeLeftSeconds,

    attacker: {
      username: battle.attacker.username,
      military: battle.attacker.power.military
    },

    defender: {
      username: battle.defender.username,
      military: battle.defender.power.military
    },

    helpers: battle.helpers.map(h => ({
      username: h.username,
      military: h.power.military
    })),

    combinedDefenderMilitary:
      battle.defender.power.military + helpersTotalMilitary
  });
};
