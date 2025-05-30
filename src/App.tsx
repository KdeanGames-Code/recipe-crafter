import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";
import Dashboard from "./components/Dashboard";
import Recipes from "./components/Recipes";
import Calendar from "./components/Calendar";
import ShoppingList from "./components/ShoppingList";
import ChefMaster from "./components/ChefMaster";

function App() {
    return (
        <Router basename="/Recipes">
            <div className="min-h-screen bg-gray-900 text-white">
                <NavBar />
                <Routes>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/recipes" element={<Recipes />} />
                    <Route path="/calendar" element={<Calendar />} />
                    <Route path="/shopping-list" element={<ShoppingList />} />
                    <Route path="/chef-master" element={<ChefMaster />} />
                    <Route path="/" element={<Recipes />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
