#!/usr/bin/env node

import OpenAI from 'openai';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { getApiKey } from './config';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

async function main() {
  const apiKey = await getApiKey();
  const client = new OpenAI({ apiKey });

  console.log(chalk.green('Welcome to ChatGPT CLI!'));
  console.log('Type "exit" or "quit" to end the conversation.');
  console.log('Type "clear" to start a new conversation.');
  console.log('-'.repeat(50));

  const messages: Message[] = [];

  while (true) {
    try {
      const { userInput } = await inquirer.prompt([
        {
          type: 'input',
          name: 'userInput',
          message: chalk.blue('You:'),
        },
      ]);

      if (userInput.toLowerCase() === 'exit' || userInput.toLowerCase() === 'quit') {
        console.log(chalk.yellow('Goodbye!'));
        break;
      }

      if (userInput.toLowerCase() === 'clear') {
        messages.length = 0;
        console.log(chalk.yellow('Conversation cleared.'));
        continue;
      }

      messages.push({ role: 'user', content: userInput });

      process.stdout.write(chalk.green('Assistant: '));
      const stream = await client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: messages as ChatCompletionMessageParam[],
        temperature: 0.7,
        stream: true,
      });

      let assistantResponse = '';
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        process.stdout.write(content);
        assistantResponse += content;
      }
      console.log(); // New line after response

      messages.push({ role: 'assistant', content: assistantResponse });

    } catch (error) {
      if (error instanceof Error) {
        console.error(chalk.red(`Error: ${error.message}`));
      } else {
        console.error(chalk.red('An unknown error occurred'));
      }
    }
  }
}

main().catch(console.error); 