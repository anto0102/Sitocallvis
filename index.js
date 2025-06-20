const apiKey = '<<2d082597ab951b3a9596ca23e71413a8>>'; // inserisci la tua API key TMDB
const baseUrl = 'https://api.themoviedb.org/3';

async function getPopular() {
  const res = await fetch(`${baseUrl}/movie/popular?api_key=${apiKey}&language=it-IT`);
  const data = await res.json();
  return data.results;
}

async function getNowPlaying() {
  const res = await fetch(`${baseUrl}/movie/now_playing?api_key=${apiKey}&language=it-IT`);
  const data = await res.json();
  return data.results;
}

// Rendering della sezione Consigliati (carosello verticale)
function renderConsigliati(list) {
  const container = document.getElementById('consigliati-carousel');
  container.innerHTML = '';

  list.forEach(movie => {
    const card = document.createElement('div');
    card.className = 'card-vertical';

    card.innerHTML = `
      <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}" />
      <div class="card-content">
        <h3>${movie.title}</h3>
        <div class="rating">⭐ ${movie.vote_average}</div>
      </div>
    `;

    container.appendChild(card);
  });
}

// Rendering Titoli del momento
function renderNowPlaying(list) {
  const container = document.getElementById('titoli-momento');
  container.innerHTML = '';

  list.forEach(movie => {
    const card = document.createElement('div');
    card.className = 'card';

    card.innerHTML = `
      <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}" />
      <div class="title">${movie.title}</div>
    `;

    container.appendChild(card);
  });
}

// Esegui onload
window.addEventListener('DOMContentLoaded', () => {
  getPopular().then(renderConsigliati);
  getNowPlaying().then(renderNowPlaying);
});
