import React from "react";

interface Ingredient {
    wholeNumber: number;
    fraction: string;
    quantity: number;
    unit: string;
    name: string;
}

interface IngredientRowProps {
    ingredient: Ingredient;
    index: number;
    units: string[];
    fractionalUnits: string[];
    fractions: string[];
    handleIngredientChange: (
        index: number,
        field: keyof Ingredient,
        value: string | number
    ) => void;
    handleIngredientUnitChange: (index: number, value: string) => void;
    removeIngredient: (index: number) => void;
    handleFocus: (field: string) => void;
    setFocusedField: (field: string | null) => void;
    showRemove: boolean;
}

const IngredientRow: React.FC<IngredientRowProps> = ({
    ingredient,
    index,
    units,
    fractionalUnits,
    fractions,
    handleIngredientChange,
    handleIngredientUnitChange,
    removeIngredient,
    handleFocus,
    setFocusedField,
    showRemove,
}) => {
    const handleWholeNumberChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const value = e.target.value;
        // Allow only non-negative numbers (including empty string for clearing)
        if (value === "" || /^\d+$/.test(value)) {
            const parsedValue = value === "" ? 0 : parseInt(value);
            if (parsedValue >= 0) {
                handleIngredientChange(index, "wholeNumber", parsedValue);
            }
        }
    };

    const isFractionalUnit = fractionalUnits.includes(ingredient.unit);

    return (
        <div key={index} className="ingredient-item space-x-2">
            <select
                value={ingredient.unit}
                onChange={(e) =>
                    handleIngredientUnitChange(index, e.target.value)
                }
                onFocus={() => handleFocus("ingredients")}
                onBlur={() => setFocusedField(null)}
                className="form-input w-[180px]"
            >
                <option value="" disabled>
                    Select Unit
                </option>
                <option value="add_unit">Add Unit</option>
                {units.map((unit) => (
                    <option key={unit} value={unit}>
                        {unit}
                    </option>
                ))}
            </select>
            <input
                type="text"
                value={
                    ingredient.wholeNumber === 0 ? "" : ingredient.wholeNumber
                }
                onChange={handleWholeNumberChange}
                onFocus={() => handleFocus("ingredients")}
                onBlur={() => setFocusedField(null)}
                className="form-input w-[180px]"
                placeholder="0"
            />
            <select
                value={ingredient.fraction}
                onChange={(e) =>
                    handleIngredientChange(index, "fraction", e.target.value)
                }
                onFocus={() => handleFocus("ingredients")}
                onBlur={() => setFocusedField(null)}
                className="form-input w-[180px]"
                disabled={!isFractionalUnit}
            >
                {fractions.map((fraction) => (
                    <option key={fraction} value={fraction}>
                        {fraction || "None"}
                    </option>
                ))}
            </select>
            <input
                type="text"
                value={ingredient.name}
                onChange={(e) =>
                    handleIngredientChange(index, "name", e.target.value)
                }
                onFocus={() => handleFocus("ingredients")}
                onBlur={() => setFocusedField(null)}
                className="form-input w-full"
                placeholder="Ingredient Name"
            />
            {showRemove && (
                <button
                    type="button"
                    onClick={() => removeIngredient(index)}
                    className="remove-button"
                >
                    <i className="fas fa-trash"></i>
                </button>
            )}
        </div>
    );
};

export default IngredientRow;
