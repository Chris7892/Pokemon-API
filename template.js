

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

function buildChainHTML(chainLink) {
    const name = chainLink.species.name;
    const id = chainLink.species.url.match(/\/(\d+)\/?$/)[1];
    const stageHTML = `<span class="evo-stage" data-id="${id}">${name}</span>`;

    if (chainLink.evolves_to.length === 0) {
        return stageHTML;
    }

    const nextStages = chainLink.evolves_to.map(buildChainHTML).join('');
    return `${stageHTML} <span class="evo-arrow">→</span> ${nextStages}`;
}

function buildTypeBadgesHTML(types) {
    return types
        .map(t => `<span class="type-badge type-${t.type.name}">${t.type.name}</span>`)
        .join('');
}

function buildStatRowHTML(stat) {
    const pct = Math.min(100, (stat.base_stat / 200) * 100);
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

function buildDetailHTML(pokemon) {
    const typeBadges = buildTypeBadgesHTML(pokemon.types);
    const abilities = pokemon.abilities.map(a => a.ability.name).join(', ');
    const heightM = (pokemon.height / 10).toFixed(1);
    const weightKg = (pokemon.weight / 10).toFixed(1);
    const statRows = pokemon.stats.map(buildStatRowHTML).join('');
    return `
        <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
        <h2>${pokemon.name} #${String(pokemon.id).padStart(3, '0')}</h2>
        <div class="type-list">${typeBadges}</div>
        ${buildInfoRowsHTML(heightM, weightKg, abilities)}
        <div class="modal-stats">${statRows}</div>
    `;
}