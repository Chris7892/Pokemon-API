function onloadFunc() {
    console.log("Page loaded");
    fetchPokemon();
}

const BASE_URL = 'https://pokeapi.co/api/v2/pokemon';

async function fetchPokemon() {
    let response = await fetch(BASE_URL);
    let data = await response.json();
    console.log(data);
}