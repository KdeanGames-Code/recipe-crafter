import { Link } from "react-router-dom";

const Dashboard = () => {
    return (
        <div className="p-4 bg-gray-800 min-h-screen text-white">
            <h1 className="text-3xl font-bold mb-4">
                Recipe Crafter Dashboard
            </h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link
                    to="/recipes"
                    className="bg-gray-700 p-4 rounded-lg shadow hover:bg-gray-600"
                >
                    <h2 className="text-xl font-semibold">Recipes</h2>
                    <p className="text-gray-300">
                        Browse and select your favorite recipes.
                    </p>
                </Link>
                <Link
                    to="/chef-master"
                    className="bg-gray-700 p-4 rounded-lg shadow hover:bg-gray-600"
                >
                    <h2 className="text-xl font-semibold">Chef Master</h2>
                    <p className="text-gray-300">
                        Guided cooking with step-by-step instructions.
                    </p>
                </Link>
                <Link
                    to="/calendar"
                    className="bg-gray-700 p-4 rounded-lg shadow hover:bg-gray-600"
                >
                    <h2 className="text-xl font-semibold">Calendar</h2>
                    <p className="text-gray-300">
                        Plan your meals with drag-and-drop ease.
                    </p>
                </Link>
                <Link
                    to="/shopping-list"
                    className="bg-gray-700 p-4 rounded-lg shadow hover:bg-gray-600"
                >
                    <h2 className="text-xl font-semibold">Shopping List</h2>
                    <p className="text-gray-300">
                        Manage your ingredients with Flipp deals.
                    </p>
                </Link>
            </div>
        </div>
    );
};

export default Dashboard;
