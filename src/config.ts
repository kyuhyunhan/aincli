import fs from 'fs';
import path from 'path';
import os from 'os';
import chalk from 'chalk';
import inquirer from 'inquirer';

const CONFIG_DIR = path.join(os.homedir(), '.aincli');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

interface Config {
  apiKey: string;
}

function ensureConfigDir(): void {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { mode: 0o700 }); // Only user can read/write/execute
  }
}

function ensureConfigFile(): void {
  if (!fs.existsSync(CONFIG_FILE)) {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify({ apiKey: '' }, null, 2));
    fs.chmodSync(CONFIG_FILE, 0o600); // Only user can read/write
  }
}

function readConfig(): Config {
  try {
    return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8')) as Config;
  } catch (error) {
    console.error(chalk.red('Error reading configuration file:'), error);
    process.exit(1);
  }
}

function writeConfig(config: Config): void {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
    fs.chmodSync(CONFIG_FILE, 0o600);
  } catch (error) {
    console.error(chalk.red('Error writing configuration file:'), error);
    process.exit(1);
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

    writeConfig({ apiKey });
    return apiKey;
  } catch (error) {
    console.error(chalk.red('Error managing API key:'), error);
    process.exit(1);
  }
} 