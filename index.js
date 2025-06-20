const API_KEY = "2d082597ab951b3a9596ca23e71413a8"; // ⬅️ Sostituisci con la tua vera chiave

const inputRicerca = document.getElementById("inputRicerca");
const btnRicerca = document.getElementById("btnRicerca");
const btnFilm = document.getElementById("btnFilm");
const btnSerie = document.getElementById("btnSerie");
const contenitore = document.getElementById("contenitore");

function mostraRisultati(risultati, tipo) {
  contenitore.innerHTML = "";
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
  fetch(`https://api.themoviedb.org/3/discover/${tipo}?api_key=${API_KEY}&language=it-IT`)
    .then(res => res.json())
    .then(data => {
      mostraRisultati(data.results, tipo);
    })
    .catch(err => {
      console.error(err);
      contenitore.innerHTML = "<p>Errore nel caricamento dei contenuti.</p>";
    });
}

function cercaContenuti() {
  const query = inputRicerca.value.trim();
  if (!query) return;

  contenitore.innerHTML = "<p>Caricamento...</p>";

  // Prima cerca nelle serie TV
  fetch(`https://api.themoviedb.org/3/search/tv?api_key=${API_KEY}&language=it-IT&query=${encodeURIComponent(query)}`)
    .then(res => res.json())
    .then(data => {
      if (data.results.length > 0) {
        mostraRisultati(data.results, "tv");
      } else {
        // Se non ci sono serie, cerca nei film
        fetch(`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&language=it-IT&query=${encodeURIComponent(query)}`)
          .then(res => res.json())
          .then(data => {
            if (data.results.length > 0) {
              mostraRisultati(data.results, "movie");
            } else {
              contenitore.innerHTML = "<p>Nessun risultato trovato.</p>";
            }
          });
      }
    })
    .catch(err => {
      console.error(err);
      contenitore.innerHTML = "<p>Errore durante la ricerca.</p>";
    });
}

// Event listeners
btnFilm.addEventListener("click", () => caricaContenuti("movie"));
btnSerie.addEventListener("click", () => caricaContenuti("tv"));
btnRicerca.addEventListener("click", cercaContenuti);
