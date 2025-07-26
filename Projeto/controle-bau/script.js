// Pega o nome do usuário que fez login no portal
const loggedInUser = localStorage.getItem('loggedInUser');

// Atualiza a mensagem de boas-vindas
document.getElementById('bau-welcome-message').textContent = `Registrar Ação (${loggedInUser})`;

// =================================================================
// COLE AQUI A CONFIGURAÇÃO DO SEU FIREBASE
// =================================================================
const firebaseConfig = {
    apiKey: "AIzaSyDKMNlXG2WeR6rF4LsDrPgdReGLE1I9d9s",
    authDomain: "registro-bau.firebaseapp.com",
    projectId: "registro-bau",
    storageBucket: "registro-bau.firebasestorage.app",
    messagingSenderId: "854687018755",
    appId: "1:854687018755:web:9a0d48b1ec97784a2b8336",
    measurementId: "G-ZBWW6VSJLB"
};

// Inicializa o Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ... (O resto do seu código do baú, com uma pequena mudança)

// FUNÇÃO PRINCIPAL: REGISTRAR UMA AÇÃO (MODIFICADA)
itemForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Linha removida: const user = userSelector.querySelector('.selected').dataset.user;
    const user = loggedInUser; // USA O USUÁRIO LOGADO AUTOMATICAMENTE

    const action = actionSelector.querySelector('.selected').dataset.action;
    const itemName = itemSelector.querySelector('.selected').dataset.item;
    const quantity = parseInt(document.getElementById('item-quantity').value);

    // ... (o resto da função de submit continua igual)

    if (!itemName || quantity <= 0) {
        alert('Por favor, preencha a quantidade corretamente.');
        return;
    }

    if (action === 'tirou') {
        const currentInventory = (user === 'Biel') ? bielItems : rafitosItems; // Pode expandir para o Tiago
        const availableQuantity = currentInventory[itemName] || 0;

        if (availableQuantity < quantity) {
            alert(`Ação inválida! ${user} não tem ${quantity}x ${itemName} para tirar. (Possui apenas ${availableQuantity})`);
            return;
        }
    }

    db.collection('transacoes').add({
        user: user, // SALVA COM O NOME CORRETO
        action: action,
        itemName: itemName,
        quantity: quantity,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        console.log('Transação registrada com sucesso!');
        document.getElementById('item-quantity').value = 1;
        document.getElementById('item-quantity').focus();
    }).catch((error) => {
        console.error("Erro ao registrar transação: ", error);
        alert('Ocorreu um erro ao registrar. Tente novamente.');
    });
});


// ... (O resto do seu código de ouvir o snapshot continua igual)