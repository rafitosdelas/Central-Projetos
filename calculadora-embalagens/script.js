// =================================================================
// PASSO IMPORTANTE: COLE AQUI A CONFIGURAÇÃO DO SEU FIREBASE
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
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// --- CONSTANTES DO JOGO ---
const CONVERSION_RATE = 5; 
const PACKAGE_COST = 5;   

// --- REFERÊNCIAS DO HTML ---
const inputs = {
    maconha: document.getElementById('maconha'),
    crack: document.getElementById('crack'),
    cocaina: document.getElementById('cocaina'),
    metanfetamina: document.getElementById('metanfetamina')
};

const neededSpans = {
    pinos: document.getElementById('pinos-needed'),
    ziplocks: document.getElementById('ziplocks-needed'),
    bicarbonato: document.getElementById('bicarbonato-needed')
};

const totalCostSpan = document.getElementById('total-cost');
const saveButton = document.getElementById('save-calculation');
const historyLogDiv = document.getElementById('history-log');

// --- FUNÇÃO DE CÁLCULO ---
function calculatePackaging() {
    const quantities = {
        maconha: parseInt(inputs.maconha.value) || 0,
        crack: parseInt(inputs.crack.value) || 0,
        cocaina: parseInt(inputs.cocaina.value) || 0,
        metanfetamina: parseInt(inputs.metanfetamina.value) || 0
    };

    const totalPureDrugs = Object.values(quantities).reduce((sum, qty) => sum + qty, 0);

    // Calcula a necessidade por tipo de embalagem
    const needed = {
        pinos: quantities.cocaina * CONVERSION_RATE,
        ziplocks: (quantities.maconha + quantities.metanfetamina) * CONVERSION_RATE,
        bicarbonato: quantities.crack * CONVERSION_RATE
    };
    
    // Calcula o custo total
    const totalPackagesNeeded = needed.pinos + needed.ziplocks + needed.bicarbonato;
    const totalCost = totalPackagesNeeded * PACKAGE_COST;

    // Atualiza os valores na tela
    neededSpans.pinos.textContent = needed.pinos;
    neededSpans.ziplocks.textContent = needed.ziplocks;
    neededSpans.bicarbonato.textContent = needed.bicarbonato;
    totalCostSpan.textContent = totalCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    
    saveButton.disabled = totalPureDrugs === 0;
}

// --- EVENT LISTENERS ---
Object.values(inputs).forEach(input => {
    input.addEventListener('input', calculatePackaging);
});

saveButton.addEventListener('click', () => {
    const quantities = {
        maconha: parseInt(inputs.maconha.value) || 0,
        crack: parseInt(inputs.crack.value) || 0,
        cocaina: parseInt(inputs.cocaina.value) || 0,
        metanfetamina: parseInt(inputs.metanfetamina.value) || 0
    };

    const totalPureDrugs = Object.values(quantities).reduce((sum, qty) => sum + qty, 0);

    if (totalPureDrugs === 0) {
        alert("Nenhum valor para salvar.");
        return;
    }

    const needed = {
        pinos: quantities.cocaina * CONVERSION_RATE,
        ziplocks: (quantities.maconha + quantities.metanfetamina) * CONVERSION_RATE,
        bicarbonato: quantities.crack * CONVERSION_RATE
    };
    
    const totalCost = (needed.pinos + needed.ziplocks + needed.bicarbonato) * PACKAGE_COST;

    db.collection('necessidade_embalagens').add({
        quantities,
        needed,
        totalCost,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        console.log('Necessidade registrada com sucesso!');
        Object.values(inputs).forEach(input => input.value = ''); // Limpa os campos
        calculatePackaging(); // Zera a calculadora
    }).catch(error => {
        console.error("Erro ao registrar: ", error);
        alert("Erro ao salvar. Verifique sua conexão e a configuração do Firebase.");
    });
});

// --- CARREGAR HISTÓRICO EM TEMPO REAL ---
db.collection('necessidade_embalagens').orderBy('timestamp', 'desc').onSnapshot(snapshot => {
    historyLogDiv.innerHTML = '';
    if (snapshot.empty) {
        historyLogDiv.innerHTML = '<p>Nenhum registro de necessidade salvo.</p>';
        return;
    }

    snapshot.docs.forEach(doc => {
        const data = doc.data();
        const needed = data.needed;
        const date = data.timestamp?.toDate().toLocaleString('pt-BR') || 'Salvando...';
        
        const entry = document.createElement('p');
        entry.innerHTML = `<strong>${date}</strong><br>
                           Pinos: <strong>${needed.pinos}</strong> | 
                           Ziplocks: <strong>${needed.ziplocks}</strong> | 
                           Bicarbonato: <strong>${needed.bicarbonato}</strong><br>
                           Custo Total: <strong>${data.totalCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>`;
        historyLogDiv.appendChild(entry);
    });
});

// Inicia a calculadora
calculatePackaging();