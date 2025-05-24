const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", async (req, res) => {
    try {
        const [results] = await db.query("SELECT * FROM recipes");
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/:id/ingredients", async (req, res) => {
    const { id } = req.params;
    try {
        const [results] = await db.query(
            "SELECT * FROM ingredients WHERE recipe_id = ?",
            [id]
        );
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
