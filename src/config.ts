import fs from 'fs';
import path from 'path';
import os from 'os';
import inquirer from 'inquirer';

const CONFIG_DIR = path.join(os.homedir(), '.aincli');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

interface Config {
  apiKey: string;
}

function ensureConfigDir(): void {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { mode: 0o700 });
  }
}

function ensureConfigFile(): void {
  if (!fs.existsSync(CONFIG_FILE)) {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify({ apiKey: '' }, null, 2));
  }
}

function readConfig(): Config {
  try {
    const data = fs.readFileSync(CONFIG_FILE, 'utf-8');
    const config = JSON.parse(data);
    
    if (typeof config !== 'object' || config === null) {
      throw new Error('Invalid config format');
    }
    
    if (typeof config.apiKey !== 'string') {
      throw new Error('Invalid API key format');
    }
    
    return config;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('Invalid JSON in configuration file.');
    }
    throw error;
  }
}

export async function getApiKey(): Promise<string> {
  try {
    ensureConfigDir();
    ensureConfigFile();
    
    const config = readConfig();
    
    if (config.apiKey) {
      return config.apiKey;
    }

    const { apiKey } = await inquirer.prompt([
      {
        type: 'password',
        name: 'apiKey',
        message: 'Enter your OpenAI API key:',
        validate: (input: string) => input.length > 0 || 'API key cannot be empty',
      },
    ]);

    fs.writeFileSync(CONFIG_FILE, JSON.stringify({ apiKey }, null, 2));
    return apiKey;
  } catch (error) {
    throw error;
  }
} 