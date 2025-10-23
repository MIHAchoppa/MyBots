# MyBots - Bot Personality Manager 🤖

A web application that allows you to create and interact with customizable AI bots. Load prompts, define personalities, and chat with your bots!

## Features

- **Create Custom Bots**: Design bots with unique names, personalities, and system prompts
- **Personality System**: Define how your bots behave (friendly, professional, humorous, serious, etc.)
- **Interactive Chat**: Have real-time conversations with your bots
- **Bot Management**: Edit, delete, and manage multiple bots
- **Chat History**: Keep track of conversations with each bot
- **Beautiful UI**: Modern, responsive interface that works on all devices

## Installation

### Standard Installation

1. Clone the repository:
```bash
git clone https://github.com/MIHAchoppa/MyBots.git
cd MyBots
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. (Optional) Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your preferred settings
```

### Docker Installation

1. Clone the repository:
```bash
git clone https://github.com/MIHAchoppa/MyBots.git
cd MyBots
```

2. Build and run with Docker Compose:
```bash
docker-compose up -d
```

## Usage

1. Start the application:

**Development mode:**
```bash
python app.py
```

**Production mode (with Gunicorn):**
```bash
gunicorn --bind 0.0.0.0:5000 --workers 4 app:app
```

**Docker:**
```bash
docker-compose up
```

2. Open your browser and navigate to:
```
http://localhost:5000
```

3. Create your first bot:
   - Click "Create New Bot"
   - Enter a name (e.g., "Friendly Assistant")
   - Describe the personality (e.g., "friendly, helpful, and enthusiastic")
   - Add a system prompt (e.g., "You are a helpful assistant that answers questions about technology")
   - Click "Save Bot"

4. Start chatting:
   - Click the "Chat" button on any bot
   - Type your message and press Enter or click Send
   - The bot will respond based on its personality!

5. Export/Import bots:
   - Use "Export Bots" to save all your bots to a JSON file
   - Use "Import Bots" to restore bots from a JSON file

### Keyboard Shortcuts

- **Ctrl/Cmd + K**: Focus message input (when bot is selected)
- **Escape**: Close modal dialogs
- **Enter**: Send message in chat

## Bot Personalities

The application supports different personality types:
- **Friendly**: Warm, enthusiastic, and welcoming
- **Professional**: Formal, structured, and business-like
- **Humorous**: Funny, lighthearted, and entertaining
- **Serious**: Focused, thorough, and analytical

You can mix and match traits or create your own unique personalities!

## Project Structure

```
MyBots/
├── app.py                  # Flask application backend
├── templates/
│   └── index.html         # Main HTML template
├── static/
│   ├── css/
│   │   └── style.css      # Styles
│   └── js/
│       └── app.js         # Frontend JavaScript
├── bots_data.json         # Bot storage (auto-generated)
├── requirements.txt       # Python dependencies
└── README.md             # This file
```

## API Endpoints

- `GET /api/bots` - Get all bots
- `POST /api/bots` - Create a new bot
- `GET /api/bots/<bot_id>` - Get a specific bot
- `PUT /api/bots/<bot_id>` - Update a bot
- `DELETE /api/bots/<bot_id>` - Delete a bot
- `POST /api/chat/<bot_id>` - Send a message to a bot
- `GET /api/chat/<bot_id>/history` - Get chat history
- `POST /api/chat/<bot_id>/clear` - Clear chat history

## Technologies Used

- **Backend**: Python, Flask, Gunicorn
- **Frontend**: HTML, CSS, JavaScript
- **Storage**: JSON file-based storage
- **Testing**: pytest
- **Deployment**: Docker, Docker Compose

## New Features (Version 2.0)

✅ **Toast Notifications**: Beautiful, non-intrusive notifications instead of alerts  
✅ **Loading States**: Visual feedback during API operations  
✅ **Export/Import**: Backup and restore your bot configurations  
✅ **Input Validation**: Comprehensive validation on both frontend and backend  
✅ **Enhanced Personality System**: More sophisticated bot responses based on personality traits  
✅ **Configuration Management**: Environment variable support for easy deployment  
✅ **Error Handling**: Robust error handling throughout the application  
✅ **Security Improvements**: Input sanitization and validation  
✅ **Keyboard Shortcuts**: Productivity enhancements  
✅ **Tests**: Automated testing for critical functionality  
✅ **Docker Support**: Easy containerized deployment  
✅ **Production Ready**: Gunicorn configuration for production deployments

## Configuration

You can configure the application using environment variables (see `.env.example`):

- `SECRET_KEY`: Flask secret key for sessions (required for production)
- `FLASK_DEBUG`: Enable/disable debug mode (default: True)
- `FLASK_HOST`: Host to bind to (default: 0.0.0.0)
- `FLASK_PORT`: Port to bind to (default: 5000)
- `BOTS_FILE`: Path to bots data file (default: bots_data.json)
- `MAX_BOT_NAME_LENGTH`: Maximum bot name length (default: 100)
- `MAX_PERSONALITY_LENGTH`: Maximum personality description length (default: 500)
- `MAX_PROMPT_LENGTH`: Maximum system prompt length (default: 2000)
- `MAX_MESSAGE_LENGTH`: Maximum chat message length (default: 1000)
- `MAX_CHAT_HISTORY`: Maximum messages to keep in chat history (default: 100)

## Testing

Run the test suite:

```bash
python -m pytest test_app.py -v
```

## Future Enhancements

- Integration with AI APIs (OpenAI, Anthropic, etc.)
- Voice chat capabilities
- Multi-user support with authentication
- Advanced personality customization with sliders
- Bot analytics and conversation insights
- Rate limiting and API throttling
- WebSocket support for real-time updates
- Bot templates library

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## License

MIT License - feel free to use this project for your own purposes!
