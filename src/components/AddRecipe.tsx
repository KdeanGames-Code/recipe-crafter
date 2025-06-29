/* AddRecipe.tsx - Component for adding or editing a recipe in the Recipe Crafter app */

/* Dependencies:
 * - src/utils/formUtils.tsx: Provides helper functions (handleInputChange, handleImageUpload, handleImageUrlChange, handleSubmit)
 * - src/components/InfoBox.tsx: Renders contextual help text in the sidebar based on focusedField and imageMode
 * - src/components/IngredientRow.tsx: Renders each ingredient row in the form with inputs for unit, quantity, and name
 * - src/config/apiConfig.ts: Provides API_BASE_URL for axios requests
 * - src/assets/images/placeholder-kitchen-672x448.png: Placeholder image for recipe preview
 * - src/utils/ingredientUtils.tsx: Provides helper functions for managing ingredients (addIngredient, removeIngredient, handleIngredientChange, handleIngredientUnitChange, fractionToDecimal)
 */

import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import API_BASE_URL from "../config/apiConfig";
import placeholderPopup from "../assets/images/placeholder-kitchen-672x448.png";
import IngredientRow from "./IngredientRow";
import InfoBox from "./InfoBox";
import {
    handleInputChange,
    handleImageUpload,
    handleImageUrlChange,
} from "../utils/formUtils";
import {
    addIngredient,
    removeIngredient,
    handleIngredientChange,
    handleIngredientUnitChange,
    fractionToDecimal,
} from "../utils/ingredientUtils";

export interface Tag {
    tag_type: "allergen" | "dietary";
    tag_name: string;
}

export interface Recipe {
    id?: number;
    title: string;
    description?: string;
    cuisine: string;
    dish_type: string;
    ingredients: { quantity: number; unit: string; name: string }[];
    instructions: InstructionSection[] | string;
    image_url?: string;
}

export interface FetchedRecipe {
    id?: number;
    title: string;
    description?: string;
    cuisine: string;
    dish_type: string;
    ingredients?: (string | { quantity: number; unit: string; name: string })[];
    instructions: string;
    image_url?: string;
}

export interface TagBadge {
    type: "allergen" | "dietary";
    value: string;
}

export interface Ingredient {
    wholeNumber: number;
    fraction: string;
    quantity: number;
    unit: string;
    name: string;
}

export interface InstructionSection {
    title: string;
    steps: string[];
}

