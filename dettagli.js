const API_KEY = "2d082597ab951b3a9596ca23e71413a8"; // La tua TMDB API key
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/';

// URLSearchParams deve essere chiamato una sola volta
const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get("id");
const tipo = urlParams.get("type"); // 'movie' or 'tv'

// Elementi HTML
const heroMediaContainer = document.getElementById("hero-media-container");
const youtubePlayerDiv = document.getElementById("youtube-player-div");
const heroBackdropImg = document.getElementById("hero-backdrop-img");
const mainDetailsSection = document.getElementById("main-details-section"); // Ora questo ID è sul DIV interno all'HEADER
const detailPoster = document.getElementById("detail-poster");
const detailTitle = document.getElementById("detail-title");
const detailTagline = document.getElementById("detail-tagline");
const detailVote = document.getElementById("detail-vote");
const detailReleaseYear = document.getElementById("detail-release-year");
const detailRuntime = document.getElementById("detail-runtime");
const detailGenres = document.getElementById("detail-genres");
const detailViews = document.getElementById("detail-views"); // Nuovo
const detailSeasons = document.getElementById("detail-seasons"); // Nuovo
const detailOverviewFull = document.getElementById("detail-overview-full"); // Sinossi completa
const btnPlayHero = document.querySelector('.btn-play-hero'); // Bottone Riproduci nel banner

const mainPlayerContainer = document.getElementById("main-player-container"); // Contenitore per il player principale
const episodesSection = document.getElementById("episodes-section");
const episodesCarouselTrack = document.querySelector("#episodes-carousel .carousel-track");
const currentSeasonDisplay = document.getElementById("current-season-display");
const selezionaStagioneBtn = document.getElementById("seleziona-stagione-btn");
const castCarouselTrack = document.querySelector('#cast-carousel .carousel-track');
const similarMoviesCarouselTrack = document.querySelector('#similar-movies-carousel .carousel-track');

const seasonModal = document.getElementById("season-modal");
const closeModalBtn = seasonModal ? seasonModal.querySelector('.close-btn') : null;
const seasonListModal = document.getElementById("season-list");

let allSeasons = []; // Array per memorizzare tutte le stagioni disponibili
let youtubePlayer; // Variabile globale per il player YouTube
let trailerVideoKey = null; // Key del trailer da YouTube

// Controllo iniziale per ID e Tipo nell'URL
if (!id || !tipo) {
    console.error("ID o tipo mancanti nell'URL. Reindirizzamento alla homepage.");
    window.location.href = "index.html"; 
    // Nessun return qui, il reindirizzamento gestirà la chiusura della pagina
}

// Chiamata all'API TMDb per i dettagli del contenuto
document.addEventListener('DOMContentLoaded', caricaDettagli);

