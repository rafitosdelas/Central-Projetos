const firebaseConfig = {
    apiKey: "AIzaSyDKMNlXG2WER6rF4LsDrPgdReGLE1I9d9s",
    authDomain: "registro-bau.firebaseapp.com",
    projectId: "registro-bau",
    storageBucket: "registro-bau.firebasestorage.app",
    messagingSenderId: "854687018755",
    appId: "1:854687018755:web:9a0d48b1ec97784a2b8336",
    measurementId: "G-ZBWW6VSJLB"
};

// Inicializa o Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// ==================================================
// REGRAS DE ACESSO E DETALHES DOS PROJETOS
// ==================================================
const accessRules = {
    'rafitos@email.com': ['controle-bau', 'calculadora-embalagens', 'projeto-3'],
    'amigo1@email.com': ['controle-bau', 'projeto-3'],
    'amigo2@email.com': ['projeto-3'],
    'amigo3@email.com': ['projeto-3']
};

const projectDetails = {
    'controle-bau': { title: 'Controle de Baú', description: 'Sistema para registrar a entrada e saída de itens valiosos do baú da facção.', url: './controle-bau/index.html' },
    'calculadora-embalagens': { title: 'Calculadora de Embalagens', description: 'Calcula a necessidade de compra de embalagens e o custo total para a produção.', url: './calculadora-embalagens/index.html' },
    'projeto-3': { title: 'Projeto 3 (Exemplo)', description: 'Descrição do projeto que todos podem acessar.', url: '#' }
};


// --- ELEMENTOS DO DOM ---
const pageContainer = document.getElementById('page-container');
const loginModal = document.getElementById('login-modal');
const loginTriggerBtn = document.getElementById('login-trigger-button');
const logoutBtn = document.getElementById('logout-button');
const loginForm = document.getElementById('login-form');
const closeModalBtn = document.querySelector('.close-button');
const projectsGrid = document.getElementById('projects-grid');
const welcomeMsg = document.getElementById('welcome-message');
const errorMsg = document.getElementById('error-message');


// --- FUNÇÕES DE UI (INTERFACE) ---
function showLoginState() {
    logoutBtn.classList.add('hidden');
    loginTriggerBtn.classList.remove('hidden');
    welcomeMsg.textContent = '';
    projectsGrid.innerHTML = '<div class="logged-out-message"><p>Por favor, faça o login para ver os projetos.</p></div>';
}

function showLoggedInState(user) {
    loginTriggerBtn.classList.add('hidden');
    logoutBtn.classList.remove('hidden');
    welcomeMsg.textContent = `Bem-vindo, ${user.email}`;
    loadProjectsForUser(user);
}

function showModal() {
    pageContainer.classList.add('blurred');
    loginModal.classList.remove('hidden');
}

function hideModal() {
    pageContainer.classList.remove('blurred');
    loginModal.classList.add('hidden');
    errorMsg.textContent = '';
    loginForm.reset();
}


// --- LÓGICA DE AUTENTICAÇÃO ---
auth.onAuthStateChanged(user => {
    if (user) {
        showLoggedInState(user);
    } else {
        showLoginState();
    }
});


// --- EVENT LISTENERS ---
loginTriggerBtn.addEventListener('click', showModal);
closeModalBtn.addEventListener('click', hideModal);
logoutBtn.addEventListener('click', () => {
    auth.signOut();
});

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    auth.signInWithEmailAndPassword(email, password)
        .then(userCredential => {
            hideModal();
        })
        .catch(error => {
            errorMsg.textContent = 'Email ou senha inválidos.';
            console.error("Erro de login:", error.message);
        });
});

// Clicar fora do modal também fecha
loginModal.addEventListener('click', (e) => {
    if (e.target === loginModal) {
        hideModal();
    }
});


// --- LÓGICA DE AUTORIZAÇÃO (CARREGAR PROJETOS) ---
function loadProjectsForUser(user) {
    projectsGrid.innerHTML = ''; // Limpa a mensagem de "faça login"
    const userPermissions = accessRules[user.email] || [];

    if (userPermissions.length === 0) {
        projectsGrid.innerHTML = '<div class="logged-out-message"><p>Você não tem permissão para acessar nenhum projeto.</p></div>';
        return;
    }

    userPermissions.forEach(projectId => {
        const project = projectDetails[projectId];
        if (project) {
            const projectCard = `
                <div class="project-card">
                    <h2>${project.title}</h2>
                    <p>${project.description}</p>
                    <a href="${project.url}" class="btn-enter">Entrar no Projeto</a>
                </div>
            `;
            projectsGrid.innerHTML += projectCard;
        }
    });
}