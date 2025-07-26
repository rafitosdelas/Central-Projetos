// Pega o nome do utilizador que fez login no portal
const loggedInUser = localStorage.getItem('loggedInUser');

// Atualiza a mensagem de boas-vindas no título
if (loggedInUser) {
    document.getElementById('bau-welcome-message').textContent = `Registrar Ação (${loggedInUser})`;
}

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

// VALORES DOS ITENS (Se precisar, adicione outros aqui)
const ITEM_VALUES = {
    "Filé de Peixe-Boi": 4200,
    "Filé de Jacaré": 5100,
    "Filé de Tartaruga": 1700,
};

// Referências para os elementos do HTML
const itemForm = document.getElementById('item-form');
const actionSelector = document.getElementById('action-selector');
const itemSelector = document.getElementById('item-selector');

// Elementos do DOM para os painéis de utilizador
const bielItemsDiv = document.getElementById('biel-items');
const rafitosItemsDiv = document.getElementById('rafitos-items');
// const tiagoItemsDiv = document.getElementById('tiago-items'); // Adicione se o Tiago tiver um painel

// Variáveis para guardar o estado do inventário
let bielItems = {};
let rafitosItems = {};
// let tiagoItems = {};

// Função genérica para lidar com a seleção de botões
function handleSelector(selectorElement) {
    if (!selectorElement) return;
    selectorElement.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON' && e.target.closest('.item-selector-group, .button-group')) {
            selectorElement.querySelectorAll('button').forEach(btn => btn.classList.remove('selected'));
            e.target.classList.add('selected');
        }
    });
}

handleSelector(actionSelector);
handleSelector(itemSelector);

// FUNÇÃO PRINCIPAL: REGISTRAR UMA AÇÃO
itemForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const user = loggedInUser;
    const action = actionSelector.querySelector('.selected')?.dataset.action;
    const itemName = itemSelector.querySelector('.selected')?.dataset.item;
    const quantity = parseInt(document.getElementById('item-quantity').value);

    if (!user || !action || !itemName || !quantity || quantity <= 0) {
        alert('Por favor, verifique se todos os campos estão preenchidos.');
        return;
    }

    if (action === 'tirou') {
        let currentInventory;
        if (user === 'Biel') currentInventory = bielItems;
        else if (user === 'Rafitos') currentInventory = rafitosItems;
        // else if (user === 'Tiago') currentInventory = tiagoItems;
        
        const availableQuantity = currentInventory ? (currentInventory[itemName] || 0) : 0;

        if (availableQuantity < quantity) {
            alert(`Ação inválida! ${user} não tem ${quantity}x ${itemName} para tirar. (Possui apenas ${availableQuantity})`);
            return;
        }
    }

    db.collection('transacoes').add({
        user: user,
        action: action,
        itemName: itemName,
        quantity: quantity,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        console.log('Transação registada com sucesso!');
        document.getElementById('item-quantity').value = 1;
    }).catch((error) => {
        console.error("Erro ao registar transação: ", error);
        alert('Ocorreu um erro ao registar. Verifique as regras do seu Firebase.');
    });
});

// FUNÇÃO MÁGICA: OUVIR E ATUALIZAR TUDO EM TEMPO REAL
db.collection('transacoes').orderBy('timestamp', 'asc').onSnapshot((snapshot) => {
    bielItems = {};
    rafitosItems = {};
    // tiagoItems = {};

    snapshot.docs.forEach(doc => {
        const transacao = doc.data();
        let itemsList;
        if (transacao.user === 'Biel') itemsList = bielItems;
        else if (transacao.user === 'Rafitos') itemsList = rafitosItems;
        // else if (transacao.user === 'Tiago') itemsList = tiagoItems;
        
        if (itemsList) {
            const currentQty = itemsList[transacao.itemName] || 0;
            if (transacao.action === 'colocou') {
                itemsList[transacao.itemName] = currentQty + transacao.quantity;
            } else {
                itemsList[transacao.itemName] = currentQty - transacao.quantity;
            }
        }
    });

    // Função para mostrar os itens no painel de cada utilizador
    function displayItems(playerItems, divElement) {
        if (!divElement) return;
        divElement.innerHTML = '';
        Object.keys(playerItems).sort().forEach(itemName => {
            const quantity = playerItems[itemName];
            if (quantity > 0) {
                const itemEntry = document.createElement('p');
                itemEntry.textContent = `${quantity}x ${itemName}`;
                divElement.appendChild(itemEntry);
            }
        });
    }

    displayItems(bielItems, bielItemsDiv);
    displayItems(rafitosItems, rafitosItemsDiv);
    // displayItems(tiagoItems, tiagoItemsDiv);
    
    // As suas funções para calcular o valor total (updatePlayerCalculator) não estavam no ficheiro que enviou,
    // mas se as tiver, pode adicioná-las aqui e chamá-las.
});