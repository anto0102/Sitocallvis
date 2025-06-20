const apiKey = '';
const baseUrl = 'https://api.themoviedb.org/3';
const imageBase = 'https://image.tmdb.org/t/p/w500';

document.addEventListener('DOMContentLoaded', () => {
  loadHomeSections();
  setupSearch();
});

// Carica le sezioni della home
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

// Carica film da un URL
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

// Carica film per genere
function loadMoviesByGenre(genreId, sectionTitle) {
  const url = `${baseUrl}/discover/movie?api_key=${apiKey}&with_genres=${genreId}&language=it-IT`;
  loadMovies(url, sectionTitle);
}

// Crea sezione e card
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
    if (!item.poster_path) return;

    const card = document.createElement('div');
    card.classList.add('card');
    card.innerHTML = `
      <img src="${imageBase + item.poster_path}" alt="${item.title || item.name}" />
      <h3>${item.title || item.name}</h3>
      <p>⭐ ${item.vote_average?.toFixed(1)}</p>
    `;
    card.addEventListener('click', () => {
      const id = item.id;
      const type = item.media_type || (item.title ? 'movie' : 'tv');
      window.location.href = `dettagli.html?id=${id}&type=${type}`;
    });

    scrollContainer.appendChild(card);
  });

  section.appendChild(scrollContainer);
  container.appendChild(section);
}

// Crea contenitore principale se non esiste
function createContainer() {
  const main = document.querySelector('main');
  const container = document.createElement('div');
  container.id = 'contenuti';
  main.appendChild(container);
  return container;
}

// Funzione di ricerca
function setupSearch() {
  const input = document.querySelector('#search-input');
  const button = document.querySelector('#search-button');

  if (!input || !button) return;

  button.addEventListener('click', () => {
    const query = input.value.trim();
    if (query.length > 0) {
      fetch(`${baseUrl}/search/multi?api_key=${apiKey}&query=${encodeURIComponent(query)}&language=it-IT`)
        .then(res => res.json())
        .then(data => {
          const container = document.getElementById('contenuti');
          container.innerHTML = '';
          renderSection(`Risultati per "${query}"`, data.results);
        })
        .catch(err => console.error('Errore nella ricerca:', err));
    }
  });
}
