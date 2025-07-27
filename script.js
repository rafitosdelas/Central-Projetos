document.addEventListener('DOMContentLoaded', () => {

    // =======================================================
    //   SENHAS ATUALIZADAS E NOME MUDADO
    // =======================================================
    const userPins = {
        "4150": "Rafitos",
        "6415": "Biel",
        "4318": "Tico", // <--- NOME ATUALIZADO
        "1111": "Visitante"
    };

    // =======================================================
    //   LISTA DE ACESSO ATUALIZADA
    // =======================================================
    const accessRules = {
        "Rafitos": ["Controle de Baú", "Calculadora de Embalagens"],
        "Biel": ["Controle de Baú", "Calculadora de Embalagens"],
        "Tico": ["Calculadora de Embalagens"], // <--- NOME ATUALIZADO
        "Visitante": ["Controle de Baú", "Calculadora de Embalagens"]
    };

    // Detalhes dos projetos
    const projectDetails = {
        'Controle de Baú': {
            description: 'Sistema para registar a entrada e saída de itens valiosos.',
            url: './controle-bau/index.html'
        },
        'Calculadora de Embalagens': {
            description: 'Calcula a necessidade de compra de embalagens e o custo.',
            url: './calculadora-embalagens/index.html'
        }
    };

    // --- Elementos da Página ---
    const loginOverlay = document.getElementById('login-overlay');
    const pageContainer = document.getElementById('page-container');
    const pinForm = document.getElementById('pin-form');
    const pinInput = document.getElementById('pin-input');
    const errorMessage = document.getElementById('error-message');
    const logoutButton = document.getElementById('logout-button');
    const welcomeMessage = document.getElementById('welcome-message');
    const projectsGrid = document.querySelector('.projects-grid');

    // --- Lógica Principal ---
    
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (loggedInUser) {
        showPortal(loggedInUser);
    } else {
        showLogin();
    }

    pinForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const pin = pinInput.value;
        const username = userPins[pin];

        if (username) {
            localStorage.setItem('loggedInUser', username);
            showPortal(username);
        } else {
            errorMessage.textContent = 'PIN incorreto.';
            pinInput.value = '';
            pinInput.focus();
        }
    });

    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('loggedInUser');
        window.location.reload();
    });

    // --- Funções Auxiliares ---

    function showPortal(username) {
        loginOverlay.classList.add('hidden');
        pageContainer.classList.remove('hidden');
        welcomeMessage.textContent = `Logado como: ${username}`;
        
        projectsGrid.innerHTML = '';
        const allowedProjects = accessRules[username] || [];

        allowedProjects.forEach(projectTitle => {
            const project = projectDetails[projectTitle];
            if (project) {
                const card = document.createElement('div');
                card.className = 'project-card';
                card.innerHTML = `
                    <h2>${projectTitle}</h2>
                    <p>${project.description}</p>
                    <a href="${project.url}" class="btn-enter">Entrar no Projeto</a>
                `;
                projectsGrid.appendChild(card);
            }
        });
    }

    function showLogin() {
        loginOverlay.classList.remove('hidden');
        pageContainer.classList.add('hidden');
        pinInput.focus();
    }
});