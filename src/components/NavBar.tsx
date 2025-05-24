import { Link } from "react-router-dom";

const NavBar = () => {
    return (
        <nav className="bg-gray-900 text-white p-4">
            <ul className="flex space-x-4">
                <li>
                    <Link to="/" className="hover:underline">
                        Dashboard
                    </Link>
                </li>
                <li>
                    <Link to="/recipes" className="hover:underline">
                        Recipes
                    </Link>
                </li>
                <li>
                    <Link to="/chef-master" className="hover:underline">
                        Chef Master
                    </Link>
                </li>
                <li>
                    <Link to="/calendar" className="hover:underline">
                        Calendar
                    </Link>
                </li>
                <li>
                    <Link to="/shopping-list" className="hover:underline">
                        Shopping List
                    </Link>
                </li>
            </ul>
        </nav>
    );
};

export default NavBar;
