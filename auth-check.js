// auth-check.js

// O porteiro verifica se há um "crachá" com o nome de alguém
const loggedInUser = localStorage.getItem('loggedInUser');

if (!loggedInUser) {
    // Se NÃO HÁ crachá...
    console.log("Acesso negado! Redirecionando para o portal...");
    // Manda o curioso de volta para o portal para fazer login
    window.location.href = '../index.html';
} else {
    // Se HÁ crachá, permite o acesso e anota quem entrou.
    console.log(`Acesso permitido para: ${loggedInUser}`);
}