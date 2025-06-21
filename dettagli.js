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
const currentSeasonDisplay = document.getElementById("current-season-display");
const selezionaStagioneBtn = document.getElementById("seleziona-stagione-btn");
const episodesCarouselTrack = document.querySelector("#episodes-carousel .carousel-track");
const castCarouselTrack = document.querySelector("#cast-carousel .carousel-track");
const similarMoviesCarouselTrack = document.querySelector("#similar-movies-carousel .carousel-track");

const seasonModal = document.getElementById("season-modal");
const closeModalBtn = document.querySelector("#season-modal .close-btn");
const seasonListModal = document.getElementById("season-list");

let allSeasons = []; // Array per memorizzare tutte le stagioni disponibili

if (!id || !tipo) {
    console.error("ID o tipo mancanti nell'URL. Reindirizzamento alla homepage.");
    window.location.href = "index.html";
}

document.addEventListener('DOMContentLoaded', caricaDettagli);

async function caricaDettagli() {
    try {
        const res = await fetch(`${BASE_URL}/${tipo}/${id}?api_key=${API_KEY}&language=it-IT&append_to_response=credits,videos,recommendations,similar`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();

        // --- Popola Top Backdrop e Dettagli Principali ---
        const title = data.title || data.name || "Titolo non disponibile";
        const overview = data.overview || "Nessuna descrizione disponibile.";
        const tagline = data.tagline || "";
        const posterPath = data.poster_path ? `${IMAGE_BASE_URL}w500${data.poster_path}` : 'https://via.placeholder.com/500x750/222222/e0e0e0?text=Poster';
        const backdropPath = data.backdrop_path ? `${IMAGE_BASE_URL}original${data.backdrop_path}` : posterPath; 

        topBackdrop.style.backgroundImage = `url(${backdropPath})`; 
        detailPoster.src = posterPath;
        detailTitle.textContent = title;
        detailTagline.textContent = tagline;
        detailOverview.textContent = overview;

        detailVote.innerHTML = `⭐ ${data.vote_average ? data.vote_average.toFixed(1) : 'N/A'}`;
        detailReleaseYear.textContent = data.release_date ? data.release_date.substring(0, 4) : (data.first_air_date ? data.first_air_date.substring(0, 4) : 'Anno N/A');
        
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
        await caricaSimilarContent(data.recommendations || data.similar);

        // --- Gestione Serie TV vs Film ---
        if (tipo === "tv") {
            episodesSection.classList.remove('hidden');
            selezionaStagioneBtn.style.display = "inline-flex";
            allSeasons = data.seasons.filter(s => s.season_number > 0);
            allSeasons.sort((a,b) => a.season_number - b.season_number);
            
            const firstSeasonToLoad = allSeasons.find(s => s.season_number === 1) || allSeasons[0];
            if (firstSeasonToLoad) {
                await caricaEpisodi(id, firstSeasonToLoad.season_number);
            } else {
                episodesCarouselTrack.innerHTML = `<p class="text-gray-400 text-center w-full py-10">Nessuna stagione disponibile.</p>`;
                mainPlayerContainer.innerHTML = `<p class="text-gray-400 text-center py-10">Nessun episodio riproducibile per questa serie.</p>`;
            }
        } else {
            episodesSection.classList.add('hidden');
            selezionaStagioneBtn.style.display = "none";
            aggiungiPlayerFilm(id);
        }

        // Setup listeners per le frecce dopo che i caroselli sono stati popolati
        setupCarouselScrollListeners();

    } catch (error) {
        console.error("Errore nel caricamento dei dettagli:", error);
        mainDetailsSection.innerHTML = `<p class="text-center text-red-500 text-xl w-full">Impossibile caricare i dettagli del contenuto. Riprova più tardi.</p>`;
        // Nascondi le altre sezioni
        document.getElementById('trailer-section').classList.add('hidden');
        document.getElementById('player-section').classList.add('hidden');
        document.getElementById('episodes-section').classList.add('hidden');
        document.getElementById('cast-section').classList.add('hidden');
        document.getElementById('similar-content-section').classList.add('hidden');
    }
}

async function caricaTrailer(videosData) {
    const trailer = videosData.results.find(v => v.type === "Trailer" && v.site === "YouTube" && v.official) || 
                    videosData.results.find(v => v.type === "Trailer" && v.site === "YouTube");

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

    const topCast = creditsData.cast.filter(member => member.profile_path).slice(0, 15);

    if (topCast.length === 0) {
        document.getElementById('cast-section').classList.add('hidden');
        return;
    }

    topCast.forEach(member => {
        const castCard = document.createElement('div');
        castCard.className = 'cast-card'; 
        castCard.innerHTML = `
            <img src="${IMAGE_BASE_URL}w185${member.profile_path}" alt="${member.name}">
            <h4>${member.name}</h4>
            <p>${member.character || ''}</p>
        `;
        castCarouselTrack.appendChild(castCard);
    });
}

async function caricaSimilarContent(relatedContentData) {
    if (!relatedContentData || !relatedContentData.results || relatedContentData.results.length === 0) {
        document.getElementById('similar-content-section').classList.add('hidden');
        return;
    }
    similarMoviesCarouselTrack.innerHTML = '';

    const filteredContent = relatedContentData.results.filter(item => item.poster_path).slice(0, 20);

    if (filteredContent.length === 0) {
        document.getElementById('similar-content-section').classList.add('hidden');
        return;
    }

    filteredContent.forEach(item => {
        const movieCard = createMovieCard(item);
        similarMoviesCarouselTrack.appendChild(movieCard);
    });
}

function createMovieCard(item) {
    const title = item.title || item.name || 'Titolo sconosciuto';
    const poster = item.poster_path ? `${IMAGE_BASE_URL}w300${item.poster_path}` : 'https://via.placeholder.com/300x450/222222/e0e0e0?text=Immagine+non+disponibile';
    const type = item.media_type || (item.title ? 'movie' : 'tv');

    const card = document.createElement('div');
    card.className = 'movie-card flex-shrink-0 rounded-lg overflow-hidden shadow-lg transition-transform duration-300';
    card.innerHTML = `
        <a href="dettagli.html?id=${item.id}&type=${type}" class="block w-full">
            <img src="${poster}" alt="${title}" class="w-full h-full object-cover rounded-md" loading="lazy" />
            <div class="p-2 text-center text-sm font-semibold">${title}</div>
        </a>
    `;
    return card;
}


// --- Funzioni per Serie TV ---
selezionaStagioneBtn.onclick = () => {
    seasonListModal.innerHTML = '';
    allSeasons.forEach(season => {
        const btn = document.createElement('button');
        btn.className = 'season-modal-button';
        btn.textContent = `Stagione ${season.season_number}`;
        btn.onclick = () => {
            seasonModal.style.display = 'none';
            caricaEpisodi(id, season.season_number);
        };
        seasonListModal.appendChild(btn);
    });
    seasonModal.style.display = 'flex';
};

closeModalBtn.onclick = () => {
    seasonModal.style.display = 'none';
};

window.onclick = (event) => {
    if (event.target == seasonModal) {
        seasonModal.style.display = 'none';
    }
};

async function caricaEpisodi(tvId, seasonNumber) {
    currentSeasonDisplay.textContent = `(Stagione ${seasonNumber})`;

    const res = await fetch(`${BASE_URL}/tv/${tvId}/season/${seasonNumber}?api_key=${API_KEY}&language=it-IT`);
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
        episodeCard.className = 'episode-card';
        
        const imgSrc = episode.still_path
            ? `${IMAGE_BASE_URL}w300${episode.still_path}`
            : 'https://via.placeholder.com/300x169/222222/e0e0e0?text=Immagine+non+disponibile';

        episodeCard.innerHTML = `
            <img src="${imgSrc}" alt="Episodio ${episode.episode_number}">
            <div class="episode-info">
                <h3>E${episode.episode_number}: ${episode.name || 'Senza Titolo'}</h3>
                <p>${episode.overview || 'Nessuna descrizione disponibile.'}</p>
                <button class="play-episode-btn">▶ Guarda</button>
            </div>
        `;
        
        episodeCard.querySelector('.play-episode-btn').onclick = () => {
            aggiornaPlayerSeries(tvId, seasonNumber, episode.episode_number);
            mainPlayerContainer.scrollIntoView({ behavior: "smooth", block: "start" });
        };

        episodesCarouselTrack.appendChild(episodeCard);

        if (!firstEpisodeLoaded) {
            aggiornaPlayerSeries(tvId, seasonNumber, episode.episode_number);
            firstEpisodeLoaded = true;
        }
    });
    // Dopo aver caricato gli episodi, aggiorna la visibilità delle frecce
    updateCarouselArrowsVisibility('episodes-carousel');
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