async function caricaDettagli() {
    // Controllo robusto degli elementi HTML essenziali (dopo la correzione dell'HTML)
    if (!mainDetailsSection || !detailPoster || !detailTitle || !btnPlayHero) {
        console.error("Elementi HTML essenziali non trovati. Assicurati che gli ID e le classi siano corretti nell'HTML.");
        document.body.innerHTML = `<div style="color: red; text-align: center; margin-top: 100px;">
                                    <h1>Errore: Contenuto non disponibile</h1>
                                    <p>Verifica gli ID degli elementi HTML. Potrebbe mancare l'ID 'main-details-section' o altri elementi chiave.</p>
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

        // --- Popola Contenuti nel Banner Hero ---
        const title = data.title || data.name || "Titolo non disponibile";
        const overview = data.overview || "Nessuna descrizione disponibile.";
        const tagline = data.tagline || "";
        const posterPath = data.poster_path ? `${IMAGE_BASE_URL}w500${data.poster_path}` : 'https://via.placeholder.com/500x750/222222/e0e0e0?text=Poster+Non+Trovato';
        const backdropPath = data.backdrop_path ? `${IMAGE_BASE_URL}original${data.backdrop_path}` : posterPath; 

        if(detailPoster) detailPoster.src = posterPath;
        if(detailTitle) detailTitle.textContent = title;
        if(detailTagline) detailTagline.textContent = tagline;
        if(detailOverviewFull) detailOverviewFull.textContent = overview; // Sinossi completa

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

        // Popola campi specifici per Ginny & Georgia style
        if (detailViews && data.vote_count) { // Usiamo vote_count come proxy per le views
            detailViews.textContent = `${(data.vote_count / 1000000).toFixed(1)}M views`;
            detailViews.classList.remove('hidden');
        }
        if (detailSeasons && tipo === 'tv' && data.number_of_seasons) {
            detailSeasons.textContent = `${data.number_of_seasons} stagioni`;
            detailSeasons.classList.remove('hidden');
        }


        // --- Caricamento Trailer nel Banner (Autoplay non YouTube) ---
        trailerVideoKey = findTrailerKey(data.videos); // Trova la key del trailer YT
        
        if (trailerVideoKey && youtubePlayerDiv) {
            heroBackdropImg.style.opacity = '0'; // Nascondi l'immagine iniziale
            // La creazione del player YT è gestita da onYouTubeIframeAPIReady
        } else {
            // Nessun trailer, mostra solo l'immagine di sfondo
            if(heroBackdropImg) heroBackdropImg.src = backdropPath;
            if(heroBackdropImg) heroBackdropImg.style.opacity = '1';
            if(youtubePlayerDiv) youtubePlayerDiv.style.display = 'none'; // Assicurati che il div del player sia nascosto
        }

        // Click sul bottone "Riproduci" nel banner
        if(btnPlayHero) {
            btnPlayHero.onclick = () => {
                // Avvia il player principale (o scrolla se è già caricato per i film)
                if(mainPlayerContainer) {
                    mainPlayerContainer.scrollIntoView({ behavior: "smooth", block: "start" });
                    if (tipo === 'movie') {
                        aggiungiPlayerFilm(id);
                    } else {
                        // Per le serie TV, il player viene caricato con il primo episodio di default
                        // Se clicca riproduci, lo portiamo al player
                    }
                }
            };
        }
        

        // --- Caricamento Contenuti Dinamici (Cast, Simili, Episodi per TV) ---
        await caricaCast(data.credits);
        await caricaSimilarContent(data.recommendations || data.similar);

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
            // Per i film, il player principale viene caricato subito, non solo al click su Riproduci Hero
            aggiungiPlayerFilm(id); 
        }

        setupCarouselScrollListeners(); // Setup listener per le frecce DOPO che i caroselli sono stati popolati

    } catch (error) {
        console.error("Errore nel caricamento dei dettagli:", error);
        if(mainDetailsSection) mainDetailsSection.innerHTML = `<p class="text-center text-red-500 text-xl w-full py-12">Impossibile caricare i dettagli del contenuto. <br>Errore: ${error.message}. <br>Assicurati che la tua API key TMDb sia corretta e che tu sia connesso a Internet.</p>`;
        if(document.getElementById('synopsis-section')) document.getElementById('synopsis-section').classList.add('hidden'); // Nascondi la sinossi
        if(document.getElementById('player-section')) document.getElementById('player-section').classList.add('hidden');
        if(document.getElementById('episodes-section')) document.getElementById('episodes-section').classList.add('hidden');
        if(document.getElementById('cast-section')) document.getElementById('cast-section').classList.add('hidden');
        if(document.getElementById('similar-content-section')) document.getElementById('similar-content-section').classList.add('hidden');
    }
}

// Funzione per trovare la key del trailer più adatto da TMDb videos
function findTrailerKey(videosData) {
    if (!videosData || !videosData.results || videosData.results.length === 0) {
        return null;
    }
    // Cerca Trailer ufficiale, altrimenti un Teaser, altrimenti un Clip, solo da YouTube
    const trailer = videosData.results.find(v => v.type === "Trailer" && v.site === "YouTube" && v.official) ||
                    videosData.results.find(v => v.type === "Teaser" && v.site === "YouTube") ||
                    videosData.results.find(v => v.type === "Clip" && v.site === "YouTube");
    return trailer ? trailer.key : null;
}

// Questa funzione viene chiamata automaticamente da YouTube IFrame Player API
window.onYouTubeIframeAPIReady = function() {
    if (trailerVideoKey && youtubePlayerDiv) {
        // Autoplay muto e in loop nel banner dopo 2 secondi
        setTimeout(() => {
            youtubePlayer = new YT.Player('youtube-player-div', {
                videoId: trailerVideoKey,
                playerVars: {
                    autoplay: 1,  // Autoplay
                    mute: 1,      // Muto
                    loop: 1,      // Loop
                    controls: 0,  // Nascondi controlli
                    showinfo: 0,  // Nascondi info video
                    modestbranding: 1, // Rimuovi logo YouTube
                    fs: 0,        // Disabilita fullscreen (per non uscire dal banner)
                    rel: 0,       // Non mostrare video correlati alla fine
                    playlist: trailerVideoKey // Necessario per il loop
                },
                events: {
                    'onReady': (event) => {
                        event.target.playVideo();
                        event.target.mute(); // Assicurati che sia muto
                        // Rendi il player visibile solo quando pronto
                        if(youtubePlayerDiv) youtubePlayerDiv.style.opacity = '1';
                        if(heroBackdropImg) heroBackdropImg.style.opacity = '0'; // Nascondi l'immagine quando il video è pronto
                    },
                    'onStateChange': (event) => {
                        // Quando il video finisce e loop è attivo, riparte
                        if (event.data === YT.PlayerState.ENDED) {
                            youtubePlayer.playVideo();
                        }
                    }
                }
            });
        }, 2000); // Avvia il trailer dopo 2 secondi
    }
};


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
        castCard.className = 'cast-card flex-shrink-0 w-24 text-center'; 
        castCard.innerHTML = `
            <img src="${IMAGE_BASE_URL}w185${member.profile_path}" alt="${member.name}" class="w-16 h-16 rounded-full object-cover mx-auto mb-2 border-2 border-gray-700">
            <p class="text-sm font-semibold text-white truncate">${member.name}</p>
            <p class="text-xs text-gray-400 truncate">${member.character || ''}</p>
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

// createMovieCard è per i "simili"
function createMovieCard(item) {
    const title = item.title || item.name || 'Titolo sconosciuto';
    const poster = item.poster_path ? `${IMAGE_BASE_URL}w300${item.poster_path}` : 'https://via.placeholder.com/300x450/222222/e0e0e0?text=Immagine+non+disponibile';
    const type = item.media_type || (item.title ? 'movie' : 'tv'); 

    const card = document.createElement('div');
    card.className = 'similar-card flex-shrink-0 w-40 md:w-48 rounded-lg overflow-hidden shadow-md transition-transform duration-200 hover:scale-105 cursor-pointer'; 
    card.innerHTML = `
        <a href="dettagli.html?id=${item.id}&type=${type}" class="block w-full">
            <img src="${poster}" alt="${title}" class="w-full h-auto object-cover rounded-md" loading="lazy" />
            <div class="p-2">
                <h3 class="font-semibold text-sm text-white truncate">${title}</h3>
            </div>
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
