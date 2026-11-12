import React from "react";

function InitiativeDetail(props) {
    const item = props.item;

    return (
        <main className="page">
            <a href="/" onClick={props.onHome}>← Volver a las iniciativas</a>

            <article className="detail">
                <h1>{item.title}</h1>
                <p><strong>Categoría:</strong> {item.category}</p>
                <p><strong>Autor:</strong> {item.author}</p>
                <p><strong>Descripción:</strong> {item.description}</p>
                <p><strong>Votos:</strong> {item.votes}</p>
            </article>
        </main>
    );
}

export default InitiativeDetail;
