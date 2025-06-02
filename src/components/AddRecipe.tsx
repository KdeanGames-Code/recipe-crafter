import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import API_BASE_URL from "../config/apiConfig";
import placeholderPopup from "../assets/images/placeholder-kitchen-672x448.png";

interface Tag {
    tag_type: "allergen" | "dietary";
    tag_name: string;
}

interface Recipe {
    id?: number;
    title: string;
    description?: string;
    cuisine: string;
    dish_type: string;
    ingredients: string[];
    instructions: string;
    image_url?: string;
}

interface TagBadge {
    type: "allergen" | "dietary";
    value: string;
}

const ItemTypes = {
    TAG: "tag",
};

const TagBadge = ({
    badge,
    onRemove,
    showRemove,
}: {
    badge: TagBadge;
    onRemove: () => void;
    showRemove: boolean;
}) => {
    const badgeRef = useRef<HTMLDivElement>(null);

    const [{ isDragging }, drag] = useDrag(() => ({
        type: ItemTypes.TAG,
        item: badge,
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    }));

    drag(badgeRef);

    return (
        <div
            ref={badgeRef}
            className={`badge ${
                badge.type === "allergen" ? "bg-red-500" : "bg-blue-500"
            } ${isDragging ? "opacity-50" : ""}`}
            style={{ cursor: "move" }}
        >
            {badge.value}{" "}
            {showRemove && (
                <i
                    className="fas fa-times ml-1 cursor-pointer"
                    onClick={onRemove}
                ></i>
            )}
        </div>
    );
};

