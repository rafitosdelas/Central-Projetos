document.addEventListener('DOMContentLoaded', () => {
    // Pega o nome do utilizador que fez login no portal
    const loggedInUser = localStorage.getItem('loggedInUser');

    // Referências para os elementos do HTML
    const itemForm = document.getElementById('item-form');
    const actionSelector = document.getElementById('action-selector');
    const itemSelector = document.getElementById('item-selector');
    const quantityInput = document.getElementById('item-quantity');
    const submitButton = itemForm.querySelector('button[type="submit"]');

    // Atualiza a mensagem de boas-vindas no título
    if (loggedInUser) {
        let welcomeText = `Registrar Ação (${loggedInUser})`;
        // MODO VISITANTE: Bloqueia a interatividade
        if (loggedInUser === 'Visitante') {
            welcomeText = `Modo de Visualização (Visitante)`;
            actionSelector.style.pointerEvents = 'none';
            itemSelector.style.pointerEvents = 'none';
            quantityInput.disabled = true;
            submitButton.disabled = true;
            submitButton.textContent = 'Apenas Visualização';
            submitButton.style.backgroundColor = '#555';
        }
        document.getElementById('bau-welcome-message').textContent = welcomeText;
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