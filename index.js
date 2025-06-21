const API_KEY = '2d082597ab951b3a9596ca23e71413a8'; // 🔐 Inserisci qui la tua API Key TMDB
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_URL = 'https://image.tmdb.org/t/p/w500';

const categories = [
  { id: 'consigliati', url: '/movie/top_rated' },
  { id: 'momento', url: '/trending/movie/day' },
  { id: 'drammatici', url: '/discover/movie?with_genres=18' },
  { id: 'azione', url: '/discover/movie?with_genres=28' },
  { id: 'commedie', url: '/discover/movie?with_genres=35' },
  { id: 'horror', url: '/discover/movie?with_genres=27' },
  { id: 'famiglia', url: '/discover/movie?with_genres=10751' },
  { id: 'fantascienza', url: '/discover/movie?with_genres=878' },
  { id: 'romantici', url: '/discover/movie?with_genres=10749' },
  { id: 'documentari', url: '/discover/movie?with_genres=99' },
];

// ⚡ Verifica disponibilità Vixsrc con cache + fallback rapido
function isMovieAvailableOnVixsrc(id, type = 'movie') {
  const key = `vixsrc_${type}_${id}`;
  const cached = localStorage.getItem(key);

  // se già verificato, restituisci il risultato
  if (cached === 'true') return Promise.resolve(true);
  if (cached === 'false') return Promise.resolve(false);

  // altrimenti prova con fetch HEAD (più veloce di iframe)
  return fetch(`https://vixsrc.to/${type}/${id}`, { method: 'HEAD', mode: 'no-cors' })
    .then(() => {
      localStorage.setItem(key, 'true');
      return true;
    })
    .catch(() => {
      localStorage.setItem(key, 'false');
      return false;
    });
}

// 🔎 Fetch film
async function fetchMovies(endpoint) {
  const page = Math.floor(Math.random() * 5) + 1;
  const url = `${BASE_URL}${endpoint}${endpoint.includes('?') ? '&' : '?'}api_key=${API_KEY}&language=it-IT&page=${page}`;
  const response = await fetch(url);
  const data = await response.json();
  return data.results || [];
}

// 🎬 Crea card film
function createMovieCard(item) {
  const title = item.title || item.name || 'Titolo sconosciuto';
  const poster = item.poster_path ? `${IMAGE_URL}${item.poster_path}` : 'fallback.jpg';
  const type = item.media_type || 'movie';

  const card = document.createElement('div');
  card.className = 'movie-card';
  card.innerHTML = `
    <a href="dettagli.html?id=${item.id}&type=${type}">
      <img src="${poster}" alt="${title}" />
      <h3>${title}</h3>
    </a>
  `;
  return card;
}

// 🚀 Carica i film per categoria
async function loadMovies() {
  for (const category of categories) {
    const container = document.getElementById(category.id);
    if (!container) continue;

    container.innerHTML = '<p class="loading">Caricamento...</p>';

    try {
      const movies = await fetchMovies(category.url);
      container.innerHTML = '';

      let count = 0;
      for (const movie of movies) {
        if (!movie.poster_path) continue;

        const available = await isMovieAvailableOnVixsrc(movie.id);
        if (available) {
          container.appendChild(createMovieCard(movie));
          count++;
        }
        if (count >= 10) break;
      }

      if (count === 0) {
        container.innerHTML = '<p>Nessun contenuto disponibile.</p>';
      }
    } catch (err) {
      console.error(`Errore nella categoria "${category.id}":`, err);
      container.innerHTML = '<p class="error">Errore nel caricamento.</p>';
    }
  }
}

// ⏱️ Inizializza
document.addEventListener('DOMContentLoaded', loadMovies);

// 🔍 Ricerca (non applica filtro)
document.getElementById('search-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const query = document.getElementById('search-input').value.trim();
  if (!query) return;

  const response = await fetch(`${BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(query)}&language=it-IT`);
  const data = await response.json();
  let results = (data.results || []).filter(item =>
    (item.media_type === 'movie' || item.media_type === 'tv') && item.poster_path
  );

  results.sort((a, b) => {
    const q = query.toLowerCase();
    const aTitle = (a.title || a.name || '').toLowerCase();
    const bTitle = (b.title || b.name || '').toLowerCase();
    const aExact = aTitle === q;
    const bExact = bTitle === q;
    if (aExact && !bExact) return -1;
    if (!aExact && bExact) return 1;
    return b.popularity - a.popularity;
  });

  const movies = results.filter(r => r.media_type === 'movie');
  const series = results.filter(r => r.media_type === 'tv');

  const main = document.getElementById('main-content');
  main.innerHTML = `
    <section>
      <h2>🔍 Risultati per "${query}"</h2>
      <div class="search-group">
        <h3>🎬 Film</h3>
        <div class="movie-container" id="search-movies"></div>
      </div>
      <div class="search-group">
        <h3>📺 Serie TV</h3>
        <div class="movie-container" id="search-series"></div>
      </div>
    </section>
  `;

  const movieContainer = document.getElementById('search-movies');
  const seriesContainer = document.getElementById('search-series');

  movies.slice(0, 10).forEach(movie => {
    movieContainer.appendChild(createMovieCard(movie));
  });

  series.slice(0, 10).forEach(serie => {
    seriesContainer.appendChild(createMovieCard(serie));
  });
});
