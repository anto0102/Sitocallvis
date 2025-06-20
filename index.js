const contenitore = document.getElementById('contenitore');

const apiKey = '2d082597ab951b3a9596ca23e71413a8';

async function caricaContenuti(listaID, tipo) {
  contenitore.innerHTML = ''; // Pulisce il contenuto

  for (const id of listaID) {
    const url = `https://api.themoviedb.org/3/${tipo}/${id}?api_key=${apiKey}&language=it-IT`;
    try {
      const res = await fetch(url);
      const data = await res.json();

      const card = document.createElement('div');
      card.className = 'card';

      const img = document.createElement('img');
      img.src = data.poster_path
        ? `https://image.tmdb.org/t/p/w300${data.poster_path}`
        : 'https://via.placeholder.com/300x450?text=Nessuna+Immagine';

      const titolo = document.createElement('h3');
      titolo.textContent = tipo === 'movie' ? data.title : data.name;

      const descrizione = document.createElement('p');
      descrizione.textContent = data.overview || 'Nessuna descrizione disponibile.';

      card.appendChild(img);
      card.appendChild(titolo);
      card.appendChild(descrizione);

      contenitore.appendChild(card);
    } catch (error) {
      console.error(`Errore nel caricamento ID ${id}:`, error);
    }
  }
}

document.getElementById('btnFilm').addEventListener('click', () => {
  const filmIDs = [
    803796, 9994, 157919, 45371, 13692, 8944,
    274820, 24663, 26171, 5723, 872170, 952701
  ];
  caricaContenuti(filmIDs, 'movie');
});

document.getElementById('btnSerie').addEventListener('click', () => {
  const serieIDs = [
    1408, 1668, 46261, 60574, 72710, 100088,
    92749, 3452, 1419, 93405, 1399, 82856
  ];
  caricaContenuti(serieIDs, 'tv');
});
const inputRicerca = document.getElementById('inputRicerca');
const btnRicerca = document.getElementById('btnRicerca');

btnRicerca.addEventListener('click', async () => {
  const query = inputRicerca.value.trim();
  if (!query) return;

  contenitore.innerHTML = "<p>Caricamento...</p>";

  const response = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(query)}&language=it-IT`);
  const data = await response.json();

  contenitore.innerHTML = '';

  if (data.results && data.results.length > 0) {
    data.results.slice(0, 10).forEach(item => {
      if (item.media_type === "movie" || item.media_type === "tv") {
        const card = creaCard(item);
        contenitore.appendChild(card);
      }
    });
  } else {
    contenitore.innerHTML = "<p>Nessun risultato trovato.</p>";
  }
});
