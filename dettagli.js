const API_KEY = "2d082597ab951b3a9596ca23e71413a8"; // La tua TMDB API key
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/';

const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get("id");
const tipo = urlParams.get("type"); // 'movie' or 'tv'

// Elementi della Hero Section
const detailHeroSection = document.getElementById("detail-hero-section");
const heroBackdrop = document.getElementById("hero-backdrop");
const detailPoster = document.getElementById("detail-poster");
const detailTitle = document.getElementById("detail-title");
const detailTagline = document.getElementById("detail-tagline");
const detailVote = document.getElementById("detail-vote");
const detailReleaseYear = document.getElementById("detail-release-year");
const detailRuntime = document.getElementById("detail-runtime");
const detailGenres = document.getElementById("detail-genres");
const detailOverview = document.getElementById("detail-overview");
const heroPlayBtn = detailHeroSection.querySelector('.play-btn');

// Elementi delle sezioni principali
const trailerPlayerContainer = document.getElementById("trailer-player-container");
const mainPlayerContainer = document.getElementById("main-player-container");
const episodesSection = document.getElementById("episodes-section");
const currentSeasonDisplay = document.getElementById("current-season-display");
const selezionaStagioneBtn = document.getElementById("seleziona-stagione-btn");
const episodesCarouselTrack = document.querySelector("#episodes-carousel .carousel-track");
const castCarouselTrack = document.querySelector("#cast-carousel .carousel-track");
const similarMoviesCarouselTrack = document.querySelector("#similar-movies-carousel .carousel-track");

// Elementi del Modal Stagioni
const seasonModal = document.getElementById("season-modal");
const closeModalBtn = document.querySelector("#season-modal .close-btn");
const seasonListModal = document.getElementById("season-list");

let allSeasons = []; // Array per memorizzare tutte le stagioni disponibili

if (!id || !tipo) {
    console.error("ID o tipo mancanti nell'URL. Reindirizzamento alla homepage.");
    window.location.href = "index.html"; // Reindirizza se i parametri sono mancanti
}

document.addEventListener('DOMContentLoaded', caricaDettagli);

