
const pokemonCache = new Map();
const speciesCache = new Map();
const evoChainCache = new Map();



async function loadPokemonCards(count = 30) {
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
    // evoData.chain enthält eine verschachtelte Struktur:
    // { species: {...}, evolves_to: [ { species: {...}, evolves_to: [...] } ] }
    console.log(evoData.chain); // erstmal zum Testen, dann eigenes Markup bauen
}