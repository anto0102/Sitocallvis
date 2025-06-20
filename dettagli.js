const API_KEY = "2d082597ab951b3a9596ca23e71413a8"; // 🔑 ← Inserisci qui la tua API KEY TMDb

const btnFilm = document.getElementById("btnFilm");
const btnSerie = document.getElementById("btnSerie");
const btnRicerca = document.getElementById("btnRicerca");
const inputRicerca = document.getElementById("inputRicerca");
const contenitore = document.getElementById("contenitore");

btnFilm.addEventListener("click", () => caricaContenuti("movie"));
btnSerie.addEventListener("click", () => caricaContenuti("tv"));
btnRicerca.addEventListener("click", () => {
  const query = inputRicerca.value.trim();
  if (query) {
    caricaContenuti("search", query);
  }
});

async function caricaContenuti(tipo, query = "") {
  contenitore.innerHTML = "<p>Caricamento...</p>";
  let url = "";

  if (tipo === "search") {
    url = `https://api.themoviedb.org/3/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(query)}&language=it-IT`;
  } else {
    const endpoint = tipo === "movie" ? "movie/popular" : "tv/popular";
    url = `https://api.themoviedb.org/3/${endpoint}?api_key=${API_KEY}&language=it-IT`;
  }

  try {
    const res = await fetch(url);
    const dati = await res.json();
    contenitore.innerHTML = "";
    dati.results.forEach(item => {
      if (item.poster_path) contenitore.appendChild(creaCard(item));
    });
  } catch (e) {
    contenitore.innerHTML = "<p>Errore nel caricamento</p>";
    console.error(e);
  }
}

function creaCard(item) {
  const tipo = item.media_type || (item.title ? "movie" : "tv");
  const card = document.createElement("div");
  card.className = "card";

  card.innerHTML = `
    <img src="https://image.tmdb.org/t/p/w500${item.poster_path}" alt="${item.title || item.name}" />
    <h3>${item.title || item.name}</h3>
    <p><strong>Tipo:</strong> ${tipo === "movie" ? "Film" : "Serie TV"}</p>
    <p><strong>Anno:</strong> ${(item.release_date || item.first_air_date || "").slice(0, 4)}</p>
    <p><strong>Score:</strong> ${item.vote_average || "N/A"}</p>
  `;

  card.addEventListener("click", () => {
    const urlParams = new URLSearchParams({
      id: item.id,
      type: tipo
    });
    window.location.href = `dettagli.html?${urlParams.toString()}`;
  });

  return card;
}
