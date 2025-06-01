import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Resizable } from "react-resizable";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

interface Recipe {
    id: number;
    title: string;
    description?: string;
    average_rating: number;
    cuisine: string;
    dish_type: string;
    ingredients?: string[];
    instructions?: string;
}

interface Tag {
    tag_type: "allergen" | "dietary";
    tag_name: string;
}

interface FilterBadge {
    type: string;
    value: string;
}

const ItemTypes = {
    BADGE: "badge",
};

const FilterBadge = ({
    badge,
    onRemove,
    showRemove,
}: {
    badge: FilterBadge;
    onRemove: () => void;
    showRemove: boolean;
}) => {
    const badgeRef = useRef<HTMLDivElement>(null);

    const [{ isDragging }, drag] = useDrag(() => ({
        type: ItemTypes.BADGE,
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
                badge.type === "cuisine"
                    ? "bg-amber-800"
                    : badge.type === "dish_type"
                    ? "bg-purple-500"
                    : badge.type === "allergen"
                    ? "bg-red-500"
                    : badge.type === "dietary"
                    ? "bg-blue-500"
                    : badge.type === "ingredient"
                    ? "bg-yellow-500"
                    : "bg-blue-500"
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

const FilterBox = ({
    appliedFilters,
    setAppliedFilters,
    setFilterOptions,
}: {
    appliedFilters: FilterBadge[];
    setAppliedFilters: React.Dispatch<React.SetStateAction<FilterBadge[]>>;
    setFilterOptions: React.Dispatch<React.SetStateAction<FilterBadge[]>>;
}) => {
    const filterBoxRef = useRef<HTMLDivElement>(null);

    const [{ isOver: isOverAdd }, drop] = useDrop(() => ({
        accept: ItemTypes.BADGE,
        drop: (item: FilterBadge) => {
            if (
                !appliedFilters.some(
                    (filter) =>
                        filter.type === item.type && filter.value === item.value
                )
            ) {
                setAppliedFilters((prev) => [...prev, item]);
                if (item.type !== "ingredient") {
                    setFilterOptions((prev) =>
                        prev.filter(
                            (option) =>
                                !(
                                    option.type === item.type &&
                                    option.value === item.value
                                )
                        )
                    );
                }
            }
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }));

    drop(filterBoxRef);

    const handleRemove = (badge: FilterBadge) => {
        setAppliedFilters(
            appliedFilters.filter(
                (filter) =>
                    !(
                        filter.type === badge.type &&
                        filter.value === badge.value
                    )
            )
        );
        if (badge.type !== "ingredient") {
            setFilterOptions((prev) =>
                [...prev, badge].sort((a, b) => a.value.localeCompare(b.value))
            );
        }
    };

    return (
        <div
            ref={filterBoxRef}
            className={`border-2 border-dashed rounded-lg p-4 min-h-[100px] ${
                isOverAdd ? "bg-gray-600" : "bg-gray-700"
            }`}
        >
            <h3 className="text-lg font-semibold text-white mb-2">
                Applied Filters
            </h3>
            <div className="flex flex-wrap gap-2">
                {appliedFilters.map((badge, index) => (
                    <FilterBadge
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

const FilterOptions = ({
    filterOptions,
    setAppliedFilters,
    setFilterOptions,
}: {
    filterOptions: FilterBadge[];
    setAppliedFilters: React.Dispatch<React.SetStateAction<FilterBadge[]>>;
    setFilterOptions: React.Dispatch<React.SetStateAction<FilterBadge[]>>;
}) => {
    const optionsBoxRef = useRef<HTMLDivElement>(null);

    const [{ isOver: isOverRemove }, drop] = useDrop(() => ({
        accept: ItemTypes.BADGE,
        drop: (item: FilterBadge) => {
            setAppliedFilters((prev) =>
                prev.filter(
                    (filter) =>
                        !(
                            filter.type === item.type &&
                            filter.value === item.value
                        )
                )
            );
            if (item.type !== "ingredient") {
                setFilterOptions((prev) =>
                    [...prev, item].sort((a, b) =>
                        a.value.localeCompare(b.value)
                    )
                );
            }
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }));

    drop(optionsBoxRef);

    return (
        <div
            ref={optionsBoxRef}
            className={`bg-gray-700 p-4 rounded-lg min-h-[150px] max-h-[200px] overflow-y-auto ${
                isOverRemove ? "bg-gray-600" : ""
            }`}
        >
            <div className="flex flex-wrap gap-2">
                {filterOptions.length > 0 ? (
                    filterOptions.map((badge, index) => (
                        <FilterBadge
                            key={`${badge.type}-${badge.value}-${index}`}
                            badge={badge}
                            onRemove={() => {}}
                            showRemove={false}
                        />
                    ))
                ) : (
                    <p className="text-gray-400">No options available</p>
                )}
            </div>
        </div>
    );
};

const Recipes = () => {
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [recipeTags, setRecipeTags] = useState<{ [key: number]: Tag[] }>({});
    const [favorites, setFavorites] = useState<number[]>([]);
    const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
    const [cuisines, setCuisines] = useState<string[]>([]);
    const [dishTypes, setDishTypes] = useState<string[]>([]);
    const [allergens, setAllergens] = useState<string[]>([]);
    const [dietaryTags, setDietaryTags] = useState<string[]>([]);
    const [filterCategory, setFilterCategory] = useState<string>("cuisine");
    const [appliedFilters, setAppliedFilters] = useState<FilterBadge[]>([]);
    const [filterOptions, setFilterOptions] = useState<FilterBadge[]>([]);
    const [ingredientInput, setIngredientInput] = useState<string>("");
    const [sidebarWidth, setSidebarWidth] = useState(300);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [isLoadingTags, setIsLoadingTags] = useState(true);
    const [isLoadingRecipes, setIsLoadingRecipes] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
    const userId = 1;

    useEffect(() => {
        axios
            .get("http://127.0.0.1:3000/api/tags")
            .then((response) => {
                console.log("Fetched Tags:", response.data);
                const allergenTags = response.data
                    .filter((tag: Tag) => tag.tag_type === "allergen")
                    .map((tag: Tag) => tag.tag_name);
                const dietaryTagsList = response.data
                    .filter((tag: Tag) => tag.tag_type === "dietary")
                    .map((tag: Tag) => tag.tag_name);
                console.log("Allergens:", allergenTags);
                console.log("Dietary Tags:", dietaryTagsList);
                setAllergens(allergenTags);
                setDietaryTags(dietaryTagsList);
                setIsLoadingTags(false);
            })
            .catch((error) => {
                console.error("Error fetching tags:", error);
                setErrorMessage(
                    "Failed to load filter options. Please try again later."
                );
                setAllergens([]);
                setDietaryTags([]);
                setIsLoadingTags(false);
            });
    }, []);

    useEffect(() => {
        axios
            .get("http://127.0.0.1:3000/api/recipes")
            .then((response) => {
                console.log("Recipes:", response.data);
                if (response.data.length === 0) {
                    setErrorMessage("No recipes found in the database.");
                }
                const recipesWithIngredients = response.data.map(
                    (recipe: Recipe) => ({
                        ...recipe,
                        ingredients: ["mock_ingredient_1", "mock_ingredient_2"],
                        instructions:
                            "Mock instructions: Step 1. Prepare ingredients. Step 2. Cook and serve.\n" +
                            "Step 3. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\n" +
                            "Step 4. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.\n" +
                            "Step 5. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.\n" +
                            "Step 6. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\n" +
                            "Step 7. Repeat steps 1-6 as needed to ensure content overflows for testing the scrollbar.\n" +
                            "Step 8. Additional step to make the content longer.\n" +
                            "Step 9. Another step to ensure overflow.\n" +
                            "Step 10. Final step for good measure.",
                    })
                );
                setRecipes(recipesWithIngredients);
                setFilteredRecipes(recipesWithIngredients);

                const uniqueCuisines = [
                    ...new Set(
                        recipesWithIngredients
                            .map((recipe: Recipe) => recipe.cuisine)
                            .filter(Boolean)
                    ),
                ] as string[];
                const uniqueDishTypes = [
                    ...new Set(
                        recipesWithIngredients
                            .map((recipe: Recipe) => recipe.dish_type)
                            .filter(Boolean)
                    ),
                ] as string[];
                setCuisines(uniqueCuisines);
                setDishTypes(uniqueDishTypes);

                setFilterOptions(
                    uniqueCuisines.map((cuisine) => ({
                        type: "cuisine",
                        value: cuisine,
                    }))
                );

                Promise.all(
                    recipesWithIngredients.map((recipe: Recipe) =>
                        axios
                            .get(
                                `http://127.0.0.1:3000/api/recipe-tags/${recipe.id}`
                            )
                            .then((tagResponse) => {
                                console.log(
                                    `Tags for recipe ${recipe.id} (${recipe.title}):`,
                                    tagResponse.data
                                );
                                return {
                                    id: recipe.id,
                                    tags: tagResponse.data,
                                };
                            })
                            .catch((error) => {
                                console.error(
                                    `Error fetching tags for recipe ${recipe.id}:`,
                                    error
                                );
                                return { id: recipe.id, tags: [] };
                            })
                    )
                ).then((tagsArray) => {
                    const tagsMap = tagsArray.reduce((acc, { id, tags }) => {
                        acc[id] = tags;
                        return acc;
                    }, {});
                    console.log("Updated recipeTags:", tagsMap);
                    setRecipeTags(tagsMap);
                    setIsLoadingRecipes(false);
                });
            })
            .catch((error) => {
                console.error("Error fetching recipes:", error);
                setErrorMessage(
                    "Failed to load recipes. Please try again later."
                );
                setRecipes([]);
                setFilteredRecipes([]);
                setCuisines([]);
                setDishTypes([]);
                setFilterOptions([]);
                setIsLoadingRecipes(false);
            });
    }, []);

    useEffect(() => {
        axios
            .get("http://127.0.0.1:3000/api/favorites")
            .then((response) => {
                console.log("Favorites:", response.data);
                const userFavorites = response.data
                    .filter(
                        (fav: { user_id: number; recipe_id: number }) =>
                            fav.user_id === userId
                    )
                    .map(
                        (fav: { user_id: number; recipe_id: number }) =>
                            fav.recipe_id
                    );
                setFavorites(userFavorites);
            })
            .catch((error) => {
                console.error("Error fetching favorites:", error);
                setFavorites([]);
            });
    }, []);

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

    const handleFilter = () => {
        let filtered = recipes;

        if (searchQuery) {
            filtered = filtered.filter(
                (recipe) =>
                    recipe.title
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                    (recipe.description &&
                        recipe.description
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase()))
            );
        }

        appliedFilters.forEach((filter) => {
            if (filter.type === "cuisine") {
                filtered = filtered.filter(
                    (recipe) => recipe.cuisine === filter.value
                );
            }
            if (filter.type === "dish_type") {
                filtered = filtered.filter(
                    (recipe) => recipe.dish_type === filter.value
                );
            }
            if (filter.type === "allergen") {
                filtered = filtered.filter((recipe) => {
                    const recipeAllergens = (recipeTags[recipe.id] || [])
                        .filter((tag) => tag.tag_type === "allergen")
                        .map((tag) => tag.tag_name);
                    return !recipeAllergens.includes(filter.value);
                });
            }
            if (filter.type === "dietary") {
                filtered = filtered.filter((recipe) => {
                    const recipeDietary = (recipeTags[recipe.id] || [])
                        .filter((tag) => tag.tag_type === "dietary")
                        .map((tag) => tag.tag_name);
                    return recipeDietary.includes(filter.value);
                });
            }
            if (filter.type === "ingredient") {
                filtered = filtered.filter((recipe) => {
                    const recipeIngredients = (recipe.ingredients || []).map(
                        (ingredient) => ingredient.toLowerCase()
                    );
                    return recipeIngredients.includes(
                        filter.value.toLowerCase()
                    );
                });
            }
        });

        setFilteredRecipes(filtered);
    };

    useEffect(() => {
        handleFilter();
    }, [appliedFilters, searchQuery, recipes, recipeTags]);

    useEffect(() => {
        if (!isLoadingTags) {
            if (filterCategory === "cuisine") {
                setFilterOptions(
                    cuisines.map((value) => ({ type: "cuisine", value }))
                );
            } else if (filterCategory === "dish_type") {
                setFilterOptions(
                    dishTypes.map((value) => ({ type: "dish_type", value }))
                );
            } else if (filterCategory === "allergen") {
                setFilterOptions(
                    allergens.map((value) => ({ type: "allergen", value }))
                );
            } else if (filterCategory === "dietary") {
                setFilterOptions(
                    dietaryTags.map((value) => ({ type: "dietary", value }))
                );
            } else if (filterCategory === "ingredient") {
                setFilterOptions([]);
            }
        }
    }, [
        filterCategory,
        cuisines,
        dishTypes,
        allergens,
        dietaryTags,
        isLoadingTags,
    ]);

    const handleCategoryChange = (category: string) => {
        setFilterCategory(category);
        setIngredientInput("");
    };

    const handleIngredientInput = (
        e: React.KeyboardEvent<HTMLInputElement>
    ) => {
        if (e.key === "Enter" && ingredientInput.trim()) {
            const newBadge: FilterBadge = {
                type: "ingredient",
                value: ingredientInput.trim(),
            };
            setAppliedFilters((prev) => [...prev, newBadge]);
            setIngredientInput("");
        }
    };

    const handleResize = (
        _event: any,
        { size }: { size: { width: number; height: number } }
    ) => {
        setSidebarWidth(size.width);
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="p-6 min-h-screen flex">
                <div style={{ minWidth: "200px", maxWidth: "500px" }}>
                    <Resizable
                        width={sidebarWidth}
                        height={Infinity}
                        onResize={handleResize}
                        minConstraints={[200, Infinity]}
                        maxConstraints={[500, Infinity]}
                        resizeHandles={["e"]}
                        className="bg-gray-800 p-4 mr-4"
                    >
                        <div style={{ width: sidebarWidth }}>
                            <h2 className="text-2xl font-bold text-white mb-4">
                                Filter Recipes
                            </h2>
                            {errorMessage && (
                                <p className="text-red-500 mb-4">
                                    {errorMessage}
                                </p>
                            )}
                            <div className="space-y-4">
                                {isLoadingTags ? (
                                    <p className="text-gray-400">
                                        Loading filters...
                                    </p>
                                ) : (
                                    <select
                                        className="p-3 bg-gray-700 text-white rounded-lg w-full border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                        value={filterCategory}
                                        onChange={(e) =>
                                            handleCategoryChange(e.target.value)
                                        }
                                    >
                                        <option value="cuisine">
                                            Cuisines
                                        </option>
                                        <option value="dish_type">
                                            Dish Types
                                        </option>
                                        <option value="allergen">
                                            Allergens
                                        </option>
                                        <option value="dietary">Dietary</option>
                                        <option value="ingredient">
                                            Ingredients
                                        </option>
                                    </select>
                                )}
                            </div>
                            <div className="mt-4">
                                <h3 className="text-lg font-semibold text-white mb-2">
                                    {filterCategory === "ingredient"
                                        ? "Add Ingredients"
                                        : "Filter Options"}
                                </h3>
                                {filterCategory === "ingredient" ? (
                                    <input
                                        type="text"
                                        placeholder="Type ingredient and press Enter..."
                                        className="p-3 bg-gray-700 text-white rounded-lg w-full border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                        value={ingredientInput}
                                        onChange={(e) =>
                                            setIngredientInput(e.target.value)
                                        }
                                        onKeyPress={handleIngredientInput}
                                    />
                                ) : (
                                    <FilterOptions
                                        filterOptions={filterOptions}
                                        setAppliedFilters={setAppliedFilters}
                                        setFilterOptions={setFilterOptions}
                                    />
                                )}
                            </div>
                            <div className="mt-4">
                                <FilterBox
                                    appliedFilters={appliedFilters}
                                    setAppliedFilters={setAppliedFilters}
                                    setFilterOptions={setFilterOptions}
                                />
                            </div>
                            <div className="mt-4">
                                <h3 className="text-lg font-semibold text-white mb-2">
                                    Search Recipes
                                </h3>
                                <input
                                    type="text"
                                    placeholder="Search by title or description..."
                                    className="p-3 bg-gray-700 text-white rounded-lg w-full border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                />
                            </div>
                        </div>
                    </Resizable>
                </div>

                <div className="flex-1">
                    {isLoadingRecipes ? (
                        <p className="text-gray-400 text-center">
                            Loading recipes...
                        </p>
                    ) : recipes.length === 0 ? (
                        <p className="text-gray-400 text-center">
                            No recipes available
                        </p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredRecipes.map((recipe) => {
                                const recipeAllergens = (
                                    recipeTags[recipe.id] || []
                                )
                                    .filter(
                                        (tag) => tag.tag_type === "allergen"
                                    )
                                    .map((tag) => tag.tag_name);
                                const recipeDietary = (
                                    recipeTags[recipe.id] || []
                                )
                                    .filter((tag) => tag.tag_type === "dietary")
                                    .map((tag) => tag.tag_name);

                                return (
                                    <div
                                        key={recipe.id}
                                        className="recipe-card p-4 rounded shadow bg-gray-700 transform transition-transform duration-200 hover:scale-105 cursor-pointer"
                                        onClick={() =>
                                            setSelectedRecipe(recipe)
                                        }
                                    >
                                        <h2 className="text-lg font-semibold text-yellow-500">
                                            {recipe.title}
                                        </h2>
                                        <p className="text-sm text-gray-400">
                                            {recipe.description ||
                                                "No description"}
                                        </p>
                                        <p className="text-sm text-gray-400 italic mt-1">
                                            Cuisine: {recipe.cuisine || "N/A"}
                                        </p>
                                        <p className="text-sm text-gray-400 italic mt-1">
                                            Dish Type:{" "}
                                            {recipe.dish_type || "N/A"}
                                        </p>
                                        <div className="flex space-x-2 mt-2">
                                            {recipeAllergens.length > 0 && (
                                                <span className="badge bg-red-500">
                                                    {recipeAllergens.join(", ")}
                                                </span>
                                            )}
                                            {recipeDietary.length > 0 && (
                                                <span className="badge bg-blue-500">
                                                    {recipeDietary.join(", ")}
                                                </span>
                                            )}
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
                                        <div className="flex space-x-2 mt-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleFavorite(recipe.id);
                                                }}
                                                className="favorite-btn"
                                            >
                                                <i
                                                    className={`fas fa-heart favorite-icon ${
                                                        favorites.includes(
                                                            recipe.id
                                                        )
                                                            ? "favorited"
                                                            : ""
                                                    } text-sm`}
                                                ></i>
                                            </button>
                                            <Link
                                                to="/chef-master"
                                                onClick={(e) =>
                                                    e.stopPropagation()
                                                }
                                            >
                                                <button className="chef-master-btn">
                                                    Start Chef Master
                                                </button>
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Recipe Popup Modal */}
            {selectedRecipe && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                    <div className="recipe-popup pt-0 px-6 pb-6 max-w-2xl w-full max-h-[80vh] custom-scrollbar relative">
                        <button
                            onClick={() => setSelectedRecipe(null)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-300 z-20"
                        >
                            <i className="fas fa-times text-xl"></i>
                        </button>
                        <div className="recipe-title-container">
                            <h2 className="recipe-title text-yellow-500">
                                <i className="fas fa-utensils text-yellow-500"></i>
                                {selectedRecipe.title}
                            </h2>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <h3 className="recipe-section-header">
                                    Description
                                </h3>
                                <p className="text-gray-400">
                                    {selectedRecipe.description ||
                                        "No description"}
                                </p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <h3 className="recipe-section-header">
                                        Cuisine
                                    </h3>
                                    <p className="text-gray-400">
                                        {selectedRecipe.cuisine || "N/A"}
                                    </p>
                                </div>
                                <div>
                                    <h3 className="recipe-section-header">
                                        Dish Type
                                    </h3>
                                    <p className="text-gray-400">
                                        {selectedRecipe.dish_type || "N/A"}
                                    </p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <h3 className="recipe-section-header">
                                        Allergens
                                    </h3>
                                    <div className="flex flex-wrap gap-2 allergen-tags">
                                        {(recipeTags[selectedRecipe.id] || [])
                                            .filter(
                                                (tag) =>
                                                    tag.tag_type === "allergen"
                                            )
                                            .map((tag) => (
                                                <span
                                                    key={tag.tag_name}
                                                    className="badge bg-red-500"
                                                >
                                                    {tag.tag_name}
                                                </span>
                                            ))}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="recipe-section-header">
                                        Dietary Tags
                                    </h3>
                                    <div className="flex flex-wrap gap-2 dietary-tags">
                                        {(recipeTags[selectedRecipe.id] || [])
                                            .filter(
                                                (tag) =>
                                                    tag.tag_type === "dietary"
                                            )
                                            .map((tag) => (
                                                <span
                                                    key={tag.tag_name}
                                                    className="badge bg-blue-500"
                                                >
                                                    {tag.tag_name}
                                                </span>
                                            ))}
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h3 className="recipe-section-header">
                                    Ingredients
                                </h3>
                                <ul className="list-disc list-inside text-gray-400">
                                    {(selectedRecipe.ingredients || []).map(
                                        (ingredient, index) => (
                                            <li key={index}>{ingredient}</li>
                                        )
                                    )}
                                </ul>
                            </div>
                            <div>
                                <h3 className="recipe-section-header">
                                    Instructions
                                </h3>
                                <div className="instructions-container">
                                    {(
                                        selectedRecipe.instructions ||
                                        "No instructions"
                                    )
                                        .split("\n")
                                        .map((line, index) => {
                                            const match = line.match(
                                                /^(Step \d+\.)\s*(.*)$/
                                            );
                                            if (match) {
                                                const [, step, instruction] =
                                                    match;
                                                return (
                                                    <p key={index}>
                                                        <span className="instruction-step">
                                                            {step}
                                                        </span>{" "}
                                                        <span className="instruction-text">
                                                            {instruction}
                                                        </span>
                                                    </p>
                                                );
                                            }
                                            return (
                                                <p
                                                    key={index}
                                                    className="instruction-text"
                                                >
                                                    {line}
                                                </p>
                                            );
                                        })}
                                </div>
                            </div>
                            <div>
                                <h3 className="recipe-section-header">
                                    Nutrition Facts (Per Serving)
                                </h3>
                                <div className="border-2 border-gray-600 rounded-lg p-4 bg-gray-900 text-white">
                                    <div className="border-b-4 border-white mb-2">
                                        <p className="text-xl font-bold">
                                            Nutrition Facts
                                        </p>
                                        <p className="text-sm">
                                            Serving Size: 1 serving
                                        </p>
                                    </div>
                                    <div className="border-b-2 border-gray-600 mb-2">
                                        <p className="text-lg font-semibold">
                                            Calories{" "}
                                            <span className="float-right">
                                                200
                                            </span>
                                        </p>
                                        <p className="text-sm text-gray-400">
                                            Calories from Fat 90
                                        </p>
                                    </div>
                                    <div className="text-sm border-b border-gray-600 py-1">
                                        <p>
                                            <span className="font-semibold">
                                                Total Fat
                                            </span>{" "}
                                            <span className="float-right">
                                                10g (13% DV)
                                            </span>
                                        </p>
                                    </div>
                                    <div className="text-sm border-b border-gray-600 py-1">
                                        <p>
                                            <span className="font-semibold">
                                                Saturated Fat
                                            </span>{" "}
                                            <span className="float-right">
                                                2g (10% DV)
                                            </span>
                                        </p>
                                    </div>
                                    <div className="text-sm border-b border-gray-600 py-1">
                                        <p>
                                            <span className="font-semibold">
                                                Cholesterol
                                            </span>{" "}
                                            <span className="float-right">
                                                30mg (10% DV)
                                            </span>
                                        </p>
                                    </div>
                                    <div className="text-sm border-b border-gray-600 py-1">
                                        <p>
                                            <span className="font-semibold">
                                                Sodium
                                            </span>{" "}
                                            <span className="float-right">
                                                300mg (13% DV)
                                            </span>
                                        </p>
                                    </div>
                                    <div className="text-sm border-b border-gray-600 py-1">
                                        <p>
                                            <span className="font-semibold">
                                                Total Carbohydrate
                                            </span>{" "}
                                            <span className="float-right">
                                                25g (9% DV)
                                            </span>
                                        </p>
                                    </div>
                                    <div className="text-sm border-b border-gray-600 py-1">
                                        <p>
                                            <span className="font-semibold">
                                                Dietary Fiber
                                            </span>{" "}
                                            <span className="float-right">
                                                3g (11% DV)
                                            </span>
                                        </p>
                                    </div>
                                    <div className="text-sm border-b border-gray-600 py-1">
                                        <p>
                                            <span className="font-semibold">
                                                Sugars
                                            </span>{" "}
                                            <span className="float-right">
                                                5g
                                            </span>
                                        </p>
                                    </div>
                                    <div className="text-sm py-1">
                                        <p>
                                            <span className="font-semibold">
                                                Protein
                                            </span>{" "}
                                            <span className="float-right">
                                                15g
                                            </span>
                                        </p>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-2">
                                        *Percent Daily Values (DV) are based on
                                        a 2,000 calorie diet.
                                    </p>
                                </div>
                            </div>
                            <div className="flex space-x-2 mt-4">
                                <Link to={`/recipes/edit/${selectedRecipe.id}`}>
                                    <button className="edit-recipe-btn">
                                        Edit Recipe
                                    </button>
                                </Link>
                                <Link to="/chef-master">
                                    <button className="master-chef-btn">
                                        Master Chef
                                    </button>
                                </Link>
                                <button
                                    onClick={() => setSelectedRecipe(null)}
                                    className="py-2 px-4 bg-gray-500 text-white rounded-lg hover:bg-gray-400 transition-colors duration-300"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DndProvider>
    );
};

export default Recipes;
