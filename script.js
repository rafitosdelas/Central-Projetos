document.addEventListener('DOMContentLoaded', () => {

    // ##################################################
    // ##  DEFINA A SENHA SECRETA PARA O GRUPO AQUI    ##
    // ##  Exemplo: "eusouincrivel" ou "familia123"    ##
    // ##################################################
    const SENHA_CORRETA = "123"; // Troque "123" pela senha que vocês vão usar


    // Elementos da página
    const passwordOverlay = document.getElementById('password-overlay');
    const pageContainer = document.getElementById('page-container');
    const passwordForm = document.getElementById('password-form');
    const passwordInput = document.getElementById('secret-password');
    const errorMessage = document.getElementById('error-message');

    // Tenta focar no campo de senha assim que a página carregar
    // O 'try...catch' previne erros caso algo aconteça antes do campo estar pronto
    try {
        passwordInput.focus();
    } catch (e) {
        console.warn("Não foi possível focar no campo de senha imediatamente.");
    }

    // Função para verificar a senha quando o formulário for enviado
    passwordForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Impede que a página recarregue

        if (passwordInput.value === SENHA_CORRETA) {
            // Se a senha estiver correta:
            // 1. Esconde a tela de senha
            passwordOverlay.classList.add('hidden');
            // 2. Mostra o conteúdo principal do site
            pageContainer.classList.remove('hidden');
        } else {
            // Se a senha estiver errada:
            // 1. Mostra uma mensagem de erro
            errorMessage.textContent = 'Senha incorreta. Tente novamente.';
            // 2. Limpa o campo de senha para uma nova tentativa
            passwordInput.value = '';
            // 3. Foca no campo de senha novamente
            passwordInput.focus();
        }
    });
});