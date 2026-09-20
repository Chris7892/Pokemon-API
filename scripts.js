const BASE_URL = 'https://pokeapi.co/api/v2/pokemon';

const pokemonCache = new Map();
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
    id = Number(id);
    if (pokemonCache.has(id)) {
        return pokemonCache.get(id);
    }
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        const data = await response.json();
        pokemonCache.set(id, data);
        return data;
    } catch (error) {
        console.error(`Fehler beim Abrufen von Pokémon mit ID ${id}:`, error);
        throw error;
    }
}

function attachCardListeners(cards) {
    cards.forEach(card => {
        card.addEventListener('click', () => showPokemonDetailModal(card.dataset.id));
        card.addEventListener('keydown', (event) => {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            event.preventDefault();
            showPokemonDetailModal(card.dataset.id);
        });
    });
}




function getVisiblePokemonIds() {
    return Array.from(document.querySelectorAll('.pokemon-card'))
        .filter(card => card.style.display !== 'none')
        .map(card => Number(card.dataset.id));
}

function buildStatsWithPercent(pokemon) {
    return pokemon.stats.map(stat => ({
        stat,
        pct: Math.min(100, Math.round((stat.base_stat / 255) * 100))
    }));
}

function updateModalNavButtons(dialog) {
    const visibleIds = getVisiblePokemonIds();
    const index = visibleIds.indexOf(currentModalId);
    dialog.querySelector('.modal-nav-prev').disabled = index <= 0;
    dialog.querySelector('.modal-nav-next').disabled = index === -1 || index >= visibleIds.length - 1;
}

async function showPokemonDetailModal(id) {
    const pokemon = await getPokemon(id);
    currentModalId = pokemon.id;
    const dialog = document.getElementById('pokemon-modal');
    dialog.className = `modal-box type-${pokemon.types[0].type.name}`;
    const heightM = pokemon.height / 10;
    const weightKg = pokemon.weight / 10;
    const abilities = pokemon.abilities.map(a => a.ability.name).join(', ');
    const statsWithPercent = buildStatsWithPercent(pokemon);
    dialog.querySelector('.modal-body').innerHTML = buildDetailHTML(pokemon, heightM, weightKg, abilities, statsWithPercent);
    updateModalNavButtons(dialog);
    if (!dialog.open) dialog.showModal();
}

function showPreviousPokemon() {
    if (currentModalId === null) return;
    const visibleIds = getVisiblePokemonIds();
    const index = visibleIds.indexOf(currentModalId);
    if (index <= 0) return;
    showPokemonDetailModal(visibleIds[index - 1]);
}

function showNextPokemon() {
    if (currentModalId === null) return;
    const visibleIds = getVisiblePokemonIds();
    const index = visibleIds.indexOf(currentModalId);
    if (index === -1 || index >= visibleIds.length - 1) return;
    showPokemonDetailModal(visibleIds[index + 1]);
}

function closeModal() {
    const dialog = document.getElementById('pokemon-modal');
    if (dialog.open) dialog.close();
}

function handleModalBackdropClick(event, dialog) {
    const rect = dialog.getBoundingClientRect();
    const clickedOutside = event.clientX < rect.left || event.clientX > rect.right
        || event.clientY < rect.top || event.clientY > rect.bottom;
    if (clickedOutside) closeModal();
}

function handleModalArrowKeys(event) {
    if (event.key === 'ArrowLeft') showPreviousPokemon();
    if (event.key === 'ArrowRight') showNextPokemon();
}

function initModal() {
    const dialog = document.getElementById('pokemon-modal');
    dialog.querySelector('.modal-close').addEventListener('click', closeModal);
    dialog.querySelector('.modal-nav-prev').addEventListener('click', showPreviousPokemon);
    dialog.querySelector('.modal-nav-next').addEventListener('click', showNextPokemon);
    dialog.addEventListener('click', (event) => handleModalBackdropClick(event, dialog));
    dialog.addEventListener('keydown', handleModalArrowKeys);
    dialog.addEventListener('close', () => { currentModalId = null; });
}

const MIN_SEARCH_LENGTH = 3;

function filterandShowNames(filterword) {
    const search = filterword.toLowerCase();
    const hint = document.getElementById('search-hint');
    const isSearchActive = search.length >= MIN_SEARCH_LENGTH;
    hint.hidden = search.length === 0 || isSearchActive;
    document.querySelector('.load-more-container').hidden = isSearchActive;
    allNames.forEach(name => {
        const card = document.querySelector(`.pokemon-card[data-name="${name}"]`);
        if (!card) return;
        card.style.display = (!isSearchActive || name.includes(search)) ? '' : 'none';
    });
}

loadPokemonCards(15);
initModal();