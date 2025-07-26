document.addEventListener('DOMContentLoaded', () => {

    // =======================================================
    //   DEFINA OS PINS E NOMES DE CADA USUÁRIO AQUI
    // =======================================================
    const userPins = {
        "123": "Rafitos",
        "124": "Biel",
        "125": "Tiago"
    };

    // --- Elementos da Página ---
    const loginOverlay = document.getElementById('login-overlay');
    const pageContainer = document.getElementById('page-container');
    const pinForm = document.getElementById('pin-form');
    const pinInput = document.getElementById('pin-input');
    const errorMessage = document.getElementById('error-message');
    const logoutButton = document.getElementById('logout-button');
    const welcomeMessage = document.getElementById('welcome-message');

    // --- Lógica Principal ---
    
    // 1. Checa se já existe um "crachá" com o nome do usuário
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (loggedInUser) {
        showPortal(loggedInUser);
    } else {
        showLogin();
    }

    // 2. Lógica do Formulário de PIN
    pinForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const pin = pinInput.value;
        const username = userPins[pin]; // Procura o nome correspondente ao PIN

        if (username) {
            // Sucesso! Salva o NOME do usuário como "crachá"
            localStorage.setItem('loggedInUser', username);
            showPortal(username);
        } else {
            // Erro
            errorMessage.textContent = 'PIN incorreto.';
            pinInput.value = '';
            pinInput.focus();
        }
    });

    // 3. Lógica do Botão de Sair
    logoutButton.addEventListener('click', () => {
        // Remove o "crachá" e recarrega a página
        localStorage.removeItem('loggedInUser');
        window.location.reload();
    });

    // --- Funções Auxiliares ---

    function showPortal(username) {
        loginOverlay.classList.add('hidden');
        pageContainer.classList.remove('hidden');
        welcomeMessage.textContent = `Logado como: ${username}`;
    }

    function showLogin() {
        loginOverlay.classList.remove('hidden');
        pageContainer.classList.add('hidden');
        pinInput.focus();
    }
});