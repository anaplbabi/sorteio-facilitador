const STORAGE_KEYS = {
    allPeople: 'facilitator_allPeople',
    subgroupPeople: 'facilitator_subgroupPeople',
    lastWeek: 'facilitator_lastWeek',
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
        monitoring: null
    };
}

function getLastWeek() {
    const last = getStoredData(STORAGE_KEYS.lastWeek);
    return last || {
        daily: null,
        cards: null,
        monitoring: null
    };
}

function saveCurrentWeek(week) {
    setStoredData(STORAGE_KEYS.currentWeek, week);
}

function saveLastWeek(week) {
    setStoredData(STORAGE_KEYS.lastWeek, week);
}

function loadCurrentWeek() {
    const week = getCurrentWeek();
    updateResultDisplay('daily', week.daily);
    updateResultDisplay('cards', week.cards);
    updateResultDisplay('monitoring', week.monitoring);
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
    const lastWeek = getLastWeek();
    const currentWeek = getCurrentWeek();
    
    updateHistoryDisplay('daily', lastWeek.daily, currentWeek.daily);
    updateHistoryDisplay('cards', lastWeek.cards, currentWeek.cards);
    updateHistoryDisplay('monitoring', lastWeek.monitoring, currentWeek.monitoring);
}

function updateHistoryDisplay(meetingType, lastPerson, currentPerson) {
    const historyDiv = document.getElementById(`${meetingType}History`);
    let html = '<div class="history-title">Histórico:</div>';
    
    if (currentPerson) {
        html += `<div class="history-item">Esta semana: <strong>${currentPerson}</strong></div>`;
    }
    if (lastPerson) {
        html += `<div class="history-item">Semana passada: ${lastPerson}</div>`;
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
    const lastWeek = getLastWeek();
    
    if (peopleList.length === 0) {
        alert(`Nenhuma pessoa disponível para ${meetingType === 'daily' ? 'Daily' : meetingType === 'cards' ? 'Cards de Operação' : 'Monitoramento'}.`);
        return;
    }
    
    const excludePerson = lastWeek[meetingType];
    const selected = drawRandom(peopleList, excludePerson);
    
    if (!selected) {
        alert('Erro ao realizar o sorteio.');
        return;
    }
    
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

function resetWeek() {
    if (!confirm('Deseja resetar a semana atual? Os resultados serão movidos para o histórico da semana passada.')) {
        return;
    }
    
    const currentWeek = getCurrentWeek();
    saveLastWeek(currentWeek);
    
    const newWeek = {
        daily: null,
        cards: null,
        monitoring: null
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
    localStorage.removeItem(STORAGE_KEYS.lastWeek);
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
document.getElementById('resetWeek').addEventListener('click', resetWeek);
document.getElementById('clearAll').addEventListener('click', clearAll);

loadConfig();