async function caricaDettagli() {
    try {
        const res = await fetch(`${BASE_URL}/${tipo}/${id}?api_key=${API_KEY}&language=it-IT&append_to_response=credits,videos,recommendations,similar`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();

        // --- Popola Hero Section ---
        const title = data.title || data.name || "Titolo non disponibile";
        const overview = data.overview || "Nessuna descrizione disponibile.";
        const tagline = data.tagline || "";
        const posterPath = data.poster_path ? `${IMAGE_BASE_URL}w500${data.poster_path}` : 'https://via.placeholder.com/500x750/222222/e0e0e0?text=Poster';
        const backdropPath = data.backdrop_path ? `${IMAGE_BASE_URL}original${data.backdrop_path}` : posterPath; // Usa poster come fallback

        detailTitle.textContent = title;
        detailTagline.textContent = tagline;
        detailOverview.textContent = overview;
        detailPoster.src = posterPath;
        heroBackdrop.style.backgroundImage = `url(${backdropPath})`;

        detailVote.innerHTML = `⭐ ${data.vote_average ? data.vote_average.toFixed(1) : 'N/A'}`;
        detailReleaseYear.textContent = data.release_date ? data.release_date.substring(0, 4) : (data.first_air_date ? data.first_air_date.substring(0, 4) : 'Anno N/A');
        
        // Durata/Runtime
        let runtimeText = 'N/A';
        if (tipo === 'movie' && data.runtime) {
            runtimeText = `${data.runtime} min`;
        } else if (tipo === 'tv' && data.episode_run_time && data.episode_run_time.length > 0) {
            runtimeText = `${data.episode_run_time[0]} min/episodio`;
        }
        detailRuntime.textContent = runtimeText;

        detailGenres.textContent = data.genres?.map(g => g.name).join(" / ") || "Generi N/A";

        // --- Logica per i pulsanti Riproduci/Aggiungi Lista (semplificati per ora) ---
        heroPlayBtn.onclick = () => {
            mainPlayerContainer.scrollIntoView({ behavior: "smooth", block: "start" });
            if (tipo === 'movie') {
                aggiungiPlayerFilm(id);
            }
            // Per le serie TV, il player verrà aggiornato al caricamento episodi
        };
        // Per il pulsante "La mia lista" puoi aggiungere una logica qui
        document.querySelector('.add-to-list-btn').onclick = () => {
            alert('Funzione "Aggiungi alla lista" non ancora implementata.');
        };


        // --- Trailer ---
        await caricaTrailer(data.videos);

        // --- Cast ---
        await caricaCast(data.credits);

        // --- Contenuti Simili ---
        await caricaSimilarContent(data.recommendations || data.similar);


        // --- Gestione Serie TV vs Film ---
        if (tipo === "tv") {
            episodesSection.classList.remove('hidden'); // Mostra la sezione episodi
            selezionaStagioneBtn.style.display = "inline-flex";
            allSeasons = data.seasons.filter(s => s.season_number > 0);
            allSeasons.sort((a,b) => a.season_number - b.season_number); // Ordina le stagioni
            
            // Carica la prima stagione disponibile o la stagione 1
            const firstSeasonToLoad = allSeasons.find(s => s.season_number === 1) || allSeasons[0];
            if (firstSeasonToLoad) {
                await caricaEpisodi(id, firstSeasonToLoad.season_number);
            } else {
                episodesCarouselTrack.innerHTML = `<p class="text-gray-400 text-center w-full">Nessuna stagione disponibile.</p>`;
                mainPlayerContainer.innerHTML = `<p class="text-gray-400 text-center">Nessun episodio riproducibile per questa serie.</p>`;
            }
        } else {
            episodesSection.classList.add('hidden'); // Nasconde la sezione episodi per i film
            selezionaStagioneBtn.style.display = "none";
            aggiungiPlayerFilm(id); // Carica il player per i film immediatamente
        }

    } catch (error) {
        console.error("Errore nel caricamento dei dettagli:", error);
        detailHeroSection.innerHTML = `<p class="text-center text-red-500 text-xl w-full">Impossibile caricare i dettagli del contenuto. Riprova più tardi.</p>`;
        // Nascondi le altre sezioni in caso di errore critico
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
            <iframe src="youtube.com/embed/{trailer.key}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
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
    castCarouselTrack.innerHTML = ''; // Pulisci i vecchi elementi

    // Prendi i primi 10-15 membri del cast con un'immagine
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
    similarMoviesCarouselTrack.innerHTML = ''; // Pulisci i vecchi elementi

    const filteredContent = relatedContentData.results.filter(item => item.poster_path).slice(0, 20); // Limita a 20 simili

    if (filteredContent.length === 0) {
        document.getElementById('similar-content-section').classList.add('hidden');
        return;
    }

    filteredContent.forEach(item => {
        const movieCard = createMovieCard(item); // Riutilizza la funzione della homepage per le card
        similarMoviesCarouselTrack.appendChild(movieCard);
    });
}

// Riutilizza la funzione createMovieCard dalla homepage (copiala anche qui per self-containment)
function createMovieCard(item) {
    const title = item.title || item.name || 'Titolo sconosciuto';
    const poster = item.poster_path ? `${IMAGE_BASE_URL}w300${item.poster_path}` : 'https://via.placeholder.com/300x450/222222/e0e0e0?text=Immagine+non+disponibile';
    const type = item.media_type || (item.title ? 'movie' : 'tv'); // Indovina il tipo se non esplicito

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
    // Popola la lista delle stagioni nel modal
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
    seasonModal.style.display = 'flex'; // Mostra il modal
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
    currentSeasonDisplay.textContent = `(Stagione ${seasonNumber})`; // Aggiorna il titolo

    const res = await fetch(`${BASE_URL}/tv/${tvId}/season/${seasonNumber}?api_key=${API_KEY}&language=it-IT`);
    const data = await res.json();

    episodesCarouselTrack.innerHTML = ''; // Pulisci i vecchi episodi

    if (!data.episodes || data.episodes.length === 0) {
        episodesCarouselTrack.innerHTML = `<p class="text-gray-400 text-center w-full py-10">Nessun episodio disponibile per questa stagione.</p>`;
        mainPlayerContainer.innerHTML = `<p class="text-gray-400 text-center py-10">Nessun episodio riproducibile per questa stagione.</p>`;
        return;
    }

    let firstEpisodeLoaded = false;
    data.episodes.forEach(episode => {
        const episodeCard = document.createElement('div');
        episodeCard.className = 'episode-card'; // Classe per lo stile
        
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

        if (!firstEpisodeLoaded) { // Carica il primo episodio disponibile nel player
            aggiornaPlayerSeries(tvId, seasonNumber, episode.episode_number);
            firstEpisodeLoaded = true;
        }
    });
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
    const scrollAmount = carouselContainer.querySelector("." + (carouselId === 'cast-carousel' ? 'cast-card' : (carouselId === 'episodes-carousel' ? 'episode-card' : 'movie-card')) )?.offsetWidth * 3 || 600; // Calcola in base al tipo di card
    carouselContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
}

function scrollLeft(carouselId) {
    const carouselContainer = document.getElementById(carouselId);
    if (!carouselContainer) {
        console.error(`Carousel container not found for ID: ${carouselId}`);
        return;
    }
    const scrollAmount = carouselContainer.querySelector("." + (carouselId === 'cast-carousel' ? 'cast-card' : (carouselId === 'episodes-carousel' ? 'episode-card' : 'movie-card')) )?.offsetWidth * 3 || 600; // Calcola in base al tipo di card
    carouselContainer.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
}
