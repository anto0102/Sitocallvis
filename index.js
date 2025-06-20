const API_KEY = "2d082597ab951b3a9596ca23e71413a8"; // <-- Inserisci qui la tua chiave API
const contentDiv = document.getElementById("content");
const inputRicerca = document.getElementById("searchInput");
const bottoneRicerca = document.getElementById("searchButton");
const bottoneFilm = document.getElementById("loadMovies");
const bottoneSerie = document.getElementById("loadSeries");

function mostraRisultati(risultati, tipo) {
  contentDiv.innerHTML = "";
  risultati.forEach(item => {
    const titolo = tipo === "movie" ? item.title : item.name;
    const descrizione = item.overview;
    const immagine = item.poster_path
      ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
      : "https://via.placeholder.com/150";

    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${immagine}" alt="${titolo}" />
      <h3>${titolo}</h3>
      <p>${descrizione}</p>
    `;
    contentDiv.appendChild(card);
  });
}

function caricaContenuti(tipo) {
  contentDiv.innerHTML = "<p>Caricamento...</p>";
  fetch(`https://api.themoviedb.org/3/discover/${tipo}?api_key=${API_KEY}`)
    .then(res => res.json())
    .then(data => {
      mostraRisultati(data.results, tipo);
    })
    .catch(err => {
      console.error(err);
      contentDiv.innerHTML = "<p>Errore nel caricamento dei contenuti.</p>";
    });
}

function cercaContenuto() {
  const query = inputRicerca.value.trim();
  if (!query) return;

  contentDiv.innerHTML = "<p>Caricamento...</p>";

  // Prima proviamo a cercare tra le serie TV
  fetch(`https://api.themoviedb.org/3/search/tv?api_key=${API_KEY}&query=${encodeURIComponent(query)}`)
    .then(res => res.json())
    .then(data => {
      if (data.results.length > 0) {
        mostraRisultati(data.results, "tv");
      } else {
        // Se nessuna serie trovata, cerchiamo tra i film
        return fetch(`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`)
          .then(res => res.json())
          .then(data => {
            if (data.results.length > 0) {
              mostraRisultati(data.results, "movie");
            } else {
              contentDiv.innerHTML = "<p>Nessun risultato trovato.</p>";
            }
          });
      }
    })
    .catch(err => {
      console.error(err);
      contentDiv.innerHTML = "<p>Errore durante la ricerca.</p>";
    });
}

bottoneFilm.addEventListener("click", () => caricaContenuti("movie"));
bottoneSerie.addEventListener("click", () => caricaContenuti("tv"));
bottoneRicerca.addEventListener("click", cercaContenuto);
