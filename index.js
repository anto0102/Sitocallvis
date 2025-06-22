const API_KEY = '2d082597ab951b3a9596ca23e71413a8'; // La tua chiave TMDb
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/';

const categories = [
    { id: 'consigliati', url: '/movie/top_rated', title: '🍿 Consigliati' },
    { id: 'momento', url: '/trending/movie/week', title: '🔥 Titoli del momento' }, 
    { id: 'drammatici', url: '/discover/movie?with_genres=18', title: '🎭 Drammatici' },
    { id: 'azione', url: '/discover/movie?with_genres=28', title: '💥 Azione' },
    { id: 'commedie', url: '/discover/movie?with_genres=35', title: '😂 Commedie' },
    { id: 'horror', url: '/discover/movie?with_genres=27', title: '👻 Horror' },
    { id: 'famiglia', url: '/discover/movie?with_genres=10751', title: '👨‍👩‍👧 Famiglia' },
    { id: 'fantascienza', url: '/discover/movie?with_genres=878', title: '🚀 Fantascienza' },
    { id: 'romantici', url: '/discover/movie?with_genres=10749', title: '💖 Romantici' },
    { id: 'documentari', url: '/discover/movie?with_genres=99', title: '🎬 Documentari' },
];

// Funzione per creare una card film aggiornata con il titolo sotto
function createMovieCard(item) {
    const title = item.title || item.name || 'Titolo sconosciuto';
    const poster = item.poster_path ? `${IMAGE_BASE_URL}w300${item.poster_path}` : 'https://via.placeholder.com/300x450/222222/e0e0e0?text=Immagine+non+disponibile';
    const type = item.media_type || 'movie';
    const overview = item.overview && item.overview.length > 150 ? item.overview.substring(0, 147) + '...' : item.overview || 'Nessuna descrizione disponibile.';
    const voteAverage = item.vote_average ? item.vote_average.toFixed(1) : 'N/A';

    const card = document.createElement('div');
    card.className = 'movie-card'; 
    card.innerHTML = `
        <a href="dettagli.html?id=${item.id}&type=${type}" class="block w-full h-full">
            <img src="${poster}" alt="${title}" class="w-full h-auto object-cover rounded-md" loading="lazy" />
            <div class="movie-card-title-section p-2">
                <h3 class="font-semibold text-sm text-white truncate">${title}</h3>
            </div>
            <div class="card-info">
                <p>⭐ ${voteAverage} | ${type === 'movie' ? 'Film' : 'Serie TV'}</p>
                <p class="text-sm text-gray-400 mt-2">${overview}</p>
                <div class="card-actions mt-4">
                    <button class="card-action-btn play-card-btn" title="Riproduci">▶</button>
                    <button class="card-action-btn info-card-btn" title="Maggiori info">ℹ</button>
                </div>
            </div>
        </a>
    `;
    return card;
}

// Funzione per impostare la Hero Section
async function setHeroSection() {
    const heroSection = document.getElementById('hero-section');
    const heroBackdrop = heroSection.querySelector('.hero-backdrop');
    const heroTitle = heroSection.querySelector('h1');
    const heroSinopsis = heroSection.querySelector('p');
    const playBtn = heroSection.querySelector('.play-btn');
    const infoBtn = heroSection.querySelector('.info-btn');

    try {
        const trendingMovies = await fetchMovies('/trending/movie/week'); 
        if (trendingMovies.length === 0) {
            console.warn("Nessun film in tendenza trovato per la Hero Section.");
            return;
        }
        
        const randomIndex = Math.floor(Math.random() * Math.min(5, trendingMovies.length));
        const featuredMovie = trendingMovies[randomIndex];

        if (featuredMovie && featuredMovie.backdrop_path) {
            heroBackdrop.style.backgroundImage = `url(${IMAGE_BASE_URL}original${featuredMovie.backdrop_path})`;
            heroBackdrop.style.transition = 'var(--hero-backdrop-transition)'; 
            heroTitle.textContent = featuredMovie.title || featuredMovie.name;
            
            let synopsis = featuredMovie.overview || 'Una breve sinossi accattivante che introduce il film o la serie del momento. Azione, avventura, dramma e tanto altro ti aspettano!';
            const MAX_HERO_SYNOPSIS_LENGTH = 180; 
            if (synopsis.length > MAX_HERO_SYNOPSIS_LENGTH) {
                synopsis = synopsis.substring(0, MAX_HERO_SYNOPSIS_LENGTH) + '...';
            }
            heroSinopsis.textContent = synopsis;

            playBtn.onclick = () => window.location.href = `dettagli.html?id=${featuredMovie.id}&type=${featuredMovie.media_type || 'movie'}`;
            infoBtn.onclick = () => window.location.href = `dettagli.html?id=${featuredMovie.id}&type=${featuredMovie.media_type || 'movie'}`;
        } else {
            console.warn("Immagine di sfondo per la Hero non disponibile per il film selezionato.");
        }
    } catch (error) {
        console.error("Errore nel caricamento della Hero Section:", error);
    }
}


