import type { Ingredient } from "../components/AddRecipe";

export const fractionToDecimal = (fraction: string): number => {
    if (!fraction) return 0;
    const [numerator, denominator] = fraction.split("/").map(Number);
    return numerator / denominator;
};

export const handleIngredientChange = (
    index: number,
    field: keyof Ingredient,
    value: string | number,
    ingredients: Ingredient[],
    setIngredients: React.Dispatch<React.SetStateAction<Ingredient[]>>,
    setValidationErrors: React.Dispatch<
        React.SetStateAction<{ [key: string]: string }>
    >
) => {
    const updatedIngredients = [...ingredients];
    updatedIngredients[index] = {
        ...updatedIngredients[index],
        [field]:
            field === "wholeNumber" ? parseInt(value as string) || 0 : value,
    };
    if (field === "wholeNumber" || field === "fraction") {
        updatedIngredients[index].quantity =
            updatedIngredients[index].wholeNumber +
            fractionToDecimal(updatedIngredients[index].fraction);
    }
    setIngredients(updatedIngredients);
    setValidationErrors((prev) => ({ ...prev, ingredients: "" }));
};

export const handleIngredientUnitChange = (
    index: number,
    value: string,
    ingredients: Ingredient[],
    setIngredients: React.Dispatch<React.SetStateAction<Ingredient[]>>,
    setValidationErrors: React.Dispatch<
        React.SetStateAction<{ [key: string]: string }>
    >,
    fractionalUnits: string[]
) => {
    const updatedIngredients = [...ingredients];
    updatedIngredients[index] = {
        ...updatedIngredients[index],
        unit: value,
        fraction: fractionalUnits.includes(value)
            ? updatedIngredients[index].fraction
            : "", // Reset fraction if unit doesn't support fractions
    };
    setIngredients(updatedIngredients);
    setValidationErrors((prev) => ({ ...prev, ingredients: "" }));
};

export const addIngredient = (
    setIngredients: React.Dispatch<React.SetStateAction<Ingredient[]>>
) => {
    setIngredients((prev) => [
        ...prev,
        {
            wholeNumber: 0,
            fraction: "",
            quantity: 0,
            unit: "unitless",
            name: "",
        },
    ]);
};

export const removeIngredient = (
    index: number,
    ingredients: Ingredient[],
    setIngredients: React.Dispatch<React.SetStateAction<Ingredient[]>>
) => {
    if (ingredients.length > 1) {
        const updatedIngredients = ingredients.filter((_, i) => i !== index);
        setIngredients(updatedIngredients);
    }
};
