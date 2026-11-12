import React, { useEffect, useState } from "react";
import InitiativeCard from "./InitiativeCard.jsx";
import InitiativeDetail from "./InitiativeDetail.jsx";

const SAMPLE_INITIATIVES = [
    { id: "101", title: "Campus Solar Canopy", category: "Energy", votes: 14, description: "Paneles solares sobre las zonas de sombra del campus para producir energía limpia.", author: "Dr. X" },
    { id: "102", title: "Zero-Waste Cafeteria Loop", category: "Waste", votes: 29, description: "Separación de residuos de la cafetería y uso de restos de comida para hacer composta.", author: "Master Splinter" },
    { id: "103", title: "Urban Rainwater Harvester", category: "Water", votes: 8, description: "Captación de agua de lluvia para usarla en el riego de áreas verdes de la ciudad.", author: "Dr. Banner" }
];

function getIdFromUrl() {
    const parts = window.location.pathname.split("/");

    if (parts[1] !== "initiatives") {
        return "";
    }

    return parts[2];
}

function App() {
    const [initiatives, setInitiatives] = useState(SAMPLE_INITIATIVES);
    const [bookmarks, setBookmarks] = useState([]);
    const [selectedId, setSelectedId] = useState(getIdFromUrl);

    useEffect(function listenToBrowserButtons() {
        function showCurrentPage() {
            setSelectedId(getIdFromUrl());
        }

        window.addEventListener("popstate", showCurrentPage);

        return function stopListening() {
            window.removeEventListener("popstate", showCurrentPage);
        };
    }, []);

    function vote(event) {
        event.stopPropagation();

        const id = event.currentTarget.dataset.id;
        const updated = [];

        for (const item of initiatives) {
            if (item.id === id) {
                const changed = { ...item };
                changed.votes = changed.votes + 1;
                updated.push(changed);
                continue;
            }

            updated.push(item);
        }

        setInitiatives(updated);
    }

    function toggleBookmark(event) {
        event.stopPropagation();

        const id = event.currentTarget.dataset.id;
        const updated = [...bookmarks];
        const position = updated.indexOf(id);

        if (position === -1) {
            updated.push(id);
        } else {
            updated.splice(position, 1);
        }

        setBookmarks(updated);
    }

    function openDetails(event) {
        const id = event.currentTarget.dataset.id;
        const url = "/initiatives/" + id;

        window.history.pushState({}, "", url);
        setSelectedId(id);
    }

    function openDetailsWithKeyboard(event) {
        if (event.key !== "Enter") {
            return;
        }

        if (event.target !== event.currentTarget) {
            return;
        }

        openDetails(event);
    }

    function goHome(event) {
        event.preventDefault();
        window.history.pushState({}, "", "/");
        setSelectedId("");
    }

    function renderCard(item) {
        const bookmarked = bookmarks.includes(item.id);

        return (
            <InitiativeCard
                key={item.id}
                item={item}
                bookmarked={bookmarked}
                onVote={vote}
                onBookmark={toggleBookmark}
                onOpen={openDetails}
                onOpenWithKeyboard={openDetailsWithKeyboard}
            />
        );
    }

    if (selectedId) {
        let selectedItem = null;

        for (const item of initiatives) {
            if (item.id === selectedId) {
                selectedItem = item;
            }
        }

        if (!selectedItem) {
            return (
                <main className="page">
                    <p>Iniciativa no encontrada.</p>
                    <a href="/" onClick={goHome}>Volver</a>
                </main>
            );
        }

        return <InitiativeDetail item={selectedItem} onHome={goHome} />;
    }

    return (
        <main className="page">
            <header>
                <h1>SustainHub</h1>
                <p>Climate Action Explorer</p>
            </header>

            <section className="grid">
                {initiatives.map(renderCard)}
            </section>
        </main>
    );
}

export default App;
