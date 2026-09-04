
const pokemonCache = new Map();
const speciesCache = new Map();
const evoChainCache = new Map();



async function loadPokemonCards(count = 15) {
    const ids = Array.from({ length: count }, (_, i) => i + 1);
    const pokemonList = await Promise.all(ids.map(id => getPokemon(id)));
    renderCards(pokemonList);
}

function renderCards(pokemonList) {
    const container = document.querySelector('.card-container');
    container.innerHTML = pokemonList.map(p => createCardHTML(p)).join('');
    attachCardListeners();
}



async function getPokemon(id) {
    if (pokemonCache.has(id)) {
        return pokemonCache.get(id);
    }
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    const data = await response.json();
    pokemonCache.set(id, data);
    return data;
}

function attachCardListeners() {
    document.querySelectorAll('.pokemon-card').forEach(card => {
        card.addEventListener('click', () => {
            const id = card.dataset.id;
            showPokemonDetailModal(id);
            showEvolutionChain(id);
        });
    });
}

async function showEvolutionChain(id) {
    const speciesData = await getSpecies(id); // eigener Cache
    const evoChainUrl = speciesData.evolution_chain.url;
    const evoData = await getEvolutionChain(evoChainUrl); // eigener Cache
    renderEvolutionChain(evoData);
}




async function getSpecies(id) {
    if (speciesCache.has(id)) return speciesCache.get(id);
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`);
    const data = await response.json();
    speciesCache.set(id, data);
    return data;
}

async function getEvolutionChain(url) {
    if (evoChainCache.has(url)) return evoChainCache.get(url);
    const response = await fetch(url);
    const data = await response.json();
    evoChainCache.set(url, data);
    return data;
}

function renderEvolutionChain(evoData) {
    const container = document.querySelector('.evolution-chain');
    container.innerHTML = buildChainHTML(evoData.chain);
    attachEvolutionListeners();
}

function attachEvolutionListeners() {
    document.querySelectorAll('.evo-stage').forEach(stage => {
        stage.addEventListener('dblclick', () => {
            showPokemonDetailModal(stage.dataset.id);
        });
    });
}

function buildChainHTML(chainLink) {
    const name = chainLink.species.name;
    const id = chainLink.species.url.match(/\/(\d+)\/?$/)[1];
    const stageHTML = `<span class="evo-stage" data-id="${id}">${name}</span>`;

    if (chainLink.evolves_to.length === 0) {
        // Endpunkt erreicht, keine weiteren Entwicklungen
        return stageHTML;
    }

    // Für jede mögliche nächste Entwicklung rekursiv weiterbauen
    const nextStages = chainLink.evolves_to
        .map(next => buildChainHTML(next))
        .join('');

    return `${stageHTML} <span class="evo-arrow">→</span> ${nextStages}`;


}

async function showPokemonDetailModal(id) {
    const pokemon = await getPokemon(id);
    const overlay = document.getElementById('pokemon-modal');
    const primaryType = pokemon.types[0].type.name;
    overlay.querySelector('.modal-box').className = `modal-box type-${primaryType}`;
    overlay.querySelector('.modal-body').innerHTML = buildDetailHTML(pokemon);
    overlay.classList.add('open');
}

function buildDetailHTML(pokemon) {
    const typeBadges = pokemon.types
        .map(t => `<span class="type-badge type-${t.type.name}">${t.type.name}</span>`)
        .join('');

    const abilities = pokemon.abilities
        .map(a => a.ability.name)
        .join(', ');

    const heightM = (pokemon.height / 10).toFixed(1);
    const weightKg = (pokemon.weight / 10).toFixed(1);

    const statRows = pokemon.stats.map(s => {
        const pct = Math.min(100, (s.base_stat / 200) * 100);
        return `
            <div class="modal-stat-row">
                <span class="modal-stat-name">${s.stat.name}</span>
                <span class="modal-stat-bar"><span class="modal-stat-bar-fill" style="width:${pct}%"></span></span>
                <span class="modal-stat-value">${s.base_stat}</span>
            </div>
        `;
    }).join('');

    return `
        <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
        <h2>${pokemon.name} #${String(pokemon.id).padStart(3, '0')}</h2>
        <div class="type-list">${typeBadges}</div>
        <div class="modal-info-row">
            <span>Größe: ${heightM} m</span>
            <span>Gewicht: ${weightKg} kg</span>
        </div>
        <div class="modal-info-row">
            <span>Fähigkeiten: ${abilities}</span>
        </div>
        <div class="modal-stats">${statRows}</div>
    `;
}

function closeModal() {
    document.getElementById('pokemon-modal').classList.remove('open');
}

function initModal() {
    const overlay = document.getElementById('pokemon-modal');
    overlay.querySelector('.modal-close').addEventListener('click', closeModal);
    overlay.addEventListener('click', (event) => {
        if (event.target === overlay) closeModal();
    });
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeModal();
    });
}

document.addEventListener('DOMContentLoaded', initModal);