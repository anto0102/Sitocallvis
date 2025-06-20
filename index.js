const API_KEY = '2d082597ab951b3a9596ca23e71413a8';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_URL = 'https://image.tmdb.org/t/p/w500';

const menuToggle = document.getElementById('menu-toggle');
const sidebar = document.getElementById('sidebar');

menuToggle.addEventListener('click', () => {
  sidebar.classList.toggle('active');
});

const categories = [
  { id: 'consigliati', url: `/movie/top_rated` },
  { id: 'momento', url: `/trending/movie/day` },
  { id: 'drammatici', url: `/discover/movie?with_genres=18` },
  { id: 'azione', url: `/discover/movie?with_genres=28` },
  { id: 'commedie', url: `/discover/movie?with_genres=35` },
  { id: 'horror', url: `/discover/movie?with_genres=27` },
  { id: 'famiglia', url: `/discover/movie?with_genres=10751` },
  { id: 'fantascienza', url: `/discover/movie?with_genres=878` },
  { id: 'romantici', url: `/discover/movie?with_genres=10749` },
  { id: 'documentari', url: `/discover/movie?with_genres=99` },
];

async function fetchMovies(endpoint) {
  const response = await fetch(`${BASE_URL}${endpoint}&api_key=${API_KEY}&language=it-IT`);
  const data = await response.json();
  return data.results;
}

function createMovieCard(movie) {
  const card = document.createElement('div');
  card.className = 'movie-card';
  card.innerHTML = `
    <img src="${IMAGE_URL + movie.poster_path}" alt="${movie.title}" />
    <h3>${movie.title}</h3>
  `;
  return card;
}

async function loadMovies() {
  for (const category of categories) {
    const container = document.getElementById(category.id);
    try {
      const movies = await fetchMovies(category.url);
      movies.slice(0, 10).forEach(movie => {
        if (movie.poster_path) {
          const card = createMovieCard(movie);
          container.appendChild(card);
        }
      });
    } catch (err) {
      console.error(`Errore caricamento ${category.id}:`, err);
    }
  }
}

document.addEventListener('DOMContentLoaded', loadMovies);
