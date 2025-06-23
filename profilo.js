// profilo.js

document.addEventListener('DOMContentLoaded', () => {
  const userData = localStorage.getItem('user');

  // Se non c'è utente loggato, reindirizza
  if (!userData) {
    window.location.href = 'login.html';
    return;
  }

  const user = JSON.parse(userData);

  // Popola i dati nel profilo
  document.getElementById('profile-username').textContent = user.username || 'Utente';
  document.getElementById('account-username').textContent = user.username || 'Utente';
  document.getElementById('account-email').textContent = user.email || 'utente@example.com';
  document.getElementById('account-subscription').textContent = user.subscription || 'Gratuito';
  document.getElementById('account-join-date').textContent = user.joinDate || 'Data sconosciuta';

  // Pulsanti login/logout visibilità
  const logoutBtn = document.querySelector('.btn-secondary');
  const loginBtn = document.querySelector('.btn-primary');
  
  if (logoutBtn) {
    logoutBtn.classList.remove('hidden');
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('user');
      window.location.href = 'login.html';
    });
  }

  if (loginBtn) {
    loginBtn.classList.add('hidden');
  }
});
