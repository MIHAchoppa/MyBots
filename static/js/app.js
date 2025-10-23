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
    
    // Export/Import functionality
    const exportBtn = document.getElementById('exportBotsBtn');
    const importBtn = document.getElementById('importBotsBtn');
    const importFileInput = document.getElementById('importFileInput');
    
    if (exportBtn) exportBtn.addEventListener('click', exportBots);
    if (importBtn) {
        importBtn.addEventListener('click', () => importFileInput.click());
    }
    if (importFileInput) {
        importFileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                importBots(e.target.files[0]);
                e.target.value = ''; // Reset input
            }
        });
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + K to focus message input
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            if (currentBotId) messageInput.focus();
        }
        // Escape to close modal
        if (e.key === 'Escape' && botFormModal.style.display === 'block') {
            closeBotForm();
        }
    });
    
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
        name: document.getElementById('botName').value.trim(),
        personality: document.getElementById('botPersonality').value.trim(),
        prompt: document.getElementById('botPrompt').value.trim()
    };

    // Validate input
    const validationError = validateBotData(botData.name, botData.personality, botData.prompt);
    if (validationError) {
        showNotification(validationError, 'error');
        return;
    }

    const submitBtn = e.target.querySelector('button[type="submit"]');
    setButtonLoading(submitBtn, true);

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
            showNotification(result.error || 'Error saving bot', 'error');
        }
    } catch (error) {
        console.error('Error saving bot:', error);
        showNotification('Error saving bot. Please try again.', 'error');
    } finally {
        setButtonLoading(submitBtn, false);
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

// Show notification (Toast)
function showNotification(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: '✓',
        error: '✗',
        warning: '⚠',
        info: 'ℹ'
    };
    
    toast.innerHTML = `
        <span class="toast-icon">${icons[type] || icons.info}</span>
        <span class="toast-message">${escapeHtml(message)}</span>
    `;
    
    container.appendChild(toast);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        toast.classList.add('hiding');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Add loading state to button
function setButtonLoading(button, isLoading) {
    if (isLoading) {
        button.disabled = true;
        button.dataset.originalText = button.textContent;
        button.innerHTML = `${button.dataset.originalText} <span class="loading"></span>`;
    } else {
        button.disabled = false;
        button.textContent = button.dataset.originalText || button.textContent;
    }
}

// Validate bot form data
function validateBotData(name, personality, prompt) {
    if (!name || name.trim().length === 0) {
        return 'Bot name is required';
    }
    if (name.trim().length > 100) {
        return 'Bot name must be less than 100 characters';
    }
    if (!personality || personality.trim().length === 0) {
        return 'Personality description is required';
    }
    if (personality.trim().length > 500) {
        return 'Personality description must be less than 500 characters';
    }
    if (!prompt || prompt.trim().length === 0) {
        return 'System prompt is required';
    }
    if (prompt.trim().length > 2000) {
        return 'System prompt must be less than 2000 characters';
    }
    return null;
}

// Export bots to JSON file
async function exportBots() {
    try {
        const response = await fetch('/api/bots');
        const bots = await response.json();
        
        if (Object.keys(bots).length === 0) {
            showNotification('No bots to export', 'warning');
            return;
        }
        
        const dataStr = JSON.stringify(bots, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `mybots-export-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
        
        showNotification('Bots exported successfully!', 'success');
    } catch (error) {
        console.error('Error exporting bots:', error);
        showNotification('Error exporting bots', 'error');
    }
}

// Import bots from JSON file
async function importBots(file) {
    try {
        const text = await file.text();
        const importedBots = JSON.parse(text);
        
        if (typeof importedBots !== 'object' || Array.isArray(importedBots)) {
            showNotification('Invalid bot file format', 'error');
            return;
        }
        
        let imported = 0;
        for (const [botId, botData] of Object.entries(importedBots)) {
            try {
                const response = await fetch('/api/bots', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(botData)
                });
                if (response.ok) imported++;
            } catch (e) {
                console.error('Error importing bot:', e);
            }
        }
        
        await loadBots();
        showNotification(`Successfully imported ${imported} bot(s)!`, 'success');
    } catch (error) {
        console.error('Error importing bots:', error);
        showNotification('Error importing bots: Invalid file format', 'error');
    }
}
