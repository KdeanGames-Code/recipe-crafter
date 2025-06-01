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
                // Remove the item from filterOptions
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
        // Add the item back to filterOptions
        setFilterOptions((prev) =>
            [...prev, badge].sort((a, b) => a.value.localeCompare(b.value))
        );
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
            // Add the item back to filterOptions
            setFilterOptions((prev) =>
                [...prev, item].sort((a, b) => a.value.localeCompare(b.value))
            );
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
    const [sidebarWidth, setSidebarWidth] = useState(300);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [isLoadingTags, setIsLoadingTags] = useState(true);
    const [isLoadingRecipes, setIsLoadingRecipes] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string>("");
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
                setRecipes(response.data);
                setFilteredRecipes(response.data);

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

                setFilterOptions(
                    uniqueCuisines.map((cuisine) => ({
                        type: "cuisine",
                        value: cuisine,
                    }))
                );

                Promise.all(
                    response.data.map((recipe: Recipe) =>
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
                                    </select>
                                )}
                            </div>
                            <div className="mt-4">
                                <h3 className="text-lg font-semibold text-white mb-2">
                                    Filter Options
                                </h3>
                                <FilterOptions
                                    filterOptions={filterOptions}
                                    setAppliedFilters={setAppliedFilters}
                                    setFilterOptions={setFilterOptions}
                                />
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
                                        className="recipe-card p-4 rounded shadow bg-gray-700 transform transition-transform duration-200 hover:scale-105"
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
                                                onClick={() =>
                                                    toggleFavorite(recipe.id)
                                                }
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
                                            <Link to="/chef-master">
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
        </DndProvider>
    );
};

export default Recipes;
