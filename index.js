// index.js COMPLETO CORRETTO

const API_KEY = '2d082597ab951b3a9596ca23e71413a8'; const BASE_URL = 'https://api.themoviedb.org/3'; const IMAGE_URL = 'https://image.tmdb.org/t/p/w500';

const categories = [ { id: 'consigliati', url: '/movie/top_rated' }, { id: 'momento', url: '/trending/movie/day' }, { id: 'drammatici', url: '/discover/movie?with_genres=18' }, { id: 'azione', url: '/discover/movie?with_genres=28' }, { id: 'commedie', url: '/discover/movie?with_genres=35' }, { id: 'horror', url: '/discover/movie?with_genres=27' }, { id: 'famiglia', url: '/discover/movie?with_genres=10751' }, { id: 'fantascienza', url: '/discover/movie?with_genres=878' }, { id: 'romantici', url: '/discover/movie?with_genres=10749' }, { id: 'documentari', url: '/discover/movie?with_genres=99' }, ];

function createMovieCard(item) { const title = item.title || item.name || 'Titolo sconosciuto'; const poster = item.poster_path ? ${IMAGE_URL}${item.poster_path} : 'fallback.jpg'; const type = item.media_type || 'movie';

const card = document.createElement('div'); card.className = 'flex-shrink-0 w-36 bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:scale-105 transition-transform'; card.innerHTML = <a href="dettagli.html?id=${item.id}&type=${type}" class="block"> <img src="${poster}" alt="${title}" class="w-full h-52 object-cover" /> <h3 class="text-center text-sm p-2">${title}</h3> </a>; return card; }

async function fetchMovies(endpoint) { const page = Math.floor(Math.random() * 5) + 1; const url = ${BASE_URL}${endpoint}${endpoint.includes('?') ? '&' : '?'}api_key=${API_KEY}&language=it-IT&page=${page}; const response = await fetch(url); const data = await response.json(); return data.results || []; }

async function loadMovies() { for (const category of categories) { const container = document.getElementById(category.id); if (!container) continue;

container.innerHTML = '<p class="text-gray-400">Caricamento...</p>';

try {
  const movies = await fetchMovies(category.url);
  container.innerHTML = '';

  let count = 0;
  for (const movie of movies) {
    if (!movie.poster_path) continue;
    container.appendChild(createMovieCard(movie));
    if (++count >= 10) break;
  }

  if (count === 0) container.innerHTML = '<p class="text-gray-500">Nessun contenuto disponibile.</p>';
} catch (err) {
  console.error(err);
  container.innerHTML = '<p class="text-red-500">Errore nel caricamento.</p>';
}

} }

document.addEventListener('DOMContentLoaded', loadMovies);

document.getElementById('search-form').addEventListener('submit', async (e) => { e.preventDefault(); const query = document.getElementById('search-input').value.trim(); if (!query) return;

const response = await fetch(${BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(query)}&language=it-IT); const data = await response.json(); const results = (data.results || []).filter(item => (item.media_type === 'movie' || item.media_type === 'tv') && item.poster_path);

results.sort((a, b) => { const q = query.toLowerCase(); const aTitle = (a.title || a.name || '').toLowerCase(); const bTitle = (b.title || b.name || '').toLowerCase(); return (aTitle === q ? -1 : 0) + (bTitle === q ? 1 : 0) || b.popularity - a.popularity; });

const movies = results.filter(r => r.media_type === 'movie'); const series = results.filter(r => r.media_type === 'tv');

const main = document.getElementById('main-content'); main.innerHTML = <section> <h2 class="text-xl font-semibold mb-2">🔍 Risultati per "${query}"</h2> <div class="space-y-6"> <div> <h3 class="text-lg font-medium mb-1">🎬 Film</h3> <div class="movie-container flex gap-4 overflow-x-auto" id="search-movies"></div> </div> <div> <h3 class="text-lg font-medium mb-1">📺 Serie TV</h3> <div class="movie-container flex gap-4 overflow-x-auto" id="search-series"></div> </div> </div> </section>;

const movieContainer = document.getElementById('search-movies'); const seriesContainer = document.getElementById('search-series');

movies.slice(0, 10).forEach(movie => movieContainer.appendChild(createMovieCard(movie))); series.slice(0, 10).forEach(serie => seriesContainer.appendChild(createMovieCard(serie))); });

