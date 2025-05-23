import React from "react";
import { Link } from "react-router-dom";

const Recipes = () => {
    const recipes = [
        {
            id: 1,
            title: "Spaghetti Bolognese",
            description: "Classic Italian pasta dish",
        },
        {
            id: 2,
            title: "Chicken Salad",
            description: "Fresh and healthy salad",
        },
    ];

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
                        <p className="text-gray-300">{recipe.description}</p>
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
