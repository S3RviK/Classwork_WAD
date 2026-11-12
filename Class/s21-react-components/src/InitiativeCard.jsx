import React from "react";

function InitiativeCard(props) {
    const item = props.item;
    let bookmarkText = "Guardar favorito";

    if (props.bookmarked) {
        bookmarkText = "Quitar favorito";
    }

    return (
        <article
            className="card"
            data-id={item.id}
            onClick={props.onOpen}
            onKeyDown={props.onOpenWithKeyboard}
            role="link"
            tabIndex={0}
        >
            <h2>{item.title}</h2>
            <p>{item.votes} votos</p>

            <div className="card-actions">
                <button type="button" data-id={item.id} onClick={props.onVote}>
                    Votar
                </button>
                <button type="button" data-id={item.id} onClick={props.onBookmark}>
                    {bookmarkText}
                </button>
            </div>
        </article>
    );
}

export default InitiativeCard;