const TagBox = ({
    appliedTags,
    setAppliedTags,
    tagType,
}: {
    appliedTags: TagBadge[];
    setAppliedTags: React.Dispatch<React.SetStateAction<TagBadge[]>>;
    tagType: "allergen" | "dietary";
}) => {
    const tagBoxRef = useRef<HTMLDivElement>(null);

    const [{ isOver }, drop] = useDrop(() => ({
        accept: ItemTypes.TAG,
        drop: (item: TagBadge) => {
            if (
                item.type === tagType &&
                !appliedTags.some(
                    (tag) => tag.type === item.type && tag.value === item.value
                )
            ) {
                setAppliedTags((prev) => [...prev, item]);
            }
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }));

    drop(tagBoxRef);

    const handleRemove = (badge: TagBadge) => {
        setAppliedTags((prev) =>
            prev.filter(
                (tag) => !(tag.type === badge.type && tag.value === badge.value)
            )
        );
    };

    return (
        <div
            ref={tagBoxRef}
            className={`tag-box custom-scrollbar ${
                isOver ? "tag-box-drag-over" : ""
            }`}
        >
            <div className="flex flex-wrap gap-2">
                {appliedTags
                    .filter((tag) => tag.type === tagType)
                    .map((badge, index) => (
                        <TagBadge
                            key={`${badge.type}-${badge.value}-${index}`}
                            badge={badge}
                            onRemove={() => handleRemove(badge)}
                            showRemove={true}
                        />
                    ))}
            </div>
        </div>
    );
};

const AddRecipe = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [allergens, setAllergens] = useState<string[]>([]);
    const [dietaryTags, setDietaryTags] = useState<string[]>([]);
    const [cuisines, setCuisines] = useState<string[]>([]);
    const [dishTypes, setDishTypes] = useState<string[]>([]);
    const [isLoadingTags, setIsLoadingTags] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);

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
    const [selectedTags, setSelectedTags] = useState<TagBadge[]>([]);
    const [validationErrors, setValidationErrors] = useState<{
        [key: string]: string;
    }>({});

    // Image handling state
    const [imageMode, setImageMode] = useState<"upload" | "url">("upload");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageUrlError, setImageUrlError] = useState<string>("");

    // Add Cuisine/Dish Type state
    const [showAddCuisine, setShowAddCuisine] = useState(false);
    const [newCuisine, setNewCuisine] = useState("");
    const [showAddDishType, setShowAddDishType] = useState(false);
    const [newDishType, setNewDishType] = useState("");

    // Load tags and recipe data
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

                    if (fetchedRecipe.image_url) {
                        setImageMode("url");
                        setImagePreview(fetchedRecipe.image_url);
                    }

                    axios
                        .get(`${API_BASE_URL}/recipe-tags/${id}`)
                        .then((tagResponse) => {
                            const recipeTags = tagResponse.data.map(
                                (tag: Tag) => ({
                                    type: tag.tag_type,
                                    value: tag.tag_name,
                                })
                            );
                            setSelectedTags(recipeTags);
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
        setValidationErrors((prev) => ({ ...prev, [name]: "" }));

        if (name === "cuisine") {
            setShowAddCuisine(value === "add_cuisine");
        }
        if (name === "dish_type") {
            setShowAddDishType(value === "add_dish_type");
        }
    };

    // Handle ingredients list
    const handleIngredientChange = (index: number, value: string) => {
        const updatedIngredients = [...recipe.ingredients];
        updatedIngredients[index] = value;
        setRecipe((prev) => ({ ...prev, ingredients: updatedIngredients }));
        setValidationErrors((prev) => ({ ...prev, ingredients: "" }));
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

    // Handle adding new cuisines and dish types
    const handleAddCuisine = () => {
        if (newCuisine.trim()) {
            setCuisines((prev) => [...prev, newCuisine.trim()]);
            setRecipe((prev) => ({ ...prev, cuisine: newCuisine.trim() }));
            setNewCuisine("");
            // Do not hide the input field here; let it persist until another element is focused
        }
    };

    const handleAddDishType = () => {
        if (newDishType.trim()) {
            setDishTypes((prev) => [...prev, newDishType.trim()]);
            setRecipe((prev) => ({ ...prev, dish_type: newDishType.trim() }));
            setNewDishType("");
            // Do not hide the input field here; let it persist until another element is focused
        }
    };

    // Handle image file upload
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle image URL change
    const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const url = e.target.value;
        setRecipe((prev) => ({ ...prev, image_url: url }));
        setImageUrlError("");
        if (url) {
            const img = new Image();
            img.src = url;
            img.onload = () => setImagePreview(url);
            img.onerror = () => setImageUrlError("Invalid image URL");
        } else {
            setImagePreview(null);
        }
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setValidationErrors({});

        // Validation
        const errors: { [key: string]: string } = {};
        if (!recipe.title.trim()) errors.title = "Title is required.";
        if (!recipe.cuisine) errors.cuisine = "Cuisine is required.";
        if (!recipe.dish_type) errors.dish_type = "Dish Type is required.";
        if (recipe.ingredients.every((ingredient) => !ingredient.trim()))
            errors.ingredients = "At least one ingredient is required.";
        if (!recipe.instructions.trim())
            errors.instructions = "Instructions are required.";

        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            return;
        }

        setIsSubmitting(true);
        try {
            let recipeId: number;
            const recipeData = {
                ...recipe,
                ingredients: recipe.ingredients.filter((ingredient) =>
                    ingredient.trim()
                ),
            };

            // Handle image data
            if (imageMode === "upload" && imageFile) {
                // Simulate upload by converting to Base64 (replace with actual API upload in production)
                const reader = new FileReader();
                reader.readAsDataURL(imageFile);
                await new Promise((resolve) => {
                    reader.onload = () => {
                        recipeData.image_url = reader.result as string;
                        resolve(null);
                    };
                });
            }

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
                recipeId = response.data.id;
            }

            // Update tags
            const tags = selectedTags.map((tag) => ({
                tag_type: tag.type,
                tag_name: tag.value,
            }));
            await axios.post(`${API_BASE_URL}/recipe-tags/${recipeId}`, {
                tags,
            });

            navigate("/recipes");
        } catch (error) {
            console.error("Error saving recipe:", error);
            setValidationErrors({
                form: "Failed to save recipe. Please try again.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Info box content based on focused field
    const getInfoBoxContent = () => {
        switch (focusedField) {
            case "title":
                return 'Enter a descriptive title for your recipe (e.g., "Spicy Chicken Tacos").';
            case "description":
                return "Provide a brief description of your recipe, including any special notes or serving suggestions.";
            case "cuisine":
                return 'Select the cuisine type. Choose "Add Cuisine" to create a new one.';
            case "dish_type":
                return 'Select the dish type (e.g., Main Course, Dessert). Choose "Add Dish Type" to create a new one.';
            case "ingredients":
                return "List each ingredient required for the recipe. Add or remove ingredients as needed.";
            case "instructions":
                return "Provide step-by-step instructions for preparing the recipe. Use new lines for each step.";
            case "allergens":
                return "Drag allergen tags from the sidebar to this section if the recipe contains them.";
            case "dietary":
                return "Drag dietary tags from the sidebar to this section if the recipe matches these diets.";
            case "image_url":
                return imageMode === "upload"
                    ? "Upload an image of your recipe. A preview will appear once selected."
                    : "Enter a URL for the recipe image. A preview will appear if the URL is valid.";
            default:
                return (
                    <div>
                        <p className="mb-2">
                            Welcome to the Recipe Crafter! Use this form to add
                            or edit a recipe.
                        </p>
                        <p className="mb-2">
                            The <strong>Recipe Options</strong> pane on the left
                            provides tools and options to assist with filling
                            out the form, such as importing a recipe or
                            selecting tags.
                        </p>
                        <p className="mb-2">
                            This instruction area will provide guidance on each
                            task as you progress through the form.
                        </p>
                        <p className="mb-2">
                            Start by entering a title for your recipe in the
                            form on the right.
                        </p>
                        <p>Required fields are marked with an asterisk (*).</p>
                    </div>
                );
        }
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="flex">
                {/* Left Column: Recipe Options Sidebar */}
                <div
                    className="bg-gray-800 p-4 mr-4"
                    style={{
                        width: "450px",
                        position: "sticky",
                        top: "112px",
                        height: "calc(100vh - 112px)",
                    }}
                >
                    <h2 className="text-2xl font-bold text-yellow-500 mb-4">
                        Recipe Options
                    </h2>
                    <div className="toolbar">
                        <button
                            type="button"
                            className="import-btn"
                            title="Import a recipe"
                            onClick={() =>
                                alert("Import functionality coming soon!")
                            }
                        >
                            <i className="fas fa-file-import"></i>
                        </button>
                    </div>
                    {errorMessage && (
                        <p className="text-red-500 mb-4">{errorMessage}</p>
                    )}
                    <div className="space-y-4">
                        {isLoadingTags ? (
                            <p className="text-gray-400">Loading options...</p>
                        ) : (
                            <>
                                {/* Instructions */}
                                <div className="bg-gray-700 p-4 rounded-lg">
                                    <h3 className="text-lg font-semibold text-yellow-500 mb-2">
                                        Instructions
                                    </h3>
                                    <div className="text-gray-400">
                                        {getInfoBoxContent()}
                                    </div>
                                </div>
                                {/* Add Cuisine */}
                                {showAddCuisine && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-yellow-500 mb-2">
                                            Add New Cuisine
                                        </h3>
                                        <div className="flex items-center mb-2">
                                            <input
                                                type="text"
                                                value={newCuisine}
                                                onChange={(e) =>
                                                    setNewCuisine(
                                                        e.target.value
                                                    )
                                                }
                                                onFocus={() =>
                                                    setFocusedField("cuisine")
                                                }
                                                className="p-3 bg-gray-800 text-white rounded-lg w-full border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:bg-gray-700"
                                                placeholder="Enter new cuisine"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleAddCuisine}
                                                className="ml-2 text-yellow-500 hover:text-yellow-400"
                                            >
                                                <i className="fas fa-plus-circle"></i>
                                            </button>
                                        </div>
                                    </div>
                                )}
                                {/* Add Dish Type */}
                                {showAddDishType && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-yellow-500 mb-2">
                                            Add New Dish Type
                                        </h3>
                                        <div className="flex items-center mb-2">
                                            <input
                                                type="text"
                                                value={newDishType}
                                                onChange={(e) =>
                                                    setNewDishType(
                                                        e.target.value
                                                    )
                                                }
                                                onFocus={() =>
                                                    setFocusedField("dish_type")
                                                }
                                                className="p-3 bg-gray-800 text-white rounded-lg w-full border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:bg-gray-700"
                                                placeholder="Enter new dish type"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleAddDishType}
                                                className="ml-2 text-yellow-500 hover:text-yellow-400"
                                            >
                                                <i className="fas fa-plus-circle"></i>
                                            </button>
                                        </div>
                                    </div>
                                )}
                                {/* Allergen Tags */}
                                {focusedField === "allergens" && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-yellow-500 mb-2">
                                            Allergens
                                        </h3>
                                        <div className="form-section custom-scrollbar">
                                            <div className="flex flex-wrap gap-2">
                                                {allergens.map((allergen) => (
                                                    <TagBadge
                                                        key={`allergen-${allergen}`}
                                                        badge={{
                                                            type: "allergen",
                                                            value: allergen,
                                                        }}
                                                        onRemove={() => {}}
                                                        showRemove={false}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {/* Dietary Tags */}
                                {focusedField === "dietary" && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-yellow-500 mb-2">
                                            Dietary Tags
                                        </h3>
                                        <div className="form-section custom-scrollbar">
                                            <div className="flex flex-wrap gap-2">
                                                {dietaryTags.map((dietary) => (
                                                    <TagBadge
                                                        key={`dietary-${dietary}`}
                                                        badge={{
                                                            type: "dietary",
                                                            value: dietary,
                                                        }}
                                                        onRemove={() => {}}
                                                        showRemove={false}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Right Column: Recipe Form */}
                <div
                    className="flex-1 p-6 overflow-y-auto custom-scrollbar"
                    style={{ height: "calc(100vh - 112px)" }}
                >
                    {id && (
                        <h2 className="text-2xl font-bold text-white mb-4">
                            Edit Recipe: {recipe.title || "Loading..."}
                        </h2>
                    )}
                    <div className="form-container">
                        {validationErrors.form && (
                            <p className="text-red-500 mb-4">
                                {validationErrors.form}
                            </p>
                        )}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Title */}
                            <div>
                                <div className="label-group">
                                    <label className="block text-yellow-500 mb-1">
                                        Title *
                                    </label>
                                    {validationErrors.title && (
                                        <p className="text-red-500 text-sm">
                                            {validationErrors.title}
                                        </p>
                                    )}
                                </div>
                                <input
                                    type="text"
                                    name="title"
                                    value={recipe.title}
                                    onChange={handleInputChange}
                                    onFocus={() => {
                                        setFocusedField("title");
                                        setShowAddCuisine(false);
                                        setShowAddDishType(false);
                                    }}
                                    onBlur={() => setFocusedField(null)}
                                    className={`p-3 bg-gray-800 text-white rounded-lg w-full border ${
                                        validationErrors.title
                                            ? "border-red-500"
                                            : "border-gray-600"
                                    } focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:bg-gray-700`}
                                    placeholder="Enter recipe title"
                                />
                            </div>
                            {/* Description */}
                            <div>
                                <label className="block text-yellow-500 mb-1">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={recipe.description || ""}
                                    onChange={handleInputChange}
                                    onFocus={() => {
                                        setFocusedField("description");
                                        setShowAddCuisine(false);
                                        setShowAddDishType(false);
                                    }}
                                    onBlur={() => setFocusedField(null)}
                                    className="p-3 bg-gray-800 text-white rounded-lg w-full border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:bg-gray-700"
                                    placeholder="Enter recipe description"
                                    rows={3}
                                />
                            </div>
                            {/* Cuisine & Dish Type (Same Row) */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <div className="label-group">
                                        <label className="block text-yellow-500 mb-1">
                                            Cuisine *
                                        </label>
                                        {validationErrors.cuisine && (
                                            <p className="text-red-500 text-sm">
                                                {validationErrors.cuisine}
                                            </p>
                                        )}
                                    </div>
                                    <select
                                        name="cuisine"
                                        value={recipe.cuisine}
                                        onChange={handleInputChange}
                                        onFocus={() =>
                                            setFocusedField("cuisine")
                                        }
                                        className={`p-3 bg-gray-800 text-white rounded-lg w-full border ${
                                            validationErrors.cuisine
                                                ? "border-red-500"
                                                : "border-gray-600"
                                        } focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:bg-gray-700`}
                                    >
                                        <option value="" disabled>
                                            Select Cuisine
                                        </option>
                                        <option value="add_cuisine">
                                            Add Cuisine
                                        </option>
                                        {cuisines.map((cuisine) => (
                                            <option
                                                key={cuisine}
                                                value={cuisine}
                                            >
                                                {cuisine}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <div className="label-group">
                                        <label className="block text-yellow-500 mb-1">
                                            Dish Type *
                                        </label>
                                        {validationErrors.dish_type && (
                                            <p className="text-red-500 text-sm">
                                                {validationErrors.dish_type}
                                            </p>
                                        )}
                                    </div>
                                    <select
                                        name="dish_type"
                                        value={recipe.dish_type}
                                        onChange={handleInputChange}
                                        onFocus={() =>
                                            setFocusedField("dish_type")
                                        }
                                        className={`p-3 bg-gray-800 text-white rounded-lg w-full border ${
                                            validationErrors.dish_type
                                                ? "border-red-500"
                                                : "border-gray-600"
                                        } focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:bg-gray-700`}
                                    >
                                        <option value="" disabled>
                                            Select Dish Type
                                        </option>
                                        <option value="add_dish_type">
                                            Add Dish Type
                                        </option>
                                        {dishTypes.map((dishType) => (
                                            <option
                                                key={dishType}
                                                value={dishType}
                                            >
                                                {dishType}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            {/* Ingredients */}
                            <div>
                                <div className="label-group">
                                    <label className="block text-yellow-500 mb-1">
                                        Ingredients *
                                    </label>
                                    {validationErrors.ingredients && (
                                        <p className="text-red-500 text-sm">
                                            {validationErrors.ingredients}
                                        </p>
                                    )}
                                </div>
                                {recipe.ingredients.map((ingredient, index) => (
                                    <div
                                        key={index}
                                        className="ingredient-item"
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
                                            onFocus={() => {
                                                setFocusedField("ingredients");
                                                setShowAddCuisine(false);
                                                setShowAddDishType(false);
                                            }}
                                            onBlur={() => setFocusedField(null)}
                                            className={`p-3 bg-gray-800 text-white rounded-lg w-full border ${
                                                validationErrors.ingredients
                                                    ? "border-red-500"
                                                    : "border-gray-600"
                                            } focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:bg-gray-700`}
                                            placeholder={`Ingredient ${
                                                index + 1
                                            }`}
                                        />
                                        {recipe.ingredients.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeIngredient(index)
                                                }
                                                className="remove-button"
                                            >
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={addIngredient}
                                    className="action-button"
                                >
                                    <i className="fas fa-plus-circle mr-1"></i>{" "}
                                    Add Ingredient
                                </button>
                            </div>
                            {/* Instructions */}
                            <div>
                                <div className="label-group">
                                    <label className="block text-yellow-500 mb-1">
                                        Instructions *
                                    </label>
                                    {validationErrors.instructions && (
                                        <p className="text-red-500 text-sm">
                                            {validationErrors.instructions}
                                        </p>
                                    )}
                                </div>
                                <textarea
                                    name="instructions"
                                    value={recipe.instructions}
                                    onChange={handleInputChange}
                                    onFocus={() => {
                                        setFocusedField("instructions");
                                        setShowAddCuisine(false);
                                        setShowAddDishType(false);
                                    }}
                                    onBlur={() => setFocusedField(null)}
                                    className={`p-3 bg-gray-800 text-white rounded-lg w-full border ${
                                        validationErrors.instructions
                                            ? "border-red-500"
                                            : "border-gray-600"
                                    } focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:bg-gray-700`}
                                    placeholder="Enter recipe instructions"
                                    rows={5}
                                />
                            </div>
                            {/* Allergens & Dietary Tags (Same Row) */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-yellow-500 mb-1">
                                        Allergens
                                    </label>
                                    <TagBox
                                        appliedTags={selectedTags}
                                        setAppliedTags={setSelectedTags}
                                        tagType="allergen"
                                    />
                                </div>
                                <div>
                                    <label className="block text-yellow-500 mb-1">
                                        Dietary Tags
                                    </label>
                                    <TagBox
                                        appliedTags={selectedTags}
                                        setAppliedTags={setSelectedTags}
                                        tagType="dietary"
                                    />
                                </div>
                            </div>
                            {/* Image Input */}
                            <div>
                                <label className="block text-yellow-500 mb-1">
                                    Recipe Image
                                </label>
                                <div className="form-container">
                                    {/* Tabs for Upload/URL */}
                                    <div className="flex border-b border-gray-600 mb-4">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setImageMode("upload");
                                                setImagePreview(null);
                                                setImageFile(null);
                                                setImageUrlError("");
                                                setRecipe((prev) => ({
                                                    ...prev,
                                                    image_url: "",
                                                }));
                                            }}
                                            className={`p-2 ${
                                                imageMode === "upload"
                                                    ? "bg-gray-700"
                                                    : "bg-gray-900"
                                            } rounded-t-lg`}
                                        >
                                            Upload Image
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setImageMode("url");
                                                setImageFile(null);
                                                setImagePreview(null);
                                                setImageUrlError("");
                                            }}
                                            className={`p-2 ${
                                                imageMode === "url"
                                                    ? "bg-gray-700"
                                                    : "bg-gray-900"
                                            } rounded-t-lg`}
                                        >
                                            Enter URL
                                        </button>
                                    </div>
                                    {imageMode === "upload" ? (
                                        <div>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                onFocus={() => {
                                                    setFocusedField(
                                                        "image_url"
                                                    );
                                                    setShowAddCuisine(false);
                                                    setShowAddDishType(false);
                                                }}
                                                onBlur={() =>
                                                    setFocusedField(null)
                                                }
                                                className="p-3 bg-gray-800 text-white rounded-lg w-full border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:bg-gray-700"
                                            />
                                            {imageFile && (
                                                <p className="text-gray-400 mt-2">
                                                    {imageFile.name} (
                                                    {(
                                                        imageFile.size / 1024
                                                    ).toFixed(2)}{" "}
                                                    KB)
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        <div>
                                            <input
                                                type="text"
                                                name="image_url"
                                                value={recipe.image_url || ""}
                                                onChange={handleImageUrlChange}
                                                onFocus={() => {
                                                    setFocusedField(
                                                        "image_url"
                                                    );
                                                    setShowAddCuisine(false);
                                                    setShowAddDishType(false);
                                                }}
                                                onBlur={() =>
                                                    setFocusedField(null)
                                                }
                                                className="p-3 bg-gray-800 text-white rounded-lg w-full border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:bg-gray-700"
                                                placeholder="https://example.com/image.jpg"
                                            />
                                            {imageUrlError && (
                                                <p className="text-red-500 mt-2">
                                                    {imageUrlError}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                    {/* Image Preview */}
                                    <div className="mt-4">
                                        <label className="block text-white mb-2">
                                            Preview
                                        </label>
                                        <div className="recipe-photo max-w-[300px] mx-auto">
                                            <img
                                                src={
                                                    imagePreview ||
                                                    placeholderPopup
                                                }
                                                alt="Recipe Preview"
                                                className="rounded-lg"
                                            />
                                        </div>
                                        {!imagePreview && (
                                            <p className="text-gray-400 text-center mt-2">
                                                Default Image
                                            </p>
                                        )}
                                        {imagePreview && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setImageFile(null);
                                                    setImagePreview(null);
                                                    setImageUrlError("");
                                                    setRecipe((prev) => ({
                                                        ...prev,
                                                        image_url: "",
                                                    }));
                                                }}
                                                className="remove-button-image"
                                            >
                                                <i className="fas fa-trash mr-1"></i>{" "}
                                                Remove Image
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                            {/* Submit Button */}
                            <div className="button-group">
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
        </DndProvider>
    );
};

export default AddRecipe;
