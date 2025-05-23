import React, { useState } from "react";
import {
    DragDropContext,
    Droppable,
    Draggable,
    type DropResult,
} from "react-beautiful-dnd";
import { Link } from "react-router-dom";

const Calendar = () => {
    const [meals, setMeals] = useState([
        { id: "meal1", date: "2025-05-23", recipe: "Spaghetti Bolognese" },
        { id: "meal2", date: "2025-05-24", recipe: "Chicken Salad" },
    ]);

    const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const startDate = new Date("2025-05-19"); // Start of the week (Monday)

    const onDragEnd = (result: DropResult) => {
        if (!result.destination) return;
        const items = Array.from(meals);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        // Update the date based on the destination day
        const destinationDayIndex = parseInt(
            result.destination.droppableId.split("-")[1]
        );
        const destinationDate = new Date(startDate);
        destinationDate.setDate(startDate.getDate() + destinationDayIndex);
        reorderedItem.date = destinationDate.toISOString().split("T")[0];

        setMeals(items);
    };

    return (
        <div className="p-4 bg-gray-800 min-h-screen text-white">
            <h1 className="text-3xl font-bold mb-4">Calendar (Week View)</h1>
            <div className="grid grid-cols-7 gap-2 mb-4">
                {daysOfWeek.map((day, index) => {
                    const currentDate = new Date(startDate);
                    currentDate.setDate(startDate.getDate() + index);
                    const dateString = currentDate.toISOString().split("T")[0];
                    return (
                        <div
                            key={day}
                            className="text-center font-bold p-2 bg-gray-700 rounded"
                        >
                            {day} ({dateString})
                        </div>
                    );
                })}
            </div>
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="grid grid-cols-7 gap-2">
                    {daysOfWeek.map((_, index) => {
                        const currentDate = new Date(startDate);
                        currentDate.setDate(startDate.getDate() + index);
                        const dateString = currentDate
                            .toISOString()
                            .split("T")[0];
                        const dayMeals = meals.filter(
                            (meal) => meal.date === dateString
                        );

                        return (
                            <Droppable droppableId={`day-${index}`} key={index}>
                                {(provided) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className="min-h-[100px] p-2 bg-gray-600 rounded"
                                    >
                                        {dayMeals.map((meal, mealIndex) => {
                                            const globalIndex = meals.findIndex(
                                                (m) => m.id === meal.id
                                            );
                                            return (
                                                <Draggable
                                                    key={meal.id}
                                                    draggableId={meal.id}
                                                    index={globalIndex}
                                                >
                                                    {(provided) => (
                                                        <div
                                                            ref={
                                                                provided.innerRef
                                                            }
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            className="bg-gray-700 p-2 mb-2 rounded-lg shadow"
                                                        >
                                                            <p>{meal.recipe}</p>
                                                            <Link to="/chef-master">
                                                                <button className="bg-green-500 text-white px-2 py-1 rounded mr-2">
                                                                    Start Chef
                                                                    Master
                                                                </button>
                                                            </Link>
                                                            <button className="bg-blue-500 text-white px-2 py-1 rounded">
                                                                Generate
                                                                Shopping List
                                                            </button>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            );
                                        })}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        );
                    })}
                </div>
            </DragDropContext>
        </div>
    );
};

export default Calendar;
