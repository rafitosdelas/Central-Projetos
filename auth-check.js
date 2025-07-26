// auth-check.js

const firebaseConfig = {
  apiKey: "AIzaSyDKMNlXG2WeR6rF4LsDrPgdReGLE1I9d9s",
  authDomain: "registro-bau.firebaseapp.com",
  projectId: "registro-bau",
  storageBucket: "registro-bau.firebasestorage.app",
  messagingSenderId: "854687018755",
  appId: "1:854687018755:web:9a0d48b1ec97784a2b8336",
  measurementId: "G-ZBWW6VSJLB"
};

// Inicializa o Firebase para podermos usar o serviço de autenticação
firebase.initializeApp(firebaseConfig);

// O "porteiro" que fica vigiando a página
firebase.auth().onAuthStateChanged(user => {
    if (!user) {
        // Se NÃO HÁ usuário logado...
        console.log("Acesso negado! Redirecionando para o login...");
        // Manda o curioso de volta para a página de login do portal
        window.location.href = '../login.html'; // Ajuste se o nome da sua página de login for diferente
    }
});