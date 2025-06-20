const API_KEY = '2d082597ab951b3a9596ca23e71413a8';
const contenitore = document.getElementById('contenitore');

// Prendi i parametri dalla URL
const params = new URLSearchParams(window.location.search);
const id = params.get('id');
const tipo = params.get('type'); // "movie" o "tv"

// Carica i dettagli
async function caricaDettagli() {
  if (!id || !tipo) {
    mostraMessaggio('Contenuto non trovato.');
    return;
  }

  try {
    const risposta = await fetch(`https://api.themoviedb.org/3/${tipo}/${id}?api_key=${API_KEY}&language=it-IT`);
    const dati = await risposta.json();

    if (dati.success === false || dati.status_code === 34) {
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

    // Carica anche il trailer
    await caricaTrailer(id, tipo);
  } catch (errore) {
    mostraMessaggio('Errore durante il caricamento.');
    console.error(errore);
  }
}

// Mostra trailer da YouTube
async function caricaTrailer(id, tipo) {
  const url = `https://api.themoviedb.org/3/${tipo}/${id}/videos?api_key=${API_KEY}&language=it-IT`;
  const risposta = await fetch(url);
  const dati = await risposta.json();

  const trailer = dati.results?.find(
    video => video.type === 'Trailer' && video.site === 'YouTube'
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

function mostraMessaggio(testo) {
  contenitore.innerHTML = `<div class="messaggio">${testo}</div>`;
}

caricaDettagli();
