import axios from "axios";
import type { Recipe, TagBadge } from "../components/AddRecipe";

interface FormState {
    title: string;
    description?: string;
    cuisine: string;
    dish_type: string;
    ingredients: { quantity: number; unit: string; name: string }[];
    instructions: string;
    image_url?: string;
}

interface ImageState {
    imageMode: "upload" | "url";
    imageFile: File | null;
    imagePreview: string | null;
    imageUrlError: string;
}

export const handleInputChange = (
    e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
    setRecipe: React.Dispatch<React.SetStateAction<Recipe>>,
    setValidationErrors: React.Dispatch<
        React.SetStateAction<{ [key: string]: string }>
    >,
    setShowAddCuisine: React.Dispatch<React.SetStateAction<boolean>>,
    setShowAddDishType: React.Dispatch<React.SetStateAction<boolean>>,
    setShowAddUnit: React.Dispatch<React.SetStateAction<boolean>>,
    TITLE_MAX_LENGTH: number,
    DESCRIPTION_MAX_LENGTH: number
) => {
    const { name, value } = e.target;
    if (name === "title" && value.length > TITLE_MAX_LENGTH) {
        return;
    }
    if (name === "description" && value.length > DESCRIPTION_MAX_LENGTH) {
        return;
    }
    setRecipe((prev: Recipe) => ({ ...prev, [name]: value }));
    setValidationErrors((prev) => ({ ...prev, [name]: "" }));

    if (name === "cuisine") {
        setShowAddCuisine(value === "add_cuisine");
        if (value !== "add_cuisine") {
            setShowAddCuisine(false);
        }
    }
    if (name === "dish_type") {
        setShowAddDishType(value === "add_dish_type");
        if (value !== "add_dish_type") {
            setShowAddDishType(false);
        }
    }
    if (name === "unit") {
        setShowAddUnit(value === "add_unit");
        if (value !== "add_unit") {
            setShowAddUnit(false);
        }
    }
};

export const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setImageFile: React.Dispatch<React.SetStateAction<File | null>>,
    setImagePreview: React.Dispatch<React.SetStateAction<string | null>>
) => {
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

export const handleImageUrlChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setRecipe: React.Dispatch<React.SetStateAction<Recipe>>,
    setImageUrlError: React.Dispatch<React.SetStateAction<string>>,
    setImagePreview: React.Dispatch<React.SetStateAction<string | null>>
) => {
    const url = e.target.value;
    setRecipe((prev: Recipe) => ({ ...prev, image_url: url }));
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

export const handleSubmit = async (
    e: React.FormEvent,
    recipe: FormState,
    ingredients: {
        wholeNumber: number;
        fraction: string;
        quantity: number;
        unit: string;
        name: string;
    }[],
    imageState: ImageState,
    selectedTags: TagBadge[],
    setValidationErrors: React.Dispatch<
        React.SetStateAction<{ [key: string]: string }>
    >,
    setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>,
    navigate: (path: string) => void,
    API_BASE_URL: string,
    id?: string
) => {
    e.preventDefault();
    setValidationErrors({});

    // Validation
    const errors: { [key: string]: string } = {};
    if (!recipe.title.trim()) errors.title = "Title is required.";
    if (!recipe.cuisine) errors.cuisine = "Cuisine is required.";
    if (!recipe.dish_type) errors.dish_type = "Dish Type is required.";
    if (
        ingredients.every((ingredient) => !ingredient.name.trim()) ||
        ingredients.length === 0
    ) {
        errors.ingredients = "At least one ingredient with a name is required.";
    } else {
        const invalidQuantity = ingredients.some(
            (ingredient) =>
                ingredient.quantity < 0 ||
                (ingredient.quantity === 0 && ingredient.unit !== "unitless")
        );
        if (invalidQuantity) {
            errors.ingredients =
                "Quantity must be positive (or 0 for 'unitless').";
        }
    }
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
                ingredient.name.trim()
            ),
        };

        // Handle image data
        if (imageState.imageMode === "upload" && imageState.imageFile) {
            const reader = new FileReader();
            reader.readAsDataURL(imageState.imageFile);
            await new Promise((resolve) => {
                reader.onload = () => {
                    recipeData.image_url = reader.result as string;
                    resolve(null);
                };
            });
        }

        if (id) {
            await axios.put(`${API_BASE_URL}/recipes/${id}`, recipeData);
            recipeId = parseInt(id);
        } else {
            const response = await axios.post(
                `${API_BASE_URL}/recipes`,
                recipeData
            );
            recipeId = response.data.id;
        }

        const tags = selectedTags.map((tag) => ({
            tag_type: tag.type,
            tag_name: tag.value,
        }));
        await axios.post(`${API_BASE_URL}/recipe-tags/${recipeId}`, { tags });

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
