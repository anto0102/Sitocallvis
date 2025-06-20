// Inserisci la tua API Key qui
const API_KEY = '2d082597ab951b3a9596ca23e71413a8';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';

const main = document.getElementById('main');
const searchInput = document.getElementById('search');
const searchBtn = document.getElementById('searchBtn');
const filterBtn = document.getElementById('filterBtn');
const filterModal = document.getElementById('filterModal');
const yearInput = document.getElementById('year');
const scoreInput = document.getElementById('score');
const applyFiltersBtn = document.getElementById('applyFilters');

let filters = {};

function createCard(item) {
  const card = document.createElement('div');
  card.classList.add('card');
  card.onclick = () => {
    window.location.href = `dettagli.html?id=${item.id}&type=${item.media_type || item.title ? 'movie' : 'tv'}`;
  };

  card.innerHTML = `
    <img src="${IMG_URL + item.poster_path}" alt="${item.title || item.name}" />
    <div class="info">
      <strong>${item.title || item.name}</strong><br />
      ⭐ ${item.vote_average}
    </div>
  `;
  return card;
}

function createSection(title, items) {
  const section = document.createElement('section');
  section.classList.add('section');
  section.innerHTML = `<h2 class="section-title">${title}</h2>`;

  const row = document.createElement('div');
  row.classList.add('scrolling-row');

  items.forEach(item => {
    if (item.poster_path) {
      row.appendChild(createCard(item));
    }
  });

  section.appendChild(row);
  main.appendChild(section);
}

async function fetchData(endpoint, title) {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}?api_key=${API_KEY}&language=it-IT`);
    const data = await res.json();
    createSection(title, data.results);
  } catch (err) {
    console.error('Errore nel caricamento:', err);
  }
}

function loadContent() {
  main.innerHTML = '';
  fetchData('/movie/popular', '🎞️ Film consigliati');
  fetchData('/trending/all/week', '🔥 Titoli del momento');
  fetchData('/discover/tv?with_genres=10764', '🧑‍🤝‍🧑 Reality');
  fetchData('/discover/movie?with_genres=27', '👻 Horror');
  fetchData('/discover/movie?with_genres=80', '🔍 Crime');
  fetchData('/discover/movie?with_genres=28', '💥 Action');
  fetchData('/discover/movie?with_genres=12', '🌍 Adventure');
  fetchData('/discover/movie?with_genres=10749', '💘 Romance');
  fetchData('/discover/tv?with_genres=10768', '⚔️ War & Politics');
}

searchBtn.addEventListener('click', () => {
  const query = searchInput.value;
  if (query.trim()) searchContent(query);
});

filterBtn.addEventListener('click', () => {
  filterModal.classList.toggle('hidden');
});

applyFiltersBtn.addEventListener('click', () => {
  filters.year = yearInput.value;
  filters.vote = scoreInput.value;
  filterModal.classList.add('hidden');
  if (searchInput.value.trim()) {
    searchContent(searchInput.value);
  }
});

async function searchContent(query) {
  main.innerHTML = '';
  try {
    const res = await fetch(`${BASE_URL}/search/multi?api_key=${API_KEY}&language=it-IT&query=${encodeURIComponent(query)}`);
    const data = await res.json();

    let results = data.results.filter(item => item.poster_path);
    if (filters.year) {
      results = results.filter(r => (r.release_date || r.first_air_date)?.startsWith(filters.year));
    }
    if (filters.vote) {
      results = results.filter(r => r.vote_average >= parseFloat(filters.vote));
    }

    createSection(`Risultati per "${query}"`, results);
  } catch (err) {
    console.error('Errore nella ricerca:', err);
  }
}

loadContent();


Ecco il file index.js aggiornato e funzionante. Copialo e incollalo nel tuo progetto:

📌 Cosa include:

Caricamento sezioni film consigliati, titoli del momento e categorie specifiche.

Funzione di ricerca con filtro per anno e voto.

Navigazione alla pagina dei dettagli tramite ID.


✅ Importante: Sostituisci 'INSERISCI_LA_TUA_API_KEY' con la tua vera API key di TMDB.

Se vuoi il CSS o il file HTML aggiornato, chiedimelo pure.

  
