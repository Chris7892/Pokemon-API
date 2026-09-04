

function createCardHTML(pokemon) {
    const typeBadges = pokemon.types
        .map(t => `<span class="type-badge type-${t.type.name}">${t.type.name}</span>`)
        .join('');
    const primaryType = pokemon.types[0].type.name;
    return `
        <div class="pokemon-card type-${primaryType}" data-id="${pokemon.id}" data-name="${pokemon.name}">
            <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
            <h3>${pokemon.name}</h3>
            <div class="type-list">${typeBadges}</div>
        </div>
    `;
}