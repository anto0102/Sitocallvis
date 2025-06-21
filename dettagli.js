const API_KEY = "2d082597ab951b3a9596ca23e71413a8"; // La tua TMDB API key
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/';

const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get("id");
const tipo = urlParams.get("type"); // 'movie' or 'tv'

// Elementi del nuovo design
const topBackdrop = document.getElementById("top-backdrop");
// RIFERIMENTO AL CONTENITORE PRINCIPALE DI DETTAGLI DENTRO L'HEADER
const mainDetailsSection = document.getElementById("main-details-section"); 
const detailPoster = document.getElementById("detail-poster");
const detailTitle = document.getElementById("detail-title");
const detailTagline = document.getElementById("detail-tagline");
const detailVote = document.getElementById("detail-vote");
const detailReleaseYear = document.getElementById("detail-release-year");
const detailRuntime = document.getElementById("detail-runtime");
const detailGenres = document.getElementById("detail-genres");
const detailOverview = document.getElementById("detail-overview");
let mainPlayBtn = null;
if (mainDetailsSection) { // Questo controllo ora dovrebbe passare
    mainPlayBtn = mainDetailsSection.querySelector('.play-btn'); 
}

const trailerPlayerContainer = document.getElementById("trailer-player-container");
const mainPlayerContainer = document.getElementById("main-player-container");
const episodesSection = document.getElementById("episodes-section");
const episodesCarouselTrack = document.querySelector("#episodes-carousel .carousel-track");
const currentSeasonDisplay = document.getElementById("current-season-display");
const selezionaStagioneBtn = document.getElementById("seleziona-stagione-btn");
const castCarouselTrack = document.querySelector('#cast-carousel .carousel-track');
const similarMoviesCarouselTrack = document.querySelector('#similar-movies-carousel .carousel-track');

const seasonModal = document.getElementById("season-modal");
let closeModalBtn = null;
if (seasonModal) {
    closeModalBtn = seasonModal.querySelector('.close-btn');
}
const seasonListModal = document.getElementById("season-list");

let allSeasons = []; 

if (!id || !tipo) {
    console.error("ID o tipo mancanti nell'URL. Reindirizzamento alla homepage.");
    window.location.href = "index.html"; 
}

document.addEventListener('DOMContentLoaded', caricaDettagli);

