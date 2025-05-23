import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Recipes from "./components/Recipes";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/recipes" element={<Recipes />} />
                <Route
                    path="/chef-master"
                    element={<div>Chef Master Placeholder</div>}
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