const ItemTypes = {
    TAG: "tag",
    SECTION: "section",
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
    onTagBoxClick,
    setAvailableAllergens,
    setAvailableDietaryTags,
}: {
    appliedTags: TagBadge[];
    setAppliedTags: React.Dispatch<React.SetStateAction<TagBadge[]>>;
    tagType: "allergen" | "dietary";
    onTagBoxClick: (tagType: "allergen" | "dietary") => void;
    setAvailableAllergens: React.Dispatch<React.SetStateAction<string[]>>;
    setAvailableDietaryTags: React.Dispatch<React.SetStateAction<string[]>>;
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
                console.log(`Dropping ${item.type} tag: ${item.value}`);
                setAppliedTags((prev) => {
                    const newTags = [...prev, item];
                    console.log("Updated appliedTags:", newTags);
                    return newTags;
                });
                // Remove the tag from the sidebar's available tags
                if (item.type === "allergen") {
                    setAvailableAllergens((prev) => {
                        const newAvailable = prev.filter(
                            (tag) => tag !== item.value
                        );
                        console.log(
                            "Updated availableAllergens:",
                            newAvailable
                        );
                        return newAvailable;
                    });
                } else if (item.type === "dietary") {
                    setAvailableDietaryTags((prev) => {
                        const newAvailable = prev.filter(
                            (tag) => tag !== item.value
                        );
                        console.log(
                            "Updated availableDietaryTags:",
                            newAvailable
                        );
                        return newAvailable;
                    });
                }
                // Force a sidebar update by toggling focusedField
                onTagBoxClick(tagType);
            }
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }));

    drop(tagBoxRef);

    const handleRemove = (badge: TagBadge) => {
        console.log(`Removing ${badge.type} tag: ${badge.value}`);
        setAppliedTags((prev) => {
            const newTags = prev.filter(
                (tag) => !(tag.type === badge.type && tag.value === badge.value)
            );
            console.log("Updated appliedTags after removal:", newTags);
            return newTags;
        });
        // Add the tag back to the sidebar's available tags
        if (badge.type === "allergen") {
            setAvailableAllergens((prev) => {
                const newAvailable = [...prev, badge.value].sort((a, b) =>
                    a.localeCompare(b)
                );
                console.log(
                    "Updated availableAllergens after adding back:",
                    newAvailable
                );
                return newAvailable;
            });
        } else if (badge.type === "dietary") {
            setAvailableDietaryTags((prev) => {
                const newAvailable = [...prev, badge.value].sort((a, b) =>
                    a.localeCompare(b)
                );
                console.log(
                    "Updated availableDietaryTags after adding back:",
                    newAvailable
                );
                return newAvailable;
            });
        }
        // Force a sidebar update by toggling focusedField
        onTagBoxClick(tagType);
    };

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation(); // Prevent the click from bubbling up and triggering the document click handler
        console.log(`TagBox clicked for ${tagType}`);
        onTagBoxClick(tagType);
    };

    console.log(
        `Rendering TagBox for ${tagType} with appliedTags:`,
        appliedTags
    );

    return (
        <div
            ref={tagBoxRef}
            className={`tag-box custom-scrollbar ${
                isOver ? "tag-box-drag-over" : ""
            }`}
            onClick={handleClick}
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

// Component for a single instruction section with drag-and-drop
const InstructionSectionComponent = ({
    section,
    sectionIndex,
    updateSectionTitle,
    addStep,
    updateStep,
    removeStep,
    removeSection,
    moveSection,
}: {
    section: InstructionSection;
    sectionIndex: number;
    updateSectionTitle: (sectionIndex: number, title: string) => void;
    addStep: (sectionIndex: number) => void;
    updateStep: (
        sectionIndex: number,
        stepIndex: number,
        value: string
    ) => void;
    removeStep: (sectionIndex: number, stepIndex: number) => void;
    removeSection: (sectionIndex: number) => void;
    moveSection: (dragIndex: number, hoverIndex: number) => void;
}) => {
    const suggestedTitles = [
        "Preparation",
        "Cooking",
        "Assembly",
        "Serving",
        "Baking",
        "Marinade",
        "Garnishing",
        "Cooling",
        "Storage",
        "Tips",
        "Custom",
    ];

    const [showCustomInput, setShowCustomInput] = useState<boolean>(
        !suggestedTitles.includes(section.title) && section.title !== ""
    );

    const ref = useRef<HTMLDivElement>(null);

    const [{ isDragging }, drag] = useDrag({
        type: ItemTypes.SECTION,
        item: { index: sectionIndex },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    const [, drop] = useDrop({
        accept: ItemTypes.SECTION,
        hover: (item: { index: number }) => {
            if (!ref.current) return;
            const dragIndex = item.index;
            const hoverIndex = sectionIndex;

            if (dragIndex === hoverIndex) return;

            moveSection(dragIndex, hoverIndex);
            item.index = hoverIndex; // Update the index for subsequent hovers
        },
    });

    drag(drop(ref));

    const handleTitleChange = (
        e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
    ) => {
        const value = e.target.value;
        if (value === "Custom") {
            setShowCustomInput(true);
            updateSectionTitle(sectionIndex, "");
        } else {
            setShowCustomInput(false);
            updateSectionTitle(sectionIndex, value);
        }
    };

    return (
        <div
            ref={ref}
            className={`mb-4 p-4 bg-gray-700 rounded-lg ${
                isDragging ? "opacity-50" : ""
            }`}
            style={{ cursor: "move" }}
        >
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    {showCustomInput ? (
                        <input
                            type="text"
                            value={section.title}
                            onChange={(e) =>
                                updateSectionTitle(sectionIndex, e.target.value)
                            }
                            onFocus={() => handleFocus("instructions")}
                            onBlur={() => setFocusedField(null)}
                            className="form-input w-64"
                            placeholder="Enter section title"
                        />
                    ) : (
                        <select
                            value={section.title || ""}
                            onChange={handleTitleChange}
                            onFocus={() => handleFocus("instructions")}
                            onBlur={() => setFocusedField(null)}
                            className="form-input w-64"
                        >
                            <option value="" disabled>
                                Select Section Title
                            </option>
                            {suggestedTitles.map((title) => (
                                <option key={title} value={title}>
                                    {title}
                                </option>
                            ))}
                        </select>
                    )}
                </div>
                <button
                    type="button"
                    onClick={() => removeSection(sectionIndex)}
                    className="remove-button"
                >
                    <i className="fas fa-trash"></i>
                </button>
            </div>
            {section.steps.map((step, stepIndex) => (
                <div key={stepIndex} className="flex items-center gap-2 mb-2">
                    <span className="text-yellow-500 w-8">{`${
                        stepIndex + 1
                    }.`}</span>
                    <input
                        type="text"
                        value={step}
                        onChange={(e) =>
                            updateStep(sectionIndex, stepIndex, e.target.value)
                        }
                        onFocus={() => handleFocus("instructions")}
                        onBlur={() => setFocusedField(null)}
                        className="form-input flex-1"
                        placeholder={`Step ${stepIndex + 1}`}
                    />
                    <button
                        type="button"
                        onClick={() => removeStep(sectionIndex, stepIndex)}
                        className="remove-button"
                    >
                        <i className="fas fa-trash"></i>
                    </button>
                </div>
            ))}
            <button
                type="button"
                onClick={() => addStep(sectionIndex)}
                className="action-button"
            >
                <i className="fas fa-plus-circle mr-1"></i> Add Step
            </button>
        </div>
    );
};

let handleFocus: (field: string) => void;
let setFocusedField: (field: string | null) => void;

const AddRecipe = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [availableAllergens, setAvailableAllergens] = useState<string[]>([]);
    const [availableDietaryTags, setAvailableDietaryTags] = useState<string[]>(
        []
    );
    const [cuisines, setCuisines] = useState<string[]>([]);
    const [dishTypes, setDishTypes] = useState<string[]>([]);
    const [isLoadingTags, setIsLoadingTags] = useState<boolean>(true);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [focusedField, setFocusedFieldState] = useState<string | null>(null);

    // Form state with pre-populated instructions
    const [recipe, setRecipe] = useState<Recipe>({
        title: "",
        description: "",
        cuisine: "",
        dish_type: "",
        ingredients: [{ quantity: 0, unit: "unitless", name: "" }],
        instructions: [{ title: "Preparation", steps: [""] }], // Pre-populate with a default section and step
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

    // Add Cuisine/Dish Type/Unit state
    const [showAddCuisine, setShowAddCuisine] = useState<boolean>(false);
    const [newCuisine, setNewCuisine] = useState<string>("");
    const [showAddDishType, setShowAddDishType] = useState<boolean>(false);
    const [newDishType, setNewDishType] = useState<string>("");
    const [showAddUnit, setShowAddUnit] = useState<boolean>(false);
    const [newUnit, setNewUnit] = useState<string>("");
    const [units, setUnits] = useState<string[]>([
        "cup",
        "teaspoon",
        "tablespoon",
        "liter",
        "milliliter",
        "gram",
        "kilogram",
        "ounce",
        "pound",
        "unitless",
    ]);

    // State for ingredients with fractional support
    const [ingredients, setIngredients] = useState<Ingredient[]>([
        {
            wholeNumber: 0,
            fraction: "",
            quantity: 0,
            unit: "unitless",
            name: "",
        },
    ]);

    // Common fractions (excluding whole numbers since we have a Whole Number input)
    const fractions = ["", "1/8", "1/4", "1/3", "1/2", "2/3", "3/4"];

    // Units that typically use fractions
    const fractionalUnits = ["cup", "teaspoon", "tablespoon"];

    // Character limits
    const TITLE_MAX_LENGTH = 100;
    const DESCRIPTION_MAX_LENGTH = 500;

    // Ref for tag boxes to handle click outside
    const allergenTagBoxRef = useRef<HTMLDivElement>(null);
    const dietaryTagBoxRef = useRef<HTMLDivElement>(null);

    // Assign handleFocus and setFocusedField
    handleFocus = (field: string) => {
        console.log(`Setting focusedField to ${field}`);
        // Toggle focusedField to force a re-render
        setFocusedFieldState(null);
        setTimeout(() => {
            setFocusedFieldState(field);
        }, 0);
        setShowAddCuisine(false);
        setShowAddDishType(false);
        setShowAddUnit(false);
    };

    setFocusedField = (field: string | null) => {
        console.log(`Clearing focusedField to ${field}`);
        setFocusedFieldState(field);
    };

    // Handle clicks outside the tag boxes to clear focusedField
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const allergenNode = allergenTagBoxRef.current;
            const dietaryNode = dietaryTagBoxRef.current;
            if (
                focusedField &&
                !(
                    allergenNode && allergenNode.contains(event.target as Node)
                ) &&
                !(dietaryNode && dietaryNode.contains(event.target as Node))
            ) {
                console.log("Click outside detected, clearing focusedField");
                setFocusedField(null);
            }
        };

        document.addEventListener("click", handleClickOutside);
        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, [focusedField]);

    // Update recipe.ingredients whenever ingredients state changes
    useEffect(() => {
        const updatedIngredients = ingredients.map((ingredient) => {
            const isFractionalUnit = fractionalUnits.includes(ingredient.unit);
            const fractionValue = isFractionalUnit
                ? fractionToDecimal(ingredient.fraction)
                : 0;
            return {
                quantity: ingredient.wholeNumber + fractionValue,
                unit: ingredient.unit,
                name: ingredient.name,
            };
        });
        setRecipe((prev) => ({ ...prev, ingredients: updatedIngredients }));
    }, [ingredients]);

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
                console.log("Fetched allergenTags:", allergenTags);
                console.log("Fetched dietaryTagsList:", dietaryTagsList);
                setAvailableAllergens(allergenTags); // Initialize available tags
                setAvailableDietaryTags(dietaryTagsList); // Initialize available tags
                setIsLoadingTags(false);
            })
            .catch((error) => {
                console.error("Error fetching tags:", error);
                setErrorMessage(
                    "Failed to load tag options. Please try again later."
                );
                setAvailableAllergens([]);
                setAvailableDietaryTags([]);
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
                    const fetchedRecipe: FetchedRecipe = response.data;
                    const loadedIngredients = fetchedRecipe.ingredients
                        ? fetchedRecipe.ingredients.map(
                              (
                                  item:
                                      | string
                                      | {
                                            quantity: number;
                                            unit: string;
                                            name: string;
                                        }
                              ) => {
                                  if (typeof item === "string") {
                                      const parts = item.trim().split(" ");
                                      let quantity = 0;
                                      let unitIndex = 1;
                                      let wholeNumber = 0;
                                      let fraction = "";
                                      if (parts.length >= 3) {
                                          if (parts[1].includes("/")) {
                                              wholeNumber =
                                                  parseInt(parts[0]) || 0;
                                              fraction = parts[1];
                                              quantity =
                                                  wholeNumber +
                                                  fractionToDecimal(fraction);
                                              unitIndex = 2;
                                          } else {
                                              quantity =
                                                  parseFloat(parts[0]) || 0;
                                              wholeNumber =
                                                  Math.floor(quantity);
                                              const fracValue =
                                                  quantity - wholeNumber;
                                              fraction = fractions.reduce(
                                                  (closest, f) => {
                                                      const fValue =
                                                          fractionToDecimal(f);
                                                      return Math.abs(
                                                          fValue - fracValue
                                                      ) <
                                                          Math.abs(
                                                              fractionToDecimal(
                                                                  closest
                                                              ) - fracValue
                                                          )
                                                          ? f
                                                          : closest;
                                                  },
                                                  ""
                                              );
                                          }
                                          return {
                                              wholeNumber,
                                              fraction,
                                              quantity,
                                              unit: parts[unitIndex],
                                              name: parts
                                                  .slice(unitIndex + 1)
                                                  .join(" "),
                                          };
                                      }
                                      return {
                                          wholeNumber: 0,
                                          fraction: "",
                                          quantity: 0,
                                          unit: "unitless",
                                          name: item,
                                      };
                                  }
                                  const wholeNumber = Math.floor(item.quantity);
                                  const fracValue = item.quantity - wholeNumber;
                                  const fraction = fractions.reduce(
                                      (closest, f) => {
                                          const fValue = fractionToDecimal(f);
                                          return Math.abs(fValue - fracValue) <
                                              Math.abs(
                                                  fractionToDecimal(closest) -
                                                      fracValue
                                              )
                                              ? f
                                              : closest;
                                      },
                                      ""
                                  );
                                  return {
                                      wholeNumber,
                                      fraction,
                                      quantity: item.quantity,
                                      unit: item.unit,
                                      name: item.name,
                                  };
                              }
                          )
                        : [
                              {
                                  wholeNumber: 0,
                                  fraction: "",
                                  quantity: 0,
                                  unit: "unitless",
                                  name: "",
                              },
                          ];

                    // Parse instructions string into structured format
                    const parsedInstructions = parseInstructions(
                        fetchedRecipe.instructions
                    );

                    setIngredients(loadedIngredients);
                    setRecipe({
                        title: fetchedRecipe.title || "",
                        description: fetchedRecipe.description || "",
                        cuisine: fetchedRecipe.cuisine || "",
                        dish_type: fetchedRecipe.dish_type || "",
                        ingredients: loadedIngredients.map((item) => ({
                            quantity: item.quantity,
                            unit: item.unit,
                            name: item.name,
                        })),
                        instructions: parsedInstructions,
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
                            console.log(
                                "Fetched recipeTags for editing:",
                                recipeTags
                            );
                            setSelectedTags(recipeTags);
                            // Remove fetched tags from available lists
                            recipeTags.forEach((tag: TagBadge) => {
                                if (tag.type === "allergen") {
                                    setAvailableAllergens((prev) => {
                                        const newAvailable = prev.filter(
                                            (t) => t !== tag.value
                                        );
                                        console.log(
                                            "Updated availableAllergens after removing fetched tags:",
                                            newAvailable
                                        );
                                        return newAvailable;
                                    });
                                } else if (tag.type === "dietary") {
                                    setAvailableDietaryTags((prev) => {
                                        const newAvailable = prev.filter(
                                            (t) => t !== tag.value
                                        );
                                        console.log(
                                            "Updated availableDietaryTags after removing fetched tags:",
                                            newAvailable
                                        );
                                        return newAvailable;
                                    });
                                }
                            });
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

    // Function to parse instructions string into structured format
    const parseInstructions = (instructions: string): InstructionSection[] => {
        if (!instructions || instructions.trim() === "") {
            return [{ title: "Preparation", steps: [""] }]; // Default section for new recipes
        }

        const sections: InstructionSection[] = [];
        const lines = instructions
            .split("\n")
            .filter((line) => line.trim() !== "");
        let currentSection: InstructionSection | null = null;

        for (const line of lines) {
            const trimmedLine = line.trim();
            const sectionMatch = trimmedLine.match(/^\[(.+)\]$/);
            if (sectionMatch) {
                if (currentSection) {
                    sections.push(currentSection);
                }
                currentSection = { title: sectionMatch[1], steps: [] };
            } else if (currentSection) {
                const stepMatch = trimmedLine.match(/^\d+\.\s*(.+)$/);
                if (stepMatch) {
                    currentSection.steps.push(stepMatch[1]);
                }
            }
        }

        if (currentSection) {
            if (currentSection.steps.length === 0) {
                currentSection.steps.push(""); // Ensure at least one step
            }
            sections.push(currentSection);
        }

        if (sections.length === 0) {
            sections.push({ title: "Preparation", steps: [""] });
        }

        return sections;
    };

    // Function to serialize instructions back into a string
    const serializeInstructions = (
        instructions: InstructionSection[]
    ): string => {
        return instructions
            .map((section) => {
                if (!section.title.trim()) return "";
                const sectionTitle = `[${section.title}]`;
                const steps = section.steps
                    .filter((step) => step.trim() !== "")
                    .map((step, index) => `${index + 1}. ${step}`);
                return [sectionTitle, ...steps].join("\n");
            })
            .filter((section) => section !== "")
            .join("\n\n");
    };

    // Handle adding new cuisines, dish types, and units
    const handleAddCuisine = () => {
        if (newCuisine.trim()) {
            setCuisines((prev) => [...prev, newCuisine.trim()]);
            setRecipe((prev) => ({ ...prev, cuisine: newCuisine.trim() }));
            setNewCuisine("");
        }
    };

    const handleAddDishType = () => {
        if (newDishType.trim()) {
            setDishTypes((prev) => [...prev, newDishType.trim()]);
            setRecipe((prev) => ({ ...prev, dish_type: newDishType.trim() }));
            setNewDishType("");
        }
    };

    const handleAddUnit = () => {
        if (newUnit.trim()) {
            setUnits((prev) => [...prev, newUnit.trim()]);
            setNewUnit("");
            setShowAddUnit(false);
        }
    };

    // Handler for TagBox clicks
    const handleTagBoxClick = (tagType: "allergen" | "dietary") => {
        handleFocus(tagType === "allergen" ? "allergens" : "dietary");
    };

    // Instructions section handlers
    const addInstructionSection = () => {
        const newSection: InstructionSection = {
            title: "Preparation",
            steps: [""],
        };
        setRecipe((prev) => ({
            ...prev,
            instructions: [
                ...(prev.instructions as InstructionSection[]),
                newSection,
            ],
        }));
    };

    const updateSectionTitle = (sectionIndex: number, title: string) => {
        setRecipe((prev) => {
            const updatedInstructions = [
                ...(prev.instructions as InstructionSection[]),
            ];
            updatedInstructions[sectionIndex] = {
                ...updatedInstructions[sectionIndex],
                title,
            };
            return { ...prev, instructions: updatedInstructions };
        });
    };

    const addStep = (sectionIndex: number) => {
        setRecipe((prev) => {
            const updatedInstructions = [
                ...(prev.instructions as InstructionSection[]),
            ];
            updatedInstructions[sectionIndex].steps.push("");
            return { ...prev, instructions: updatedInstructions };
        });
    };

    const updateStep = (
        sectionIndex: number,
        stepIndex: number,
        value: string
    ) => {
        setRecipe((prev) => {
            const updatedInstructions = [
                ...(prev.instructions as InstructionSection[]),
            ];
            updatedInstructions[sectionIndex].steps[stepIndex] = value;
            return { ...prev, instructions: updatedInstructions };
        });
    };

    const removeStep = (sectionIndex: number, stepIndex: number) => {
        setRecipe((prev) => {
            const updatedInstructions = [
                ...(prev.instructions as InstructionSection[]),
            ];
            updatedInstructions[sectionIndex].steps = updatedInstructions[
                sectionIndex
            ].steps.filter((_, index) => index !== stepIndex);
            if (updatedInstructions[sectionIndex].steps.length === 0) {
                updatedInstructions[sectionIndex].steps.push(""); // Ensure at least one step
            }
            return { ...prev, instructions: updatedInstructions };
        });
    };

    const removeSection = (sectionIndex: number) => {
        setRecipe((prev) => {
            const updatedInstructions = (
                prev.instructions as InstructionSection[]
            ).filter((_, index) => index !== sectionIndex);
            if (updatedInstructions.length === 0) {
                updatedInstructions.push({ title: "Preparation", steps: [""] }); // Ensure at least one section
            }
            return { ...prev, instructions: updatedInstructions };
        });
    };

    const moveSection = (dragIndex: number, hoverIndex: number) => {
        setRecipe((prev) => {
            const updatedInstructions = [
                ...(prev.instructions as InstructionSection[]),
            ];
            const [draggedSection] = updatedInstructions.splice(dragIndex, 1);
            updatedInstructions.splice(hoverIndex, 0, draggedSection);
            return { ...prev, instructions: updatedInstructions };
        });
    };

    // Override handleSubmit to serialize instructions before saving
    const customHandleSubmit = async (
        e: React.FormEvent,
        recipe: Recipe,
        ingredients: Ingredient[],
        imageState: {
            imageMode: "upload" | "url";
            imageFile: File | null;
            imagePreview: string | null;
            imageUrlError: string;
        },
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
            errors.ingredients =
                "At least one ingredient with a name is required.";
        } else {
            const invalidQuantity = ingredients.some(
                (ingredient) =>
                    ingredient.quantity < 0 ||
                    (ingredient.quantity === 0 &&
                        ingredient.unit !== "unitless")
            );
            if (invalidQuantity) {
                errors.ingredients =
                    "Quantity must be positive (or 0 for 'unitless').";
            }
        }

        // Validate instructions
        const instructions = recipe.instructions as InstructionSection[];
        const hasValidInstructions = instructions.some(
            (section) =>
                section.title.trim() !== "" &&
                section.steps.some((step) => step.trim() !== "")
        );
        if (!hasValidInstructions) {
            errors.instructions =
                "At least one section with at least one non-empty step is required.";
        }

        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            return;
        }

        setIsSubmitting(true);
        try {
            let recipeId: number;
            // Serialize instructions back into a string
            const serializedInstructions = serializeInstructions(instructions);
            const recipeData = {
                ...recipe,
                ingredients: recipe.ingredients.filter((ingredient) =>
                    ingredient.name.trim()
                ),
                instructions: serializedInstructions,
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

    console.log("Rendering AddRecipe with focusedField:", focusedField);
    console.log("availableAllergens:", availableAllergens);
    console.log("availableDietaryTags:", availableDietaryTags);

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
                                        <InfoBox
                                            focusedField={focusedField}
                                            imageMode={imageMode}
                                        />
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
                                                    handleFocus("cuisine")
                                                }
                                                className="form-input"
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
                                                    handleFocus("dish_type")
                                                }
                                                className="form-input"
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
                                {/* Add Unit */}
                                {showAddUnit && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-yellow-500 mb-2">
                                            Add New Unit
                                        </h3>
                                        <div className="flex items-center mb-2">
                                            <input
                                                type="text"
                                                value={newUnit}
                                                onChange={(e) =>
                                                    setNewUnit(e.target.value)
                                                }
                                                onFocus={() =>
                                                    handleFocus("ingredients")
                                                }
                                                className="form-input"
                                                placeholder="Enter new unit"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleAddUnit}
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
                                                {availableAllergens.length >
                                                0 ? (
                                                    availableAllergens.map(
                                                        (allergen) => (
                                                            <TagBadge
                                                                key={`allergen-${allergen}`}
                                                                badge={{
                                                                    type: "allergen",
                                                                    value: allergen,
                                                                }}
                                                                onRemove={() => {}}
                                                                showRemove={
                                                                    false
                                                                }
                                                            />
                                                        )
                                                    )
                                                ) : (
                                                    <p className="text-gray-400">
                                                        No allergen tags
                                                        available
                                                    </p>
                                                )}
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
                                                {availableDietaryTags.length >
                                                0 ? (
                                                    availableDietaryTags.map(
                                                        (dietary) => (
                                                            <TagBadge
                                                                key={`dietary-${dietary}`}
                                                                badge={{
                                                                    type: "dietary",
                                                                    value: dietary,
                                                                }}
                                                                onRemove={() => {}}
                                                                showRemove={
                                                                    false
                                                                }
                                                            />
                                                        )
                                                    )
                                                ) : (
                                                    <p className="text-gray-400">
                                                        No dietary tags
                                                        available
                                                    </p>
                                                )}
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
                        <form
                            onSubmit={(e) =>
                                customHandleSubmit(
                                    e,
                                    recipe,
                                    ingredients,
                                    {
                                        imageMode,
                                        imageFile,
                                        imagePreview,
                                        imageUrlError,
                                    },
                                    selectedTags,
                                    setValidationErrors,
                                    setIsSubmitting,
                                    navigate,
                                    API_BASE_URL,
                                    id
                                )
                            }
                            className="space-y-6"
                        >
                            {/* Title */}
                            <div>
                                <div className="label-group">
                                    <label className="block text-yellow-500 text-lg font-semibold mb-1">
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
                                    onChange={(e) =>
                                        handleInputChange(
                                            e,
                                            setRecipe,
                                            setValidationErrors,
                                            setShowAddCuisine,
                                            setShowAddDishType,
                                            setShowAddUnit,
                                            TITLE_MAX_LENGTH,
                                            DESCRIPTION_MAX_LENGTH
                                        )
                                    }
                                    onFocus={() => handleFocus("title")}
                                    onBlur={() => setFocusedField(null)}
                                    className={`form-input ${
                                        validationErrors.title
                                            ? "border-red-500"
                                            : ""
                                    }`}
                                    placeholder="e.g., Grandma's Secret Lasagna"
                                    maxLength={TITLE_MAX_LENGTH}
                                />
                                <p className="character-count">
                                    {recipe.title.length}/{TITLE_MAX_LENGTH}{" "}
                                    characters
                                </p>
                            </div>
                            {/* Description */}
                            <div>
                                <label className="block text-yellow-500 text-lg font-semibold mb-1">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={recipe.description || ""}
                                    onChange={(e) =>
                                        handleInputChange(
                                            e,
                                            setRecipe,
                                            setValidationErrors,
                                            setShowAddCuisine,
                                            setShowAddDishType,
                                            setShowAddUnit,
                                            TITLE_MAX_LENGTH,
                                            DESCRIPTION_MAX_LENGTH
                                        )
                                    }
                                    onFocus={() => handleFocus("description")}
                                    onBlur={() => setFocusedField(null)}
                                    className="form-input"
                                    placeholder="e.g., A creamy pasta dish perfect for cozy nights..."
                                    rows={4}
                                    maxLength={DESCRIPTION_MAX_LENGTH}
                                />
                                <p className="character-count">
                                    {(recipe.description || "").length}/
                                    {DESCRIPTION_MAX_LENGTH} characters
                                </p>
                            </div>
                            {/* Cuisine & Dish Type (Same Row) */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <div className="label-group">
                                        <label className="block text-yellow-500 text-lg font-semibold mb-1">
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
                                        onChange={(e) =>
                                            handleInputChange(
                                                e,
                                                setRecipe,
                                                setValidationErrors,
                                                setShowAddCuisine,
                                                setShowAddDishType,
                                                setShowAddUnit,
                                                TITLE_MAX_LENGTH,
                                                DESCRIPTION_MAX_LENGTH
                                            )
                                        }
                                        onFocus={() => handleFocus("cuisine")}
                                        onBlur={() => setFocusedField(null)}
                                        className={`form-input ${
                                            validationErrors.cuisine
                                                ? "border-red-500"
                                                : ""
                                        }`}
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
                                    {recipe.cuisine &&
                                        recipe.cuisine !== "add_cuisine" && (
                                            <p className="selected-option">
                                                Selected: {recipe.cuisine}
                                            </p>
                                        )}
                                </div>
                                <div>
                                    <div className="label-group">
                                        <label className="block text-yellow-500 text-lg font-semibold mb-1">
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
                                        onChange={(e) =>
                                            handleInputChange(
                                                e,
                                                setRecipe,
                                                setValidationErrors,
                                                setShowAddCuisine,
                                                setShowAddDishType,
                                                setShowAddUnit,
                                                TITLE_MAX_LENGTH,
                                                DESCRIPTION_MAX_LENGTH
                                            )
                                        }
                                        onFocus={() => handleFocus("dish_type")}
                                        onBlur={() => setFocusedField(null)}
                                        className={`form-input ${
                                            validationErrors.dish_type
                                                ? "border-red-500"
                                                : ""
                                        }`}
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
                                    {recipe.dish_type &&
                                        recipe.dish_type !==
                                            "add_dish_type" && (
                                            <p className="selected-option">
                                                Selected: {recipe.dish_type}
                                            </p>
                                        )}
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
                                {/* Field Labels */}
                                <div className="flex gap-2 mb-2">
                                    <span
                                        className="text-dijon"
                                        style={{ width: "180px" }}
                                    >
                                        Unit
                                    </span>
                                    <span
                                        className="text-dijon"
                                        style={{ width: "180px" }}
                                    >
                                        Whole Number
                                    </span>
                                    <span
                                        className="text-dijon"
                                        style={{ width: "180px" }}
                                    >
                                        Fraction
                                    </span>
                                    <span className="text-dijon flex-1">
                                        Ingredient Name
                                    </span>
                                    <span className="w-6"></span>{" "}
                                    {/* Spacer for Remove button */}
                                </div>
                                {ingredients.map((ingredient, index) => (
                                    <IngredientRow
                                        key={index}
                                        ingredient={ingredient}
                                        index={index}
                                        units={units}
                                        fractionalUnits={fractionalUnits}
                                        fractions={fractions}
                                        handleIngredientChange={(
                                            index,
                                            field,
                                            value
                                        ) =>
                                            handleIngredientChange(
                                                index,
                                                field,
                                                value,
                                                ingredients,
                                                setIngredients,
                                                setValidationErrors
                                            )
                                        }
                                        handleIngredientUnitChange={(
                                            index,
                                            value
                                        ) =>
                                            handleIngredientUnitChange(
                                                index,
                                                value,
                                                ingredients,
                                                setIngredients,
                                                setValidationErrors,
                                                fractionalUnits
                                            )
                                        }
                                        removeIngredient={(index) =>
                                            removeIngredient(
                                                index,
                                                ingredients,
                                                setIngredients
                                            )
                                        }
                                        handleFocus={handleFocus}
                                        setFocusedField={setFocusedField}
                                        showRemove={ingredients.length > 1}
                                    />
                                ))}
                                <button
                                    type="button"
                                    onClick={() =>
                                        addIngredient(setIngredients)
                                    }
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
                                <div className="instructions-box p-4 border-2 border-dashed border-gray-600 rounded-lg min-h-[150px] overflow-y-auto custom-scrollbar mb-4">
                                    {(
                                        recipe.instructions as InstructionSection[]
                                    ).map((section, sectionIndex) => (
                                        <InstructionSectionComponent
                                            key={sectionIndex}
                                            section={section}
                                            sectionIndex={sectionIndex}
                                            updateSectionTitle={
                                                updateSectionTitle
                                            }
                                            addStep={addStep}
                                            updateStep={updateStep}
                                            removeStep={removeStep}
                                            removeSection={removeSection}
                                            moveSection={moveSection}
                                        />
                                    ))}
                                </div>
                                <button
                                    type="button"
                                    onClick={addInstructionSection}
                                    className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-gray-900 font-semibold py-2 px-4 rounded-lg border border-yellow-500 shadow-lg hover:from-yellow-300 hover:to-yellow-500 hover:shadow-xl active:shadow-inner transition-all duration-200"
                                >
                                    <i className="fas fa-plus-circle mr-1"></i>{" "}
                                    Add Section
                                </button>
                            </div>
                            {/* Allergens & Dietary Tags (Same Row) */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-yellow-500 mb-1">
                                        Allergens
                                    </label>
                                    <div ref={allergenTagBoxRef}>
                                        <TagBox
                                            appliedTags={selectedTags}
                                            setAppliedTags={setSelectedTags}
                                            tagType="allergen"
                                            onTagBoxClick={handleTagBoxClick}
                                            setAvailableAllergens={
                                                setAvailableAllergens
                                            }
                                            setAvailableDietaryTags={
                                                setAvailableDietaryTags
                                            }
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-yellow-500 mb-1">
                                        Dietary Tags
                                    </label>
                                    <div ref={dietaryTagBoxRef}>
                                        <TagBox
                                            appliedTags={selectedTags}
                                            setAppliedTags={setSelectedTags}
                                            tagType="dietary"
                                            onTagBoxClick={handleTagBoxClick}
                                            setAvailableAllergens={
                                                setAvailableAllergens
                                            }
                                            setAvailableDietaryTags={
                                                setAvailableDietaryTags
                                            }
                                        />
                                    </div>
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
                                                onChange={(e) =>
                                                    handleImageUpload(
                                                        e,
                                                        setImageFile,
                                                        setImagePreview
                                                    )
                                                }
                                                onFocus={() =>
                                                    handleFocus("image_url")
                                                }
                                                onBlur={() =>
                                                    setFocusedField(null)
                                                }
                                                className="form-input"
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
                                                onChange={(e) =>
                                                    handleImageUrlChange(
                                                        e,
                                                        setRecipe,
                                                        setImageUrlError,
                                                        setImagePreview
                                                    )
                                                }
                                                onFocus={() =>
                                                    handleFocus("image_url")
                                                }
                                                onBlur={() =>
                                                    setFocusedField(null)
                                                }
                                                className="form-input"
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
