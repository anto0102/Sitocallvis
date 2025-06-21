const API_KEY = '2d082597ab951b3a9596ca23e71413a8'; // Inserisci qui la tua API Key TMDB
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

// Verifica se il film esiste su vixsrc.to
async function isMovieAvailableOnVixsrc(id) {
  return new Promise((resolve) => {
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = `https://vixsrc.to/movie/${id}`;

    const timeout = setTimeout(() => {
      document.body.removeChild(iframe);
      resolve(false);
    }, 5000);

    iframe.onload = () => {
      clearTimeout(timeout);
      document.body.removeChild(iframe);
      resolve(true);
    };

    iframe.onerror = () => {
      clearTimeout(timeout);
      document.body.removeChild(iframe);
      resolve(false);
    };

    document.body.appendChild(iframe);
  });
}

async function fetchMovies(endpoint) {
  const randomPage = Math.floor(Math.random() * 5) + 1;
  const fullUrl = `${BASE_URL}${endpoint}${endpoint.includes('?') ? '&' : '?'}api_key=${API_KEY}&language=it-IT&page=${randomPage}`;
  const response = await fetch(fullUrl);
  const data = await response.json();
  return data.results || [];
}

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

async function loadMovies() {
  for (const category of categories) {
    const container = document.getElementById(category.id);
    if (!container) continue;

    try {
      const movies = await fetchMovies(category.url);
      container.innerHTML = '';

      let count = 0;
      for (const movie of movies) {
        if (!movie.poster_path) continue;
        const available = await isMovieAvailableOnVixsrc(movie.id);
        if (available) {
          const card = createMovieCard(movie);
          container.appendChild(card);
          count++;
        }
        if (count >= 10) break;
      }
    } catch (err) {
      console.error(`Errore caricamento ${category.id}:`, err);
    }
  }
}

document.addEventListener('DOMContentLoaded', loadMovies);

// 🔍 Ricerca
document.getElementById('search-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const query = document.getElementById('search-input').value.trim();
  if (!query) return;

  const response = await fetch(`${BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(query)}&language=it-IT`);
  const data = await response.json();
  let results = (data.results || []).filter(item =>
    (item.media_type === 'movie' || item.media_type === 'tv') && item.poster_path
  );

  // Ordina: match esatto > popolarità
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

  // Dividi film e serie
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
    const card = createMovieCard(movie);
    movieContainer.appendChild(card);
  });

  series.slice(0, 10).forEach(serie => {
    const card = createMovieCard(serie);
    seriesContainer.appendChild(card);
  });
});
