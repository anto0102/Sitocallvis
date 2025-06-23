document.addEventListener("DOMContentLoaded", () => {
  const usernameInput = document.getElementById("username");
  const emailInput = document.getElementById("email");
  const profileImageInput = document.getElementById("profileImageInput");
  const profileImagePreview = document.getElementById("profileImagePreview");
  const saveButton = document.getElementById("saveProfile");

  // Carica i dati dal localStorage (se presenti)
  const savedProfile = JSON.parse(localStorage.getItem("userProfile")) || {};

  if (savedProfile.username) usernameInput.value = savedProfile.username;
  if (savedProfile.email) emailInput.value = savedProfile.email;
  if (savedProfile.imageDataUrl) {
    profileImagePreview.src = savedProfile.imageDataUrl;
  }

  // Quando l'utente seleziona una nuova immagine
  profileImageInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        profileImagePreview.src = e.target.result;
        savedProfile.imageDataUrl = e.target.result;
        localStorage.setItem("userProfile", JSON.stringify(savedProfile));
      };
      reader.readAsDataURL(file);
    }
  });

  // Quando clicca su "Salva Profilo"
  saveButton.addEventListener("click", (e) => {
    e.preventDefault();
    const updatedProfile = {
      username: usernameInput.value,
      email: emailInput.value,
      imageDataUrl: profileImagePreview.src,
    };
    localStorage.setItem("userProfile", JSON.stringify(updatedProfile));
    alert("Profilo salvato con successo!");
  });
});
