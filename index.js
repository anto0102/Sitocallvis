const API_KEY = "2d082597ab951b3a9596ca23e71413a8"; // ⬅️ Inserisci la tua vera chiave TMDb qui
const BASE_URL = "https://api.themoviedb.org/3";

const inputRicerca = document.getElementById("inputRicerca");
const btnRicerca = document.getElementById("btnRicerca");
const btnFilm = document.getElementById("btnFilm");
const btnSerie = document.getElementById("btnSerie");
const contenitore = document.getElementById("contenitore");

function mostraRisultati(risultati, tipo) {
  contenitore.innerHTML = "";

  if (!risultati || risultati.length === 0) {
    contenitore.innerHTML = "<p>Nessun risultato trovato.</p>";
    return;
  }

  risultati.forEach(item => {
    const titolo = tipo === "tv" ? item.name : item.title;
    const descrizione = item.overview || "Nessuna descrizione disponibile.";
    const anno = (item.first_air_date || item.release_date || "").slice(0, 4);
    const immagine = item.poster_path
      ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
      : "https://via.placeholder.com/150";

    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${immagine}" alt="${titolo}" width="150">
      <h3>${titolo}</h3>
      <p><strong>Anno:</strong> ${anno}</p>
      <p>${descrizione}</p>
    `;
    contenitore.appendChild(card);
  });
}

function caricaContenuti(tipo) {
  contenitore.innerHTML = "<p>Caricamento...</p>";

  fetch(`${BASE_URL}/discover/${tipo}?api_key=${API_KEY}&language=it-IT`)
    .then(response => response.json())
    .then(data => mostraRisultati(data.results, tipo))
    .catch(error => {
      console.error("Errore nel caricamento:", error);
      contenitore.innerHTML = "<p>Errore nel caricamento dei contenuti.</p>";
    });
}

function cercaContenuti() {
  const query = inputRicerca.value.trim();
  if (!query) return;

  contenitore.innerHTML = "<p>Caricamento...</p>";

  fetch(`${BASE_URL}/search/multi?api_key=${API_KEY}&language=it-IT&query=${encodeURIComponent(query)}`)
    .then(response => response.json())
    .then(data => {
      if (!data.results || data.results.length === 0) {
        contenitore.innerHTML = "<p>Nessun risultato trovato.</p>";
        return;
      }

      // Filtra solo film o serie
      const filtrati = data.results.filter(
        item => item.media_type === "movie" || item.media_type === "tv"
      );

      mostraRisultati(filtrati, "multi");
    })
    .catch(error => {
      console.error("Errore nella ricerca:", error);
      contenitore.innerHTML = "<p>Errore durante la ricerca.</p>";
    });
}

// Event listeners
btnFilm.addEventListener("click", () => caricaContenuti("movie"));
btnSerie.addEventListener("click", () => caricaContenuti("tv"));
btnRicerca.addEventListener("click", cercaContenuti);
