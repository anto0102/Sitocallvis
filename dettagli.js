const API_KEY = "2d082597ab951b3a9596ca23e71413a8"; // La tua TMDB API key
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/';

const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get("id");
const tipo = urlParams.get("type"); // 'movie' or 'tv'

const dettagliHero = document.getElementById("dettagli-hero");
const backdropOverlay = document.getElementById("backdrop-overlay");
const trailerBox = document.getElementById("trailer");
const episodiSection = document.getElementById("episodes-section"); // Nuova sezione per episodi
const episodiCarosello = document.getElementById("episodi-carosello");
const playerContainer = document.getElementById("player-container");
const modal = document.getElementById("modal-stagioni");
const closeModal = document.querySelector(".close-btn");
const selezionaStagioneBtn = document.getElementById("seleziona-stagione");
const listaStagioniModal = document.getElementById("lista-stagioni");
const currentSeasonTitle = document.getElementById("current-season-title");

let stagioni = [];
let mediaDetails = null; // Per salvare i dettagli del film/serie

if (!id || !tipo) {
    console.error("ID o tipo mancanti nell'URL. Reindirizzamento alla homepage.");
    window.location.href = "index.html";
}

caricaDettagli();

async function caricaDettagli() {
    try {
        const res = await fetch(`${BASE_URL}/${tipo}/${id}?api_key=${API_KEY}&language=it-IT`);
        if (!res.ok) throw new Error(`Errore HTTP! status: ${res.status}`);
        mediaDetails = await res.json(); // Salva i dettagli

        const titolo = mediaDetails.title || mediaDetails.name;
        const descrizione = mediaDetails.overview || "Nessuna descrizione disponibile.";
        const posterPath = mediaDetails.poster_path ? `${IMAGE_BASE_URL}w500${mediaDetails.poster_path}` : 'https://via.placeholder.com/500x750/222222/e0e0e0?text=Poster+non+disponibile';
        const backdropPath = mediaDetails.backdrop_path ? `${IMAGE_BASE_URL}original${mediaDetails.backdrop_path}` : posterPath; // Usa il poster come fallback
        const dataUscita = mediaDetails.release_date || mediaDetails.first_air_date || "Data non disponibile";
        const voto = mediaDetails.vote_average ? `${mediaDetails.vote_average.toFixed(1)}/10` : "N/A";
        const generi = mediaDetails.genres?.map(g => g.name).join(", ") || "Non disponibili";
        // Aggiungi runtime solo per i film, per le serie mostra null o un messaggio se non c'è run_time
        const runtime = (tipo === 'movie' && mediaDetails.runtime) ? `${mediaDetails.runtime} min` : (tipo === 'tv' && mediaDetails.episode_run_time && mediaDetails.episode_run_time.length > 0 ? `${mediaDetails.episode_run_time[0]} min/episodio` : 'N/A');

        // Imposta lo sfondo dinamico
        backdropOverlay.style.backgroundImage = `url(${backdropPath})`;

        // Popola la Hero Section di dettaglio
        dettagliHero.innerHTML = `
            <div class="details-content flex flex-col md:flex-row items-center md:items-start gap-8 lg:gap-12">
                <img src="${posterPath}" alt="${titolo}" class="w-48 h-auto rounded-lg shadow-2xl md:w-64 lg:w-80 flex-shrink-0">
                <div class="info text-center md:text-left">
                    <h1 class="text-5xl lg:text-7xl font-bold mb-4 leading-tight">${titolo}</h1>
                    <p class="text-xl lg:text-2xl text-gray-300 mb-4">${descrizione}</p>
                    <p class="text-lg mb-2"><strong>Data di uscita:</strong> ${dataUscita}</p>
                    <p class="text-lg mb-2"><strong>Generi:</strong> ${generi}</p>
                    ${runtime !== 'N/A' ? `<p class="text-lg mb-2"><strong>Durata:</strong> ${runtime}</p>` : ''}
                    <p class="text-lg mb-6"><strong>Voto:</strong> ⭐ ${voto}</p>
                    <div class="detail-buttons flex gap-4 justify-center md:justify-start">
                        <button class="btn play-btn flex items-center gap-2">
                            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"></path></svg>
                            Riproduci
                        </button>
                    </div>
                </div>
            </div>
        `;

        const heroPlayBtn = dettagliHero.querySelector('.play-btn');
        heroPlayBtn.onclick = () => {
            playerContainer.scrollIntoView({ behavior: "smooth", block: "start" });
            // Per i film, avvia subito il player se non è già attivo
            if (tipo === 'movie') {
                aggiungiPlayerFilm(id);
            }
        };

        await caricaTrailer();

        if (tipo === "tv") {
            episodiSection.classList.remove('hidden'); // Mostra la sezione episodi
            selezionaStagioneBtn.style.display = "inline-flex"; // Mostra il bottone per le stagioni
            await caricaStagioni(id);
            const stagione1 = stagioni.find(s => s.season_number === 1);
            if (stagione1) {
                await caricaEpisodi(id, 1);
            } else {
                // Se non c'è la stagione 1, prova a caricare la prima stagione disponibile
                if (stagioni.length > 0) {
                    await caricaEpisodi(id, stagioni[0].season_number);
                } else {
                    playerContainer.innerHTML = `<p class="text-gray-400 text-center">Nessuna stagione o episodio disponibile.</p>`;
                }
            }
        } else {
            episodiSection.classList.add('hidden'); // Nasconde la sezione episodi per i film
            selezionaStagioneBtn.style.display = "none";
            aggiungiPlayerFilm(id); // Carica il player per i film immediatamente
        }

    } catch (error) {
        console.error("Errore nel caricamento dei dettagli:", error);
        dettagliHero.innerHTML = `<p class="text-center text-red-500 text-xl w-full">Errore nel caricamento dei dettagli. Riprova più tardi.</p>`;
        // Puoi anche nascondere le altre sezioni se la hero fallisce
        trailerBox.innerHTML = '';
        episodiSection.classList.add('hidden');
        playerContainer.innerHTML = '';
    }
}

