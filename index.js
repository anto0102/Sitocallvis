const apiKey = '2d082597ab951b3a9596ca23e71413a8'; // 🔑 <-- METTI QUI LA TUA CHIAVE DI TMDB
const baseUrl = 'https://api.themoviedb.org/3';
const imageBase = 'https://image.tmdb.org/t/p/w500';

document.addEventListener('DOMContentLoaded', () => {
  loadHomeSections();
  setupSearch();
});

// Carica sezioni della home
function loadHomeSections() {
  loadMovies(`${baseUrl}/movie/popular?api_key=${apiKey}&language=it-IT&page=1`, 'consigliati');
  loadMovies(`${baseUrl}/trending/all/week?api_key=${apiKey}&language=it-IT`, 'tendenze');
}

// Carica film da URL e li mette in una sezione
function loadMovies(url, containerId) {
  fetch(url)
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById(containerId);
      container.innerHTML = ''; // svuota prima
      data.results.forEach(item => {
        if (!item.poster_path) return;
        const card = createCard(item);
        container.appendChild(card);
      });
    })
    .catch(err => console.error('Errore nel caricamento:', err));
}

// Crea una card per ogni film/serie
function createCard(item) {
  const card = document.createElement('div');
  card.classList.add('card');
  const title = item.title || item.name;
  const type = item.media_type || (item.title ? 'movie' : 'tv');

  card.innerHTML = `
    <img src="${imageBase + item.poster_path}" alt="${title}" />
    <h3>${title}</h3>
    <p>⭐ ${item.vote_average?.toFixed(1)}</p>
  `;

  card.addEventListener('click', () => {
    window.location.href = `dettagli.html?id=${item.id}&type=${type}`;
  });

  return card;
}

// Funzione per la ricerca
function setupSearch() {
  const input = document.querySelector('#search-input');
  const button = document.querySelector('#search-button');

  button.addEventListener('click', () => {
    const query = input.value.trim();
    if (query.length === 0) return;

    fetch(`${baseUrl}/search/multi?api_key=${apiKey}&language=it-IT&query=${encodeURIComponent(query)}`)
      .then(res => res.json())
      .then(data => {
        const contenuto = document.getElementById('contenuto');
        contenuto.innerHTML = `<section class="sezione">
          <h2>🔍 Risultati per "${query}"</h2>
          <div class="scroll-container" id="risultati"></div>
        </section>`;

        const resultsContainer = document.getElementById('risultati');
        data.results.forEach(item => {
          if (!item.poster_path) return;
          const card = createCard(item);
          resultsContainer.appendChild(card);
        });
      })
      .catch(err => console.error('Errore nella ricerca:', err));
  });
}