// Funzioni di scroll per i caroselli nella pagina dettagli
function scrollRight(carouselId) {
    const carouselContainer = document.getElementById(carouselId);
    if (!carouselContainer) {
        console.error(`Carousel container not found for ID: ${carouselId}`);
        return;
    }
    const carouselTrack = carouselContainer.querySelector('.carousel-track');
    if (!carouselTrack) {
        console.error(`Carousel track not found inside ${carouselId}`);
        return;
    }
    // Calcola lo scroll basandosi sulla larghezza del contenitore o della prima card
    const scrollAmount = carouselContainer.offsetWidth * 0.8; // Scorre l'80% della larghezza visibile
    carouselContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
}

function scrollLeft(carouselId) {
    const carouselContainer = document.getElementById(carouselId);
    if (!carouselContainer) {
        console.error(`Carousel container not found for ID: ${carouselId}`);
        return;
    }
    const carouselTrack = carouselContainer.querySelector('.carousel-track');
    if (!carouselTrack) {
        console.error(`Carousel track not found inside ${carouselId}`);
        return;
    }
    // Calcola lo scroll basandosi sulla larghezza del contenitore o della prima card
    const scrollAmount = carouselContainer.offsetWidth * 0.8; // Scorre l'80% della larghezza visibile
    carouselContainer.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
}

