const API_KEY = '2d082597ab951b3a9596ca23e71413a8';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_URL = 'https://image.tmdb.org/t/p/w500';

const categories = [
  { id: 'consigliati', name: 'Consigliati', url: '/movie/top_rated' },
  { id: 'momento', name: 'Titoli del momento', url: '/trending/movie/day' },
  { id: 'drammatici', name: 'Drammatici', url: '/discover/movie?with_genres=18' },
  { id: 'azione', name: 'Azione', url: '/discover/movie?with_genres=28' },
  { id: 'commedia', name: 'Commedia', url: '/discover/movie?with_genres=35' },
  { id: 'horror', name: 'Horror', url: '/discover/movie?with_genres=27' },
  { id: 'famiglia', name: 'Famiglia', url: '/discover/movie?with_genres=10751' },
  { id: 'fantascienza', name: 'Fantascienza', url: '/discover/movie?with_genres=878' },
  { id: 'romantico', name: 'Romantico', url: '/discover/movie?with_genres=10749' },
  { id: 'documentari', name: 'Documentari', url: '/discover/movie?with_genres=99' },
  { id: 'animazione', name: 'Animazione', url: '/discover/movie?with_genres=16' }
];

// Sidebar
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('show');
}

// Navigazione
function navigateTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  toggleSidebar();
}

// Tema scuro/chiaro
function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
}

// Richiesta API
async function fetchMovies(endpoint) {
  const response = await fetch(`${BASE_URL}${endpoint}&api_key=${API_KEY}&language=it-IT`);
  const data = await response.json();
  return data.results;
}

// Creazione card film
function createMovieCard(movie) {
  const card = document.createElement('div');
  card.className = 'movie-card';
  card.innerHTML = `
    <img src="${IMAGE_URL + movie.poster_path}" alt="${movie.title}">
    <div class="info">
      <div class="title">${movie.title}</div>
      <div class="rating">⭐ ${movie.vote_average.toFixed(1)}</div>
    </div>
  `;
  return card;
}

// Genera tutte le sezioni
async function loadCategories() {
  const main = document.getElementById('mainContent');
  for (const cat of categories) {
    const section = document.createElement('section');
    section.id = cat.id;
    section.innerHTML = `<h2>${cat.name}</h2><div class="movie-row" id="row-${cat.id}"></div>`;
    main.appendChild(section);

    try {
      const movies = await fetchMovies(cat.url);
      const row = section.querySelector('.movie-row');
      movies.slice(0, 12).forEach(movie => {
        if (movie.poster_path) {
          row.appendChild(createMovieCard(movie));
        }
      });
    } catch (err) {
      console.error(`Errore con categoria ${cat.name}:`, err);
    }
  }
}

// Ricerca film
async function searchMovies() {
  const query = document.getElementById('searchInput').value.trim();
  if (!query) return;

  const main = document.getElementById('mainContent');
  main.innerHTML = '<h2>Risultati ricerca...</h2>';

  try {
    const res = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&language=it-IT&query=${encodeURIComponent(query)}`);
    const data = await res.json();

    const resultSection = document.createElement('section');
    resultSection.innerHTML = `<h2>Risultati per "${query}"</h2><div class="movie-row"></div>`;
    main.appendChild(resultSection);

    const row = resultSection.querySelector('.movie-row');
    data.results.slice(0, 12).forEach(movie => {
      if (movie.poster_path) {
        row.appendChild(createMovieCard(movie));
      }
    });
  } catch (error) {
    console.error("Errore durante la ricerca:", error);
  }
}

// Inizializza al caricamento
document.addEventListener('DOMContentLoaded', () => {
  loadCategories();
});
