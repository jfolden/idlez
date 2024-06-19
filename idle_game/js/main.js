import init, { start_gathering, stop_gathering, get_gathering_info, gather_material, get_material } from '../pkg/idle_game.js';
import ProgressBar from './ProgressBar.js';

let gatheringInterval = null;
let globalProgressBar = new ProgressBar('global-cast-bar', 'global-cast-bar-label');

async function run() {
    console.log('Initializing WebAssembly module...');
    try {
        await init();
        console.log('WebAssembly module initialized successfully.');
    } catch (error) {
        console.error('Failed to initialize WebAssembly module:', error);
    }

    setInterval(() => {
        // We may not need to call this anymore
        // updateGlobalCastBar();
        ['iron-ore', 'gold-ore', 'diamond', 'salmon', 'tuna', 'shark'].forEach(material => {
            let count = get_material(material);
            if (document.getElementById(material)) {
                document.getElementById(material).innerText = count;
            }
        });
    }, 1000);
}

window.startGathering = function(material, duration, activity) {
    console.log(`Starting gathering: ${material} for ${duration}ms`);
    stopGathering(); // Stop any current gathering task

    const startTime = performance.now();
    start_gathering(material, BigInt(duration), startTime);

    globalProgressBar.start(duration / 1000);
    const activityLabel = document.getElementById('activity-label');
    activityLabel.innerText = `${activity}: ${material.replace('-', ' ')}`;
    gatheringInterval = setInterval(() => {
        gather_material(material);
        globalProgressBar.start(duration / 1000);
    }, duration);
}

window.stopGathering = function() {
    clearInterval(gatheringInterval);
    gatheringInterval = null;
    stop_gathering();
    globalProgressBar.stop();

    const activityLabel = document.getElementById('activity-label');
    activityLabel.innerText = '';
}

function attachEventListeners() {
    document.querySelectorAll('[data-gather-material]').forEach(button => {
        button.onclick = () => {
            const material = button.getAttribute('data-gather-material');
            const duration = parseInt(button.getAttribute('data-gather-duration'), 10);
            const activity = button.getAttribute('data-activity');
            startGathering(material, duration, activity);
        };
    });
}

window.loadTab = async function(tabName) {
    try {
        console.log(`Loading tab: ${tabName}`);
        const response = await fetch(`html/${tabName}.html`);
        if (!response.ok) {
            throw new Error(`Failed to load ${tabName}.html`);
        }
        const content = await response.text();
        document.getElementById('content').innerHTML = content;
        attachEventListeners(); // Attach event listeners after loading the content
    } catch (error) {
        console.error('Error loading tab content:', error);
    }
}

async function registerUser(username) {
    const response = await fetch('http://localhost:8080/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: generateUUID(), username })
    });
    return response.json();
}

async function getInventory(userId) {
    const response = await fetch(`http://localhost:8080/inventory/${userId}`);
    return response.json();
}

async function addToInventory(userId, itemName, quantity) {
    const response = await fetch(`http://localhost:8080/inventory/${userId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: generateUUID(), user_id: userId, item_name: itemName, quantity })
    });
    return response.json();
}

function generateUUID() {
    // Simple UUID generator for demonstration purposes
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0,
            v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    const form = document.getElementById('register-form');
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const username = document.getElementById('username').value;
        const user = await registerUser(username);
        console.log('Registered user:', user);

        const inventory = await getInventory(user.id);
        console.log('User inventory:', inventory);

        // Example of adding an item to the inventory
        await addToInventory(user.id, 'iron-ore', 10);
        const updatedInventory = await getInventory(user.id);
        console.log('Updated inventory:', updatedInventory);

        document.getElementById('username-form').style.display = 'none';
        document.getElementById('content').style.display = 'block';
        loadTab('fishing'); // Load the initial game tab, e.g., fishing
    });

    run();
});
