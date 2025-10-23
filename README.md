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

1. Clone the repository:
```bash
git clone https://github.com/MIHAchoppa/MyBots.git
cd MyBots
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

## Usage

1. Start the application:
```bash
python app.py
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

- **Backend**: Python, Flask
- **Frontend**: HTML, CSS, JavaScript
- **Storage**: JSON file-based storage

## Future Enhancements

- Integration with AI APIs (OpenAI, Anthropic, etc.)
- Export/import bot configurations
- Voice chat capabilities
- Multi-user support
- Advanced personality customization
- Bot analytics and insights

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## License

MIT License - feel free to use this project for your own purposes!
