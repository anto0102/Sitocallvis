const apiKey = '2d082597ab951b3a9596ca23e71413a8';
const baseUrl = 'https://api.themoviedb.org/3';
const imageBase = 'https://image.tmdb.org/t/p/w500';

document.addEventListener('DOMContentLoaded', () => {
  loadHomeSections();
  setupSearch();
});

function loadHomeSections() {
  loadMovies(`${baseUrl}/movie/popular?api_key=${apiKey}&language=it-IT`, 'Popolari');
  loadMovies(`${baseUrl}/trending/all/week?api_key=${apiKey}&language=it-IT`, 'Tendenze');
  loadMoviesByGenre(27, 'Horror');
  loadMoviesByGenre(10752, 'War & Politics');
  loadMoviesByGenre(10749, 'Romance');
  loadMoviesByGenre(28, 'Azione');
  loadMoviesByGenre(80, 'Crime');
}

function loadMovies(url, sectionTitle) {
  fetch(url)
    .then(res => res.json())
    .then(data => {
      if (data.results && data.results.length > 0) {
        renderSection(sectionTitle, data.results);
      }
    })
    .catch(err => console.error('Errore:', err));
}

function loadMoviesByGenre(genreId, title) {
  const url = `${baseUrl}/discover/movie?api_key=${apiKey}&with_genres=${genreId}&language=it-IT`;
  loadMovies(url, title);
}

function renderSection(title, items) {
  const container = document.getElementById('contenuti');
  const section = document.createElement('section');
  section.innerHTML = `<h2>${title}</h2>`;
  const scroll = document.createElement('div');
  scroll.className = 'scroll';

  items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'card';

    const type = item.media_type || (item.title ? 'movie' : 'tv');
    const name = item.title || item.name;
    const img = item.poster_path 
      ? imageBase + item.poster_path
      : 'https://via.placeholder.com/300x450?text=Nessuna+immagine';

    card.innerHTML = `
      <a href="dettagli.html?id=${item.id}&type=${type}">
        <img src="${img}" alt="${name}" />
        <h3>${name}</h3>
        <p>⭐ ${item.vote_average?.toFixed(1)}</p>
      </a>
    `;

    scroll.appendChild(card);
  });

  section.appendChild(scroll);
  container.appendChild(section);
}

function setupSearch() {
  const input = document.querySelector('#search-input');
  const button = document.querySelector('#search-button');

  button.addEventListener('click', () => {
    const query = input.value.trim();
    if (query) {
      window.location.href = `index.html?search=${encodeURIComponent(query)}`;
    }
  });
}
