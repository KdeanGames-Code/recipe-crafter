const express = require("express");
const cors = require("cors");
const app = express();

const recipesRouter = require("./routes/recipes");
const mealPlansRouter = require("./routes/mealPlans");
const shoppingListRouter = require("./routes/shoppingList");

app.use(cors());
app.use(express.json());

app.use("/api/recipes", recipesRouter);
app.use("/api/meal-plans", mealPlansRouter);
app.use("/api/shopping-list", shoppingListRouter);

app.get("/", (req, res) => res.send("Recipe Crafter API"));

app.listen(3000, () => console.log("Server running on port 3000"));
