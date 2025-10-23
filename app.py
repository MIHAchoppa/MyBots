"""
Bot Personality Application
A Flask web application for creating and interacting with customizable AI bots
"""

from flask import Flask, render_template, request, jsonify, session
import json
import os
from datetime import datetime
from config import Config

app = Flask(__name__)
app.config.from_object(Config)

# Data storage file
BOTS_FILE = app.config['BOTS_FILE']

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

def validate_bot_data(data):
    """Validate bot data"""
    name = data.get('name', '').strip()
    personality = data.get('personality', '').strip()
    prompt = data.get('prompt', '').strip()
    
    if not name:
        return 'Bot name is required'
    if len(name) > app.config['MAX_BOT_NAME_LENGTH']:
        return f'Bot name must be less than {app.config["MAX_BOT_NAME_LENGTH"]} characters'
    if not personality:
        return 'Personality description is required'
    if len(personality) > app.config['MAX_PERSONALITY_LENGTH']:
        return f'Personality description must be less than {app.config["MAX_PERSONALITY_LENGTH"]} characters'
    if not prompt:
        return 'System prompt is required'
    if len(prompt) > app.config['MAX_PROMPT_LENGTH']:
        return f'System prompt must be less than {app.config["MAX_PROMPT_LENGTH"]} characters'
    
    return None

@app.route('/api/bots', methods=['POST'])
def create_bot():
    """Create a new bot"""
    try:
        data = request.json
        if not data:
            return jsonify({'success': False, 'error': 'Invalid request data'}), 400
        
        # Validate input
        validation_error = validate_bot_data(data)
        if validation_error:
            return jsonify({'success': False, 'error': validation_error}), 400
        
        bot_id = data.get('id', str(datetime.now().timestamp()))
        
        bots = load_bots()
        bots[bot_id] = {
            'id': bot_id,
            'name': data.get('name', '').strip(),
            'personality': data.get('personality', '').strip(),
            'prompt': data.get('prompt', '').strip(),
            'created_at': datetime.now().isoformat()
        }
        save_bots(bots)
        
        return jsonify({'success': True, 'bot': bots[bot_id]})
    except Exception as e:
        app.logger.error(f'Error creating bot: {str(e)}')
        return jsonify({'success': False, 'error': 'Internal server error'}), 500

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
    try:
        data = request.json
        if not data:
            return jsonify({'success': False, 'error': 'Invalid request data'}), 400
        
        # Validate input
        validation_error = validate_bot_data(data)
        if validation_error:
            return jsonify({'success': False, 'error': validation_error}), 400
        
        bots = load_bots()
        
        if bot_id in bots:
            bots[bot_id].update({
                'name': data.get('name', '').strip(),
                'personality': data.get('personality', '').strip(),
                'prompt': data.get('prompt', '').strip(),
                'updated_at': datetime.now().isoformat()
            })
            save_bots(bots)
            return jsonify({'success': True, 'bot': bots[bot_id]})
        
        return jsonify({'success': False, 'error': 'Bot not found'}), 404
    except Exception as e:
        app.logger.error(f'Error updating bot: {str(e)}')
        return jsonify({'success': False, 'error': 'Internal server error'}), 500

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
    try:
        data = request.json
        if not data:
            return jsonify({'success': False, 'error': 'Invalid request data'}), 400
        
        user_message = data.get('message', '').strip()
        
        if not user_message:
            return jsonify({'success': False, 'error': 'Message cannot be empty'}), 400
        
        if len(user_message) > app.config['MAX_MESSAGE_LENGTH']:
            return jsonify({'success': False, 'error': f'Message too long (max {app.config["MAX_MESSAGE_LENGTH"]} characters)'}), 400
        
        bots = load_bots()
        if bot_id not in bots:
            return jsonify({'success': False, 'error': 'Bot not found'}), 404
        
        bot = bots[bot_id]
        
        # Initialize chat history in session
        if 'chat_history' not in session:
            session['chat_history'] = {}
        if bot_id not in session['chat_history']:
            session['chat_history'][bot_id] = []
        
        # Limit chat history to prevent memory issues
        if len(session['chat_history'][bot_id]) > app.config['MAX_CHAT_HISTORY']:
            session['chat_history'][bot_id] = session['chat_history'][bot_id][-app.config['MAX_CHAT_HISTORY']:]
        
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
    except Exception as e:
        app.logger.error(f'Error in chat: {str(e)}')
        return jsonify({'success': False, 'error': 'Internal server error'}), 500

