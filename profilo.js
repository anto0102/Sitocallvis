// profilo.js

// Controlla se c’è un utente loggato
const userData = localStorage.getItem('user');
if (!userData) {
  window.location.href = 'login.html';
}

const user = JSON.parse(userData);

// Ora puoi mostrare i suoi dati nel profilo
document.getElementById('profile-username').textContent = user.username;
document.getElementById('account-username').textContent = user.username;
document.getElementById('account-email').textContent = user.email;

// Se hai un'immagine salvata, la imposti automaticamente:
// document.getElementById('profile-picture').src = user.imageUrl;
