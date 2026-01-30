const STORAGE_KEYS = {
    allPeople: 'facilitator_allPeople',
    subgroupPeople: 'facilitator_subgroupPeople',
    history: 'facilitator_history',
    currentWeek: 'facilitator_currentWeek'
};

function getStoredData(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
}

function setStoredData(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function getAllPeople() {
    const text = document.getElementById('allPeople').value.trim();
    return text ? text.split('\n').map(p => p.trim()).filter(p => p) : [];
}

function getSubgroupPeople() {
    const text = document.getElementById('subgroupPeople').value.trim();
    return text ? text.split('\n').map(p => p.trim()).filter(p => p) : [];
}

function loadConfig() {
    const allPeople = getStoredData(STORAGE_KEYS.allPeople);
    const subgroupPeople = getStoredData(STORAGE_KEYS.subgroupPeople);
    
    if (allPeople) {
        document.getElementById('allPeople').value = allPeople.join('\n');
    }
    if (subgroupPeople) {
        document.getElementById('subgroupPeople').value = subgroupPeople.join('\n');
    }
    
    loadCurrentWeek();
}

function saveConfig() {
    const allPeople = getAllPeople();
    const subgroupPeople = getSubgroupPeople();
    
    if (allPeople.length === 0) {
        alert('Por favor, adicione pelo menos uma pessoa na lista principal.');
        return;
    }
    
    setStoredData(STORAGE_KEYS.allPeople, allPeople);
    setStoredData(STORAGE_KEYS.subgroupPeople, subgroupPeople);
    
    alert('Configuração salva com sucesso!');
}

function getCurrentWeek() {
    const current = getStoredData(STORAGE_KEYS.currentWeek);
    return current || {
        daily: null,
        cards: null,
        monitoring: null,
        retrospectiva: null
    };
}

function getHistory() {
    const history = getStoredData(STORAGE_KEYS.history);
    return history || {
        daily: [],
        cards: [],
        monitoring: [],
        retrospectiva: []
    };
}

function saveCurrentWeek(week) {
    setStoredData(STORAGE_KEYS.currentWeek, week);
}

function saveHistory(history) {
    setStoredData(STORAGE_KEYS.history, history);
}

function addToHistory(meetingType, person) {
    const history = getHistory();
    if (!history[meetingType]) {
        history[meetingType] = [];
    }
    
    history[meetingType].push(person);
    
    if (history[meetingType].length > 4) {
        history[meetingType].shift();
    }
    
    saveHistory(history);
}

function loadCurrentWeek() {
    const week = getCurrentWeek();
    updateResultDisplay('daily', week.daily);
    updateResultDisplay('cards', week.cards);
    updateResultDisplay('monitoring', week.monitoring);
    updateResultDisplay('retrospectiva', week.retrospectiva);
    updateHistory();
}

function updateResultDisplay(meetingType, person) {
    const resultBox = document.getElementById(`${meetingType}Result`);
    if (person) {
        resultBox.innerHTML = person;
        resultBox.classList.add('has-result');
    } else {
        resultBox.innerHTML = '<span class="result-placeholder">Aguardando sorteio...</span>';
        resultBox.classList.remove('has-result');
    }
}

function updateHistory() {
    const history = getHistory();
    const currentWeek = getCurrentWeek();
    
    updateHistoryDisplay('daily', history.daily, currentWeek.daily);
    updateHistoryDisplay('cards', history.cards, currentWeek.cards);
    updateHistoryDisplay('monitoring', history.monitoring, currentWeek.monitoring);
    updateHistoryDisplay('retrospectiva', history.retrospectiva, currentWeek.retrospectiva);
}

function updateHistoryDisplay(meetingType, historyArray, currentPerson) {
    const historyDiv = document.getElementById(`${meetingType}History`);
    let html = '<div class="history-title">Histórico:</div>';
    
    if (currentPerson) {
        html += `<div class="history-item">Esta semana: <strong>${currentPerson}</strong></div>`;
    }
    
    if (historyArray && historyArray.length > 0) {
        const labels = ['1 semana atrás', '2 semanas atrás', '3 semanas atrás', '4 semanas atrás'];
        const startIndex = Math.max(0, historyArray.length - 4);
        
        for (let i = historyArray.length - 1; i >= startIndex; i--) {
            const labelIndex = historyArray.length - 1 - i;
            html += `<div class="history-item">${labels[labelIndex]}: ${historyArray[i]}</div>`;
        }
    }
    
    historyDiv.innerHTML = html;
}

function drawRandom(people, excludePerson = null) {
    let available = people.filter(p => p !== excludePerson);
    
    if (available.length === 0) {
        available = people;
    }
    
    if (available.length === 0) {
        return null;
    }
    
    const randomIndex = Math.floor(Math.random() * available.length);
    return available[randomIndex];
}

function drawForMeeting(meetingType, peopleList) {
    const currentWeek = getCurrentWeek();
    const history = getHistory();
    const historyForType = history[meetingType] || [];
    
    if (peopleList.length === 0) {
        const names = { daily: 'Daily', cards: 'Cards de Operação', monitoring: 'Monitoramento', retrospectiva: 'Retrospectiva' };
        alert(`Nenhuma pessoa disponível para ${names[meetingType] || meetingType}.`);
        return;
    }
    
    const excludeFromCurrentWeek = Object.values(currentWeek).filter(p => p !== null && p !== currentWeek[meetingType]);
    const excludeFromHistory = historyForType.slice(-4);
    const excludePersons = [...excludeFromHistory, ...excludeFromCurrentWeek].filter(p => p !== null);
    
    let available = peopleList.filter(p => !excludePersons.includes(p));
    
    if (available.length === 0) {
        if (historyForType.length > 0) {
            const oldestPerson = historyForType[0];
            available = peopleList.filter(p => p === oldestPerson);
        } else {
            available = peopleList;
        }
    }
    
    if (available.length === 0) {
        alert('Erro ao realizar o sorteio.');
        return;
    }
    
    const randomIndex = Math.floor(Math.random() * available.length);
    const selected = available[randomIndex];
    
    currentWeek[meetingType] = selected;
    saveCurrentWeek(currentWeek);
    updateResultDisplay(meetingType, selected);
    updateHistory();
}

function drawDaily() {
    const allPeople = getAllPeople();
    if (allPeople.length === 0) {
        alert('Por favor, configure a lista de pessoas primeiro.');
        return;
    }
    drawForMeeting('daily', allPeople);
}

function drawCards() {
    const subgroupPeople = getSubgroupPeople();
    if (subgroupPeople.length === 0) {
        alert('Por favor, configure o subgrupo para Cards de Operação primeiro.');
        return;
    }
    drawForMeeting('cards', subgroupPeople);
}

function drawMonitoring() {
    const subgroupPeople = getSubgroupPeople();
    if (subgroupPeople.length === 0) {
        alert('Por favor, configure o subgrupo para Monitoramento primeiro.');
        return;
    }
    drawForMeeting('monitoring', subgroupPeople);
}

function drawRetrospectiva() {
    const allPeople = getAllPeople();
    if (allPeople.length === 0) {
        alert('Por favor, configure a lista de pessoas primeiro.');
        return;
    }
    drawForMeeting('retrospectiva', allPeople);
}

function resetWeek() {
    if (!confirm('Deseja resetar a semana atual? Os resultados serão movidos para o histórico.')) {
        return;
    }
    
    const currentWeek = getCurrentWeek();
    
    if (currentWeek.daily) {
        addToHistory('daily', currentWeek.daily);
    }
    if (currentWeek.cards) {
        addToHistory('cards', currentWeek.cards);
    }
    if (currentWeek.monitoring) {
        addToHistory('monitoring', currentWeek.monitoring);
    }
    if (currentWeek.retrospectiva) {
        addToHistory('retrospectiva', currentWeek.retrospectiva);
    }
    
    const newWeek = {
        daily: null,
        cards: null,
        monitoring: null,
        retrospectiva: null
    };
    saveCurrentWeek(newWeek);
    
    loadCurrentWeek();
    alert('Semana resetada com sucesso!');
}

function clearAll() {
    if (!confirm('Deseja limpar TODOS os dados? Esta ação não pode ser desfeita.')) {
        return;
    }
    
    localStorage.removeItem(STORAGE_KEYS.allPeople);
    localStorage.removeItem(STORAGE_KEYS.subgroupPeople);
    localStorage.removeItem(STORAGE_KEYS.history);
    localStorage.removeItem(STORAGE_KEYS.currentWeek);
    
    document.getElementById('allPeople').value = '';
    document.getElementById('subgroupPeople').value = '';
    
    loadCurrentWeek();
    alert('Todos os dados foram limpos!');
}

document.getElementById('saveConfig').addEventListener('click', saveConfig);
document.getElementById('drawDaily').addEventListener('click', drawDaily);
document.getElementById('drawCards').addEventListener('click', drawCards);
document.getElementById('drawMonitoring').addEventListener('click', drawMonitoring);
document.getElementById('drawRetrospectiva').addEventListener('click', drawRetrospectiva);
document.getElementById('resetWeek').addEventListener('click', resetWeek);
document.getElementById('clearAll').addEventListener('click', clearAll);

loadConfig();

