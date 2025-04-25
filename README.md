# aincli

A command-line interface for ChatGPT using OpenAI API.

## Installation

```bash
npm install -g aincli
```

## Configuration

### Setting up OpenAI API Key

When you first run `aincli`, it will:
1. Create a configuration directory at `~/.aincli` in your home folder
2. Prompt you to enter your OpenAI API key
3. Store the API key securely in `~/.aincli/config.json`

The configuration is stored securely and only needs to be set up once. After that, you can use `aincli` from any directory without needing to reconfigure.

### Manual Configuration (Optional)

If you prefer to set up the API key manually:

1. Create the configuration directory:
   ```bash
   mkdir -p ~/.aincli
   `

2. Create a `config.json` file with your API key:
   ```bash
   echo '{"apiKey":"your-api-key-here"}' > ~/.aincli/config.json
   ```

3. Set secure permissions:
   ```bash
   chmod 600 ~/.aincli/config.json
   ```

## Usage

After installation and configuration, you can use the `aincli` command from anywhere in your terminal:

```bash
aincli
```

### Commands
- Type your message and press Enter to chat with ChatGPT
- Type `exit` or `quit` to end the conversation
- Type `clear` to start a new conversation

## Features
- Real-time streaming responses from ChatGPT
- Conversation history maintained during the session
- Colored terminal interface
- Secure API key storage in your home directory
- Works globally from any directory

## Requirements
- Node.js >= 14.0.0
- An OpenAI API key

## Getting an OpenAI API Key
1. Go to [OpenAI's website](https://platform.openai.com/)
2. Sign up or log in
3. Navigate to the API keys section
4. Create a new API key

## License
MIT 