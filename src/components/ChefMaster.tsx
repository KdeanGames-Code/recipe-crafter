const ChefMaster = () => {
    const steps = [
        { id: 1, group: "Prep", description: "Chop onions" },
        { id: 2, group: "Prep", description: "Mince garlic" },
        { id: 3, group: "Cooking", description: "Sauté onions and garlic" },
    ];

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-gray-800 text-white">
            <div className="w-full md:w-1/2 p-4 border-r border-gray-600">
                <h2 className="text-2xl font-bold mb-4">Steps</h2>
                {steps.map((step) => (
                    <div key={step.id} className="mb-2">
                        <label className="flex items-center">
                            <input type="checkbox" className="mr-2" />
                            <span>
                                {step.group}: {step.description}
                            </span>
                        </label>
                    </div>
                ))}
            </div>
            <div className="w-full md:w-1/2 p-4 fixed inset-0 md:static bg-gray-800 md:bg-transparent flex md:block transition-transform duration-300">
                <div className="p-4 w-full">
                    <h2 className="text-2xl font-bold mb-4">Instructions</h2>
                    <p className="mb-4">
                        Follow the steps on the left to prepare your dish.
                    </p>
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold">Timer</h3>
                        <p>00:00 (Placeholder)</p>
                    </div>
                    <button className="bg-blue-500 text-white px-4 py-2 rounded">
                        Next Step
                    </button>
                    <button className="md:hidden bg-red-500 text-white px-4 py-2 rounded ml-2">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChefMaster;
