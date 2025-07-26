document.addEventListener('DOMContentLoaded', () => {
    
    // Pega o nome do utilizador que fez login no portal
    const loggedInUser = localStorage.getItem('loggedInUser');

    // =================================================================
    // CONFIGURAÇÃO DO FIREBASE
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
    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();

    // VALORES DOS ITENS
    const ITEM_VALUES = {
        "Filé de Peixe-Boi": 4200,
        "Filé de Jacaré": 5100,
        "Filé de Tartaruga": 1700,
    };

    // Referências para os elementos do HTML
    const itemForm = document.getElementById('item-form');
    const actionSelector = document.getElementById('action-selector');
    const itemSelector = document.getElementById('item-selector');
    const quantityInput = document.getElementById('item-quantity');
    const submitButton = itemForm.querySelector('button[type="submit"]');

    // Mapeamento dos painéis de utilizador
    const userPanels = {
        Biel: {
            itemsDiv: document.getElementById('biel-items'),
            filesValue: document.getElementById('biel-files-value'),
            grandTotal: document.getElementById('biel-grand-total'),
            finalWashed: document.getElementById('biel-final-washed-value')
        },
        Rafitos: {
            itemsDiv: document.getElementById('rafitos-items'),
            filesValue: document.getElementById('rafitos-files-value'),
            grandTotal: document.getElementById('rafitos-grand-total'),
            finalWashed: document.getElementById('rafitos-final-washed-value')
        }
    };

    // Inventários
    let inventories = { Biel: {}, Rafitos: {} };

    // --- LÓGICA DE VISITANTE E BOAS-VINDAS ---
    if (loggedInUser) {
        let welcomeText = `Registrar Ação (${loggedInUser})`;
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

    // --- ATIVAÇÃO DOS BOTÕES E FORMULÁRIOS ---

    function handleSelector(selectorElement) {
        if (!selectorElement) return;
        selectorElement.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON') {
                selectorElement.querySelectorAll('button').forEach(btn => btn.classList.remove('selected'));
                e.target.classList.add('selected');
            }
        });
    }
    handleSelector(actionSelector);
    handleSelector(itemSelector);

    itemForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = loggedInUser;
        const action = actionSelector.querySelector('.selected')?.dataset.action;
        const itemName = itemSelector.querySelector('.selected')?.dataset.item;
        const quantity = parseInt(quantityInput.value, 10);

        if (!user || !action || !itemName || !quantity) {
            alert('Preencha todos os campos.');
            return;
        }

        if (action === 'tirou') {
            const userInventory = inventories[user] || {};
            const available = userInventory[itemName] || 0;
            if (available < quantity) {
                alert(`${user} tem apenas ${available}x ${itemName}.`);
                return;
            }
        }

        db.collection('transacoes').add({ user, action, itemName, quantity, timestamp: firebase.firestore.FieldValue.serverTimestamp() })
            .then(() => {
                quantityInput.value = 1;
            })
            .catch(error => {
                console.error("Erro ao salvar: ", error);
                alert("Ocorreu um erro ao registar a transação. Verifique as regras do seu Firebase.");
            });
    });

    // --- ATUALIZAÇÃO EM TEMPO REAL ---

    db.collection('transacoes').orderBy('timestamp', 'asc').onSnapshot(snapshot => {
        inventories = { Biel: {}, Rafitos: {} };

        snapshot.docs.forEach(doc => {
            const t = doc.data();
            if (inventories[t.user]) {
                const qty = inventories[t.user][t.itemName] || 0;
                inventories[t.user][t.itemName] = t.action === 'colocou' ? qty + t.quantity : qty - t.quantity;
            }
        });
        updateUI();
    });

    function updateUI() {
        for (const userName in inventories) {
            const panel = userPanels[userName];
            const inventory = inventories[userName];
            if (panel && panel.itemsDiv) {
                displayItems(userName, inventory, panel.itemsDiv);
                updateCalculator(inventory, panel);
            }
        }
    }

    function displayItems(ownerName, inventory, div) {
        div.innerHTML = '';
        Object.keys(inventory).sort().forEach(itemName => {
            const quantity = inventory[itemName];
            if (quantity > 0) {
                const p = document.createElement('p');
                p.textContent = `${quantity}x ${itemName}`;
                if (loggedInUser === ownerName && loggedInUser !== 'Visitante') {
                    p.style.cursor = 'pointer';
                    p.addEventListener('click', () => {
                        actionSelector.querySelector('[data-action="colocou"]').classList.remove('selected');
                        actionSelector.querySelector('[data-action="tirou"]').classList.add('selected');
                        itemSelector.querySelectorAll('button').forEach(btn => {
                            btn.classList.toggle('selected', btn.dataset.item === itemName);
                        });
                        quantityInput.value = quantity;
                        quantityInput.focus();
                    });
                }
                div.appendChild(p);
            }
        });
    }

    function updateCalculator(inventory, ui) {
        const format = (val) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        let filesValue = 0;
        const dirtyMoney = inventory['Dinheiro Sujo'] || 0;

        for (const name in inventory) {
            if (ITEM_VALUES[name]) {
                filesValue += inventory[name] * ITEM_VALUES[name];
            }
        }

        const grandTotal = filesValue + dirtyMoney;
        const finalWashed = grandTotal * 0.85;

        if (ui.filesValue) ui.filesValue.textContent = format(filesValue);
        if (ui.grandTotal) ui.grandTotal.textContent = format(grandTotal);
        if (ui.finalWashed) ui.finalWashed.textContent = format(finalWashed);
    }
});
