import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

interface Recipe {
    id: number;
    title: string;
    description?: string;
    category?: string;
}

const Recipes = () => {
    const [recipes, setRecipes] = useState<Recipe[]>([]);

    useEffect(() => {
        axios
            .get("http://127.0.0.1:3000/api/recipes")
            .then((response) => setRecipes(response.data))
            .catch((error) => console.error("Error fetching recipes:", error));
    }, []);

    return (
        <div className="p-4 bg-gray-800 min-h-screen text-white">
            <h1 className="text-3xl font-bold mb-4">Recipes</h1>
            <select className="mb-4 p-2 bg-gray-700 text-white rounded">
                <option>Select a recipe</option>
                {recipes.map((recipe) => (
                    <option key={recipe.id} value={recipe.id}>
                        {recipe.title}
                    </option>
                ))}
            </select>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {recipes.map((recipe) => (
                    <div
                        key={recipe.id}
                        className="bg-gray-700 p-4 rounded-lg shadow"
                    >
                        <h2 className="text-xl font-semibold">
                            {recipe.title}
                        </h2>
                        <p className="text-gray-300">
                            {recipe.description || "No description"}
                        </p>
                        <p className="text-gray-400 italic">
                            Category: {recipe.category || "N/A"}
                        </p>
                        <Link to="/chef-master">
                            <button className="mt-2 bg-green-500 text-white px-4 py-2 rounded">
                                Start Chef Master
                            </button>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Recipes;