async function caricaDettagli() {
    // Questo controllo ora dovrebbe passare correttamente se l'HTML è stato aggiornato
    if (!mainDetailsSection || !detailPoster || !detailTitle || !mainPlayBtn) {
        console.error("Elementi HTML essenziali non trovati. Assicurati che l'ID 'main-details-section' e altri ID siano corretti nell'HTML.");
        document.body.innerHTML = `<div style="color: red; text-align: center; margin-top: 100px;">
                                    <h1>Errore: Contenuto non disponibile</h1>
                                    <p>Verifica gli ID degli elementi HTML. Potrebbe mancare l'ID 'main-details-section' nel DIV con il poster e i dettagli.</p>
                                    <a href="index.html" style="color: blue;">Torna alla Home</a>
                                  </div>`;
        return; 
    }

    try {
        const res = await fetch(`${BASE_URL}/${tipo}/${id}?api_key=${API_KEY}&language=it-IT&append_to_response=credits,videos,recommendations,similar`);
        if (!res.ok) {
             const errorData = await res.json();
             throw new Error(`Errore API TMDb: ${res.status} - ${errorData.status_message || res.statusText}`);
        }
        const data = await res.json();

        // --- Popola Top Backdrop e Dettagli Principali ---
        const title = data.title || data.name || "Titolo non disponibile";
        const overview = data.overview || "Nessuna descrizione disponibile.";
        const tagline = data.tagline || "";
        const posterPath = data.poster_path ? `${IMAGE_BASE_URL}w500${data.poster_path}` : 'https://via.placeholder.com/500x750/222222/e0e0e0?text=Poster+Non+Trovato';
        const backdropPath = data.backdrop_path ? `${IMAGE_BASE_URL}original${data.backdrop_path}` : posterPath; 

        if(topBackdrop) topBackdrop.style.backgroundImage = `url(${backdropPath})`; 
        if(detailPoster) detailPoster.src = posterPath;
        if(detailTitle) detailTitle.textContent = title;
        if(detailTagline) detailTagline.textContent = tagline;
        if(detailOverview) detailOverview.textContent = overview;

        if(detailVote) detailVote.innerHTML = `⭐ ${data.vote_average ? data.vote_average.toFixed(1) : 'N/A'}`;
        if(detailReleaseYear) detailReleaseYear.textContent = data.release_date ? new Date(data.release_date).getFullYear() : (data.first_air_date ? new Date(data.first_air_date).getFullYear() : 'N/A');
        
        let runtimeText = 'N/A';
        if (tipo === 'movie' && data.runtime) {
            runtimeText = `${data.runtime} min`;
        } else if (tipo === 'tv' && data.episode_run_time && data.episode_run_time.length > 0) {
            runtimeText = `${data.episode_run_time[0]} min/episodio`;
        }
        if(detailRuntime) detailRuntime.textContent = runtimeText;

        if(detailGenres) detailGenres.textContent = data.genres?.map(g => g.name).join(" / ") || "Generi N/A";

        // --- Logica pulsanti Play/Add to List ---
        if(mainPlayBtn) {
            mainPlayBtn.onclick = () => {
                if(mainPlayerContainer) mainPlayerContainer.scrollIntoView({ behavior: "smooth", block: "start" });
                if (tipo === 'movie') {
                    aggiungiPlayerFilm(id);
                }
            };
        }
        const addToListBtn = document.querySelector('.add-to-list-btn');
        if(addToListBtn) {
            addToListBtn.onclick = () => {
                alert('Funzione "Aggiungi alla lista" non ancora implementata.');
            };
        }

        // --- Caricamento Contenuti Dinamici ---
        await caricaTrailer(data.videos);
        await caricaCast(data.credits);
        await caricaSimilarContent(data.recommendations || data.similar);

        // --- Gestione Serie TV vs Film ---
        if (tipo === "tv") {
            if(episodesSection) episodesSection.classList.remove('hidden');
            if(selezionaStagioneBtn) selezionaStagioneBtn.style.display = "inline-flex";
            allSeasons = data.seasons.filter(s => s.season_number > 0);
            allSeasons.sort((a,b) => a.season_number - b.season_number);
            
            const firstSeasonToLoad = allSeasons.find(s => s.season_number === 1) || allSeasons[0];
            if (firstSeasonToLoad) {
                await caricaEpisodi(id, firstSeasonToLoad.season_number);
            } else {
                if(episodesCarouselTrack) episodesCarouselTrack.innerHTML = `<p class="text-gray-400 text-center w-full py-10">Nessuna stagione disponibile.</p>`;
                if(mainPlayerContainer) mainPlayerContainer.innerHTML = `<p class="text-gray-400 text-center py-10">Nessun episodio riproducibile per questa serie.</p>`;
            }
        } else {
            if(episodesSection) episodesSection.classList.add('hidden');
            if(selezionaStagioneBtn) selezionaStagioneBtn.style.display = "none";
            aggiungiPlayerFilm(id);
        }

        setupCarouselScrollListeners(); // Setup listener per le frecce DOPO che i caroselli sono stati popolati

    } catch (error) {
        console.error("Errore nel caricamento dei dettagli:", error);
        if(mainDetailsSection) mainDetailsSection.innerHTML = `<p class="text-center text-red-500 text-xl w-full py-12">Impossibile caricare i dettagli del contenuto. <br>Errore: ${error.message}. <br>Assicurati che la tua API key TMDb sia corretta e che tu sia connesso a Internet.</p>`;
        if(document.getElementById('trailer-section')) document.getElementById('trailer-section').classList.add('hidden');
        if(document.getElementById('player-section')) document.getElementById('player-section').classList.add('hidden');
        if(document.getElementById('episodes-section')) document.getElementById('episodes-section').classList.add('hidden');
        if(document.getElementById('cast-section')) document.getElementById('cast-section').classList.add('hidden');
        if(document.getElementById('similar-content-section')) document.getElementById('similar-content-section').classList.add('hidden');
    }
}

