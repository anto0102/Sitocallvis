const form = document.querySelector("form");
const input = document.querySelector("input");
const risultati = document.getElementById("risultati");
const API_KEY = "2d082597ab951b3a9596ca23e71413a8"; // <-- Sostituiscilo con la tua vera chiave

form.addEventListener("submit", function (e) {
  e.preventDefault();
  const query = input.value.trim();

  if (query) {
    cercaFilmOSerie(query);
  }
});

async function cercaFilmOSerie(query) {
  risultati.innerHTML = ""; // Pulisce i risultati precedenti

  try {
    const risposta = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=${API_KEY}&language=it-IT&query=${encodeURIComponent(query)}`);
    const dati = await risposta.json();

    if (dati.results.length === 0) {
      risultati.innerHTML = "<p>Nessun risultato trovato.</p>";
      return;
    }

    dati.results.forEach(item => {
      // Filtra solo movie o serie TV (ignora persone e altro)
      if (item.media_type === "movie" || item.media_type === "tv") {
        const card = document.createElement("div");
        card.className = "card";

        const titolo = item.title || item.name;
        const imgPath = item.poster_path 
          ? `https://image.tmdb.org/t/p/w500${item.poster_path}` 
          : "https://via.placeholder.com/300x450?text=No+Image";

        card.innerHTML = `
          <img src="${imgPath}" alt="${titolo}">
          <h3>${titolo}</h3>
          <a href="dettagli.html?id=${item.id}&tipo=${item.media_type}">Dettagli</a>
        `;
        risultati.appendChild(card);
      }
    });
  } catch (errore) {
    console.error("Errore durante la ricerca:", errore);
    risultati.innerHTML = "<p>Errore durante la ricerca.</p>";
  }
}
