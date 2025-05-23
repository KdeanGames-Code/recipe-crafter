import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Recipes from "./components/Recipes";
import ChefMaster from "./components/ChefMaster";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/recipes" replace />} />
                <Route path="/recipes" element={<Recipes />} />
                <Route path="/chef-master" element={<ChefMaster />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
