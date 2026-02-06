const WarState = require("../models/WarState");

exports.getWarStatus = async (req, res) => {
    try {
        let war = await WarState.findOne();
        if (!war) {
            // Create default if not exists
            war = await WarState.create({ warEnabled: false });
        }
        res.json({
            warEnabled: war.warEnabled
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.setWarStatus = async (req, res) => {
    try {
        const { enabled } = req.body;
        let war = await WarState.findOne();
        if (!war) {
            war = await WarState.create({ warEnabled: false });
        }

        if (typeof enabled === 'boolean') {
            war.warEnabled = enabled;
            await war.save();
        }

        res.json({
            message: `War Zone is now ${war.warEnabled ? 'ACTIVE' : 'INACTIVE'}`,
            warEnabled: war.warEnabled
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
