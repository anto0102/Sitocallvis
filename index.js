const TMDB_API_KEY = 'INSERISCI_LA_TUA_API_KEY'; // opzionale

const carica = async (tipo) => {
  const container = document.getElementById('contenitore');
  container.innerHTML = 'Caricamento...';

  try {
    const urlOriginale = `https://vixsrc.to/api/list/${tipo}?lang=it`;
    const res = await fetch(`/api/proxy?url=${encodeURIComponent(urlOriginale)}`);

    if (!res.ok) throw new Error(`Errore HTTP: ${res.status}`);
    
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error("Risposta non valida: atteso un array.");

    container.innerHTML = '';
    for (let item of data) {
      const id = item.tmdb_id;
      const div = document.createElement('div');
      div.textContent = `TMDB ID: ${id}`;
      container.appendChild(div);

      // opzionale: carica dettagli
      if (TMDB_API_KEY !== 'INSERISCI_LA_TUA_API_KEY') {
        await caricaDettagliTMDB(id, container);
      }
    }

  } catch (error) {
    container.innerHTML = 'Errore durante il caricamento.';
    console.error("Errore:", error);
  }
};

// opzionale: fetch TMDB
const caricaDettagliTMDB = async (id, container) => {
  try {
    const res = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${TMDB_API_KEY}&language=it`);
    const dettagli = await res.json();
    const div = document.createElement('div');
    div.textContent = `Titolo: ${dettagli.title || dettagli.name}`;
    container.appendChild(div);
  } catch (e) {
    console.error("Errore nel caricamento dei dettagli TMDB:", e);
  }
};

// collega i pulsanti dopo il caricamento DOM
window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('carica-film').addEventListener('click', () => carica('movie'));
  document.getElementById('carica-serie').addEventListener('click', () => carica('tv'));
});
