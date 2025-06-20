const API_KEY = "2d082597ab951b3a9596ca23e71413a8"; // 🔑 Inserisci la tua TMDb API Key
const BASE_URL = "https://api.themoviedb.org/3";

const inputRicerca = document.getElementById("inputRicerca");
const btnRicerca = document.getElementById("btnRicerca");
const btnFilm = document.getElementById("btnFilm");
const btnSerie = document.getElementById("btnSerie");
const contenitore = document.getElementById("contenitore");

function creaCardDettagliata(item, tipo) {
  const titolo = tipo === "tv" ? item.name : item.title;
  const descrizione = item.overview || "Nessuna descrizione disponibile.";
  const anno = (item.first_air_date || item.release_date || "").slice(0, 4);
  const immagine = item.poster_path
    ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
    : "https://via.placeholder.com/150";
  const voto = item.vote_average ? item.vote_average.toFixed(1) : "N/A";

  let infoExtra = "";

  if (tipo === "movie") {
    infoExtra = `<p><strong>Durata:</strong> ${item.runtime ? item.runtime + " min" : "N/A"}</p>`;
  } else if (tipo === "tv") {
    const stagioni = item.number_of_seasons || "N/A";
    const episodi = item.number_of_episodes || "N/A";
    infoExtra = `<p><strong>Stagioni:</strong> ${stagioni}, <strong>Episodi:</strong> ${episodi}</p>`;
  }

  const card = document.createElement("div");
  card.className = "card";
  card.innerHTML = `
    <img src="${immagine}" alt="${titolo}">
    <h3>${titolo}</h3>
    <p><strong>Anno:</strong> ${anno}</p>
    <p><strong>Tipo:</strong> ${tipo === "movie" ? "Film" : "Serie TV"}</p>
    ${infoExtra}
    <p><strong>Voto medio:</strong> ${voto}</p>
    <p>${descrizione}</p>
  `;
  contenitore.appendChild(card);
}

async function mostraRisultatiDettagliati(risultati, tipo) {
  contenitore.innerHTML = "";

  if (!risultati || risultati.length === 0) {
    contenitore.innerHTML = "<p>Nessun risultato trovato.</p>";
    return;
  }

  for (const item of risultati.slice(0, 12)) {
    try {
      const dettaglioRes = await fetch(`${BASE_URL}/${tipo}/${item.id}?api_key=${API_KEY}&language=it-IT`);
      const dettaglio = await dettaglioRes.json();
      creaCardDettagliata(dettaglio, tipo);
    } catch (error) {
      console.error("Errore nel recupero dettagli:", error);
    }
  }
}

function caricaContenuti(tipo) {
  contenitore.innerHTML = "<p>Caricamento...</p>";
  fetch(`${BASE_URL}/discover/${tipo}?api_key=${API_KEY}&language=it-IT`)
    .then(res => res.json())
    .then(data => mostraRisultatiDettagliati(data.results, tipo))
    .catch(err => {
      console.error("Errore nel caricamento:", err);
      contenitore.innerHTML = "<p>Errore nel caricamento.</p>";
    });
}

function cercaContenuti() {
  const query = inputRicerca.value.trim();
  if (!query) return;

  contenitore.innerHTML = "<p>Caricamento...</p>";

  fetch(`${BASE_URL}/search/multi?api_key=${API_KEY}&language=it-IT&query=${encodeURIComponent(query)}`)
    .then(res => res.json())
    .then(async data => {
      const filtrati = data.results.filter(i => i.media_type === "movie" || i.media_type === "tv");
      contenitore.innerHTML = "";
      for (const item of filtrati.slice(0, 12)) {
        const tipo = item.media_type;
        try {
          const dettaglioRes = await fetch(`${BASE_URL}/${tipo}/${item.id}?api_key=${API_KEY}&language=it-IT`);
          const dettaglio = await dettaglioRes.json();
          creaCardDettagliata(dettaglio, tipo);
        } catch (error) {
          console.error("Errore nella ricerca dettagli:", error);
        }
      }
    })
    .catch(err => {
      console.error("Errore durante la ricerca:", err);
      contenitore.innerHTML = "<p>Errore nella ricerca.</p>";
    });
}

// Event listeners
btnFilm.addEventListener("click", () => caricaContenuti("movie"));
btnSerie.addEventListener("click", () => caricaContenuti("tv"));
btnRicerca.addEventListener("click", cercaContenuti);
