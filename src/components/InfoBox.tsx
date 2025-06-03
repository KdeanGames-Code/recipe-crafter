import React from "react";

interface InfoBoxProps {
    focusedField: string | null;
    imageMode: "upload" | "url";
}

const InfoBox: React.FC<InfoBoxProps> = ({ focusedField, imageMode }) => {
    switch (focusedField) {
        case "title":
            return (
                <div>
                    <p className="mb-2">
                        Give your recipe a catchy and descriptive title to grab
                        attention.
                    </p>
                    <p className="mb-2">Tips for a great title:</p>
                    <ul className="list-disc list-inside mb-2">
                        <li>
                            Be specific (e.g., "Spicy Chicken Tacos" instead of
                            "Tacos").
                        </li>
                        <li>
                            Add a unique twist (e.g., "Grandma's Secret
                            Lasagna").
                        </li>
                        <li>Keep it under 100 characters for clarity.</li>
                    </ul>
                    <p className="mb-2">Examples to inspire you:</p>
                    <ul className="list-disc list-inside">
                        <li>Grandma's Secret Lasagna</li>
                        <li>Spicy Midnight Tacos</li>
                        <li>Sunset Citrus Salad</li>
                    </ul>
                </div>
            );
        case "description":
            return (
                <div>
                    <p className="mb-2">
                        Write a short description to give a taste of what your
                        recipe is about.
                    </p>
                    <p className="mb-2">What to include:</p>
                    <ul className="list-disc list-inside mb-2">
                        <li>
                            Highlight the dish's vibe (e.g., "A creamy pasta
                            dish perfect for cozy nights").
                        </li>
                        <li>
                            Mention serving suggestions (e.g., "Best served with
                            garlic bread").
                        </li>
                        <li>Keep it under 500 characters to stay concise.</li>
                    </ul>
                    <p className="mb-2">Examples to inspire you:</p>
                    <ul className="list-disc list-inside">
                        <li>
                            A creamy pasta dish perfect for cozy nights, best
                            served with garlic bread.
                        </li>
                        <li>
                            This tangy salad brings summer vibes, great for
                            picnics or BBQs!
                        </li>
                    </ul>
                </div>
            );
        case "cuisine":
            return (
                <div>
                    <p className="mb-2">
                        Select the cuisine that best represents your recipe’s
                        cultural or flavor profile.
                    </p>
                    <p className="mb-2">How to choose:</p>
                    <ul className="list-disc list-inside mb-2">
                        <li>
                            Pick a cuisine that matches the dish’s origin or
                            style (e.g., Italian for pasta).
                        </li>
                        <li>
                            Choose "Add Cuisine" to create a new one if your
                            cuisine isn’t listed.
                        </li>
                        <li>
                            Think about the flavors (e.g., Thai for spicy and
                            vibrant dishes).
                        </li>
                    </ul>
                    <p className="mb-2">Examples to get you started:</p>
                    <ul className="list-disc list-inside">
                        <li>Italian (think rich pastas)</li>
                        <li>Thai (spicy and vibrant)</li>
                        <li>Fusion (a creative blend)</li>
                    </ul>
                </div>
            );
        case "dish_type":
            return (
                <div>
                    <p className="mb-2">
                        Choose the dish type that defines your recipe’s role in
                        a meal.
                    </p>
                    <p className="mb-2">How to choose:</p>
                    <ul className="list-disc list-inside mb-2">
                        <li>
                            Select a type that fits the dish’s purpose (e.g.,
                            Main Course for a hearty dish).
                        </li>
                        <li>
                            Pick "Add Dish Type" to create a new category if
                            needed.
                        </li>
                        <li>
                            Consider the meal context (e.g., Appetizer for
                            starters).
                        </li>
                    </ul>
                    <p className="mb-2">Examples to spark your creativity:</p>
                    <ul className="list-disc list-inside">
                        <li>Main Course (hearty and filling)</li>
                        <li>Dessert (sweet indulgence)</li>
                        <li>Appetizer (perfect starter)</li>
                    </ul>
                </div>
            );
        case "ingredients":
            return (
                <div>
                    <p className="mb-2">
                        List all ingredients needed for your recipe, including
                        quantities and units.
                    </p>
                    <p className="mb-2">Steps to add an ingredient:</p>
                    <ul className="list-disc list-inside mb-2">
                        <li>
                            Select a unit (e.g., cup, gram, unitless) or add a
                            new one.
                        </li>
                        <li>Enter the whole number (e.g., 1 for 1 cup).</li>
                        <li>
                            For cups, teaspoons, or tablespoons, select a
                            fraction if needed (e.g., 1/4).
                        </li>
                        <li>
                            Enter the ingredient name (e.g., flour, chicken).
                        </li>
                        <li>
                            Click "Add Ingredient" to include more ingredients.
                        </li>
                    </ul>
                    <p className="mb-2">Examples to guide you:</p>
                    <ul className="list-disc list-inside">
                        <li>
                            Unit: cup, Whole Number: 1, Fraction: 1/4, Name:
                            flour
                        </li>
                        <li>
                            Unit: teaspoon, Whole Number: 2, Fraction: 1/3,
                            Name: salt
                        </li>
                        <li>
                            Unit: gram, Whole Number: 200, Fraction: None
                            (disabled), Name: chicken
                        </li>
                        <li>
                            Unit: unitless, Whole Number: 3, Fraction: None
                            (disabled), Name: eggs
                        </li>
                    </ul>
                    <p className="mb-2 mt-2">
                        These ingredients will be searchable, and you’ll be able
                        to scale portions when cooking!
                    </p>
                </div>
            );
        case "instructions":
            return (
                <div>
                    <p className="mb-2">
                        Break down your recipe into clear sections with
                        step-by-step instructions.
                    </p>
                    <p className="mb-2">Steps to create instructions:</p>
                    <ul className="list-disc list-inside mb-2">
                        <li>
                            Select a section title (e.g., "Preparation") or
                            choose "Custom" to enter your own.
                        </li>
                        <li>
                            Add steps under each section by clicking the "Add
                            Step" button.
                        </li>
                        <li>
                            Enter each step in the provided input fields (e.g.,
                            "Dice onions").
                        </li>
                        <li>
                            Drag and drop sections to rearrange their order if
                            needed.
                        </li>
                        <li>
                            Remove sections or steps using the trash icons if
                            necessary.
                        </li>
                        <li>
                            Click the plus-circle button to add more sections.
                        </li>
                    </ul>
                    <p className="mt-2">
                        At least one section with at least one non-empty step is
                        required.
                    </p>
                </div>
            );
        case "allergens":
            return (
                <div>
                    <p className="mb-2">
                        Add allergen tags if your recipe contains common
                        allergens.
                    </p>
                    <p className="mb-2">How to add allergens:</p>
                    <ul className="list-disc list-inside">
                        <li>
                            Drag tags (e.g., "Peanuts", "Dairy") from the
                            sidebar to this section.
                        </li>
                        <li>
                            Remove tags by clicking the "x" on each tag if added
                            by mistake.
                        </li>
                        <li>
                            Only add allergens that are directly in the recipe
                            (not optional ingredients).
                        </li>
                    </ul>
                </div>
            );
        case "dietary":
            return (
                <div>
                    <p className="mb-2">
                        Add dietary tags if your recipe fits specific dietary
                        preferences.
                    </p>
                    <p className="mb-2">How to add dietary tags:</p>
                    <ul className="list-disc list-inside">
                        <li>
                            Drag tags (e.g., "Vegetarian", "Gluten-Free") from
                            the sidebar to this section.
                        </li>
                        <li>
                            Remove tags by clicking the "x" on each tag if added
                            by mistake.
                        </li>
                        <li>
                            Ensure the recipe fully meets the dietary
                            requirement (e.g., no meat for Vegetarian).
                        </li>
                    </ul>
                </div>
            );
        case "image_url":
            return (
                <div>
                    {imageMode === "upload" ? (
                        <div>
                            <p className="mb-2">
                                Upload a photo of your finished dish to make
                                your recipe more appealing.
                            </p>
                            <p className="mb-2">Tips for uploading:</p>
                            <ul className="list-disc list-inside">
                                <li>
                                    Choose a clear, well-lit image of the final
                                    dish.
                                </li>
                                <li>Supported formats: JPEG, PNG, etc.</li>
                                <li>
                                    Click "Remove Image" to clear the selection
                                    if needed.
                                </li>
                            </ul>
                        </div>
                    ) : (
                        <div>
                            <p className="mb-2">
                                Provide a URL to an online image of your
                                finished dish.
                            </p>
                            <p className="mb-2">Tips for using a URL:</p>
                            <ul className="list-disc list-inside">
                                <li>
                                    Ensure the URL points to a publicly
                                    accessible image (e.g.,
                                    https://example.com/image.jpg).
                                </li>
                                <li>
                                    Use a clear, well-lit image of the final
                                    dish.
                                </li>
                                <li>
                                    Click "Remove Image" to clear the selection
                                    if needed.
                                </li>
                            </ul>
                        </div>
                    )}
                </div>
            );
        default:
            return (
                <div>
                    <p className="mb-2">
                        Welcome to the Recipe Crafter! Use this form to add or
                        edit a recipe.
                    </p>
                    <p className="mb-2">
                        The <strong>Recipe Options</strong> pane on the left
                        provides tools and guidance:
                    </p>
                    <ul className="list-disc list-inside mb-2">
                        <li>
                            Click the import button (top left) to import a
                            recipe (coming soon!).
                        </li>
                        <li>
                            Focus on a field (e.g., Title, Ingredients) to see
                            specific instructions here.
                        </li>
                        <li>
                            Drag tags from the sidebar to the Allergens or
                            Dietary Tags sections when focused.
                        </li>
                    </ul>
                    <p className="mb-2">
                        Start by entering a title for your recipe in the form on
                        the right.
                    </p>
                    <p>Required fields are marked with an asterisk (*).</p>
                </div>
            );
    }
};

export default InfoBox;
