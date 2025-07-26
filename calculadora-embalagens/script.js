document.addEventListener('DOMContentLoaded', () => {
    // Pega o nome do utilizador que fez login no portal
    const loggedInUser = localStorage.getItem('loggedInUser');
    
    // --- Referências do DOM ---
    const inputs = { maconha: document.getElementById('maconha'), crack: document.getElementById('crack'), cocaina: document.getElementById('cocaina'), metanfetamina: document.getElementById('metanfetamina') };
    const saveButton = document.getElementById('save-calculation');
    
    if (loggedInUser) {
        let welcomeText = `Calcular Embalagens (${loggedInUser})`;
        // MODO VISITANTE: Bloqueia a interatividade
        if (loggedInUser === 'Visitante') {
            welcomeText = `Modo de Visualização (Visitante)`;
            Object.values(inputs).forEach(input => input.disabled = true);
            saveButton.disabled = true;
            saveButton.textContent = 'Apenas Visualização';
            saveButton.style.backgroundColor = '#555';
        }
        document.getElementById('calculator-welcome-message').textContent = welcomeText;
    }

    // =================================================================
    // CONFIGURAÇÃO DO FIREBASE (NÃO PRECISA MEXER)
    // =================================================================
    const firebaseConfig = {
      apiKey: "AIzaSyDKMNlXG2WeR6rF4LsDrPgdReGLE1I9d9s",
      authDomain: "registro-bau.firebaseapp.com",
      projectId: "registro-bau",
      storageBucket: "registro-bau.firebasestorage.app",
      messagingSenderId: "854687018755",
      appId: "1:854687018755:web:9a0d48b1ec97784a2b8336"
    };
    
    // ... (O resto do seu código continua exatamente igual)
    // ...
});