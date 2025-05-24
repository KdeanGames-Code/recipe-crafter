const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", async (req, res) => {
    try {
        const [results] = await db.query("SELECT * FROM shopping_lists");
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post("/", async (req, res) => {
    const { item_name, quantity, allergens, user_id } = req.body;
    try {
        const [result] = await db.query(
            "INSERT INTO shopping_lists (item_name, quantity, allergens, user_id) VALUES (?, ?, ?, ?)",
            [item_name, quantity, JSON.stringify(allergens), user_id]
        );
        res.status(201).json({ id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