async function caricaTrailer(videosData) {
    if(!trailerPlayerContainer) return;
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
    if (!castCarouselTrack || !document.getElementById('cast-section')) {
        console.warn("Elementi Cast Carousel non trovati.");
        document.getElementById('cast-section').classList.add('hidden');
        return;
    }
    
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
    updateCarouselArrowsVisibility('cast-carousel'); 
}

async function caricaSimilarContent(relatedContentData) {
    if (!similarMoviesCarouselTrack || !document.getElementById('similar-content-section')) {
        console.warn("Elementi Similar Movies Carousel non trovati.");
        document.getElementById('similar-content-section').classList.add('hidden');
        return;
    }

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
    updateCarouselArrowsVisibility('similar-movies-carousel'); 
}

function createMovieCard(item) {
    const title = item.title || item.name || 'Titolo sconosciuto';
    const poster = item.poster_path ? `${IMAGE_BASE_URL}w300${item.poster_path}` : 'https://via.placeholder.com/300x450/222222/e0e0e0?text=Immagine+non+disponibile';
    const type = item.media_type || (item.title ? 'movie' : 'tv'); 

    const card = document.createElement('div');
    card.className = 'similar-card flex-shrink-0 rounded-lg overflow-hidden shadow-md transition-transform duration-300 hover:scale-105 cursor-pointer'; 
    card.innerHTML = `
        <a href="dettagli.html?id=${item.id}&type=${type}" class="block w-full">
            <img src="${poster}" alt="${title}" class="w-full h-full object-cover rounded-md" loading="lazy" />
            <div class="p-2 text-center text-sm font-semibold">${title}</div>
        </a>
    `;
    return card;
}


// --- Funzioni per Serie TV (Caricamento Episodi e Modal Stagioni) ---
if(selezionaStagioneBtn) {
    selezionaStagioneBtn.onclick = () => {
        if(seasonListModal) seasonListModal.innerHTML = '';
        allSeasons.forEach(season => {
            const btn = document.createElement('button');
            btn.className = 'season-button text-center p-3 rounded-lg bg-gray-700 hover:bg-blue-600 transition-colors duration-200'; 
            btn.textContent = season.name;
            btn.dataset.seasonNumber = season.season_number;
            btn.onclick = () => {
                if(seasonModal) seasonModal.classList.remove('active'); 
                if(seasonModal) seasonModal.querySelector('.modal-content').classList.remove('active-modal-content');
                caricaEpisodi(id, season.season_number);
            };
            if(seasonListModal) seasonListModal.appendChild(btn);
        });
        if(seasonModal) seasonModal.classList.add('active'); 
        if(seasonModal) seasonModal.querySelector('.modal-content').classList.add('active-modal-content');
    };
}

if(closeModalBtn) {
    closeModalBtn.onclick = () => {
        if(seasonModal) seasonModal.classList.remove('active');
        if(seasonModal) seasonModal.querySelector('.modal-content').classList.remove('active-modal-content');
    };
}

if(seasonModal) {
    window.onclick = (event) => {
        if (event.target === seasonModal) {
            seasonModal.classList.remove('active');
            seasonModal.querySelector('.modal-content').classList.remove('active-modal-content');
        }
    };
}


