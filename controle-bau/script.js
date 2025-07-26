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
    appId: "1:854687018755:web:9a0d48b1ec97784a2b8336"
};

// Inicializa o Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Referências para os elementos do HTML
const itemForm = document.getElementById('item-form');
const actionSelector = document.getElementById('action-selector');
const itemSelector = document.getElementById('item-selector');

// Elementos do DOM (Adapte se o Tiago também tiver um baú)
const bielItemsDiv = document.getElementById('biel-items');
const rafitosItemsDiv = document.getElementById('rafitos-items');

// Variáveis para guardar o estado do inventário
let bielItems = {};
let rafitosItems = {};
// let tiagoItems = {}; // Descomente se o Tiago tiver um baú

// Função genérica para lidar com a seleção de botões
function handleSelector(selectorElement) {
    selectorElement.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON' && e.target.closest('.item-selector-group, .button-group')) {
            selectorElement.querySelectorAll('button').forEach(btn => btn.classList.remove('selected'));
            e.target.classList.add('selected');
        }
    });
}

handleSelector(actionSelector);
handleSelector(itemSelector);


// FUNÇÃO PRINCIPAL: REGISTRAR UMA AÇÃO (MODIFICADA)
itemForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const user = loggedInUser; // USA O UTILIZADOR LOGADO AUTOMATICAMENTE
    const action = actionSelector.querySelector('.selected').dataset.action;
    const itemName = itemSelector.querySelector('.selected').dataset.item;
    const quantity = parseInt(document.getElementById('item-quantity').value);

    if (!itemName || quantity <= 0) {
        alert('Por favor, preencha a quantidade corretamente.');
        return;
    }

    if (action === 'tirou') {
        let currentInventory;
        if (user === 'Biel') currentInventory = bielItems;
        if (user === 'Rafitos') currentInventory = rafitosItems;
        // if (user === 'Tiago') currentInventory = tiagoItems;

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
        console.log('Transação registada com sucesso!');
        document.getElementById('item-quantity').value = 1;
        document.getElementById('item-quantity').focus();
    }).catch((error) => {
        console.error("Erro ao registar transação: ", error);
        alert('Ocorreu um erro ao registar. Tente novamente.');
    });
});


// FUNÇÃO MÁGICA: OUVIR E ATUALIZAR TUDO EM TEMPO REAL
db.collection('transacoes').orderBy('timestamp', 'asc').onSnapshot((snapshot) => {
    bielItemsDiv.innerHTML = '';
    rafitosItemsDiv.innerHTML = '';
    bielItems = {};
    rafitosItems = {};

    snapshot.docs.forEach(doc => {
        const transacao = doc.data();
        let itemsList;
        if (transacao.user === 'Biel') itemsList = bielItems;
        if (transacao.user === 'Rafitos') itemsList = rafitosItems;
        // if (transacao.user === 'Tiago') itemsList = tiagoItems;
        
        if (itemsList) {
            const currentQty = itemsList[transacao.itemName] || 0;
            if (transacao.action === 'colocou') {
                itemsList[transacao.itemName] = currentQty + transacao.quantity;
            } else {
                itemsList[transacao.itemName] = currentQty - transacao.quantity;
            }
        }
    });
    
    // As suas funções displayItems e updatePlayerCalculator podem continuar como estavam,
    // mas lembre-se de chamá-las para o Tiago se ele tiver um inventário visual.
});