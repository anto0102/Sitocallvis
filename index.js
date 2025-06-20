const contenitore = document.getElementById("contenitore");
const bottoneFilm = document.getElementById("carica-film");
const bottoneSerie = document.getElementById("carica-serie");
const bottoneCerca = document.getElementById("cerca");
const inputRicerca = document.getElementById("input-ricerca");

const API_KEY = "2d082597ab951b3a9596ca23e71413a8"; // ← Inserisci la tua vera API key qui
const BASE_URL = "https://api.themoviedb.org/3";

async function caricaContenuti(tipo) {
  contenitore.innerHTML = "<p>Caricamento...</p>";

  try {
    const response = await fetch(`${BASE_URL}/discover/${tipo}?api_key=${API_KEY}&language=it-IT`);
    if (!response.ok) throw new Error("Errore nel caricamento");

    const data = await response.json();
    mostraRisultati(data.results);
  } catch (errore) {
    contenitore.innerHTML = "<p>Errore nel caricamento dei dati.</p>";
    console.error(errore);
  }
}

async function cercaContenuti(query) {
  contenitore.innerHTML = "<p>Caricamento...</p>";

  try {
    const response = await fetch(
      `${BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(query)}&language=it-IT`
    );
    if (!response.ok) throw new Error("Errore nella ricerca");

    const data = await response.json();
    mostraRisultati(data.results);
  } catch (errore) {
    contenitore.innerHTML = "<p>Errore nella ricerca dei dati.</p>";
    console.error(errore);
  }
}

function mostraRisultati(risultati) {
  if (!risultati || risultati.length === 0) {
    contenitore.innerHTML = "<p>Nessun risultato trovato.</p>";
    return;
  }

  contenitore.innerHTML = risultati
    .map((item) => {
      const titolo = item.title || item.name || "Senza titolo";
      const immagine = item.poster_path
        ? `https://image.tmdb.org/t/p/w300${item.poster_path}`
        : "https://via.placeholder.com/300x450?text=Nessuna+immagine";
      return `
        <div class="scheda">
          <img src="${immagine}" alt="${titolo}">
          <h3>${titolo}</h3>
        </div>`;
    })
    .join("");
}

// Eventi
bottoneFilm.addEventListener("click", () => caricaContenuti("movie"));
bottoneSerie.addEventListener("click", () => caricaContenuti("tv"));
bottoneCerca.addEventListener("click", () => {
  const query = inputRicerca.value.trim();
  if (query) cercaContenuti(query);
});
