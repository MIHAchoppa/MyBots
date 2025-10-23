"""
Bot Personality Application
A Flask web application for creating and interacting with customizable AI bots
"""

from flask import Flask, render_template, request, jsonify, session
import json
import os
from datetime import datetime
import secrets

app = Flask(__name__)
app.secret_key = secrets.token_hex(16)

# Data storage file
BOTS_FILE = 'bots_data.json'

def load_bots():
    """Load bots from JSON file"""
    if os.path.exists(BOTS_FILE):
        with open(BOTS_FILE, 'r') as f:
            return json.load(f)
    return {}

def save_bots(bots):
    """Save bots to JSON file"""
    with open(BOTS_FILE, 'w') as f:
        json.dump(bots, f, indent=2)

@app.route('/')
def index():
    """Main page - show all bots"""
    return render_template('index.html')

@app.route('/api/bots', methods=['GET'])
def get_bots():
    """Get all bots"""
    bots = load_bots()
    return jsonify(bots)

@app.route('/api/bots', methods=['POST'])
def create_bot():
    """Create a new bot"""
    data = request.json
    bot_id = data.get('id', str(datetime.now().timestamp()))
    
    bots = load_bots()
    bots[bot_id] = {
        'id': bot_id,
        'name': data.get('name', 'Unnamed Bot'),
        'personality': data.get('personality', ''),
        'prompt': data.get('prompt', ''),
        'created_at': datetime.now().isoformat()
    }
    save_bots(bots)
    
    return jsonify({'success': True, 'bot': bots[bot_id]})

@app.route('/api/bots/<bot_id>', methods=['GET'])
def get_bot(bot_id):
    """Get a specific bot"""
    bots = load_bots()
    if bot_id in bots:
        return jsonify(bots[bot_id])
    return jsonify({'error': 'Bot not found'}), 404

@app.route('/api/bots/<bot_id>', methods=['PUT'])
def update_bot(bot_id):
    """Update a bot"""
    data = request.json
    bots = load_bots()
    
    if bot_id in bots:
        bots[bot_id].update({
            'name': data.get('name', bots[bot_id]['name']),
            'personality': data.get('personality', bots[bot_id]['personality']),
            'prompt': data.get('prompt', bots[bot_id]['prompt']),
            'updated_at': datetime.now().isoformat()
        })
        save_bots(bots)
        return jsonify({'success': True, 'bot': bots[bot_id]})
    
    return jsonify({'error': 'Bot not found'}), 404

@app.route('/api/bots/<bot_id>', methods=['DELETE'])
def delete_bot(bot_id):
    """Delete a bot"""
    bots = load_bots()
    
    if bot_id in bots:
        del bots[bot_id]
        save_bots(bots)
        return jsonify({'success': True})
    
    return jsonify({'error': 'Bot not found'}), 404

@app.route('/api/chat/<bot_id>', methods=['POST'])
def chat_with_bot(bot_id):
    """Chat with a specific bot"""
    data = request.json
    user_message = data.get('message', '')
    
    bots = load_bots()
    if bot_id not in bots:
        return jsonify({'error': 'Bot not found'}), 404
    
    bot = bots[bot_id]
    
    # Initialize chat history in session
    if 'chat_history' not in session:
        session['chat_history'] = {}
    if bot_id not in session['chat_history']:
        session['chat_history'][bot_id] = []
    
    # Add user message to history
    session['chat_history'][bot_id].append({
        'role': 'user',
        'message': user_message,
        'timestamp': datetime.now().isoformat()
    })
    
    # Generate bot response based on personality and prompt
    bot_response = generate_bot_response(bot, user_message, session['chat_history'][bot_id])
    
    # Add bot response to history
    session['chat_history'][bot_id].append({
        'role': 'bot',
        'message': bot_response,
        'timestamp': datetime.now().isoformat()
    })
    
    session.modified = True
    
    return jsonify({
        'success': True,
        'response': bot_response,
        'bot_name': bot['name']
    })

def generate_bot_response(bot, user_message, chat_history):
    """Generate a response based on bot's personality and prompt"""
    personality = bot.get('personality', '')
    prompt = bot.get('prompt', '')
    
    # Simple response generation (can be enhanced with AI/ML models)
    response = f"As {bot['name']}, with personality: {personality[:50]}..., I received your message: '{user_message}'"
    
    # Add personality-based responses
    if personality.lower().find('friendly') != -1:
        response = f"Hey there! 😊 {user_message}? That's great! I'm {bot['name']}, and I'm here to help!"
    elif personality.lower().find('professional') != -1:
        response = f"Hello. I'm {bot['name']}. I understand you mentioned: {user_message}. How may I assist you further?"
    elif personality.lower().find('funny') != -1 or personality.lower().find('humorous') != -1:
        response = f"Haha! {user_message}? That's hilarious! I'm {bot['name']}, the bot with a sense of humor! 😄"
    elif personality.lower().find('serious') != -1:
        response = f"I see. Regarding '{user_message}', let me provide you with a thorough response. I'm {bot['name']}."
    else:
        response = f"I'm {bot['name']}. You said: {user_message}. {prompt[:100] if prompt else 'How can I help you?'}"
    
    return response

@app.route('/api/chat/<bot_id>/history', methods=['GET'])
def get_chat_history(bot_id):
    """Get chat history for a bot"""
    if 'chat_history' not in session or bot_id not in session['chat_history']:
        return jsonify([])
    return jsonify(session['chat_history'][bot_id])

@app.route('/api/chat/<bot_id>/clear', methods=['POST'])
def clear_chat_history(bot_id):
    """Clear chat history for a bot"""
    if 'chat_history' in session and bot_id in session['chat_history']:
        session['chat_history'][bot_id] = []
        session.modified = True
    return jsonify({'success': True})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
