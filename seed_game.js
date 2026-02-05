const fs = require('fs');
const path = require('path');

const questionsPath = 'e:/simcity/frontend_simcity/src/data/questions.json';

async function seed() {
    try {
        if (!fs.existsSync(questionsPath)) {
            console.error("Questions file not found at:", questionsPath);
            return;
        }

        const data = fs.readFileSync(questionsPath, 'utf8');
        const jsonData = JSON.parse(data);

        console.log("Seeding game data...");

        const response = await fetch('http://127.0.0.1:5000/api/game/seed', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(jsonData)
        });

        const result = await response.json();
        console.log("Seed result:", result);

        if (response.ok) {
            console.log("SUCCESS: Game seeded.");
        } else {
            console.error("FAILED to seed game.");
        }

    } catch (err) {
        console.error("Error seeding game:", err);
    }
}

seed();