// Funzione per aggiornare la visibilità delle frecce
function updateCarouselArrowsVisibility(carouselId) {
    const carouselContainer = document.getElementById(carouselId);
    if (!carouselContainer) return;

    const scrollLeftBtn = carouselContainer.querySelector('.scroll-left');
    const scrollRightBtn = carouselContainer.querySelector('.scroll-right');

    if (!scrollLeftBtn || !scrollRightBtn) return; // Assicurati che i bottoni esistano

    // Debounce per evitare che la funzione si attivi troppo spesso durante lo scroll
    let scrollTimeout;
    carouselContainer.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            // Logica per la freccia sinistra
            if (carouselContainer.scrollLeft > 0) {
                scrollLeftBtn.style.opacity = '1';
                scrollLeftBtn.style.pointerEvents = 'auto';
            } else {
                scrollLeftBtn.style.opacity = '0';
                scrollLeftBtn.style.pointerEvents = 'none';
            }

            // Logica per la freccia destra
            // Aggiungi una piccola tolleranza per i calcoli in virgola mobile
            const scrollEnd = carouselContainer.scrollWidth - carouselContainer.clientWidth;
            const tolerance = 1; // pixel di tolleranza
            if (carouselContainer.scrollLeft >= scrollEnd - tolerance) {
                scrollRightBtn.style.opacity = '0';
                scrollRightBtn.style.pointerEvents = 'none';
            } else {
                scrollRightBtn.style.opacity = '1';
                scrollRightBtn.style.pointerEvents = 'auto';
            }
        }, 100); // Ritardo di 100ms
    });

    // Chiamata iniziale per impostare la visibilità all'inizio
    // La freccia sinistra è inizialmente nascosta dal CSS, qui la logica la mostra se si scorre
    // La freccia destra è inizialmente visibile (su hover del genitore), qui la logica la nasconde se non c'è più nulla da scorrere
    const scrollEnd = carouselContainer.scrollWidth - carouselContainer.clientWidth;
    const tolerance = 1;
    if (carouselContainer.scrollLeft >= scrollEnd - tolerance) {
        scrollRightBtn.style.opacity = '0';
        scrollRightBtn.style.pointerEvents = 'none';
    } else {
        // Se c'è spazio per scorrere a destra, la freccia destra dovrebbe essere visibile su hover del genitore
        scrollRightBtn.style.opacity = '1'; // Questo è per il caso iniziale, ma il CSS group:hover lo gestisce
        scrollRightBtn.style.pointerEvents = 'auto';
    }
    // La freccia sinistra è sempre nascosta all'inizio
    scrollLeftBtn.style.opacity = '0';
    scrollLeftBtn.style.pointerEvents = 'none';
}


// Inizializza i listener per tutti i caroselli
function setupCarouselScrollListeners() {
    const carouselIds = ['episodes-carousel', 'cast-carousel', 'similar-movies-carousel'];
    carouselIds.forEach(id => {
        const carouselContainer = document.getElementById(id);
        if (carouselContainer) {
            // Chiamata iniziale per impostare la visibilità delle frecce
            // Questo gestisce il caso in cui un carosello non ha abbastanza elementi per scorrere
            const scrollLeftBtn = carouselContainer.querySelector('.scroll-left');
            const scrollRightBtn = carouselContainer.querySelector('.scroll-right');

            if (carouselContainer.scrollWidth <= carouselContainer.clientWidth + 1) { // +1 per tolleranza
                if (scrollLeftBtn) scrollLeftBtn.style.display = 'none';
                if (scrollRightBtn) scrollRightBtn.style.display = 'none';
            } else {
                if (scrollLeftBtn) {
                    scrollLeftBtn.style.opacity = '0'; // Nascosta di default
                    scrollLeftBtn.style.pointerEvents = 'none';
                }
                // La freccia destra è gestita dal CSS group:hover e dalla logica di scroll
                // Assicurati che sia visibile se c'è contenuto da scorrere
                if (scrollRightBtn) {
                    scrollRightBtn.style.opacity = '1'; // Visibile su hover se c'è spazio
                    scrollRightBtn.style.pointerEvents = 'auto';
                }
            }

            // Aggiungi il listener di scroll per la logica di visibilità dinamica
            carouselContainer.addEventListener('scroll', () => {
                updateCarouselArrowsVisibility(id);
            });
            // Esegui un aggiornamento immediato per lo stato iniziale
            updateCarouselArrowsVisibility(id);
        }
    });
}
