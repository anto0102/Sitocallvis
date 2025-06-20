const API_KEY = "2d082597ab951b3a9596ca23e71413a8"; // Inserisci la tua TMDB API Key

const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get("id");
const tipo = urlParams.get("type");

const dettagli = document.getElementById("dettagli");
const trailerBox = document.getElementById("trailer");
const episodiBox = document.getElementById("episodi-carosello");
const playerBox = document.getElementById("player-container");
const modal = document.getElementById("modal-stagioni");
const closeModal = document.querySelector(".close");
const selezionaStagioneBtn = document.getElementById("seleziona-stagione");
const listaStagioni = document.getElementById("lista-stagioni");

let stagioni = [];

if (!id || !tipo) throw new Error("Parametro mancante");

caricaDettagli();

async function caricaDettagli() {
  const res = await fetch(`https://api.themoviedb.org/3/${tipo}/${id}?api_key=${API_KEY}&language=it-IT`);
  const data = await res.json();

  const titolo = data.title || data.name;
  const descrizione = data.overview || "Nessuna descrizione disponibile.";
  const img = data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : "";
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

  if (tipo === "tv") caricaStagioni(id);
  else aggiungiPlayerFilm(id);
}

async function caricaTrailer() {
  const res = await fetch(`https://api.themoviedb.org/3/${tipo}/${id}/videos?api_key=${API_KEY}&language=it-IT`);
  const data = await res.json();
  const trailer = data.results.find(v => v.type === "Trailer" && v.site === "YouTube");

  if (trailer) {
    trailerBox.innerHTML = `
      <h2>🎬 Trailer</h2>
      <div class="iframe-container">
        <iframe src="https://www.youtube.com/embed/${trailer.key}" allowfullscreen></iframe>
      </div>`;
  } else {
    trailerBox.innerHTML = `
      <h2>🎬 Trailer</h2>
      <p class="messaggio">Nessun trailer disponibile.</p>
    `;
  }
}

function aggiungiPlayerFilm(id) {
  playerBox.innerHTML = `
    <div class="box-player">
      <h2>🎥 Guarda ora</h2>
      <div class="iframe-container">
        <iframe src="https://vixsrc.to/movie/${id}" allowfullscreen></iframe>
      </div>
    </div>`;
}

async function caricaStagioni(tvId) {
  const res = await fetch(`https://api.themoviedb.org/3/tv/${tvId}?api_key=${API_KEY}&language=it-IT`);
  const data = await res.json();
  stagioni = data.seasons.filter(s => s.season_number > 0);

  listaStagioni.innerHTML = "";
  stagioni.forEach(stagione => {
    const btn = document.createElement("button");
    btn.className = "stagione-selector";
    btn.textContent = `Stagione ${stagione.season_number}`;
    btn.onclick = () => {
      modal.style.display = "none";
      caricaEpisodi(tvId, stagione.season_number);
    };
    listaStagioni.appendChild(btn);
  });
}

async function caricaEpisodi(tvId, seasonNumber) {
  episodiBox.innerHTML = `
    <h3 class="stagione-attiva">Stagione ${seasonNumber}</h3>
    <div class="episodi-wrapper"></div>
  `;
  const wrapper = episodiBox.querySelector(".episodi-wrapper");

  const res = await fetch(`https://api.themoviedb.org/3/tv/${tvId}/season/${seasonNumber}?api_key=${API_KEY}&language=it-IT`);
  const data = await res.json();

  data.episodes.forEach(ep => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="https://image.tmdb.org/t/p/w300${ep.still_path}" alt="Ep ${ep.episode_number}" />
      <p>Ep ${ep.episode_number}: ${ep.name}</p>
    `;
    card.onclick = () => {
      playerBox.innerHTML = `
        <div class="box-player grande">
          <h2>🎥 Episodio ${ep.episode_number}</h2>
          <div class="iframe-container">
            <iframe src="https://vixsrc.to/tv/${tvId}/${seasonNumber}/${ep.episode_number}" allowfullscreen></iframe>
          </div>
        </div>
      `;
    };
    wrapper.appendChild(card);
  });
}

// Modal toggle
selezionaStagioneBtn.onclick = () => {
  modal.style.display = "block";
};

closeModal.onclick = () => {
  modal.style.display = "none";
};

window.onclick = event => {
  if (event.target == modal) modal.style.display = "none";
};
