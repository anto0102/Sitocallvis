const dettagli = document.getElementById("dettagli");
const trailerBox = document.getElementById("trailer");
const episodiBox = document.getElementById("episodi");
const playerContainer = document.getElementById("player-container");
const API_KEY = "2d082597ab951b3a9596ca23e71413a8"; // Inserisci la tua API KEY TMDB

const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get("id");
const tipo = urlParams.get("type");

if (!id || !tipo) {
  dettagli.innerHTML = "<p class='messaggio'>ID o tipo mancanti.</p>";
  throw new Error("Parametro mancante");
}

async function caricaDettagli() {
  try {
    const res = await fetch(`https://api.themoviedb.org/3/${tipo}/${id}?api_key=${API_KEY}&language=it-IT`);
    const data = await res.json();

    const titolo = data.title || data.name;
    const descrizione = data.overview || "Nessuna descrizione disponibile.";
    const img = data.poster_path 
      ? `https://image.tmdb.org/t/p/w500${data.poster_path}`
      : "https://via.placeholder.com/300x450?text=No+Image";
    const dataUscita = data.release_date || data.first_air_date || "Data non disponibile";
    const voto = data.vote_average ? `${data.vote_average}/10` : "N/A";
    const generi = data.genres?.map(g => g.name).join(", ") || "Non disponibili";

    dettagli.innerHTML = `
      <img src="${img}" alt="${titolo}">
      <div class="info">
        <h2>${titolo}</h2>
        <p><strong>Data di uscita:</strong> ${dataUscita}</p>
        <p><strong>Generi:</strong> ${generi}</p>
        <p><strong>Voto:</strong> ${voto}</p>
        <p><strong>Descrizione:</strong> ${descrizione}</p>
      </div>
    `;

    await caricaTrailer();
    
    if (tipo === "movie") {
      aggiungiPlayerFilm(id);
    } else if (tipo === "tv") {
      caricaStagioni(id);
    }

  } catch (error) {
    dettagli.innerHTML = "<p class='messaggio'>Errore nel caricamento dei dettagli.</p>";
    console.error(error);
  }
}

async function caricaTrailer() {
  try {
    const res = await fetch(`https://api.themoviedb.org/3/${tipo}/${id}/videos?api_key=${API_KEY}&language=it-IT`);
    const data = await res.json();
    const trailer = data.results.find(video => video.type === "Trailer" && video.site === "YouTube");
    if (trailer) {
      trailerBox.innerHTML = `
        <h2>🎬 Trailer</h2>
        <div class="iframe-container">
          <iframe src="https://www.youtube.com/embed/${trailer.key}" allowfullscreen></iframe>
        </div>
      `;
    } else {
      trailerBox.innerHTML = "<p class='messaggio'>Nessun trailer disponibile.</p>";
    }
  } catch (error) {
    console.error("Errore nel caricamento del trailer", error);
  }
}

function aggiungiPlayerFilm(id) {
  playerContainer.innerHTML = `
    <div class="box-player">
      <h2>🎥 Guarda ora</h2>
      <div class="iframe-container">
        <iframe src="https://vixsrc.to/movie/${id}" allowfullscreen></iframe>
      </div>
    </div>
  `;
}

async function caricaStagioni(serieId) {
  const res = await fetch(`https://api.themoviedb.org/3/tv/${serieId}?api_key=${API_KEY}&language=it-IT`);
  const data = await res.json();
  episodiBox.innerHTML = "";

  for (const stagione of data.seasons) {
    if (stagione.season_number === 0) continue; // salta \"Speciali\"
    const stagioneDiv = document.createElement("div");
    stagioneDiv.className = "stagione-container";
    stagioneDiv.innerHTML = `<h3>Stagione ${stagione.season_number}</h3>`;

    const episodioRes = await fetch(`https://api.themoviedb.org/3/tv/${serieId}/season/${stagione.season_number}?api_key=${API_KEY}&language=it-IT`);
    const episodioData = await episodioRes.json();

    episodioData.episodes.forEach(ep => {
      const btn = document.createElement("button");
      btn.className = "episodio-btn";
      btn.textContent = `Episodio ${ep.episode_number}`;
      btn.onclick = () => mostraPlayerEpisodio(serieId, stagione.season_number, ep.episode_number);
      stagioneDiv.appendChild(btn);
    });

    episodiBox.appendChild(stagioneDiv);
  }
}

function mostraPlayerEpisodio(id, stagione, episodio) {
  playerContainer.innerHTML = `
    <div class="box-player">
      <h2>🎥 Episodio ${episodio}</h2>
      <div class="iframe-container">
        <iframe src="https://vixsrc.to/tv/${id}/${stagione}/${episodio}" allowfullscreen></iframe>
      </div>
    </div>
  `;
}

caricaDettagli();
