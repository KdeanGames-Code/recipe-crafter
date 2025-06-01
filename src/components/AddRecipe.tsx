import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../config/apiConfig";

interface Tag {
    tag_type: "allergen" | "dietary";
    tag_name: string;
}

interface Recipe {
    id: number;
    title: string;
    description?: string;
    average_rating: number;
    cuisine: string;
    dish_type: string;
    ingredients?: string[];
    instructions?: string;
    image_url?: string;
    image_url_popup?: string;
}

const AddRecipe = () => {
    const { id } = useParams<{ id: string }>(); // Get the recipe ID for editing
    const [allergens, setAllergens] = useState<string[]>([]);
    const [dietaryTags, setDietaryTags] = useState<string[]>([]);
    const [cuisines, setCuisines] = useState<string[]>([]);
    const [dishTypes, setDishTypes] = useState<string[]>([]);
    const [isLoadingTags, setIsLoadingTags] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [recipe, setRecipe] = useState<Recipe | null>(null);

    // Load tags for the tools/options sidebar
    useEffect(() => {
        axios
            .get(`${API_BASE_URL}/tags`)
            .then((response) => {
                const allergenTags = response.data
                    .filter((tag: Tag) => tag.tag_type === "allergen")
                    .map((tag: Tag) => tag.tag_name);
                const dietaryTagsList = response.data
                    .filter((tag: Tag) => tag.tag_type === "dietary")
                    .map((tag: Tag) => tag.tag_name);
                setAllergens(allergenTags);
                setDietaryTags(dietaryTagsList);
                setIsLoadingTags(false);
            })
            .catch((error) => {
                console.error("Error fetching tags:", error);
                setErrorMessage(
                    "Failed to load tag options. Please try again later."
                );
                setAllergens([]);
                setDietaryTags([]);
                setIsLoadingTags(false);
            });

        // Fetch cuisines and dish types (similar to Recipes.tsx)
        axios
            .get(`${API_BASE_URL}/recipes`)
            .then((response) => {
                const uniqueCuisines = [
                    ...new Set(
                        response.data
                            .map((recipe: Recipe) => recipe.cuisine)
                            .filter(Boolean)
                    ),
                ] as string[];
                const uniqueDishTypes = [
                    ...new Set(
                        response.data
                            .map((recipe: Recipe) => recipe.dish_type)
                            .filter(Boolean)
                    ),
                ] as string[];
                setCuisines(uniqueCuisines);
                setDishTypes(uniqueDishTypes);
            })
            .catch((error) => {
                console.error(
                    "Error fetching recipes for cuisines/dish types:",
                    error
                );
                setCuisines([]);
                setDishTypes([]);
            });

        // If editing, fetch the recipe details
        if (id) {
            axios
                .get(`${API_BASE_URL}/recipes/${id}`)
                .then((response) => {
                    setRecipe(response.data);
                })
                .catch((error) => {
                    console.error(`Error fetching recipe ${id}:`, error);
                    setErrorMessage("Failed to load recipe for editing.");
                });
        }
    }, [id]);

    return (
        <div className="p-6 min-h-screen flex">
            {/* Left Column: Tools/Options Sidebar */}
            <div
                className="bg-gray-800 p-4 mr-4"
                style={{ minWidth: "200px", maxWidth: "500px" }}
            >
                <h2 className="text-2xl font-bold text-white mb-4">
                    {id ? "Edit Recipe Options" : "Add/Import Recipe Options"}
                </h2>
                {errorMessage && (
                    <p className="text-red-500 mb-4">{errorMessage}</p>
                )}
                <div className="space-y-4">
                    {isLoadingTags ? (
                        <p className="text-gray-400">Loading options...</p>
                    ) : (
                        <>
                            {/* Example: Cuisine Options */}
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-2">
                                    Cuisines
                                </h3>
                                <select className="p-3 bg-gray-700 text-white rounded-lg w-full border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500">
                                    <option value="">Select Cuisine</option>
                                    {cuisines.map((cuisine) => (
                                        <option key={cuisine} value={cuisine}>
                                            {cuisine}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {/* Example: Dish Type Options */}
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-2">
                                    Dish Types
                                </h3>
                                <select className="p-3 bg-gray-700 text-white rounded-lg w-full border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500">
                                    <option value="">Select Dish Type</option>
                                    {dishTypes.map((dishType) => (
                                        <option key={dishType} value={dishType}>
                                            {dishType}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {/* Example: Allergen Tags */}
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-2">
                                    Allergens
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {allergens.map((allergen) => (
                                        <span
                                            key={allergen}
                                            className="badge bg-red-500"
                                        >
                                            {allergen}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            {/* Example: Dietary Tags */}
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-2">
                                    Dietary Tags
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {dietaryTags.map((dietary) => (
                                        <span
                                            key={dietary}
                                            className="badge bg-blue-500"
                                        >
                                            {dietary}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Right Column: Recipe Form (Placeholder) */}
            <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-4">
                    {id
                        ? `Edit Recipe: ${recipe?.title || "Loading..."}`
                        : "Add/Import Recipe"}
                </h2>
                <div className="bg-gray-700 p-4 rounded-lg">
                    <p className="text-gray-400">Recipe form will go here...</p>
                    {/* Add form fields for title, description, ingredients, instructions, etc. */}
                </div>
            </div>
        </div>
    );
};

export default AddRecipe;
