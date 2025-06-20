// Estrai l'ID dalla URL
const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get("id");
const tipo = urlParams.get("tipo"); // "movie" o "tv"

const API_KEY = "2d082597ab951b3a9596ca23e71413a8"; // Sostituisci con la tua vera API Key
const contenitore = document.getElementById("contenitore");

// Recupera i dettagli dal TMDb
async function getDettagli() {
  try {
    const risposta = await fetch(`https://api.themoviedb.org/3/${tipo}/${id}?api_key=${API_KEY}&language=it-IT`);
    const dati = await risposta.json();

    // Crea HTML dettagli
    const dettagli = document.createElement("div");
    dettagli.classList.add("box-dettagli");
    dettagli.innerHTML = `
      <h2 style="color:red">${dati.name || dati.title}</h2>
      <p><strong>Tipo:</strong> ${tipo === "movie" ? "Film" : "Serie TV"}</p>
      <p><strong>Data uscita:</strong> ${dati.release_date || dati.first_air_date}</p>
      <p><strong>Durata:</strong> ${tipo === "movie" ? dati.runtime + " min" : dati.number_of_episodes + " episodi"}</p>
      <p><strong>Genere:</strong> ${dati.genres.map(g => g.name).join(", ")}</p>
      <p><strong>Punteggio:</strong> ⭐ ${dati.vote_average}</p>
      <p><strong>Trama:</strong> ${dati.overview}</p>
    `;
    contenitore.appendChild(dettagli);

    // Carica trailer YouTube
    caricaTrailer();

    // Carica video player da vixsrc
    caricaPlayerVix(tipo, id);

  } catch (errore) {
    console.error("Errore nel recupero dettagli:", errore);
  }
}

async function caricaTrailer() {
  try {
    const risposta = await fetch(`https://api.themoviedb.org/3/${tipo}/${id}/videos?api_key=${API_KEY}&language=it-IT`);
    const dati = await risposta.json();
    const trailer = dati.results.find(video => video.type === "Trailer" && video.site === "YouTube");

    if (trailer) {
      const boxTrailer = document.createElement("div");
      boxTrailer.className = "box-trailer";
      boxTrailer.innerHTML = `
        <iframe width="100%" height="400" src="https://www.youtube.com/embed/${trailer.key}" 
          title="Trailer" frameborder="0" allowfullscreen loading="lazy"></iframe>
      `;
      contenitore.appendChild(boxTrailer);
    }
  } catch (errore) {
    console.warn("Trailer non disponibile:", errore);
  }
}

function caricaPlayerVix(tipo, id) {
  const playerContainer = document.createElement('div');
  playerContainer.className = 'box-trailer';

  const iframe = document.createElement('iframe');
  iframe.src = `https://vixsrc.to/embed/${tipo}/${id}`;
  iframe.width = '100%';
  iframe.height = '400';
  iframe.allowFullscreen = true;
  iframe.loading = 'lazy';
  iframe.referrerPolicy = 'no-referrer';
  iframe.style.border = 'none';

  playerContainer.appendChild(iframe);
  contenitore.appendChild(playerContainer);
}

// Avvia il caricamento
getDettagli();
