const API_KEY = '2d082597ab951b3a9596ca23e71413a8'; // La tua chiave TMDb - RICORDATI DI METTERE QUI LA TUA VERA CHIAVE API
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/';

const categories = [
    { id: 'consigliati', url: '/movie/top_rated', title: '🍿 Consigliati' },
    { id: 'momento', url: '/trending/movie/day', title: '🔥 Titoli del momento' },
    { id: 'drammatici', url: '/discover/movie?with_genres=18', title: '🎭 Drammatici' },
    { id: 'azione', url: '/discover/movie?with_genres=28', title: '💥 Azione' },
    { id: 'commedie', url: '/discover/movie?with_genres=35', title: '😂 Commedie' },
    { id: 'horror', url: '/discover/movie?with_genres=27', title: '👻 Horror' },
    { id: 'famiglia', url: '/discover/movie?with_genres=10751', title: '👨‍👩‍👧 Famiglia' },
    { id: 'fantascienza', url: '/discover/movie?with_genres=878', title: '🚀 Fantascienza' },
    { id: 'romantici', url: '/discover/movie?with_genres=10749', title: '💖 Romantici' },
    { id: 'documentari', url: '/discover/movie?with_genres=99', title: '🎬 Documentari' },
];

// Funzione per creare una card film aggiornata con lo stile al hover
function createMovieCard(item) {
    const title = item.title || item.name || 'Titolo sconosciuto';
    // Utilizza w300 per le miniature per un buon equilibrio tra qualità e performance
    const poster = item.poster_path ? `${IMAGE_BASE_URL}w300${item.poster_path}` : 'https://via.placeholder.com/300x450/222222/e0e0e0?text=Immagine+non+disponibile';
    const type = item.media_type || 'movie';
    const overview = item.overview && item.overview.length > 150 ? item.overview.substring(0, 147) + '...' : item.overview || 'Nessuna descrizione disponibile.';
    const voteAverage = item.vote_average ? item.vote_average.toFixed(1) : 'N/A';

    const card = document.createElement('div');
    card.className = 'movie-card'; // Applica la nuova classe CSS
    card.innerHTML = `
        <a href="dettagli.html?id=${item.id}&type=${type}" class="block w-full h-full relative">
            <img src="${poster}" alt="${title}" class="w-full h-full object-cover rounded-md" loading="lazy" />
            <div class="card-info">
                <h3>${title}</h3>
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
        const trendingMovies = await fetchMovies('/trending/movie/week'); // Prendiamo i trending della settimana
        if (trendingMovies.length === 0) {
            console.warn("Nessun film in tendenza trovato per la Hero Section.");
            return;
        }
        
        // Scegli un film casuale tra i primi 5 per la Hero
        const randomIndex = Math.floor(Math.random() * Math.min(5, trendingMovies.length));
        const featuredMovie = trendingMovies[randomIndex];

        if (featuredMovie && featuredMovie.backdrop_path) {
            heroBackdrop.style.backgroundImage = `url(${IMAGE_BASE_URL}original${featuredMovie.backdrop_path})`;
            heroBackdrop.style.transition = 'var(--hero-backdrop-transition)'; 
            heroTitle.textContent = featuredMovie.title || featuredMovie.name;
            
            // --- MODIFICA QUI: TRONCAMENTO DESCRIZIONE HERO ---
            let synopsis = featuredMovie.overview || 'Una breve sinossi accattivante che introduce il film o la serie del momento. Azione, avventura, dramma e tanto altro ti aspettano!';
            const MAX_HERO_SYNOPSIS_LENGTH = 180; // Definisci un limite di caratteri, puoi adattarlo
            if (synopsis.length > MAX_HERO_SYNOPSIS_LENGTH) {
                synopsis = synopsis.substring(0, MAX_HERO_SYNOPSIS_LENGTH) + '...';
            }
            heroSinopsis.textContent = synopsis;
            // --- FINE MODIFICA ---

            // Aggiorna i link dei bottoni
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
}

document.addEventListener('DOMContentLoaded', loadMovies);


// Gestione della ricerca - AGGIORNATA PER NUOVE CLASSI E STRUTTURA
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
    // Genera la nuova struttura per i risultati di ricerca
    main.innerHTML = `
        <section class="search-results-section relative px-8 pt-24 pb-8">
            <h2 class="text-4xl font-bold mb-8 text-white">🔍 Risultati per "${query}"</h2>
            <div class="space-y-12">
                <div class="group relative"> <h3 class="text-2xl font-semibold mb-4 text-white">🎬 Film</h3>
                    <div class="carousel-container overflow-x-auto scroll-smooth hide-scrollbar pb-6">
                        <div class="carousel-track flex gap-4" id="search-movies"></div>
                    </div>
                    <button class="scroll-btn scroll-right opacity-0 group-hover:opacity-100 right-0" onclick="scrollRight('search-movies')">❯</button>
                    <button class="scroll-btn scroll-left opacity-0 group-hover:opacity-100 left-0" onclick="scrollLeft('search-movies')">❮</button>
                </div>
                <div class="group relative"> <h3 class="text-2xl font-semibold mb-4 text-white">📺 Serie TV</h3>
                    <div class="carousel-container overflow-x-auto scroll-smooth hide-scrollbar pb-6">
                        <div class="carousel-track flex gap-4" id="search-series"></div>
                    </div>
                    <button class="scroll-btn scroll-right opacity-0 group-hover:opacity-100 right-0" onclick="scrollRight('search-series')">❯</button>
                    <button class="scroll-btn scroll-left opacity-0 group-hover:opacity-100 left-0" onclick="scrollLeft('search-series')">❮</button>
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
});

// Funzioni di scroll per i caroselli - CORRETTE per puntare ai carousel-container
function scrollRight(containerId) {
    // Cerchiamo direttamente l'elemento che ha overflow-x: scroll, che è .carousel-container
    const carouselContainer = document.getElementById(containerId).closest('.carousel-container');
    if (!carouselContainer) {
        console.error(`Carousel container not found for ID: ${containerId}`);
        return;
    }
    const scrollAmount = carouselContainer.querySelector(".movie-card")?.offsetWidth * 3 || 600; // Scorre di 3 card alla volta
    carouselContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
}

function scrollLeft(containerId) {
    // Cerchiamo direttamente l'elemento che ha overflow-x: scroll, che è .carousel-container
    const carouselContainer = document.getElementById(containerId).closest('.carousel-container');
    if (!carouselContainer) {
        console.error(`Carousel container not found for ID: ${containerId}`);
        return;
    }
    const scrollAmount = carouselContainer.querySelector(".movie-card")?.offsetWidth * 3 || 600; // Scorre di 3 card alla volta
    carouselContainer.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
}
