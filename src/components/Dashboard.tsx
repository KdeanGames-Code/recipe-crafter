import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

interface MealPlan {
    id: number;
    date: string;
    meal_type: string;
    recipe_id: number;
    servings: number;
    user_id: number;
}

interface Recipe {
    id: number;
    title: string;
    description?: string;
    average_rating: number;
    cuisine: string;
    dish_type: string;
}

interface ShoppingListItem {
    item_name: string;
}

interface Favorite {
    user_id: number;
    recipe_id: number;
}

const Dashboard = () => {
    const [todaysMeal, setTodaysMeal] = useState<MealPlan | null>(null);
    const [neededToday, setNeededToday] = useState<ShoppingListItem[]>([]);
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [favorites, setFavorites] = useState<number[]>([]);
    const userId = 1;

    useEffect(() => {
        axios
            .get("http://127.0.0.1:3000/api/meal-plans")
            .then((response) => {
                console.log("Meal Plans:", response.data);
                const today = "2025-05-24";
                const meal = response.data.find((m: MealPlan) => {
                    const mealDate = new Date(m.date)
                        .toISOString()
                        .split("T")[0];
                    return mealDate === today;
                });
                setTodaysMeal(meal || null);
            })
            .catch((error) =>
                console.error("Error fetching meal plans:", error)
            );

        axios
            .get("http://127.0.0.1:3000/api/shopping-list")
            .then((response) => {
                console.log("Shopping List:", response.data);
                setNeededToday(response.data);
            })
            .catch((error) =>
                console.error("Error fetching shopping list:", error)
            );

        axios
            .get("http://127.0.0.1:3000/api/recipes")
            .then((response) => {
                console.log("Recipes:", response.data);
                setRecipes(response.data);
            })
            .catch((error) => console.error("Error fetching recipes:", error));

        axios
            .get("http://127.0.0.1:3000/api/meal-plans")
            .then((response) => {
                console.log("Favorites:", response.data);
                const userFavorites = response.data
                    .filter((fav: Favorite) => fav.user_id === userId)
                    .map((fav: Favorite) => fav.recipe_id);
                setFavorites(userFavorites);
            })
            .catch((error) =>
                console.error("Error fetching favorites:", error)
            );
    }, []);

    const allergens: string[] = [];
    const dietary: string[] = [];

    const toggleFavorite = (recipeId: number) => {
        if (favorites.includes(recipeId)) {
            setFavorites(favorites.filter((id) => id !== recipeId));
            axios
                .delete(
                    `http://127.0.0.1:3000/api/favorites/${userId}/${recipeId}`
                )
                .catch((error) =>
                    console.error("Error removing favorite:", error)
                );
        } else {
            setFavorites([...favorites, recipeId]);
            axios
                .post("http://127.0.0.1:3000/api/favorites", {
                    user_id: userId,
                    recipe_id: recipeId,
                })
                .catch((error) =>
                    console.error("Error adding favorite:", error)
                );
        }
    };

    return (
        <div className="p-6 min-h-screen">
            <h1 className="text-4xl font-bold mb-6 text-center">
                Recipe Crafter Dashboard
            </h1>
            <div className="space-y-6">
                {/* Today's Meal */}
                <div>
                    <h2 className="text-xl font-semibold mb-2">Today's Meal</h2>
                    <div className="card p-4 rounded shadow hover:shadow-xl transition-shadow duration-300">
                        {todaysMeal ? (
                            <>
                                <p className="text-gray-200">
                                    {recipes.find(
                                        (r) => r.id === todaysMeal.recipe_id
                                    )?.title || "Unknown Recipe"}{" "}
                                    ({todaysMeal.servings} servings)
                                </p>
                                <p className="text-sm text-gray-400 italic mt-1">
                                    Cuisine:{" "}
                                    {recipes.find(
                                        (r) => r.id === todaysMeal.recipe_id
                                    )?.cuisine || "N/A"}
                                </p>
                                <p className="text-sm text-gray-400 italic mt-1">
                                    Dish Type:{" "}
                                    {recipes.find(
                                        (r) => r.id === todaysMeal.recipe_id
                                    )?.dish_type || "N/A"}
                                </p>
                                <div className="flex space-x-2 mt-2">
                                    <span
                                        className={`badge px-2 py-1 rounded-full text-sm ${
                                            allergens.length === 0
                                                ? "bg-green-500"
                                                : "bg-red-500"
                                        } text-white`}
                                    >
                                        {allergens.length === 0
                                            ? "No Allergens"
                                            : allergens.join(", ")}
                                    </span>
                                    <span
                                        className={`badge px-2 py-1 rounded-full text-sm ${
                                            dietary.length === 0
                                                ? "bg-green-500"
                                                : "bg-blue-500"
                                        } text-white`}
                                    >
                                        {dietary.length === 0
                                            ? "No Dietary Restrictions"
                                            : dietary.join(", ")}
                                    </span>
                                </div>
                                <div className="flex space-x-1 mt-2">
                                    {[...Array(5)].map((_, i) => (
                                        <i
                                            key={i}
                                            className={`fas fa-star ${
                                                i <
                                                Math.round(
                                                    recipes.find(
                                                        (r) =>
                                                            r.id ===
                                                            todaysMeal.recipe_id
                                                    )?.average_rating || 0
                                                )
                                                    ? "text-yellow-500"
                                                    : "text-gray-400"
                                            }`}
                                        ></i>
                                    ))}
                                </div>
                                <button
                                    onClick={() =>
                                        toggleFavorite(todaysMeal.recipe_id)
                                    }
                                    className="mt-2 text-sm"
                                >
                                    <i
                                        className={`fas fa-heart ${
                                            favorites.includes(
                                                todaysMeal.recipe_id
                                            )
                                                ? "text-red-500"
                                                : "text-gray-400"
                                        } text-sm`}
                                    ></i>
                                </button>
                            </>
                        ) : (
                            <p className="text-gray-200">
                                No meal planned for today.
                            </p>
                        )}
                    </div>
                </div>
                {/* Shopping List for Today */}
                <div>
                    <h2 className="text-xl font-semibold mb-2">
                        Shopping List for Today
                    </h2>
                    <div className="card p-4 rounded shadow hover:shadow-xl transition-shadow duration-300">
                        {neededToday.length > 0 ? (
                            <>
                                <ul className="space-y-2 text-gray-200">
                                    {neededToday.map((item, index) => (
                                        <li key={index}>{item.item_name}</li>
                                    ))}
                                </ul>
                                <p className="text-sm mt-2">
                                    See full list in{" "}
                                    <Link
                                        to="/shopping-list"
                                        className="underline"
                                    >
                                        Shopping List
                                    </Link>
                                </p>
                            </>
                        ) : (
                            <p className="text-gray-200">
                                No items needed today.
                            </p>
                        )}
                    </div>
                </div>
                {/* Your Recipes */}
                <div>
                    <h2 className="text-xl font-semibold mb-2">Your Recipes</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {recipes.map((recipe) => (
                            <div
                                key={recipe.id}
                                className="card p-4 rounded shadow hover:shadow-xl transition-shadow duration-300"
                            >
                                <h3 className="text-lg font-semibold text-white">
                                    {recipe.title}
                                </h3>
                                <p className="text-sm text-gray-400">
                                    {recipe.description ||
                                        "Beef, tomatoes, pasta"}
                                </p>
                                <p className="text-sm text-gray-400 italic mt-1">
                                    Cuisine: {recipe.cuisine || "N/A"}
                                </p>
                                <p className="text-sm text-gray-400 italic mt-1">
                                    Dish Type: {recipe.dish_type || "N/A"}
                                </p>
                                <div className="flex space-x-2 mt-2">
                                    <span
                                        className={`badge px-2 py-1 rounded-full text-sm ${
                                            allergens.length === 0
                                                ? "bg-green-500"
                                                : "bg-red-500"
                                        } text-white`}
                                    >
                                        {allergens.length === 0
                                            ? "No Allergens"
                                            : allergens.join(", ")}
                                    </span>
                                    <span
                                        className={`badge px-2 py-1 rounded-full text-sm ${
                                            dietary.length === 0
                                                ? "bg-green-500"
                                                : "bg-blue-500"
                                        } text-white`}
                                    >
                                        {dietary.length === 0
                                            ? "No Dietary Restrictions"
                                            : dietary.join(", ")}
                                    </span>
                                </div>
                                <div className="flex space-x-1 mt-2">
                                    {[...Array(5)].map((_, i) => (
                                        <i
                                            key={i}
                                            className={`fas fa-star ${
                                                i <
                                                Math.round(
                                                    recipe.average_rating
                                                )
                                                    ? "text-yellow-500"
                                                    : "text-gray-400"
                                            }`}
                                        ></i>
                                    ))}
                                </div>
                                <button
                                    onClick={() => toggleFavorite(recipe.id)}
                                    className="mt-2 text-sm"
                                >
                                    <i
                                        className={`fas fa-heart ${
                                            favorites.includes(recipe.id)
                                                ? "text-red-500"
                                                : "text-gray-400"
                                        } text-sm`}
                                    ></i>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
                {/* Favorites */}
                <div>
                    <h2 className="text-xl font-semibold mb-2">Favorites</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {recipes
                            .filter((recipe) => favorites.includes(recipe.id))
                            .map((recipe) => (
                                <div
                                    key={recipe.id}
                                    className="card p-4 rounded shadow hover:shadow-xl transition-shadow duration-300"
                                >
                                    <h3 className="text-lg font-semibold text-white">
                                        {recipe.title}
                                    </h3>
                                    <p className="text-sm text-gray-400">
                                        {recipe.description ||
                                            "Cocoa, sugar, flour"}
                                    </p>
                                    <p className="text-sm text-gray-400 italic mt-1">
                                        Cuisine: {recipe.cuisine || "N/A"}
                                    </p>
                                    <p className="text-sm text-gray-400 italic mt-1">
                                        Dish Type: {recipe.dish_type || "N/A"}
                                    </p>
                                    <div className="flex space-x-2 mt-2">
                                        <span
                                            className={`badge px-2 py-1 rounded-full text-sm ${
                                                allergens.length === 0
                                                    ? "bg-green-500"
                                                    : "bg-red-500"
                                            } text-white`}
                                        >
                                            {allergens.length === 0
                                                ? "No Allergens"
                                                : allergens.join(", ")}
                                        </span>
                                        <span
                                            className={`badge px-2 py-1 rounded-full text-sm ${
                                                dietary.length === 0
                                                    ? "bg-green-500"
                                                    : "bg-blue-500"
                                            } text-white`}
                                        >
                                            {dietary.length === 0
                                                ? "No Dietary Restrictions"
                                                : dietary.join(", ")}
                                        </span>
                                    </div>
                                    <div className="flex space-x-1 mt-2">
                                        {[...Array(5)].map((_, i) => (
                                            <i
                                                key={i}
                                                className={`fas fa-star ${
                                                    i <
                                                    Math.round(
                                                        recipe.average_rating
                                                    )
                                                        ? "text-yellow-500"
                                                        : "text-gray-400"
                                                }`}
                                            ></i>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() =>
                                            toggleFavorite(recipe.id)
                                        }
                                        className="mt-2 text-sm"
                                    >
                                        <i
                                            className={`fas fa-heart ${
                                                favorites.includes(recipe.id)
                                                    ? "text-red-500"
                                                    : "text-gray-400"
                                            } text-sm`}
                                        ></i>
                                    </button>
                                </div>
                            ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
