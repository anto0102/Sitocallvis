document.addEventListener('DOMContentLoaded', () => {
  // Funzione per recuperare i dati dell'utente dal localStorage o usare un placeholder
  const getInitialUserData = () => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      return JSON.parse(storedUser);
    }
    // Dati placeholder se nessun utente è loggato
    return {
      username: 'Ospite',
      email: 'ospite@example.com',
      subscription: 'Nessuno',
      joinDate: 'N/A',
      description: 'Benvenuto nel tuo profilo StreamVerse! Accedi per personalizzare la tua esperienza.',
      profileImg: 'https://via.placeholder.com/150x150/555555/e0e0e0?text=👤'
    };
  };

  let currentUserData = getInitialUserData();

  // Se non c'è un utente loggato, reindirizza (se la pagina è strettamente per utenti loggati)
  // Nota: ho commentato il reindirizzamento per permettere di vedere la pagina anche da non loggati con dati placeholder.
  // if (currentUserData.username === 'Ospite' && window.location.pathname.includes('profilo.html')) {
  //   window.location.href = 'login.html';
  //   return;
  // }

  // Riferimenti agli elementi HTML del profilo
  const profilePicture = document.getElementById('profile-picture');
  const profileUsernameDisplay = document.getElementById('profile-username'); // Il titolo h1 del profilo
  const profileDescriptionDisplay = document.getElementById('profile-description');
  const editProfileBtn = document.querySelector('.edit-profile-btn');

  // Elementi del recap account
  const accountUsernameDisplay = document.getElementById('account-username');
  const accountEmailDisplay = document.getElementById('account-email');
  const accountSubscriptionDisplay = document.getElementById('account-subscription');
  const accountJoinDateDisplay = document.getElementById('account-join-date');

  // Pulsanti login/logout nella navbar
  const logoutBtn = document.querySelector('#auth-area .btn-secondary'); // Seleziona quello specifico
  const loginBtn = document.querySelector('#auth-area .btn-primary');    // Seleziona quello specifico

  // Funzione per renderizzare/aggiornare i dati del profilo sulla pagina
  const renderProfile = () => {
    profilePicture.src = currentUserData.profileImg;
    profileUsernameDisplay.textContent = currentUserData.username;
    profileDescriptionDisplay.textContent = currentUserData.description;
    
    if (accountUsernameDisplay) accountUsernameDisplay.textContent = currentUserData.username;
    if (accountEmailDisplay) accountEmailDisplay.textContent = currentUserData.email;
    if (accountSubscriptionDisplay) accountSubscriptionDisplay.textContent = currentUserData.subscription;
    if (accountJoinDateDisplay) accountJoinDateDisplay.textContent = currentUserData.joinDate;
  };

  // Gestione del click sul pulsante "Modifica Profilo"
  if (editProfileBtn) {
    editProfileBtn.addEventListener('click', () => {
      // Chiedi all'utente il nuovo nome utente
      const newUsername = prompt('Inserisci il nuovo nome utente:', currentUserData.username);
      if (newUsername !== null && newUsername.trim() !== '') {
        currentUserData.username = newUsername.trim();
      }

      // Chiedi all'utente la nuova descrizione
      // Ho reso l'input più user-friendly usando un textarea con più spazio per testi lunghi
      const newDescription = prompt('Inserisci la nuova descrizione:', currentUserData.description);
      if (newDescription !== null) { 
        currentUserData.description = newDescription.trim();
      }

      // Chiedi all'utente l'URL della nuova immagine profilo
      const newProfileImg = prompt('Inserisci l\'URL della nuova immagine profilo:', currentUserData.profileImg);
      if (newProfileImg !== null && newProfileImg.trim() !== '') {
        currentUserData.profileImg = newProfileImg.trim();
      } else if (newProfileImg === "") { 
        currentUserData.profileImg = "https://via.placeholder.com/150x150/555555/e0e0e0?text=👤"; // Placeholder di default se cancellato
      }

      // Salva i dati aggiornati nel localStorage
      localStorage.setItem('user', JSON.stringify(currentUserData));
      renderProfile(); // Aggiorna il profilo sulla pagina
      alert('Profilo aggiornato! (Queste modifiche sono persistenti nel browser, ma non su un server.)');
    });
  }

  // Gestione della visibilità dei pulsanti di login/logout nella navbar
  if (currentUserData.username !== 'Ospite') { // Se un utente è "loggato" (non è l'ospite placeholder)
    if (loginBtn) loginBtn.classList.add('hidden');
    if (logoutBtn) logoutBtn.classList.remove('hidden');
  } else { // Utente ospite
    if (loginBtn) loginBtn.classList.remove('hidden');
    if (logoutBtn) logoutBtn.classList.add('hidden');
  }

  // Logica per il pulsante Logout
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('user'); // Rimuovi i dati utente
      // Reindirizza o aggiorna la pagina per mostrare lo stato di non loggato
      window.location.reload(); // Ricarica per resettare lo stato dei pulsanti e dati
    });
  }

  // Chiamata iniziale per visualizzare i dati del profilo al caricamento della pagina
  renderProfile();

  // --- Logica per la visibilità delle frecce del carosello "La mia lista" ---
  // Questa parte è riadattata dalla logica delle frecce della homepage
  const myListCarousel = document.getElementById('my-list-carousel');
  if (myListCarousel) {
      const scrollLeftBtn = myListCarousel.querySelector('.scroll-btn.scroll-left');
      const scrollRightBtn = myListCarousel.querySelector('.scroll-btn.scroll-right');
      const carouselTrack = myListCarousel.querySelector('.carousel-track');

      const updateMyListArrowsVisibility = () => {
          const tolerance = 5; // Pixels di tolleranza per l'inizio/fine dello scroll
          const scrollEnd = carouselTrack.scrollWidth - carouselTrack.clientWidth;

          // Freccia sinistra (indietro)
          if (scrollLeftBtn && carouselTrack.scrollLeft > tolerance) {
              scrollLeftBtn.classList.add('show-arrow');
              scrollLeftBtn.classList.remove('hide-arrow');
          } else if (scrollLeftBtn) {
              scrollLeftBtn.classList.add('hide-arrow');
              scrollLeftBtn.classList.remove('show-arrow');
          }

          // Freccia destra (avanti)
          if (scrollRightBtn && carouselTrack.scrollWidth > carouselTrack.clientWidth + tolerance && carouselTrack.scrollLeft < scrollEnd - tolerance) {
              scrollRightBtn.classList.add('show-arrow');
              scrollRightBtn.classList.remove('hide-arrow');
          } else if (scrollRightBtn) {
              scrollRightBtn.classList.add('hide-arrow');
              scrollRightBtn.classList.remove('show-arrow');
          }
      };

      // Aggiorna la visibilità delle frecce quando il carosello scorre
      carouselTrack.addEventListener('scroll', () => {
          requestAnimationFrame(updateMyListArrowsVisibility);
      });
      // Aggiorna la visibilità delle frecce quando la finestra viene ridimensionata
      window.addEventListener('resize', () => {
          requestAnimationFrame(updateMyListArrowsVisibility);
      });
      
      // Chiamata iniziale per impostare la visibilità delle frecce al caricamento della pagina
      setTimeout(updateMyListArrowsVisibility, 100); 
  }
});
