const API_KEY = ""; // Inserisci la tua TMDB API key qui
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/';

const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get("id");
const tipo = urlParams.get("type");

if (!id || !tipo) {
    console.error("ID o tipo mancanti nell'URL. Reindirizzamento alla homepage.");
    window.location.href = "index.html";
}

document.addEventListener('DOMContentLoaded', caricaDettagli);

async function caricaDettagli() {
    try {
        const res = await fetch(`${BASE_URL}/${tipo}/${id}?api_key=${API_KEY}&language=it-IT&append_to_response=credits,videos,recommendations,similar`);
        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(`Errore API TMDb: ${res.status} - ${errorData.status_message || res.statusText}`);
        }
        const data = await res.json();

        // Popola titolo, descrizione, immagine ecc.
        document.getElementById("detail-title").textContent = data.title || data.name || "Titolo non disponibile";
        document.getElementById("detail-overview-full").textContent = data.overview || "Nessuna descrizione disponibile.";
        document.getElementById("detail-poster").src = data.poster_path ? `${IMAGE_BASE_URL}w500${data.poster_path}` : 'https://via.placeholder.com/500x750/222222/e0e0e0?text=Poster+Non+Trovato';

        const background = data.backdrop_path ? `${IMAGE_BASE_URL}original${data.backdrop_path}` : null;
        if (background) document.getElementById("hero-backdrop-img").style.backgroundImage = `url(${background})`;

        document.getElementById("detail-tagline").textContent = data.tagline || "";
        document.getElementById("detail-vote").innerHTML = `⭐ ${data.vote_average ? data.vote_average.toFixed(1) : 'N/A'}`;

        const year = data.release_date || data.first_air_date;
        document.getElementById("detail-release-year").textContent = year ? new Date(year).getFullYear() : "N/A";

        const runtime = tipo === 'movie' ? data.runtime : (data.episode_run_time && data.episode_run_time[0]);
        document.getElementById("detail-runtime").textContent = runtime ? `${runtime} min` : "N/A";

        document.getElementById("detail-genres").textContent = data.genres?.map(g => g.name).join(" / ") || "Generi N/A";

        // Sezioni opzionali (views e stagioni)
        if (data.vote_count) {
            document.getElementById("detail-views").textContent = `${(data.vote_count / 1000000).toFixed(1)}M views`;
        }

        if (tipo === "tv" && data.number_of_seasons) {
            document.getElementById("detail-seasons").textContent = `${data.number_of_seasons} stagioni`;
        }

        // Trailer
        const trailerKey = trovaTrailer(data.videos);
        if (trailerKey) {
            const trailerContainer = document.getElementById("trailer-player-container");
            trailerContainer.innerHTML = `<iframe src="https://www.youtube.com/embed/${trailerKey}" frameborder="0" allowfullscreen></iframe>`;
            document.getElementById("trailer-section").classList.remove("hidden");
        }

    } catch (err) {
        console.error("Errore durante il caricamento dei dettagli:", err);
        document.body.innerHTML = `<div style="color: red; text-align: center; margin-top: 100px;">
            <h1>Errore: Contenuto non disponibile</h1>
            <p>${err.message}</p>
            <a href="index.html">Torna alla Home</a>
        </div>`;
    }
}

function trovaTrailer(videosData) {
    if (!videosData || !videosData.results || videosData.results.length === 0) return null;

    const trailer = videosData.results.find(v => v.type === "Trailer" && v.site === "YouTube")
        || videosData.results.find(v => v.type === "Teaser" && v.site === "YouTube");

    return trailer ? trailer.key : null;
}
