const ShoppingList = () => {
    const items = [
        { id: 1, name: "Tomatoes", quantity: "2 pcs" },
        { id: 2, name: "Sour Cream", quantity: "200g" },
    ];

    return (
        <div className="p-4 bg-gray-800 min-h-screen text-white">
            <h1 className="text-3xl font-bold mb-4">Shopping List</h1>
            <ul>
                {items.map((item) => (
                    <li key={item.id} className="mb-2">
                        {item.name} - {item.quantity}
                        <a
                            href={`https://flipp.com/search/${item.name.toLowerCase()}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 text-blue-400 underline"
                        >
                            Find on Flipp
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ShoppingList;
