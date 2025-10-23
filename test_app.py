"""
Basic tests for MyBots application
Run with: python -m pytest test_app.py
"""
import pytest
import json
import os
from app import app, validate_bot_data

@pytest.fixture
def client():
    """Create test client"""
    app.config['TESTING'] = True
    app.config['BOTS_FILE'] = 'test_bots_data.json'
    
    with app.test_client() as client:
        yield client
    
    # Cleanup
    if os.path.exists('test_bots_data.json'):
        os.remove('test_bots_data.json')

def test_index_page(client):
    """Test that index page loads"""
    response = client.get('/')
    assert response.status_code == 200
    assert b'MyBots' in response.data

def test_validate_bot_data():
    """Test bot data validation"""
    # Valid data
    valid_data = {
        'name': 'Test Bot',
        'personality': 'Friendly and helpful',
        'prompt': 'You are a test bot'
    }
    assert validate_bot_data(valid_data) is None
    
    # Missing name
    invalid_data = {
        'name': '',
        'personality': 'Friendly',
        'prompt': 'Test'
    }
    assert validate_bot_data(invalid_data) == 'Bot name is required'
    
    # Name too long
    long_name_data = {
        'name': 'a' * 150,
        'personality': 'Friendly',
        'prompt': 'Test'
    }
    assert 'must be less than' in validate_bot_data(long_name_data)

def test_create_bot(client):
    """Test creating a bot"""
    bot_data = {
        'name': 'Test Bot',
        'personality': 'Friendly and helpful',
        'prompt': 'You are a helpful assistant'
    }
    
    response = client.post('/api/bots',
                          data=json.dumps(bot_data),
                          content_type='application/json')
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['success'] is True
    assert data['bot']['name'] == 'Test Bot'

def test_get_bots(client):
    """Test getting all bots"""
    response = client.get('/api/bots')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert isinstance(data, dict)

def test_chat_validation(client):
    """Test chat message validation"""
    # First create a bot
    bot_data = {
        'name': 'Test Bot',
        'personality': 'Friendly',
        'prompt': 'Test bot'
    }
    
    create_response = client.post('/api/bots',
                                 data=json.dumps(bot_data),
                                 content_type='application/json')
    bot_id = json.loads(create_response.data)['bot']['id']
    
    # Test empty message
    response = client.post(f'/api/chat/{bot_id}',
                          data=json.dumps({'message': ''}),
                          content_type='application/json')
    assert response.status_code == 400
    
    # Test valid message
    response = client.post(f'/api/chat/{bot_id}',
                          data=json.dumps({'message': 'Hello bot!'}),
                          content_type='application/json')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['success'] is True
    assert 'response' in data

def test_delete_bot(client):
    """Test deleting a bot"""
    # Create a bot first
    bot_data = {
        'name': 'Test Bot',
        'personality': 'Friendly',
        'prompt': 'Test bot'
    }
    
    create_response = client.post('/api/bots',
                                 data=json.dumps(bot_data),
                                 content_type='application/json')
    bot_id = json.loads(create_response.data)['bot']['id']
    
    # Delete the bot
    response = client.delete(f'/api/bots/{bot_id}')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['success'] is True

if __name__ == '__main__':
    pytest.main([__file__, '-v'])
