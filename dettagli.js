const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get("id");
const tipo = urlParams.get("tipo");

if (!id || !tipo) {
  document.getElementById("dettagliContainer").innerHTML = "<p>Contenuto non trovato.</p>";
} else {
  // Inserisci qui la tua chiave TMDB
  const apiKey = "2d082597ab951b3a9596ca23e71413a8";
  const url = `https://api.themoviedb.org/3/${tipo}/${id}?api_key=${apiKey}&language=it-IT`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      document.getElementById("dettagliContainer").innerHTML = `
        <img src="https://image.tmdb.org/t/p/w500${data.poster_path}" alt="${data.title || data.name}">
        <h2>${data.title || data.name}</h2>
        <p><strong>Descrizione:</strong> ${data.overview}</p>
        <p><strong>Media Voto:</strong> ${data.vote_average}</p>
        <p><strong>Durata:</strong> ${data.runtime || data.episode_run_time?.[0] || "N/A"} minuti</p>
      `;
    })
    .catch(error => {
      document.getElementById("dettagliContainer").innerHTML = "<p>Errore nel caricamento dei dettagli.</p>";
      console.error(error);
    });
}
