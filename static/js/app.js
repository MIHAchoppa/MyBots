// Global variables
let currentBotId = null;
let bots = {};

// DOM Elements
const botList = document.getElementById('botList');
const createBotBtn = document.getElementById('createBotBtn');
const botFormModal = document.getElementById('botFormModal');
const botForm = document.getElementById('botForm');
const cancelBtn = document.getElementById('cancelBtn');
const closeBtn = document.querySelector('.close');
const chatArea = document.getElementById('chatArea');
const noBotSelected = document.getElementById('noBotSelected');
const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const clearChatBtn = document.getElementById('clearChatBtn');
const currentBotName = document.getElementById('currentBotName');

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadBots();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    createBotBtn.addEventListener('click', () => openBotForm());
    closeBtn.addEventListener('click', () => closeBotForm());
    cancelBtn.addEventListener('click', () => closeBotForm());
    botForm.addEventListener('submit', handleBotFormSubmit);
    sendBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
    clearChatBtn.addEventListener('click', clearChat);
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === botFormModal) closeBotForm();
    });
}

// Load all bots
async function loadBots() {
    try {
        const response = await fetch('/api/bots');
        bots = await response.json();
        renderBotList();
    } catch (error) {
        console.error('Error loading bots:', error);
        showNotification('Error loading bots', 'error');
    }
}

// Render bot list
function renderBotList() {
    if (Object.keys(bots).length === 0) {
        botList.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">No bots yet. Create your first bot!</p>';
        return;
    }

    botList.innerHTML = Object.values(bots).map(bot => `
        <div class="bot-card ${bot.id === currentBotId ? 'active' : ''}" data-id="${bot.id}">
            <h3>${escapeHtml(bot.name)}</h3>
            <p><strong>Personality:</strong> ${escapeHtml(bot.personality.substring(0, 100))}${bot.personality.length > 100 ? '...' : ''}</p>
            <div class="bot-card-actions">
                <button class="btn btn-primary btn-small" onclick="selectBot('${bot.id}')">Chat</button>
                <button class="btn btn-secondary btn-small" onclick="editBot('${bot.id}')">Edit</button>
                <button class="btn btn-danger btn-small" onclick="deleteBot('${bot.id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

// Open bot form
function openBotForm(bot = null) {
    document.getElementById('formTitle').textContent = bot ? 'Edit Bot' : 'Create New Bot';
    document.getElementById('botId').value = bot ? bot.id : '';
    document.getElementById('botName').value = bot ? bot.name : '';
    document.getElementById('botPersonality').value = bot ? bot.personality : '';
    document.getElementById('botPrompt').value = bot ? bot.prompt : '';
    botFormModal.style.display = 'block';
}

// Close bot form
function closeBotForm() {
    botFormModal.style.display = 'none';
    botForm.reset();
}

// Handle bot form submission
async function handleBotFormSubmit(e) {
    e.preventDefault();
    
    const botId = document.getElementById('botId').value;
    const botData = {
        name: document.getElementById('botName').value,
        personality: document.getElementById('botPersonality').value,
        prompt: document.getElementById('botPrompt').value
    };

    try {
        let response;
        if (botId) {
            // Update existing bot
            response = await fetch(`/api/bots/${botId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(botData)
            });
        } else {
            // Create new bot
            response = await fetch('/api/bots', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(botData)
            });
        }

        const result = await response.json();
        if (result.success) {
            showNotification(botId ? 'Bot updated successfully!' : 'Bot created successfully!', 'success');
            closeBotForm();
            await loadBots();
        } else {
            showNotification('Error saving bot', 'error');
        }
    } catch (error) {
        console.error('Error saving bot:', error);
        showNotification('Error saving bot', 'error');
    }
}

// Edit bot
function editBot(botId) {
    const bot = bots[botId];
    if (bot) {
        openBotForm(bot);
    }
}

// Delete bot
async function deleteBot(botId) {
    if (!confirm('Are you sure you want to delete this bot?')) return;

    try {
        const response = await fetch(`/api/bots/${botId}`, {
            method: 'DELETE'
        });

        const result = await response.json();
        if (result.success) {
            showNotification('Bot deleted successfully!', 'success');
            if (currentBotId === botId) {
                currentBotId = null;
                noBotSelected.style.display = 'flex';
                chatArea.style.display = 'none';
            }
            await loadBots();
        } else {
            showNotification('Error deleting bot', 'error');
        }
    } catch (error) {
        console.error('Error deleting bot:', error);
        showNotification('Error deleting bot', 'error');
    }
}

// Select bot for chatting
async function selectBot(botId) {
    currentBotId = botId;
    const bot = bots[botId];
    
    currentBotName.textContent = bot.name;
    noBotSelected.style.display = 'none';
    chatArea.style.display = 'flex';
    
    renderBotList(); // Update active state
    await loadChatHistory(botId);
}

// Load chat history
async function loadChatHistory(botId) {
    try {
        const response = await fetch(`/api/chat/${botId}/history`);
        const history = await response.json();
        
        chatMessages.innerHTML = '';
        history.forEach(msg => {
            appendMessage(msg.role, msg.message, msg.timestamp);
        });
        scrollToBottom();
    } catch (error) {
        console.error('Error loading chat history:', error);
    }
}

// Send message
async function sendMessage() {
    if (!currentBotId) {
        showNotification('Please select a bot first', 'error');
        return;
    }

    const message = messageInput.value.trim();
    if (!message) return;

    // Add user message to chat
    appendMessage('user', message);
    messageInput.value = '';
    scrollToBottom();

    // Disable input while waiting for response
    messageInput.disabled = true;
    sendBtn.disabled = true;

    try {
        const response = await fetch(`/api/chat/${currentBotId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message })
        });

        const result = await response.json();
        if (result.success) {
            appendMessage('bot', result.response);
            scrollToBottom();
        } else {
            showNotification('Error sending message', 'error');
        }
    } catch (error) {
        console.error('Error sending message:', error);
        showNotification('Error sending message', 'error');
    } finally {
        messageInput.disabled = false;
        sendBtn.disabled = false;
        messageInput.focus();
    }
}

// Append message to chat
function appendMessage(role, message, timestamp = null) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    
    const time = timestamp ? new Date(timestamp) : new Date();
    const timeStr = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    messageDiv.innerHTML = `
        <div class="message-content">${escapeHtml(message)}</div>
        <div class="message-time">${timeStr}</div>
    `;
    
    chatMessages.appendChild(messageDiv);
}

// Clear chat
async function clearChat() {
    if (!currentBotId) return;
    if (!confirm('Clear chat history?')) return;

    try {
        const response = await fetch(`/api/chat/${currentBotId}/clear`, {
            method: 'POST'
        });

        const result = await response.json();
        if (result.success) {
            chatMessages.innerHTML = '';
            showNotification('Chat cleared', 'success');
        }
    } catch (error) {
        console.error('Error clearing chat:', error);
        showNotification('Error clearing chat', 'error');
    }
}

// Scroll to bottom of chat
function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Show notification
function showNotification(message, type = 'info') {
    // Simple console notification for now
    console.log(`[${type.toUpperCase()}] ${message}`);
    
    // You can enhance this with a proper toast notification
    alert(message);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
