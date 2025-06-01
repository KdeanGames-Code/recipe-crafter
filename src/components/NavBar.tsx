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
            case "recipes/add":
                return "Add/Import Recipe";
            case "calendar":
                return "Calendar";
            case "shopping-list":
                return "Shopping List";
            case "chef-master":
                return "Chef Master";
            default:
                return "Recipes";
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
            <nav className="navbar">
                <NavLink
                    to="/dashboard"
                    className={({ isActive }) =>
                        isActive ? "nav-item active" : "nav-item"
                    }
                >
                    Dashboard
                </NavLink>
                <div className="nav-submenu-container">
                    <NavLink
                        to="/recipes"
                        className={({ isActive }) =>
                            isActive ? "nav-item active" : "nav-item"
                        }
                    >
                        Recipes
                    </NavLink>
                    <div className="nav-submenu">
                        <NavLink
                            to="/recipes/add"
                            className={({ isActive }) =>
                                isActive
                                    ? "nav-submenu-item active"
                                    : "nav-submenu-item"
                            }
                        >
                            Add/Import Recipe
                        </NavLink>
                    </div>
                </div>
                <NavLink
                    to="/calendar"
                    className={({ isActive }) =>
                        isActive ? "nav-item active" : "nav-item"
                    }
                >
                    Calendar
                </NavLink>
                <NavLink
                    to="/shopping-list"
                    className={({ isActive }) =>
                        isActive ? "nav-item active" : "nav-item"
                    }
                >
                    Shopping List
                </NavLink>
            </nav>
        </>
    );
};

export default NavBar;