async function caricaEpisodi(tvId, seasonNumber) {
    if(!currentSeasonDisplay || !episodesCarouselTrack || !mainPlayerContainer) {
        console.warn("Elementi Episodi non trovati.");
        return;
    }

    currentSeasonDisplay.textContent = `(Stagione ${seasonNumber})`;

    const res = await fetch(`${BASE_URL}/tv/${tvId}/season/${seasonNumber}?api_key=${API_KEY}&language=it-IT`);
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`Errore caricamento episodi: ${res.status} - ${errorData.status_message || res.statusText}`);
    }
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
        episodeCard.className = 'episode-card flex-shrink-0 w-64 bg-gray-800 rounded-lg shadow-md overflow-hidden transition-transform duration-200 hover:scale-[1.02] cursor-pointer'; 
        
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

        if (!firstEpisodeLoaded) {
            aggiornaPlayerSeries(tvId, seasonNumber, episode.episode_number);
            firstEpisodeLoaded = true;
        }
    });
    updateCarouselArrowsVisibility('episodes-carousel'); 
}

function aggiornaPlayerSeries(tvId, season, episode) {
    if (!mainPlayerContainer) { console.warn("Main Player Container non trovato."); return; }
    mainPlayerContainer.innerHTML = `
        <iframe src="https://vixsrc.to/tv/${tvId}/${season}/${episode}" frameborder="0" allowfullscreen></iframe>
    `;
}

function aggiungiPlayerFilm(movieId) {
    if (!mainPlayerContainer) { console.warn("Main Player Container non trovato."); return; }
    mainPlayerContainer.innerHTML = `
        <iframe src="https://vixsrc.to/movie/${movieId}" frameborder="0" allowfullscreen></iframe>
    `;
}

// --- Funzioni di scroll per i caroselli ---
window.scrollLeft = function(carouselId) {
    const carouselContainer = document.getElementById(carouselId);
    if (!carouselContainer) { console.error(`Carousel container not found for ID: ${carouselId}`); return; }
    carouselContainer.scrollBy({
        left: -carouselContainer.clientWidth * 0.8, 
        behavior: 'smooth'
    });
};

window.scrollRight = function(carouselId) {
    const carouselContainer = document.getElementById(carouselId);
    if (!carouselContainer) { console.error(`Carousel container not found for ID: ${carouselId}`); return; }
    carouselContainer.scrollBy({
        left: carouselContainer.clientWidth * 0.8, 
        behavior: 'smooth'
    });
};


// Funzione per aggiornare la visibilità delle frecce (dopo caricamento e su scroll)
function updateCarouselArrowsVisibility(carouselId) {
    const carouselContainer = document.getElementById(carouselId);
    if (!carouselContainer) return;

    const scrollLeftBtn = carouselContainer.querySelector('.scroll-btn.scroll-left');
    const scrollRightBtn = carouselContainer.querySelector('.scroll-btn.scroll-right');

    if (!scrollLeftBtn || !scrollRightBtn) return; 

    const toggleArrows = () => {
        const scrollEnd = carouselContainer.scrollWidth - carouselContainer.clientWidth;
        const tolerance = 5; 

        if (carouselContainer.scrollLeft > tolerance) {
            scrollLeftBtn.classList.remove('hide-arrow');
            scrollLeftBtn.classList.add('show-arrow');
            scrollLeftBtn.style.pointerEvents = 'auto'; 
        } else {
            scrollLeftBtn.classList.remove('show-arrow');
            scrollLeftBtn.classList.add('hide-arrow');
            scrollLeftBtn.style.pointerEvents = 'none'; 
        }

        if (carouselContainer.scrollLeft >= scrollEnd - tolerance) {
            scrollRightBtn.classList.remove('show-arrow');
            scrollRightBtn.classList.add('hide-arrow');
            scrollRightBtn.style.pointerEvents = 'none'; 
        } else {
            scrollRightBtn.classList.remove('hide-arrow');
            scrollRightBtn.classList.add('show-arrow');
            scrollRightBtn.style.pointerEvents = 'auto'; 
        }
    };

    let scrollTimeout;
    carouselContainer.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(toggleArrows, 150); 
    });

    // Stato iniziale delle frecce (immediatamente)
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
