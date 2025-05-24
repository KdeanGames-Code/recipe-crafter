const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", async (req, res) => {
    try {
        const [results] = await db.query("SELECT * FROM meal_plans");
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post("/", async (req, res) => {
    const { date, meal_type, recipe_id, servings, user_id } = req.body;
    try {
        const [result] = await db.query(
            "INSERT INTO meal_plans (date, meal_type, recipe_id, servings, user_id) VALUES (?, ?, ?, ?, ?)",
            [date, meal_type, recipe_id, servings, user_id]
        );
        res.status(201).json({ id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
