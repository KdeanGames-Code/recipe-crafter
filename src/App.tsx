import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Recipes from "./components/Recipes";
import ChefMaster from "./components/ChefMaster";
import Calendar from "./components/Calendar";
import ShoppingList from "./components/ShoppingList";

function App() {
    return (
        <BrowserRouter basename="/Recipes">
            <Routes>
                <Route path="/" element={<Navigate to="recipes" replace />} />
                <Route path="recipes" element={<Recipes />} />
                <Route path="chef-master" element={<ChefMaster />} />
                <Route path="calendar" element={<Calendar />} />
                <Route path="shopping-list" element={<ShoppingList />} />
                <Route path="*" element={<div>404 Not Found</div>} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
