const express = require("express");

module.exports = function CreditsHandling(db) {
    const router = express.Router();

    // ✅ Fetch credits by email
    router.post("/get-credits", async (req, res) => {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        try {
            const [rows] = await db.query("SELECT credits FROM users WHERE email = ?", [email]);

            if (!rows || rows.length === 0) {
                return res.status(404).json({ message: "User not found" });
            }

            // return res.json({ email, credits: rows[0].credits });
            return res.json({ email, credits: rows.credits });

        } catch (error) {
            console.error("❌ Error fetching credits:", error);
            return res.status(500).json({ message: "Database error", error: error.message });
        }
    });


    // ✅ Deduct credits after question paper generation
    router.post("/deduct-credits", async (req, res) => {
        try {
            const { email } = req.body;
            if (!email) {
                return res.status(400).json({ message: "Email is required" });
            }

            const creditsToDeduct = 1; // 🔒 always 1 credit, fixed in backend

            // Fetch current credits
            const [rows] = await db.query("SELECT credits FROM users WHERE email = ?", [email]);
            let userRow;
            if (Array.isArray(rows)) {
                if (rows.length === 0) {
                    return res.status(404).json({ message: "User not found" });
                }
                userRow = rows[0];
            } else {
                userRow = rows;
            }

            const currentCredits = Number(userRow.credits);
            if (currentCredits < creditsToDeduct) {
                return res.status(400).json({ message: "Not enough credits" });
            }

            const newCredits = currentCredits - creditsToDeduct;

            // Update credits in DB
            await db.query("UPDATE users SET credits = ? WHERE email = ?", [newCredits, email]);

            return res.json({
                email,
                credits: newCredits,
            });
        } catch (error) {
            console.error("❌ Error deducting credits:", error);
            return res.status(500).json({ message: "Database error", error: error.message });
        }
    });

    console.log("✅ Credits Handling successfully working");

    return router;
};