async function caricaTrailer() {
    const res = await fetch(`${BASE_URL}/${tipo}/${id}/videos?api_key=${API_KEY}&language=it-IT`);
    const data = await res.json();
    const trailer = data.results.find(v => v.type === "Trailer" && v.site === "YouTube" && v.official) || 
                    data.results.find(v => v.type === "Trailer" && v.site === "YouTube");

    if (trailer) {
        trailerBox.innerHTML = `
            <div class="iframe-container">
                <iframe src="https://www.youtube.com/embed/${trailer.key}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
            </div>`;
    } else {
        trailerBox.innerHTML = `
            <p class="text-gray-400 text-center">Nessun trailer disponibile.</p>
        `;
    }
}

function aggiungiPlayerFilm(id) {
    playerContainer.innerHTML = `
        <div class="iframe-container">
            <iframe src="https://vixsrc.to/movie/${id}" frameborder="0" allowfullscreen></iframe>
        </div>`;
}

async function caricaStagioni(tvId) {
    const res = await fetch(`${BASE_URL}/tv/${tvId}?api_key=${API_KEY}&language=it-IT`);
    const data = await res.json();
    stagioni = data.seasons.filter(s => s.season_number > 0);

    listaStagioniModal.innerHTML = "";
    stagioni.sort((a,b) => a.season_number - b.season_number); // Ordina le stagioni
    stagioni.forEach(stagione => {
        const btn = document.createElement("button");
        btn.className = "season-modal-button";
        btn.textContent = `Stagione ${stagione.season_number}`;
        btn.onclick = () => {
            modal.style.display = "none";
            caricaEpisodi(tvId, stagione.season_number);
        };
        listaStagioniModal.appendChild(btn);
    });
}

async function caricaEpisodi(tvId, seasonNumber) {
    currentSeasonTitle.textContent = `(Stagione ${seasonNumber})`; // Aggiorna il titolo della stagione corrente

    const res = await fetch(`${BASE_URL}/tv/${tvId}/season/${seasonNumber}?api_key=${API_KEY}&language=it-IT`);
    const data = await res.json();

    const carouselTrack = episodiCarosello.querySelector(".carousel-track");
    carouselTrack.innerHTML = ''; // Pulisci i vecchi episodi

    if (!data.episodes || data.episodes.length === 0) {
        carouselTrack.innerHTML = `<p class="text-gray-400 text-center w-full">Nessun episodio disponibile per questa stagione.</p>`;
        // In questo caso, potresti anche pulire il player o mostrare un messaggio
        playerContainer.innerHTML = `<p class="text-gray-400 text-center">Nessun episodio riproducibile per questa stagione.</p>`;
        return;
    }

    let primoCaricato = false; // Flag per caricare il primo episodio nel player

    data.episodes.forEach(episodio => {
        const epCard = document.createElement("div");
        epCard.className = "episode-card";

        const imgSrc = episodio.still_path
            ? `${IMAGE_BASE_URL}w300${episodio.still_path}`
            : "https://via.placeholder.com/300x169/222222/e0e0e0?text=Immagine+non+disponibile";

        epCard.innerHTML = `
            <img src="${imgSrc}" alt="Episodio ${episodio.episode_number}">
            <div class="episode-info">
                <h3>E${episodio.episode_number}: ${episodio.name}</h3>
                <p>${episodio.overview || "Nessuna descrizione."}</p>
                <button class="play-episode-btn">▶ Guarda</button>
            </div>
        `;

        epCard.querySelector('.play-episode-btn').onclick = () => {
            aggiornaPlayer(tvId, seasonNumber, episodio.episode_number, true);
        };

        carouselTrack.appendChild(epCard);

        // Carica il primo episodio della stagione SOLO SE non è già stato caricato
        if (!primoCaricato) {
            aggiornaPlayer(tvId, seasonNumber, episodio.episode_number, false);
            primoCaricato = true;
        }
    });
}

function aggiornaPlayer(tvId, season, episode, scroll = true) {
    // Controlla se il media è un film o una serie TV
    if (tipo === 'movie') {
        playerContainer.innerHTML = `
            <div class="iframe-container">
                <iframe src="https://vixsrc.to/movie/${tvId}" frameborder="0" allowfullscreen></iframe>
            </div>`;
    } else { // È una serie TV
        playerContainer.innerHTML = `
            <div class="iframe-container">
                <iframe src="https://vixsrc.to/tv/${tvId}/${season}/${episode}" frameborder="0" allowfullscreen></iframe>
            </div>`;
    }


    if (scroll) {
        setTimeout(() => {
            playerContainer.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
    }
}

// Gestione modale
selezionaStagioneBtn.onclick = () => {
    modal.style.display = "flex"; // Usa flex per centrare il contenuto
};

closeModal.onclick = () => {
    modal.style.display = "none";
};

window.onclick = (event) => {
    if (event.target == modal) {
        modal.style.display = "none";
    }
};
