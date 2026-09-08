const BASE_URL = 'https://pokeapi.co/api/v2/pokemon';

function onloadFunc() {
    loadPokemonCards(15);
}


async function fetchPokemon() {
    let response = await fetch(BASE_URL);
    let data = await response.json();
   return data.results;
}