document.addEventListener('DOMContentLoaded', () => {
    const mainDetailsSection = document.getElementById('main-details-section');
    const resultDiv = document.getElementById('result');

    if (mainDetailsSection) {
        resultDiv.textContent = 'SUCCESSO: main-details-section TROVATO!';
        resultDiv.style.color = 'green';
    } else {
        resultDiv.textContent = 'FALLIMENTO: main-details-section NON TROVATO.';
        resultDiv.style.color = 'red';
    }
    console.log('Stato di mainDetailsSection:', mainDetailsSection);
});
