function createCardHTML(pokemon) {
    const typeBadges = buildTypeBadgesHTML(pokemon.types);
    const primaryType = pokemon.types[0].type.name;
    return `
        <div class="pokemon-card type-${primaryType}" data-id="${pokemon.id}" data-name="${pokemon.name}" role="button" tabindex="0" aria-label="${pokemon.name} Details anzeigen">
            <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
            <h3>${pokemon.name}</h3>
            <div class="type-list">${typeBadges}</div>
        </div>
    `;
}

function buildTypeBadgesHTML(types) {
    return types
        .map(t => `<span class="type-badge type-${t.type.name}">${t.type.name}</span>`)
        .join('');
}

function buildStatRowHTML(stat, pct) {
    return `
        <div class="modal-stat-row">
            <span class="modal-stat-name">${stat.stat.name}</span>
            <span class="modal-stat-bar"><span class="modal-stat-bar-fill" style="width:${pct}%"></span></span>
            <span class="modal-stat-value">${stat.base_stat}</span>
        </div>
    `;
}

function buildInfoRowsHTML(heightM, weightKg, abilities) {
    return `
        <div class="modal-info-row">
            <span>Größe: ${heightM} m</span>
            <span>Gewicht: ${weightKg} kg</span>
        </div>
        <div class="modal-info-row">
            <span>Fähigkeiten: ${abilities}</span>
        </div>
    `;
}

function buildDetailHTML(pokemon, heightM, weightKg, abilities, statsWithPercent) {
    const typeBadges = buildTypeBadgesHTML(pokemon.types);
    const statRows = statsWithPercent.map(({ stat, pct }) => buildStatRowHTML(stat, pct)).join('');
    return `
        <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
        <h2>${pokemon.name} #${String(pokemon.id).padStart(3, '0')}</h2>
        <div class="type-list">${typeBadges}</div>
        ${buildInfoRowsHTML(heightM, weightKg, abilities)}
        <div class="modal-stats">${statRows}</div>
    `;
}