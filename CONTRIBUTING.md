# Contributing to MyBots

Thank you for considering contributing to MyBots! This document provides guidelines and instructions for contributing.

## How to Contribute

### Reporting Bugs

If you find a bug, please create an issue with:
- A clear, descriptive title
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Screenshots if applicable
- Your environment (OS, Python version, browser)

### Suggesting Features

Feature suggestions are welcome! Please create an issue with:
- A clear description of the feature
- Use cases and benefits
- Any implementation ideas you have

### Code Contributions

1. **Fork the repository**
   ```bash
   git clone https://github.com/YOUR-USERNAME/MyBots.git
   cd MyBots
   ```

2. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Follow the existing code style
   - Add tests for new features
   - Update documentation as needed

4. **Run tests**
   ```bash
   python -m pytest test_app.py -v
   ```

5. **Commit your changes**
   ```bash
   git add .
   git commit -m "Add feature: your feature description"
   ```

6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create a Pull Request**
   - Describe your changes clearly
   - Reference any related issues
   - Wait for review and address feedback

## Development Setup

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Copy environment configuration:
   ```bash
   cp .env.example .env
   ```

3. Run the development server:
   ```bash
   python app.py
   ```

4. Run tests:
   ```bash
   python -m pytest test_app.py -v
   ```

## Code Style

- Follow PEP 8 for Python code
- Use meaningful variable and function names
- Add docstrings to functions and classes
- Keep functions focused and small
- Comment complex logic

## Testing

- Write tests for new features
- Ensure existing tests pass
- Aim for good test coverage
- Test edge cases and error conditions

## Documentation

- Update README.md for user-facing changes
- Update CHANGELOG.md with your changes
- Add docstrings to new functions
- Update API documentation if needed

## Questions?

Feel free to open an issue for any questions about contributing!
