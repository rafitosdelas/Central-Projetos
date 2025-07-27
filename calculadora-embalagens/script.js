document.addEventListener('DOMContentLoaded', () => {
    // Pega o nome do utilizador que fez login no portal
    const loggedInUser = localStorage.getItem('loggedInUser');
    
    // --- Referências do DOM ---
    const inputs = { 
        peDeMaconha: document.getElementById('pe-de-maconha'), 
        pastaBase: document.getElementById('pasta-base'), 
        plantaCoca: document.getElementById('planta-coca'), 
        anfetamina: document.getElementById('anfetamina') 
    };
    const saveButton = document.getElementById('save-calculation');
    
    if (loggedInUser) {
        let welcomeText = `Calcular Embalagens (${loggedInUser})`;
        if (loggedInUser === 'Visitante') {
            welcomeText = `Modo de Visualização (Visitante)`;
            Object.values(inputs).forEach(input => input.disabled = true);
            saveButton.disabled = true;
            saveButton.textContent = 'Apenas Visualização';
            saveButton.style.backgroundColor = '#555';
        }
        document.getElementById('calculator-welcome-message').textContent = welcomeText;
    }

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

    // --- Constantes ---
    const CONVERSION_RATE = 5; 
    const PACKAGE_COST = 5;
    const MAX_BUY_AMOUNT = 50;
    const PACKAGE_WEIGHT = 0.01;
    const FINAL_PRODUCT_PRICE = 98;

    // --- Mais Referências do DOM ---
    const neededSpans = { pinos: document.getElementById('pinos-needed'), ziplocks: document.getElementById('ziplocks-needed'), bicarbonato: document.getElementById('bicarbonato-needed') };
    const clicksSpans = { pinos: document.getElementById('pinos-clicks'), ziplocks: document.getElementById('ziplocks-clicks'), bicarbonato: document.getElementById('bicarbonato-clicks') };
    const totalCostSpan = document.getElementById('total-cost');
    const totalWeightSpan = document.getElementById('total-weight');
    const estimatedValueSpan = document.getElementById('estimated-value');
    const historyLogDiv = document.getElementById('history-log');
    const detailsBox = document.getElementById('details-box');
    const detailsContent = document.getElementById('details-content');
    
    // --- Funções ---
    function calculateClicks(total) {
        if (total === 0) return '';
        const fullBuys = Math.floor(total / MAX_BUY_AMOUNT);
        const remainder = total % MAX_BUY_AMOUNT;
        let result = '';
        if (fullBuys > 0) result += `${fullBuys}x de ${MAX_BUY_AMOUNT}`;
        if (remainder > 0) result += (fullBuys > 0 ? ' + ' : '') + `1x de ${remainder}`;
        return `(${result})`;
    }

    function calculatePackaging() {
        const quantities = { 
            peDeMaconha: parseInt(inputs.peDeMaconha.value) || 0, 
            pastaBase: parseInt(inputs.pastaBase.value) || 0, 
            plantaCoca: parseInt(inputs.plantaCoca.value) || 0, 
            anfetamina: parseInt(inputs.anfetamina.value) || 0 
        };
        const needed = {
            pinos: quantities.plantaCoca * CONVERSION_RATE,
            ziplocks: (quantities.peDeMaconha + quantities.anfetamina) * CONVERSION_RATE,
            bicarbonato: quantities.pastaBase * CONVERSION_RATE
        };
        const totalPackages = needed.pinos + needed.ziplocks + needed.bicarbonato;
        const totalCost = totalPackages * PACKAGE_COST;
        const totalWeight = totalPackages * PACKAGE_WEIGHT;
        const estimatedValue = totalPackages * FINAL_PRODUCT_PRICE;

        neededSpans.pinos.textContent = needed.pinos;
        neededSpans.ziplocks.textContent = needed.ziplocks;
        neededSpans.bicarbonato.textContent = needed.bicarbonato;
        clicksSpans.pinos.textContent = calculateClicks(needed.pinos);
        clicksSpans.ziplocks.textContent = calculateClicks(needed.ziplocks);
        clicksSpans.bicarbonato.textContent = calculateClicks(needed.bicarbonato);
        totalCostSpan.textContent = totalCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        totalWeightSpan.textContent = `${totalWeight.toFixed(2)} kg`;
        estimatedValueSpan.textContent = estimatedValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        if (loggedInUser !== 'Visitante') {
            saveButton.disabled = totalPackages === 0;
        }
    }

    // --- Event Listeners ---
    Object.values(inputs).forEach(input => input.addEventListener('input', calculatePackaging));

    saveButton.addEventListener('click', () => {
        const quantities = { peDeMaconha: parseInt(inputs.peDeMaconha.value) || 0, pastaBase: parseInt(inputs.pastaBase.value) || 0, plantaCoca: parseInt(inputs.plantaCoca.value) || 0, anfetamina: parseInt(inputs.anfetamina.value) || 0 };
        if (Object.values(quantities).reduce((a, b) => a + b, 0) === 0) return;

        const needed = { pinos: quantities.plantaCoca * CONVERSION_RATE, ziplocks: (quantities.peDeMaconha + quantities.anfetamina) * CONVERSION_RATE, bicarbonato: quantities.pastaBase * CONVERSION_RATE };
        const totalCost = (needed.pinos + needed.ziplocks + needed.bicarbonato) * PACKAGE_COST;

        db.collection('necessidade_embalagens').add({
            registradoPor: loggedInUser,
            quantities, needed, totalCost,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
            Object.values(inputs).forEach(input => input.value = '');
            calculatePackaging();
        }).catch(error => alert("Erro ao salvar. Verifique as regras do seu Firebase."));
    });

    // --- Carregar Histórico ---
    db.collection('necessidade_embalagens').orderBy('timestamp', 'desc').limit(3).onSnapshot(snapshot => {
        historyLogDiv.innerHTML = '';
        if (snapshot.empty) {
            historyLogDiv.innerHTML = '<p>Nenhum registo salvo.</p>';
            return;
        }

        snapshot.docs.forEach(doc => {
            const data = doc.data();
            const totalPackages = data.needed.pinos + data.needed.ziplocks + data.needed.bicarbonato;
            const entry = document.createElement('p');
            entry.innerHTML = `<strong>${data.timestamp?.toDate().toLocaleString('pt-BR')}</strong><br>
                               Por: <strong>${data.registradoPor || 'N/A'}</strong> | Total: <strong>${totalPackages}</strong>`;
            
            entry.addEventListener('click', () => {
                historyLogDiv.querySelectorAll('p').forEach(p => p.classList.remove('selected'));
                entry.classList.add('selected');
                
                // **A MÁGICA ACONTECE AQUI**
                let registeredItemsHTML = '<p><strong>Itens Registados:</strong></p>';
                if (data.quantities.peDeMaconha > 0) registeredItemsHTML += `<p>- Pé de Maconha: ${data.quantities.peDeMaconha}</p>`;
                if (data.quantities.pastaBase > 0) registeredItemsHTML += `<p>- Pasta Base: ${data.quantities.pastaBase}</p>`;
                if (data.quantities.plantaCoca > 0) registeredItemsHTML += `<p>- Planta de Coca: ${data.quantities.plantaCoca}</p>`;
                if (data.quantities.anfetamina > 0) registeredItemsHTML += `<p>- Anfetamina: ${data.quantities.anfetamina}</p>`;
                
                const totalWeightOfEntry = totalPackages * PACKAGE_WEIGHT;
                const estimatedValueOfEntry = totalPackages * FINAL_PRODUCT_PRICE;
                detailsContent.innerHTML = `
                    <p><strong>Registado por:</strong> ${data.registradoPor || 'N/A'}</p>
                    <p><strong>Data:</strong> ${data.timestamp?.toDate().toLocaleString('pt-BR')}</p>
                    <hr>
                    ${registeredItemsHTML}
                    <hr>
                    <p><strong>Valor de Venda:</strong> ${estimatedValueOfEntry.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                    <p><strong>Custo Embalagens:</strong> ${data.totalCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                    <p><strong>Peso Total:</strong> ${totalWeightOfEntry.toFixed(2)} kg</p>
                `;
            });

            historyLogDiv.appendChild(entry);
        });
    });

    calculatePackaging();
});