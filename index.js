const API_KEY = '2d082597ab951b3a9596ca23e71413a8'; // <--- Cambia questa riga

async function getFilmData(id) {
  const response = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&language=it-IT`);
  if (!response.ok) throw new Error(`Errore TMDB per ID ${id}`);
  return await response.json();
}

async function mostraFilm(ids) {
  const contenitore = document.getElementById('contenitore');
  contenitore.innerHTML = ''; // Pulisce il contenuto precedente

  for (const id of ids) {
    try {
      const film = await getFilmData(id);

      const card = document.createElement('div');
      card.classList.add('card');

      card.innerHTML = `
        <img src="https://image.tmdb.org/t/p/w500${film.poster_path}" alt="${film.title}" />
        <h3>${film.title}</h3>
        <p>Anno: ${film.release_date?.slice(0, 4) || 'N/A'}</p>
        <p>Voto: ${film.vote_average.toFixed(1)} ⭐</p>
      `;

      contenitore.appendChild(card);
    } catch (err) {
      console.error(err);
    }
  }
}

document.getElementById('carica-film').addEventListener('click', async () => {
  const response = await fetch('/film.json');
  const filmIds = await response.json();
  mostraFilm(filmIds);
});

document.getElementById('carica-serie').addEventListener('click', async () => {
  const response = await fetch('/serie.json');
  const serieIds = await response.json();
  mostraFilm(serieIds); // puoi creare un mostraSerie separato se vuoi campi diversi
});