def generate_bot_response(bot, user_message, chat_history):
    """Generate a response based on bot's personality and prompt"""
    personality = bot.get('personality', '').lower()
    prompt = bot.get('prompt', '')
    bot_name = bot.get('name', 'Bot')
    
    # Greeting detection
    greetings = ['hello', 'hi', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening']
    is_greeting = any(greeting in user_message.lower() for greeting in greetings)
    
    # Question detection
    is_question = '?' in user_message
    
    # Generate contextual response based on personality
    if 'friendly' in personality or 'enthusiastic' in personality:
        if is_greeting:
            response = f"Hey there! 😊 I'm {bot_name}! It's great to meet you! How can I help you today?"
        elif is_question:
            response = f"That's a great question! {user_message}\n\nAs {bot_name}, I'd love to help you with that! {prompt[:150] if prompt else 'Let me share what I know about this topic.'}"
        else:
            response = f"Thanks for sharing that! I'm {bot_name}, and I'm really excited to chat with you! {prompt[:150] if prompt else 'Feel free to ask me anything!'}"
    
    elif 'professional' in personality or 'formal' in personality:
        if is_greeting:
            response = f"Good day. I am {bot_name}. {prompt[:100] if prompt else 'How may I assist you today?'}"
        elif is_question:
            response = f"Regarding your inquiry: \"{user_message}\"\n\nI will provide you with a comprehensive response. {prompt[:150] if prompt else 'Please allow me to address this matter thoroughly.'}"
        else:
            response = f"I acknowledge your message. As {bot_name}, {prompt[:150] if prompt else 'I am here to provide professional assistance.'}"
    
    elif 'humor' in personality or 'funny' in personality or 'witty' in personality:
        if is_greeting:
            response = f"Well hello there! 😄 I'm {bot_name}, the bot with jokes! Why did the bot cross the road? To process data on the other side! But seriously, how can I help?"
        elif is_question:
            response = f"Ooh, a question! {user_message}\n\nLet me think... *pretends to think really hard* 🤔 As {bot_name}, I'd say: {prompt[:150] if prompt else 'The answer is probably 42, but let me give you a better one!'}"
        else:
            response = f"Haha, nice! {user_message}? I love it! I'm {bot_name}, and I'm here to bring some fun to our chat! {prompt[:150] if prompt else '😄'}"
    
    elif 'serious' in personality or 'analytical' in personality or 'thorough' in personality:
        if is_greeting:
            response = f"Greetings. I am {bot_name}. {prompt[:100] if prompt else 'I am prepared to engage in focused, analytical discussion.'}"
        elif is_question:
            response = f"Your question requires careful consideration: \"{user_message}\"\n\nLet me provide a thorough analysis. {prompt[:150] if prompt else 'I will examine this matter systematically and provide detailed insights.'}"
        else:
            response = f"I have received your input. As {bot_name}, I approach this with careful consideration. {prompt[:150] if prompt else 'I am prepared to provide detailed, analytical responses.'}"
    
    elif 'helpful' in personality or 'assistant' in personality:
        if is_greeting:
            response = f"Hello! I'm {bot_name}, your helpful assistant. {prompt[:100] if prompt else 'How can I help you today?'}"
        elif is_question:
            response = f"I'd be happy to help with that question!\n\n\"{user_message}\"\n\n{prompt[:150] if prompt else 'Let me assist you with finding the answer.'}"
        else:
            response = f"Thank you for your message! I'm {bot_name}. {prompt[:150] if prompt else 'I am here to help you with whatever you need!'}"
    
    else:
        # Default response
        if is_greeting:
            response = f"Hello! I'm {bot_name}. {prompt[:100] if prompt else 'Nice to meet you!'}"
        elif is_question:
            response = f"You asked: \"{user_message}\"\n\nI'm {bot_name}. {prompt[:150] if prompt else 'I will do my best to answer your question.'}"
        else:
            response = f"I'm {bot_name}. {prompt[:200] if prompt else 'How can I assist you today?'}"
    
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
    app.run(debug=app.config['DEBUG'], host=app.config['HOST'], port=app.config['PORT'])
