const express = require("express");
const db = require("./db");
const cors = require("cors"); // Add this
const app = express();

app.use(express.json());
app.use(cors()); // Add this to enable CORS

app.get("/api/recipes", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM recipes");
        res.json(rows);
    } catch (err) {
        console.error("Error in /api/recipes:", err);
        res.status(500).json({ error: err.message });
    }
});

app.get("/api/meal-plans", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM meal_plans");
        res.json(rows);
    } catch (err) {
        console.error("Error in /api/meal-plans:", err);
        res.status(500).json({ error: err.message });
    }
});

app.get("/api/shopping-list", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM shopping_lists");
        res.json(rows);
    } catch (err) {
        console.error("Error in /api/shopping-list:", err);
        res.status(500).json({ error: err.message });
    }
});

app.get("/api/tags", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM user_tags");
        res.json(rows);
    } catch (err) {
        console.error("Error in /api/tags:", err);
        res.status(500).json({ error: err.message });
    }
});

app.get("/api/favorites", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM recipe_favorites");
        res.json(rows);
    } catch (err) {
        console.error("Error in /api/favorites:", err);
        res.status(500).json({ error: err.message });
    }
});

app.get("/api/recipe-tags/:recipeId", async (req, res) => {
    try {
        const recipeId = req.params.recipeId;
        const [rows] = await db.query("SELECT GetRecipeTags(?) AS tags", [
            recipeId,
        ]);
        const tagsString = rows[0].tags || "";
        const tags = tagsString
            ? tagsString.split(",").map((tag) => {
                  const [tag_type, tag_name] = tag.split(":");
                  return { tag_type, tag_name };
              })
            : [];
        res.json(tags);
    } catch (err) {
        console.error("Error in /api/recipe-tags:", err);
        res.status(500).json({ error: err.message });
    }
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});
