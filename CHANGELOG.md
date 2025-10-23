# Changelog

All notable changes to this project will be documented in this file.

## [2.0.0] - 2025-10-23

### Added
- **Toast Notification System**: Beautiful, animated toast notifications replacing browser alerts
- **Loading States**: Visual loading indicators on buttons during API operations
- **Export/Import Functionality**: Ability to export bots to JSON and import them back
- **Input Validation**: Comprehensive validation on both frontend and backend
  - Bot name, personality, and prompt length validation
  - Message length validation
  - Empty input detection
- **Enhanced Bot Response System**: Significantly improved personality-based responses
  - Context-aware responses (greetings, questions, statements)
  - Multiple personality types: friendly, professional, humorous, serious, helpful
  - More natural conversation flow
- **Configuration Management**:
  - New `config.py` module for centralized configuration
  - Environment variable support via `.env` file
  - Configurable limits and settings
- **Security Improvements**:
  - Input sanitization and validation
  - XSS protection with HTML escaping
  - Session management improvements
  - Chat history size limits
- **Keyboard Shortcuts**:
  - Ctrl/Cmd + K to focus message input
  - Escape to close modal dialogs
- **Error Handling**: Comprehensive error handling in all API endpoints
- **Testing Suite**: Added pytest-based test suite with 6 tests
- **Docker Support**:
  - Dockerfile for containerized deployment
  - docker-compose.yml for easy setup
  - Health checks
- **Production Deployment**:
  - Gunicorn configuration
  - Environment-based configuration
  - Proper logging

### Changed
- Replaced browser `alert()` with custom toast notifications
- Improved UI/UX with loading states and better feedback
- Enhanced CSS with animations and loading spinners
- Updated documentation with new features and deployment instructions
- Improved bot response generation with contextual awareness
- Better error messages throughout the application

### Fixed
- Form submission without validation
- Missing error handling in API calls
- No feedback during async operations
- Memory issues with unlimited chat history

## [1.0.0] - Initial Release

### Added
- Basic bot creation and management (CRUD operations)
- Simple personality-based chat system
- Bot list with card-based UI
- Chat interface with message history
- Session-based chat history
- File-based JSON storage
- Responsive design
- Modern gradient UI
