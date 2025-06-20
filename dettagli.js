const API_KEY = '2d082597ab951b3a9596ca23e71413a8'; // ← Inserisci qui la tua API KEY di TMDb
const contenitore = document.getElementById('contenitore');

const params = new URLSearchParams(window.location.search);
const id = params.get('id');
const tipo = params.get('type');

caricaDettagli();
setupSearch();

// Carica i dettagli
async function caricaDettagli() {
  if (!id || !tipo) {
    mostraMessaggio('Contenuto non trovato.');
    return;
  }

  try {
    const res = await fetch(`https://api.themoviedb.org/3/${tipo}/${id}?api_key=${API_KEY}&language=it-IT`);
    const dati = await res.json();

    if (!res.ok || dati.status_code === 34) {
      mostraMessaggio('Contenuto non trovato.');
      return;
    }

    const titolo = tipo === 'movie' ? dati.title : dati.name;
    const descrizione = dati.overview || 'Nessuna descrizione disponibile.';
    const immagine = dati.poster_path
      ? `https://image.tmdb.org/t/p/w500${dati.poster_path}`
      : 'https://via.placeholder.com/500x750?text=No+Image';
    const punteggio = dati.vote_average?.toFixed(1) || 'N/A';
    const durata = tipo === 'movie' ? `${dati.runtime} min` : `${dati.number_of_episodes} episodi`;
    const generi = dati.genres?.map(g => g.name).join(', ') || 'N/A';
    const dataUscita = tipo === 'movie' ? dati.release_date : dati.first_air_date;

    const card = document.createElement('div');
    card.className = 'dettagli-card';
    card.innerHTML = `
      <img src="${immagine}" alt="${titolo}" />
      <div class="info">
        <h2>${titolo}</h2>
        <p><strong>Tipo:</strong> ${tipo === 'movie' ? 'Film' : 'Serie TV'}</p>
        <p><strong>Data uscita:</strong> ${dataUscita || 'N/A'}</p>
        <p><strong>Durata:</strong> ${durata}</p>
        <p><strong>Genere:</strong> ${generi}</p>
        <p><strong>Punteggio:</strong> ⭐ ${punteggio}</p>
        <p><strong>Trama:</strong> ${descrizione}</p>
      </div>
    `;
    contenitore.appendChild(card);

    await caricaTrailer(id, tipo);
  } catch (e) {
    mostraMessaggio('Errore durante il caricamento.');
    console.error(e);
  }
}

// Carica trailer YouTube
async function caricaTrailer(id, tipo) {
  const url = `https://api.themoviedb.org/3/${tipo}/${id}/videos?api_key=${API_KEY}&language=it-IT`;
  const res = await fetch(url);
  const dati = await res.json();

  const trailer = dati.results?.find(
    v => v.type === 'Trailer' && v.site === 'YouTube'
  );

  if (trailer) {
    const iframe = document.createElement('iframe');
    iframe.width = '100%';
    iframe.height = '400';
    iframe.src = `https://www.youtube.com/embed/${trailer.key}`;
    iframe.title = 'Trailer';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;

    const boxTrailer = document.createElement('div');
    boxTrailer.className = 'box-trailer';
    boxTrailer.appendChild(iframe);
    contenitore.appendChild(boxTrailer);
  }
}

// Mostra messaggio d’errore
function mostraMessaggio(testo) {
  contenitore.innerHTML = `<div class="messaggio">${testo}</div>`;
}

// 🔍 Ricerca
function setupSearch() {
  const input = document.querySelector('#search-input');
  const button = document.querySelector('#search-button');

  if (!input || !button) return;

  button.addEventListener('click', () => {
    const query = input.value.trim();
    if (query.length > 0) {
      window.location.href = `index.html?search=${encodeURIComponent(query)}`;
    }
  });

  input.addEventListener('keyup', e => {
    if (e.key === 'Enter') button.click();
  });
}
