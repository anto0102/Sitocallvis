const API_KEY = "2d082597ab951b3a9596ca23e71413a8"; // La tua TMDB API key
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/';

const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get("id");
const tipo = urlParams.get("type"); // 'movie' or 'tv'

// Elementi del nuovo design
const topBackdrop = document.getElementById("top-backdrop");
const mainDetailsSection = document.getElementById("main-details-section");
const detailPoster = document.getElementById("detail-poster");
const detailTitle = document.getElementById("detail-title");
const detailTagline = document.getElementById("detail-tagline");
const detailVote = document.getElementById("detail-vote");
const detailReleaseYear = document.getElementById("detail-release-year");
const detailRuntime = document.getElementById("detail-runtime");
const detailGenres = document.getElementById("detail-genres");
const detailOverview = document.getElementById("detail-overview");
const mainPlayBtn = mainDetailsSection.querySelector('.play-btn'); // Bottone play nella sezione dettagli

const trailerPlayerContainer = document.getElementById("trailer-player-container");
const mainPlayerContainer = document.getElementById("main-player-container");
const episodesSection = document.getElementById("episodes-section");
const episodesCarouselTrack = document.querySelector("#episodes-carousel .carousel-track");
const currentSeasonDisplay = document.getElementById("current-season-display");
const selezionaStagioneBtn = document.getElementById("seleziona-stagione-btn");
const castCarouselTrack = document.querySelector('#cast-carousel .carousel-track');
const similarMoviesCarouselTrack = document.querySelector('#similar-movies-carousel .carousel-track');

const seasonModal = document.getElementById("season-modal");
const closeModalBtn = seasonModal.querySelector('.close-btn');
const seasonListModal = document.getElementById("season-list");

let allSeasons = []; // Array per memorizzare tutte le stagioni disponibili

if (!id || !tipo) {
    console.error("ID o tipo mancanti nell'URL. Reindirizzamento alla homepage.");
    window.location.href = "index.html"; // Reindirizza se i parametri sono mancanti
}

document.addEventListener('DOMContentLoaded', caricaDettagli);

