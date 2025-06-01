import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../config/apiConfig";

interface Tag {
    tag_type: "allergen" | "dietary";
    tag_name: string;
}

interface Recipe {
    id?: number; // Optional for new recipes
    title: string;
    description?: string;
    cuisine: string;
    dish_type: string;
    ingredients: string[];
    instructions: string;
    image_url?: string;
}

const AddRecipe = () => {
    const { id } = useParams<{ id: string }>(); // Get the recipe ID for editing
    const navigate = useNavigate();
    const [allergens, setAllergens] = useState<string[]>([]);
    const [dietaryTags, setDietaryTags] = useState<string[]>([]);
    const [cuisines, setCuisines] = useState<string[]>([]);
    const [dishTypes, setDishTypes] = useState<string[]>([]);
    const [isLoadingTags, setIsLoadingTags] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [formError, setFormError] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [recipe, setRecipe] = useState<Recipe>({
        title: "",
        description: "",
        cuisine: "",
        dish_type: "",
        ingredients: [""],
        instructions: "",
        image_url: "",
    });
    const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
    const [selectedDietaryTags, setSelectedDietaryTags] = useState<string[]>(
        []
    );

    // Load tags and recipe data
    useEffect(() => {
        // Fetch tags for the sidebar and form
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

        // Fetch cuisines and dish types
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
                    const fetchedRecipe = response.data;
                    setRecipe({
                        title: fetchedRecipe.title || "",
                        description: fetchedRecipe.description || "",
                        cuisine: fetchedRecipe.cuisine || "",
                        dish_type: fetchedRecipe.dish_type || "",
                        ingredients: fetchedRecipe.ingredients || [""],
                        instructions: fetchedRecipe.instructions || "",
                        image_url: fetchedRecipe.image_url || "",
                    });

                    // Fetch associated tags
                    axios
                        .get(`${API_BASE_URL}/recipe-tags/${id}`)
                        .then((tagResponse) => {
                            const recipeAllergens = tagResponse.data
                                .filter(
                                    (tag: Tag) => tag.tag_type === "allergen"
                                )
                                .map((tag: Tag) => tag.tag_name);
                            const recipeDietaryTags = tagResponse.data
                                .filter(
                                    (tag: Tag) => tag.tag_type === "dietary"
                                )
                                .map((tag: Tag) => tag.tag_name);
                            setSelectedAllergens(recipeAllergens);
                            setSelectedDietaryTags(recipeDietaryTags);
                        })
                        .catch((error) => {
                            console.error(
                                `Error fetching tags for recipe ${id}:`,
                                error
                            );
                            setErrorMessage(
                                "Failed to load recipe tags for editing."
                            );
                        });
                })
                .catch((error) => {
                    console.error(`Error fetching recipe ${id}:`, error);
                    setErrorMessage("Failed to load recipe for editing.");
                });
        }
    }, [id]);

    // Handle form input changes
    const handleInputChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        const { name, value } = e.target;
        setRecipe((prev) => ({ ...prev, [name]: value }));
    };

    // Handle ingredients list
    const handleIngredientChange = (index: number, value: string) => {
        const updatedIngredients = [...recipe.ingredients];
        updatedIngredients[index] = value;
        setRecipe((prev) => ({ ...prev, ingredients: updatedIngredients }));
    };

    const addIngredient = () => {
        setRecipe((prev) => ({
            ...prev,
            ingredients: [...prev.ingredients, ""],
        }));
    };

    const removeIngredient = (index: number) => {
        if (recipe.ingredients.length > 1) {
            const updatedIngredients = recipe.ingredients.filter(
                (_, i) => i !== index
            );
            setRecipe((prev) => ({ ...prev, ingredients: updatedIngredients }));
        }
    };

    // Handle allergen and dietary tag checkboxes
    const handleAllergenChange = (allergen: string) => {
        setSelectedAllergens((prev) =>
            prev.includes(allergen)
                ? prev.filter((item) => item !== allergen)
                : [...prev, allergen]
        );
    };

    const handleDietaryTagChange = (tag: string) => {
        setSelectedDietaryTags((prev) =>
            prev.includes(tag)
                ? prev.filter((item) => item !== tag)
                : [...prev, tag]
        );
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError("");
        setIsSubmitting(true);

        // Basic validation
        if (!recipe.title.trim()) {
            setFormError("Title is required.");
            setIsSubmitting(false);
            return;
        }
        if (!recipe.cuisine) {
            setFormError("Cuisine is required.");
            setIsSubmitting(false);
            return;
        }
        if (!recipe.dish_type) {
            setFormError("Dish Type is required.");
            setIsSubmitting(false);
            return;
        }
        if (recipe.ingredients.every((ingredient) => !ingredient.trim())) {
            setFormError("At least one ingredient is required.");
            setIsSubmitting(false);
            return;
        }
        if (!recipe.instructions.trim()) {
            setFormError("Instructions are required.");
            setIsSubmitting(false);
            return;
        }

        try {
            let recipeId: number;
            const recipeData = {
                ...recipe,
                ingredients: recipe.ingredients.filter((ingredient) =>
                    ingredient.trim()
                ),
            };

            if (id) {
                // Update existing recipe
                await axios.put(`${API_BASE_URL}/recipes/${id}`, recipeData);
                recipeId = parseInt(id);
            } else {
                // Create new recipe
                const response = await axios.post(
                    `${API_BASE_URL}/recipes`,
                    recipeData
                );
                recipeId = response.data.id; // Assuming the API returns the new recipe ID
            }

            // Update tags (assumes an endpoint to set recipe tags)
            const tags = [
                ...selectedAllergens.map((tag) => ({
                    tag_type: "allergen" as const,
                    tag_name: tag,
                })),
                ...selectedDietaryTags.map((tag) => ({
                    tag_type: "dietary" as const,
                    tag_name: tag,
                })),
            ];
            await axios.post(`${API_BASE_URL}/recipe-tags/${recipeId}`, {
                tags,
            });

            // Navigate back to recipes page
            navigate("/recipes");
        } catch (error) {
            console.error("Error saving recipe:", error);
            setFormError("Failed to save recipe. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

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
                            {/* Cuisine Options */}
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-2">
                                    Cuisines
                                </h3>
                                <select
                                    className="p-3 bg-gray-700 text-white rounded-lg w-full border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                    value={recipe.cuisine}
                                    onChange={handleInputChange}
                                    name="cuisine"
                                >
                                    <option value="">Select Cuisine</option>
                                    {cuisines.map((cuisine) => (
                                        <option key={cuisine} value={cuisine}>
                                            {cuisine}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {/* Dish Type Options */}
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-2">
                                    Dish Types
                                </h3>
                                <select
                                    className="p-3 bg-gray-700 text-white rounded-lg w-full border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                    value={recipe.dish_type}
                                    onChange={handleInputChange}
                                    name="dish_type"
                                >
                                    <option value="">Select Dish Type</option>
                                    {dishTypes.map((dishType) => (
                                        <option key={dishType} value={dishType}>
                                            {dishType}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {/* Allergen Tags */}
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
                            {/* Dietary Tags */}
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

            {/* Right Column: Recipe Form */}
            <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-4">
                    {id
                        ? `Edit Recipe: ${recipe.title || "Loading..."}`
                        : "Add/Import Recipe"}
                </h2>
                <div className="bg-gray-700 p-4 rounded-lg">
                    {formError && (
                        <p className="text-red-500 mb-4">{formError}</p>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Title */}
                        <div>
                            <label className="block text-white mb-1">
                                Title *
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={recipe.title}
                                onChange={handleInputChange}
                                className="p-3 bg-gray-800 text-white rounded-lg w-full border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                placeholder="Enter recipe title"
                            />
                        </div>
                        {/* Description */}
                        <div>
                            <label className="block text-white mb-1">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={recipe.description || ""}
                                onChange={handleInputChange}
                                className="p-3 bg-gray-800 text-white rounded-lg w-full border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                placeholder="Enter recipe description"
                                rows={3}
                            />
                        </div>
                        {/* Cuisine */}
                        <div>
                            <label className="block text-white mb-1">
                                Cuisine *
                            </label>
                            <select
                                name="cuisine"
                                value={recipe.cuisine}
                                onChange={handleInputChange}
                                className="p-3 bg-gray-800 text-white rounded-lg w-full border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            >
                                <option value="">Select Cuisine</option>
                                {cuisines.map((cuisine) => (
                                    <option key={cuisine} value={cuisine}>
                                        {cuisine}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {/* Dish Type */}
                        <div>
                            <label className="block text-white mb-1">
                                Dish Type *
                            </label>
                            <select
                                name="dish_type"
                                value={recipe.dish_type}
                                onChange={handleInputChange}
                                className="p-3 bg-gray-800 text-white rounded-lg w-full border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            >
                                <option value="">Select Dish Type</option>
                                {dishTypes.map((dishType) => (
                                    <option key={dishType} value={dishType}>
                                        {dishType}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {/* Ingredients */}
                        <div>
                            <label className="block text-white mb-1">
                                Ingredients *
                            </label>
                            {recipe.ingredients.map((ingredient, index) => (
                                <div
                                    key={index}
                                    className="flex items-center mb-2"
                                >
                                    <input
                                        type="text"
                                        value={ingredient}
                                        onChange={(e) =>
                                            handleIngredientChange(
                                                index,
                                                e.target.value
                                            )
                                        }
                                        className="p-3 bg-gray-800 text-white rounded-lg w-full border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                        placeholder={`Ingredient ${index + 1}`}
                                    />
                                    {recipe.ingredients.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                removeIngredient(index)
                                            }
                                            className="ml-2 text-red-500 hover:text-red-400"
                                        >
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={addIngredient}
                                className="text-yellow-500 hover:text-yellow-400 flex items-center"
                            >
                                <i className="fas fa-plus-circle mr-1"></i> Add
                                Ingredient
                            </button>
                        </div>
                        {/* Instructions */}
                        <div>
                            <label className="block text-white mb-1">
                                Instructions *
                            </label>
                            <textarea
                                name="instructions"
                                value={recipe.instructions}
                                onChange={handleInputChange}
                                className="p-3 bg-gray-800 text-white rounded-lg w-full border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                placeholder="Enter recipe instructions"
                                rows={5}
                            />
                        </div>
                        {/* Allergens */}
                        <div>
                            <label className="block text-white mb-1">
                                Allergens
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {allergens.map((allergen) => (
                                    <label
                                        key={allergen}
                                        className="flex items-center text-white"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedAllergens.includes(
                                                allergen
                                            )}
                                            onChange={() =>
                                                handleAllergenChange(allergen)
                                            }
                                            className="mr-1"
                                        />
                                        {allergen}
                                    </label>
                                ))}
                            </div>
                        </div>
                        {/* Dietary Tags */}
                        <div>
                            <label className="block text-white mb-1">
                                Dietary Tags
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {dietaryTags.map((tag) => (
                                    <label
                                        key={tag}
                                        className="flex items-center text-white"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedDietaryTags.includes(
                                                tag
                                            )}
                                            onChange={() =>
                                                handleDietaryTagChange(tag)
                                            }
                                            className="mr-1"
                                        />
                                        {tag}
                                    </label>
                                ))}
                            </div>
                        </div>
                        {/* Image URL (Placeholder for File Upload) */}
                        <div>
                            <label className="block text-white mb-1">
                                Image URL
                            </label>
                            <input
                                type="text"
                                name="image_url"
                                value={recipe.image_url || ""}
                                onChange={handleInputChange}
                                className="p-3 bg-gray-800 text-white rounded-lg w-full border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                placeholder="Enter image URL or leave blank for default"
                            />
                        </div>
                        {/* Submit Button */}
                        <div className="flex space-x-2">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`chef-master-btn ${
                                    isSubmitting
                                        ? "opacity-50 cursor-not-allowed"
                                        : ""
                                }`}
                            >
                                {isSubmitting
                                    ? "Saving..."
                                    : id
                                    ? "Update Recipe"
                                    : "Add Recipe"}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate("/recipes")}
                                className="close-btn"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddRecipe;