// Funzione per caricare i film nelle varie categorie
async function fetchMovies(endpoint) {
    const page = Math.floor(Math.random() * 5) + 1; 
    const url = `${BASE_URL}${endpoint}${endpoint.includes('?') ? '&' : '?'}api_key=${API_KEY}&language=it-IT&page=${page}`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.results || [];
}

async function loadMovies() {
    await setHeroSection(); 

    for (const category of categories) {
        const container = document.getElementById(category.id);
        if (!container) continue;

        container.innerHTML = '<p class="text-gray-400">Caricamento...</p>';

        try {
            const movies = await fetchMovies(category.url);
            container.innerHTML = ''; 

            const filteredMovies = movies
                .filter(movie => movie.poster_path)
                .slice(0, 15); 

            if (filteredMovies.length === 0) {
                container.innerHTML = '<p class="text-gray-500">Nessun contenuto disponibile.</p>';
            } else {
                filteredMovies.forEach(movie => container.appendChild(createMovieCard(movie)));
            }
        } catch (err) {
            console.error(`Errore nel caricamento della categoria ${category.id}:`, err);
            container.innerHTML = '<p class="text-red-500">Errore nel caricamento dei contenuti.</p>';
        }
    }
    setupCarouselArrowVisibilityListeners(); // <--- CHIAMATA IMPORTANTE PER INIZIALIZZARE LE FRECCE DOPO IL CARICAMENTO
}

document.addEventListener('DOMContentLoaded', loadMovies);


// Gestione della ricerca
document.getElementById('search-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const query = document.getElementById('search-input').value.trim();
    if (!query) return;

    const response = await fetch(`${BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(query)}&language=it-IT`);
    if (!response.ok) {
        console.error("Errore nella ricerca:", response.statusText);
        return;
    }
    const data = await response.json();
    const results = (data.results || []).filter(item => (item.media_type === 'movie' || item.media_type === 'tv') && item.poster_path);

    results.sort((a, b) => {
        const q = query.toLowerCase();
        const aTitle = (a.title || a.name || '').toLowerCase();
        const bTitle = (b.title || b.name || '').toLowerCase();
        return (aTitle === q ? -1 : 0) + (bTitle === q ? 1 : 0) || b.popularity - a.popularity;
    });

    const movies = results.filter(r => r.media_type === 'movie');
    const series = results.filter(r => r.media_type === 'tv');

    const main = document.getElementById('main-content');
    main.innerHTML = `
        <section class="search-results-section relative px-8 pt-24 pb-8">
            <h2 class="text-4xl font-bold mb-8 text-white">🔍 Risultati per "${query}"</h2>
            <div class="space-y-12">
                <div class="group relative"> <h3 class="text-2xl font-semibold mb-4 text-white">🎬 Film</h3>
                    <div class="carousel-container overflow-x-auto scroll-smooth hide-scrollbar pb-6">
                        <div class="carousel-track flex gap-4" id="search-movies"></div>
                    </div>
                    <button class="scroll-btn scroll-right" onclick="scrollRight('search-movies')">❯</button>
                    <button class="scroll-btn scroll-left" onclick="scrollLeft('search-movies')">❮</button>
                </div>
                <div class="group relative"> <h3 class="text-2xl font-semibold mb-4 text-white">📺 Serie TV</h3>
                    <div class="carousel-container overflow-x-auto scroll-smooth hide-scrollbar pb-6">
                        <div class="carousel-track flex gap-4" id="search-series"></div>
                    </div>
                    <button class="scroll-btn scroll-right" onclick="scrollRight('search-series')">❯</button>
                    <button class="scroll-btn scroll-left" onclick="scrollLeft('search-series')">❮</button>
                </div>
            </div>
        </section>
    `;

    const movieContainer = document.getElementById('search-movies');
    const seriesContainer = document.getElementById('search-series');

    if (movies.length === 0) {
        movieContainer.innerHTML = '<p class="text-gray-500 text-center w-full">Nessun film trovato.</p>';
    } else {
        movies.forEach(movie => movieContainer.appendChild(createMovieCard(movie)));
    }

    if (series.length === 0) {
        seriesContainer.innerHTML = '<p class="text-gray-500 text-center w-full">Nessuna serie TV trovata.</p>';
    } else {
        series.forEach(serie => seriesContainer.appendChild(createMovieCard(serie)));
    }
    setupCarouselArrowVisibilityListeners(); // <--- CHIAMATA PER INIZIALIZZARE LE FRECCE SUI RISULTATI DI RICERCA
});

