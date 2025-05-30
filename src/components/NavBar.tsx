import { NavLink, useLocation } from "react-router-dom";

const NavBar = () => {
    const location = useLocation();

    // Extract the path segment after the basename
    const path =
        location.pathname.replace("/Recipes", "").replace("/", "") || "recipes";

    // Map path segments to page titles
    const getPageTitle = () => {
        switch (path) {
            case "dashboard":
                return "Dashboard";
            case "recipes":
                return "Recipes";
            case "calendar":
                return "Calendar";
            case "shopping-list":
                return "Shopping List";
            case "chef-master":
                return "Chef Master";
            default:
                return "Recipes"; // Default to Recipes
        }
    };

    const pageTitle = getPageTitle();

    return (
        <>
            <header className="bg-gray-900 shadow-lg p-4 flex items-center justify-between">
                <div className="flex items-center">
                    <i className="fas fa-utensils text-white text-2xl mr-2"></i>
                    <h1 className="text-2xl font-bold text-white">
                        Recipe Crafter - {pageTitle}
                    </h1>
                </div>
                <div className="flex items-center space-x-4">
                    <i className="fas fa-user text-gray-400 text-xl"></i>
                    <i className="fas fa-sign-out-alt text-gray-400 text-xl"></i>
                </div>
            </header>
            <nav className="bg-gray-800 p-2 flex justify-around flex-wrap shadow-lg">
                <NavLink
                    to="/dashboard"
                    className={({ isActive }) =>
                        isActive
                            ? "text-green-500 font-semibold px-2 py-1"
                            : "text-gray-400 font-semibold px-2 py-1"
                    }
                >
                    Dashboard
                </NavLink>
                <NavLink
                    to="/recipes"
                    className={({ isActive }) =>
                        isActive
                            ? "text-green-500 font-semibold px-2 py-1"
                            : "text-gray-400 font-semibold px-2 py-1"
                    }
                >
                    Recipes
                </NavLink>
                <NavLink
                    to="/calendar"
                    className={({ isActive }) =>
                        isActive
                            ? "text-green-500 font-semibold px-2 py-1"
                            : "text-gray-400 font-semibold px-2 py-1"
                    }
                >
                    Calendar
                </NavLink>
                <NavLink
                    to="/shopping-list"
                    className={({ isActive }) =>
                        isActive
                            ? "text-green-500 font-semibold px-2 py-1"
                            : "text-gray-400 font-semibold px-2 py-1"
                    }
                >
                    Shopping List
                </NavLink>
            </nav>
        </>
    );
};

export default NavBar;
