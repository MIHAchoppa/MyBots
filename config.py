"""
Configuration module for MyBots application
"""
import os

class Config:
    """Application configuration"""
    
    # Flask configuration
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    
    # Session configuration
    SESSION_TYPE = 'filesystem'
    PERMANENT_SESSION_LIFETIME = 86400  # 24 hours
    
    # Data storage
    BOTS_FILE = os.environ.get('BOTS_FILE') or 'bots_data.json'
    
    # Application settings
    MAX_BOT_NAME_LENGTH = int(os.environ.get('MAX_BOT_NAME_LENGTH', 100))
    MAX_PERSONALITY_LENGTH = int(os.environ.get('MAX_PERSONALITY_LENGTH', 500))
    MAX_PROMPT_LENGTH = int(os.environ.get('MAX_PROMPT_LENGTH', 2000))
    MAX_MESSAGE_LENGTH = int(os.environ.get('MAX_MESSAGE_LENGTH', 1000))
    MAX_CHAT_HISTORY = int(os.environ.get('MAX_CHAT_HISTORY', 100))
    
    # Server settings
    DEBUG = os.environ.get('FLASK_DEBUG', 'True').lower() == 'true'
    HOST = os.environ.get('FLASK_HOST', '0.0.0.0')
    PORT = int(os.environ.get('FLASK_PORT', 5000))