async function caricaDettagli() {
    try {
        // Chiamata principale per dettagli, crediti, video, raccomandazioni/simili
        const res = await fetch(`${BASE_URL}/${tipo}/${id}?api_key=${API_KEY}&language=it-IT&append_to_response=credits,videos,recommendations,similar`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();

        // --- Popola Top Backdrop e Dettagli Principali ---
        const title = data.title || data.name || "Titolo non disponibile";
        const overview = data.overview || "Nessuna descrizione disponibile.";
        const tagline = data.tagline || "";
        const posterPath = data.poster_path ? `${IMAGE_BASE_URL}w500${data.poster_path}` : 'https://via.placeholder.com/500x750/222222/e0e0e0?text=Poster+non+disponibile';
        const backdropPath = data.backdrop_path ? `${IMAGE_BASE_URL}original${data.backdrop_path}` : posterPath; 

        topBackdrop.style.backgroundImage = `url(${backdropPath})`; 
        detailPoster.src = posterPath;
        detailTitle.textContent = title;
        detailTagline.textContent = tagline;
        detailOverview.textContent = overview;

        detailVote.innerHTML = `⭐ ${data.vote_average ? data.vote_average.toFixed(1) : 'N/A'}`;
        detailReleaseYear.textContent = data.release_date ? new Date(data.release_date).getFullYear() : (data.first_air_date ? new Date(data.first_air_date).getFullYear() : 'N/A');
        
        let runtimeText = 'N/A';
        if (tipo === 'movie' && data.runtime) {
            runtimeText = `${data.runtime} min`;
        } else if (tipo === 'tv' && data.episode_run_time && data.episode_run_time.length > 0) {
            runtimeText = `${data.episode_run_time[0]} min/episodio`;
        }
        detailRuntime.textContent = runtimeText;

        detailGenres.textContent = data.genres?.map(g => g.name).join(" / ") || "Generi N/A";

        // --- Logica pulsanti Play/Add to List ---
        mainPlayBtn.onclick = () => {
            mainPlayerContainer.scrollIntoView({ behavior: "smooth", block: "start" });
            if (tipo === 'movie') {
                aggiungiPlayerFilm(id);
            }
        };
        document.querySelector('.add-to-list-btn').onclick = () => {
            alert('Funzione "Aggiungi alla lista" non ancora implementata.');
        };

        // --- Caricamento Contenuti Dinamici ---
        await caricaTrailer(data.videos);
        await caricaCast(data.credits);
        await caricaSimilarContent(data.recommendations || data.similar); // TMDb usa 'recommendations' o 'similar'

        // --- Gestione Serie TV vs Film ---
        if (tipo === "tv") {
            episodesSection.classList.remove('hidden');
            selezionaStagioneBtn.style.display = "inline-flex";
            allSeasons = data.seasons.filter(s => s.season_number > 0); // Filtra stagioni speciali
            allSeasons.sort((a,b) => a.season_number - b.season_number); // Ordina le stagioni
            
            const firstSeasonToLoad = allSeasons.find(s => s.season_number === 1) || allSeasons[0]; // Prova stagione 1 o la prima disponibile
            if (firstSeasonToLoad) {
                await caricaEpisodi(id, firstSeasonToLoad.season_number);
            } else {
                episodesCarouselTrack.innerHTML = `<p class="text-gray-400 text-center w-full py-10">Nessuna stagione disponibile.</p>`;
                mainPlayerContainer.innerHTML = `<p class="text-gray-400 text-center py-10">Nessun episodio riproducibile per questa serie.</p>`;
            }
        } else {
            episodesSection.classList.add('hidden');
            selezionaStagioneBtn.style.display = "none";
            aggiungiPlayerFilm(id); // Carica il player per i film immediatamente
        }

        // Setup listener per le frecce DOPO che i caroselli sono stati popolati
        setupCarouselScrollListeners();

    } catch (error) {
        console.error("Errore nel caricamento dei dettagli:", error);
        mainDetailsSection.innerHTML = `<p class="text-center text-red-500 text-xl w-full py-12">Impossibile caricare i dettagli del contenuto. Riprova più tardi.</p>`;
        // Nascondi le altre sezioni in caso di errore
        document.getElementById('trailer-section').classList.add('hidden');
        document.getElementById('player-section').classList.add('hidden');
        document.getElementById('episodes-section').classList.add('hidden');
        document.getElementById('cast-section').classList.add('hidden');
        document.getElementById('similar-content-section').classList.add('hidden');
    }
}

async function caricaTrailer(videosData) {
    const trailer = videosData.results.find(v => v.type === "Trailer" && v.site === "YouTube" && v.official) || 
                    videosData.results.find(v => v.type === "Trailer" && v.site === "YouTube"); // Fallback se non c'è ufficiale

    if (trailer) {
        trailerPlayerContainer.innerHTML = `
            <iframe src="https://www.youtube.com/embed/${trailer.key}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        `;
    } else {
        trailerPlayerContainer.innerHTML = `
            <p class="text-gray-400 text-center py-10">Nessun trailer disponibile per questo contenuto.</p>
        `;
    }
}

async function caricaCast(creditsData) {
    if (!creditsData || !creditsData.cast || creditsData.cast.length === 0) {
        document.getElementById('cast-section').classList.add('hidden');
        return;
    }
    castCarouselTrack.innerHTML = '';

    const topCast = creditsData.cast.filter(member => member.profile_path).slice(0, 15); // Prendi i primi 15 con immagine

    if (topCast.length === 0) {
        document.getElementById('cast-section').classList.add('hidden');
        return;
    }

    topCast.forEach(member => {
        const castCard = document.createElement('div');
        castCard.className = 'cast-card'; // Questa classe ha gli stili definiti in dettagli.css
        castCard.innerHTML = `
            <img src="${IMAGE_BASE_URL}w185${member.profile_path}" alt="${member.name}">
            <h4>${member.name}</h4>
            <p>${member.character || ''}</p>
        `;
        castCarouselTrack.appendChild(castCard);
    });
    updateCarouselArrowsVisibility('cast-carousel'); // Aggiorna visibilità frecce dopo il caricamento
}

async function caricaSimilarContent(relatedContentData) {
    if (!relatedContentData || !relatedContentData.results || relatedContentData.results.length === 0) {
        document.getElementById('similar-content-section').classList.add('hidden');
        return;
    }
    similarMoviesCarouselTrack.innerHTML = '';

    const filteredContent = relatedContentData.results.filter(item => item.poster_path).slice(0, 20); // Limita a 20 simili

    if (filteredContent.length === 0) {
        document.getElementById('similar-content-section').classList.add('hidden');
        return;
    }

    filteredContent.forEach(item => {
        const movieCard = createMovieCard(item); // Riutilizza la funzione della homepage per le card
        similarMoviesCarouselTrack.appendChild(movieCard);
    });
    updateCarouselArrowsVisibility('similar-movies-carousel'); // Aggiorna visibilità frecce dopo il caricamento
}

// createMovieCard è stata pensata per la homepage, ma la riusiamo qui per i "simili"
// Assicurati che i suoi stili in dettagli.css siano allineati al .movie-card o .similar-card
function createMovieCard(item) {
    const title = item.title || item.name || 'Titolo sconosciuto';
    const poster = item.poster_path ? `${IMAGE_BASE_URL}w300${item.poster_path}` : 'https://via.placeholder.com/300x450/222222/e0e0e0?text=Immagine+non+disponibile';
    const type = item.media_type || (item.title ? 'movie' : 'tv'); // Tenta di indovinare il tipo

    const card = document.createElement('div');
    // Le classi qui devono corrispondere al CSS di .movie-card/similar-card in dettagli.css
    card.className = 'similar-card flex-shrink-0 rounded-lg overflow-hidden shadow-md transition-transform duration-300 hover:scale-105 cursor-pointer'; 
    card.innerHTML = `
        <a href="dettagli.html?id=${item.id}&type=${type}" class="block w-full">
            <img src="${poster}" alt="${title}" class="w-full h-auto object-cover rounded-md" loading="lazy" />
            <div class="p-2 text-center text-sm font-semibold">${title}</div>
        </a>
    `;
    return card;
}


// --- Funzioni per Serie TV (Caricamento Episodi e Modal Stagioni) ---
selezionaStagioneBtn.onclick = () => {
    seasonListModal.innerHTML = '';
    allSeasons.forEach(season => {
        const btn = document.createElement('button');
        btn.className = 'season-button text-center p-3 rounded-lg bg-gray-700 hover:bg-blue-600 transition-colors duration-200'; // Classi per il bottone del modal
        btn.textContent = season.name;
        btn.dataset.seasonNumber = season.season_number;
        btn.onclick = () => {
            seasonModal.classList.remove('active'); // Chiudi modale
            seasonModal.querySelector('.modal-content').classList.remove('active-modal-content');
            caricaEpisodi(id, season.season_number);
        };
        seasonListModal.appendChild(btn);
    });
    seasonModal.classList.add('active'); // Mostra modale
    seasonModal.querySelector('.modal-content').classList.add('active-modal-content');
};

closeModalBtn.onclick = () => {
    seasonModal.classList.remove('active');
    seasonModal.querySelector('.modal-content').classList.remove('active-modal-content');
};

window.onclick = (event) => {
    if (event.target === seasonModal) {
        seasonModal.classList.remove('active');
        seasonModal.querySelector('.modal-content').classList.remove('active-modal-content');
    }
};

async function caricaEpisodi(tvId, seasonNumber) {
    currentSeasonDisplay.textContent = `(Stagione ${seasonNumber})`;

    const res = await fetch(`${BASE_URL}/tv/${tvId}/season/${seasonNumber}?api_key=${API_KEY}&language=it-IT`);
    if (!res.ok) throw new Error(`Errore caricamento episodi! status: ${res.status}`);
    const data = await res.json();

    episodesCarouselTrack.innerHTML = '';

    if (!data.episodes || data.episodes.length === 0) {
        episodesCarouselTrack.innerHTML = `<p class="text-gray-400 text-center w-full py-10">Nessun episodio disponibile per questa stagione.</p>`;
        mainPlayerContainer.innerHTML = `<p class="text-gray-400 text-center py-10">Nessun episodio riproducibile per questa stagione.</p>`;
        return;
    }

    let firstEpisodeLoaded = false;
    data.episodes.forEach(episode => {
        const episodeCard = document.createElement('div');
        episodeCard.className = 'episode-card flex-shrink-0 w-64 bg-gray-800 rounded-lg shadow-md overflow-hidden transition-transform duration-200 hover:scale-[1.02] cursor-pointer'; // Classi dalla precedente proposta
        
        const imgSrc = episode.still_path
            ? `${IMAGE_BASE_URL}w300${episode.still_path}`
            : 'https://via.placeholder.com/300x168/333333/e0e0e0?text=Episodio+non+disponibile';

        episodeCard.innerHTML = `
            <img src="${imgSrc}" alt="Episodio ${episode.episode_number}" class="w-full h-36 object-cover">
            <div class="p-3">
                <h3 class="font-semibold text-lg text-white truncate">E${episode.episode_number}: ${episode.name || 'Senza Titolo'}</h3>
                <p class="text-sm text-gray-400 line-clamp-2">${episode.overview || 'Nessuna descrizione disponibile.'}</p>
                <button class="play-episode-btn btn-primary text-sm mt-3 px-3 py-1.5 rounded-full">▶ Guarda</button>
            </div>
        `;
        
        episodeCard.querySelector('.play-episode-btn').onclick = () => {
            aggiornaPlayerSeries(tvId, seasonNumber, episode.episode_number);
            mainPlayerContainer.scrollIntoView({ behavior: "smooth", block: "start" });
        };

        episodesCarouselTrack.appendChild(episodeCard);

        if (!firstEpisodeLoaded) { // Carica il primo episodio disponibile nel player
            aggiornaPlayerSeries(tvId, seasonNumber, episode.episode_number);
            firstEpisodeLoaded = true;
        }
    });
    updateCarouselArrowsVisibility('episodes-carousel'); // Aggiorna visibilità frecce dopo il caricamento
}

function aggiornaPlayerSeries(tvId, season, episode) {
    mainPlayerContainer.innerHTML = `
        <iframe src="https://vixsrc.to/tv/${tvId}/${season}/${episode}" frameborder="0" allowfullscreen></iframe>
    `;
}

function aggiungiPlayerFilm(movieId) {
    mainPlayerContainer.innerHTML = `
        <iframe src="https://vixsrc.to/movie/${movieId}" frameborder="0" allowfullscreen></iframe>
    `;
}

// --- Funzioni di scroll per i caroselli ---
// Queste funzioni sono richiamate dall'onclick dei bottoni freccia in HTML
window.scrollLeft = function(carouselId) {
    const carouselContainer = document.getElementById(carouselId);
    if (!carouselContainer) { console.error(`Carousel container not found for ID: ${carouselId}`); return; }
    // Scrolla di una "pagina" di carosello
    carouselContainer.scrollBy({
        left: -carouselContainer.clientWidth * 0.8, // Scorri dell'80% della larghezza visibile
        behavior: 'smooth'
    });
};

window.scrollRight = function(carouselId) {
    const carouselContainer = document.getElementById(carouselId);
    if (!carouselContainer) { console.error(`Carousel container not found for ID: ${carouselId}`); return; }
    // Scrolla di una "pagina" di carosello
    carouselContainer.scrollBy({
        left: carouselContainer.clientWidth * 0.8, // Scorri dell'80% della larghezza visibile
        behavior: 'smooth'
    });
};


// Funzione per aggiornare la visibilità delle frecce (dopo caricamento e su scroll)
function updateCarouselArrowsVisibility(carouselId) {
    const carouselContainer = document.getElementById(carouselId);
    if (!carouselContainer) return;

    const scrollLeftBtn = carouselContainer.querySelector('.scroll-btn.scroll-left');
    const scrollRightBtn = carouselContainer.querySelector('.scroll-btn.scroll-right');

    // Funzione interna per togglare le classi
    const toggleArrows = () => {
        if (!scrollLeftBtn || !scrollRightBtn) return; // Assicurati che i bottoni esistano

        const scrollEnd = carouselContainer.scrollWidth - carouselContainer.clientWidth;
        const tolerance = 5; // pixel di tolleranza per l'arrivo alla fine

        // Freccia sinistra (indietro)
        if (carouselContainer.scrollLeft > tolerance) {
            scrollLeftBtn.classList.remove('hide-arrow');
            scrollLeftBtn.classList.add('show-arrow');
            scrollLeftBtn.style.pointerEvents = 'auto'; // Abilita click
        } else {
            scrollLeftBtn.classList.remove('show-arrow');
            scrollLeftBtn.classList.add('hide-arrow');
            scrollLeftBtn.style.pointerEvents = 'none'; // Disabilita click
        }

        // Freccia destra (avanti)
        if (carouselContainer.scrollLeft >= scrollEnd - tolerance) {
            scrollRightBtn.classList.remove('show-arrow');
            scrollRightBtn.classList.add('hide-arrow');
            scrollRightBtn.style.pointerEvents = 'none'; // Disabilita click
        } else {
            scrollRightBtn.classList.remove('hide-arrow');
            scrollRightBtn.classList.add('show-arrow');
            scrollRightBtn.style.pointerEvents = 'auto'; // Abilita click
        }
    };

    // Aggiungi event listener per lo scroll con debounce
    let scrollTimeout;
    carouselContainer.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(toggleArrows, 150); // Aggiorna dopo 150ms di inattività
    });

    // Stato iniziale delle frecce (immediatamente)
    // Se il contenuto non è scrollabile, nascondi entrambe
    if (carouselContainer.scrollWidth <= carouselContainer.clientWidth + tolerance) {
        if (scrollLeftBtn) {
            scrollLeftBtn.classList.add('hide-arrow');
            scrollLeftBtn.style.pointerEvents = 'none';
        }
        if (scrollRightBtn) {
            scrollRightBtn.classList.add('hide-arrow');
            scrollRightBtn.style.pointerEvents = 'none';
        }
    } else {
        // Altrimenti, la freccia sinistra è nascosta all'inizio, la destra è visibile
        if (scrollLeftBtn) {
            scrollLeftBtn.classList.add('hide-arrow');
            scrollLeftBtn.style.pointerEvents = 'none';
        }
        if (scrollRightBtn) {
            scrollRightBtn.classList.add('show-arrow');
            scrollRightBtn.style.pointerEvents = 'auto';
        }
    }
}