// Funzioni di scroll per i caroselli
function scrollRight(containerId) {
    const carouselContainer = document.getElementById(containerId).closest('.carousel-container');
    if (!carouselContainer) {
        console.error(`Carousel container not found for ID: ${containerId}`);
        return;
    }
    const scrollAmount = carouselContainer.querySelector(".movie-card")?.offsetWidth * 3 || 600; 
    carouselContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
}

function scrollLeft(containerId) {
    const carouselContainer = document.getElementById(containerId).closest('.carousel-container');
    if (!carouselContainer) {
        console.error(`Carousel container not found for ID: ${containerId}`);
        return;
    }
    const scrollAmount = carouselContainer.querySelector(".movie-card")?.offsetWidth * 3 || 600; 
    carouselContainer.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
}

// --- NUOVE FUNZIONI PER GESTIONE VISIBILITÀ FRECCE CAROSELLO ---

// Funzione per aggiornare la visibilità delle frecce (chiamata su scroll e all'inizio)
function updateCarouselArrowsVisibility(carouselContainer) {
    const scrollLeftBtn = carouselContainer.querySelector('.scroll-btn.scroll-left');
    const scrollRightBtn = carouselContainer.querySelector('.scroll-btn.scroll-right');

    if (!scrollLeftBtn || !scrollRightBtn) return;

    const toggleArrows = () => {
        const tolerance = 5; // Pixels di tolleranza per l'inizio/fine dello scroll
        const scrollEnd = carouselContainer.scrollWidth - carouselContainer.clientWidth;

        // Freccia sinistra (indietro)
        if (carouselContainer.scrollLeft > tolerance) {
            scrollLeftBtn.classList.remove('hide-arrow');
            scrollLeftBtn.classList.add('show-arrow');
            // scrollLeftBtn.style.pointerEvents = 'auto'; // Gestito da CSS :hover
        } else {
            scrollLeftBtn.classList.remove('show-arrow');
            scrollLeftBtn.classList.add('hide-arrow');
            // scrollLeftBtn.style.pointerEvents = 'none'; // Gestito da CSS :hover
        }

        // Freccia destra (avanti)
        // Mostra solo se c'è contenuto scorrevole e non siamo alla fine
        if (carouselContainer.scrollWidth > carouselContainer.clientWidth + tolerance && carouselContainer.scrollLeft < scrollEnd - tolerance) {
            scrollRightBtn.classList.remove('hide-arrow');
            scrollRightBtn.classList.add('show-arrow');
            // scrollRightBtn.style.pointerEvents = 'auto'; // Gestito da CSS :hover
        } else {
            scrollRightBtn.classList.remove('show-arrow');
            scrollRightBtn.classList.add('hide-arrow');
            // scrollRightBtn.style.pointerEvents = 'none'; // Gestito da CSS :hover
        }
    };

    // Imposta la visibilità iniziale
    toggleArrows(); 

    // Aggiungi un listener di scroll con debounce
    let scrollTimeout;
    carouselContainer.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(toggleArrows, 150); 
    });
}

// Funzione per inizializzare la visibilità delle frecce per TUTTI i caroselli
function setupCarouselArrowVisibilityListeners() {
    // Caroselli delle categorie principali
    categories.forEach(category => {
        const carouselContainer = document.getElementById(category.id)?.closest('.carousel-container');
        if (carouselContainer) {
            updateCarouselArrowsVisibility(carouselContainer);
        }
    });

    // Caroselli dei risultati di ricerca (se presenti)
    const searchMoviesCarousel = document.getElementById('search-movies')?.closest('.carousel-container');
    if (searchMoviesCarousel) {
        updateCarouselArrowsVisibility(searchMoviesCarousel);
    }
    const searchSeriesCarousel = document.getElementById('search-series')?.closest('.carousel-container');
    if (searchSeriesCarousel) {
        updateCarouselArrowsVisibility(searchSeriesCarousel);
    }
}
