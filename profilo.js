// profilo.js

document.addEventListener('DOMContentLoaded', () => {
  // Verifica se l'utente è loggato
  const userData = localStorage.getItem('user');
  if (!userData) {
    window.location.href = 'login.html';
    return;
  }

  const user = JSON.parse(userData);

  // Popola le informazioni del profilo
  const profileUsername = document.getElementById('profile-username');
  const accountUsername = document.getElementById('account-username');
  const accountEmail = document.getElementById('account-email');
  const accountSubscription = document.getElementById('account-subscription');
  const accountJoinDate = document.getElementById('account-join-date');

  if (profileUsername) profileUsername.textContent = user.username || "Utente";
  if (accountUsername) accountUsername.textContent = user.username || "Utente";
  if (accountEmail) accountEmail.textContent = user.email || "email@example.com";
  if (accountSubscription) accountSubscription.textContent = user.subscription || "Gratuito";
  if (accountJoinDate) accountJoinDate.textContent = user.joinDate || "Data sconosciuta";

  // Mostra/nasconde i pulsanti di login/logout
  const logoutBtn = document.getElementById('logout-btn');
  const loginBtn = document.getElementById('login-btn');

  if (logoutBtn) {
    logoutBtn.classList.remove('hidden');
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('user');
      window.location.href = 'login.html';
    });
  }

  if (loginBtn) loginBtn.classList.add('hidden');
});
