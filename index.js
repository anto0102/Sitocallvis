const apiKey = '2d082597ab951b3a9596ca23e71413a8';
const baseUrl = 'https://api.themoviedb.org/3';
const imageBase = 'https://image.tmdb.org/t/p/w500';

async function getPopular() {
  const res = await fetch(`${baseUrl}/movie/popular?api_key=${apiKey}&language=it-IT`);
  const data = await res.json();
  return data.results;
}

async function getTopRated() {
  const res = await fetch(`${baseUrl}/movie/top_rated?api_key=${apiKey}&language=it-IT`);
  const data = await res.json();
  return data.results;
}

function createCard(movie) {
  const div = document.createElement('div');
  div.className = 'movie-card';
  div.innerHTML = `
    <img src="${imageBase + movie.poster_path}" alt="${movie.title}" />
    <h3>${movie.title}</h3>
    <div class="rating">⭐ ${movie.vote_average.toFixed(1)}</div>
  `;
  return div;
}

async function loadMovies() {
  const consigliati = await getTopRated();
  const momento = await getPopular();

  const consigliatiContainer = document.getElementById('consigliati-carousel');
  const momentoContainer = document.getElementById('titoli-momento');

  consigliati.slice(0, 6).forEach(movie => {
    const card = createCard(movie);
    consigliatiContainer.appendChild(card);
  });

  momento.slice(0, 10).forEach(movie => {
    const card = createCard(movie);
    momentoContainer.appendChild(card);
  });
}

window.addEventListener('DOMContentLoaded', loadMovies);
