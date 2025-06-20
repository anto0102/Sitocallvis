const apiKey = '2d082597ab951b3a9596ca23e71413a8'; // <-- inserisci la tua API key
const baseUrl = 'https://api.themoviedb.org/3';
const imageBase = 'https://image.tmdb.org/t/p/w500';

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const query = params.get('search');

  if (query) {
    performSearch(query);
  } else {
    loadHomeSections();
  }

  setupSearch();
});

// Caricamento sezioni homepage
function loadHomeSections() {
  loadMovies(`${baseUrl}/movie/popular?api_key=${apiKey}&language=it-IT&page=1`, 'Consigliati');
  loadMovies(`${baseUrl}/trending/all/week?api_key=${apiKey}&language=it-IT`, 'Titoli del momento');
  loadMoviesByGenre(10764, 'Reality');
  loadMoviesByGenre(27, 'Horror');
  loadMoviesByGenre(80, 'Crime');
  loadMoviesByGenre(28, 'Action');
  loadMoviesByGenre(12, 'Adventure');
  loadMoviesByGenre(10749, 'Romance');
  loadMoviesByGenre(10752, 'War & Politics');
}

function loadMovies(url, sectionTitle) {
  fetch(url)
    .then(res => res.json())
    .then(data => {
      if (data.results && data.results.length > 0) {
        renderSection(sectionTitle, data.results);
      }
    })
    .catch(err => console.error('Errore nel caricamento:', err));
}

function loadMoviesByGenre(genreId, sectionTitle) {
  const url = `${baseUrl}/discover/movie?api_key=${apiKey}&with_genres=${genreId}&language=it-IT`;
  loadMovies(url, sectionTitle);
}

function renderSection(title, items) {
  const container = document.getElementById('contenuti') || createContainer();
  const section = document.createElement('section');
  section.classList.add('sezione');

  const heading = document.createElement('h2');
  heading.textContent = title;
  section.appendChild(heading);

  const scrollContainer = document.createElement('div');
  scrollContainer.classList.add('scroll-container');

  items.forEach(item => {
    const card = document.createElement('div');
    card.classList.add('card');
    card.innerHTML = `
      <img src="${imageBase + item.poster_path}" alt="${item.title || item.name}" />
      <h3>${item.title || item.name}</h3>
      <p>⭐ ${item.vote_average?.toFixed(1) || 'N/A'}</p>
    `;
    card.addEventListener('click', () => {
      const id = item.id;
      const tipo = item.media_type || (item.title ? 'movie' : 'tv');
      window.location.href = `dettagli.html?id=${id}&tipo=${tipo}`;
    });

    scrollContainer.appendChild(card);
  });

  section.appendChild(scrollContainer);
  container.appendChild(section);
}

function createContainer() {
  const main = document.querySelector('main');
  const container = document.createElement('div');
  container.id = 'contenuti';
  main.appendChild(container);
  return container;
}

// 🔍 Funzione ricerca
function setupSearch() {
  const input = document.querySelector('#search-input');
  const button = document.querySelector('#search-button');

  if (!input || !button) return;

  button.addEventListener('click', () => {
    const query = input.value.trim();
    if (query.length > 0) {
      // reindirizza a index.html con parametro
      window.location.href = `index.html?search=${encodeURIComponent(query)}`;
    }
  });
}

// Funzione per eseguire ricerca da URL
function performSearch(query) {
  fetch(`${baseUrl}/search/multi?api_key=${apiKey}&query=${query}&language=it-IT`)
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById('contenuti') || createContainer();
      container.innerHTML = '';
      renderSection(`Risultati per "${query}"`, data.results);
    })
    .catch(err => console.error('Errore nella ricerca:', err));
}
