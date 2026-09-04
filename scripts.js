
const pokemonCache = new Map();
const speciesCache = new Map();
const evoChainCache = new Map();
let allNames = [];
let currentModalId = null;
let loadedCount = 0;
let isLoadingMore = false;



async function loadPokemonCards(count = 15) {
    const ids = Array.from({ length: count }, (_, i) => i + 1);
    const pokemonList = await Promise.all(ids.map(id => getPokemon(id)));
    renderCards(pokemonList);
    loadedCount = count;
}

function renderCards(pokemonList) {
    const container = document.querySelector('.card-container');
    container.innerHTML = pokemonList.map(p => createCardHTML(p)).join('');
    allNames = pokemonList.map(p => p.name);
    attachCardListeners(container.querySelectorAll('.pokemon-card'));
}

function appendCards(pokemonList) {
    const container = document.querySelector('.card-container');
    container.insertAdjacentHTML('beforeend', pokemonList.map(p => createCardHTML(p)).join(''));
    allNames = allNames.concat(pokemonList.map(p => p.name));
    const newCards = Array.from(container.querySelectorAll('.pokemon-card')).slice(-pokemonList.length);
    attachCardListeners(newCards);
}

function setLoadMoreState(isLoading) {
    const btn = document.getElementById('load-more-btn');
    const loadingIndicator = document.getElementById('load-more-loading');
    btn.disabled = isLoading;
    btn.textContent = isLoading ? 'Lädt...' : 'Mehr laden';
    loadingIndicator.hidden = !isLoading;
}

async function fetchNextBatch() {
    const batchSize = Math.floor(Math.random() * (40 - 20 + 1)) + 20;
    const startId = loadedCount + 1;
    const ids = Array.from({ length: batchSize }, (_, i) => startId + i);
    const pokemonList = await Promise.all(ids.map(id => getPokemon(id)));
    appendCards(pokemonList);
    loadedCount += batchSize;
}

async function loadMorePokemon() {
    if (isLoadingMore) return;
    isLoadingMore = true;
    setLoadMoreState(true);
    try {
        await fetchNextBatch();
    } catch (err) {
        console.error('Fehler beim Laden weiterer Pokémon:', err);
    } finally {
        setLoadMoreState(false);
        isLoadingMore = false;
    }
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

function attachCardListeners(cards) {
    cards.forEach(card => {
        card.addEventListener('click', () => {
            const id = card.dataset.id;
            showPokemonDetailModal(id);
        });
    });
}




async function getSpecies(id) {
    if (speciesCache.has(id)) return speciesCache.get(id);
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`);
    const data = await response.json();
    speciesCache.set(id, data);
    return data;
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

async function showPokemonDetailModal(id) {
    const pokemon = await getPokemon(id);
    currentModalId = pokemon.id;
    const overlay = document.getElementById('pokemon-modal');
    const primaryType = pokemon.types[0].type.name;
    overlay.querySelector('.modal-box').className = `modal-box type-${primaryType}`;
    overlay.querySelector('.modal-body').innerHTML = buildDetailHTML(pokemon);
    overlay.querySelector('.modal-nav-prev').disabled = currentModalId <= 1;
    overlay.classList.add('open');
    document.body.classList.add('modal-open');
}

function showPreviousPokemon() {
    if (currentModalId === null || currentModalId <= 1) return;
    showPokemonDetailModal(currentModalId - 1);
}

function showNextPokemon() {
    if (currentModalId === null) return;
    showPokemonDetailModal(currentModalId + 1);
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

function closeModal() {
    document.getElementById('pokemon-modal').classList.remove('open');
    document.body.classList.remove('modal-open');
}

function handleModalKeydown(event, overlay) {
    if (event.key === 'Escape') closeModal();
    if (!overlay.classList.contains('open')) return;
    if (event.key === 'ArrowLeft') showPreviousPokemon();
    if (event.key === 'ArrowRight') showNextPokemon();
}

function initModal() {
    const overlay = document.getElementById('pokemon-modal');
    overlay.querySelector('.modal-close').addEventListener('click', closeModal);
    overlay.querySelector('.modal-nav-prev').addEventListener('click', showPreviousPokemon);
    overlay.querySelector('.modal-nav-next').addEventListener('click', showNextPokemon);
    overlay.addEventListener('click', (event) => {
        if (event.target === overlay) closeModal();
    });
    document.addEventListener('keydown', (event) => handleModalKeydown(event, overlay));
}

function filterandShowNames(filterword) {
    const search = filterword.toLowerCase();
    allNames.forEach(name => {
        const card = document.querySelector(`.pokemon-card[data-name="${name}"]`);
        if (!card) return;
        card.style.display = name.includes(search) ? '' : 'none';
    });
}

document.addEventListener('DOMContentLoaded', initModal);