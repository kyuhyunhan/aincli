#!/usr/bin/env node

import OpenAI from 'openai';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { getApiKey } from './config';
import { ConversationManager } from './conversation';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

async function showConversationList() {
  const conversations = await ConversationManager.listConversations();
  if (conversations.length === 0) {
    console.log(chalk.yellow('No conversations found.'));
    return null;
  }

  const choices = conversations.map(conv => ({
    name: `${conv.title} (${new Date(conv.updatedAt).toLocaleString()})`,
    value: conv.id
  }));

  const { selectedId } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedId',
      message: 'Select a conversation:',
      choices: [...choices, new inquirer.Separator(), { name: 'Cancel', value: null }]
    }
  ]);

  return selectedId;
}

async function main() {
  const apiKey = await getApiKey();
  const client = new OpenAI({ apiKey });

  console.log(chalk.green('Welcome to ChatGPT CLI!'));
  console.log('Type "exit" or "quit" to end the conversation.');
  console.log('Type "clear" to start a new conversation.');
  console.log('Type "list" to view all conversations.');
  console.log('Type "load" to load a previous conversation.');
  console.log('Type "save" to save the current conversation.');
  console.log('-'.repeat(50));

  let messages: Message[] = [];
  let currentConversationId: string | null = null;

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
        messages = [];
        currentConversationId = null;
        console.log(chalk.yellow('Conversation cleared.'));
        continue;
      }

      if (userInput.toLowerCase() === 'list') {
        const conversations = await ConversationManager.listConversations();
        if (conversations.length === 0) {
          console.log(chalk.yellow('No conversations found.'));
        } else {
          console.log(chalk.cyan('\nSaved Conversations:'));
          conversations.forEach(conv => {
            console.log(chalk.green(`- ${conv.title}`));
            console.log(`  ID: ${conv.id}`);
            console.log(`  Last updated: ${new Date(conv.updatedAt).toLocaleString()}`);
            console.log(`  Messages: ${conv.messages.length}`);
            console.log();
          });
        }
        continue;
      }

      if (userInput.toLowerCase() === 'load') {
        const selectedId = await showConversationList();
        if (selectedId) {
          const conversation = await ConversationManager.loadConversation(selectedId);
          if (conversation) {
            messages = conversation.messages;
            currentConversationId = conversation.id;
            console.log(chalk.green(`Loaded conversation: ${conversation.title}`));
            
            // Show the last few messages
            const lastMessages = messages.slice(-3);
            lastMessages.forEach(msg => {
              const prefix = msg.role === 'user' ? chalk.blue('You:') : chalk.green('Assistant:');
              console.log(`${prefix} ${msg.content}\n`);
            });
          }
        }
        continue;
      }

      if (userInput.toLowerCase() === 'save') {
        const { title } = await inquirer.prompt([
          {
            type: 'input',
            name: 'title',
            message: 'Enter a title for this conversation:',
            default: `Conversation ${new Date().toLocaleString()}`
          }
        ]);

        const id = await ConversationManager.saveConversation(messages, title);
        currentConversationId = id;
        console.log(chalk.green(`Conversation saved with ID: ${id}`));
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

      // Auto-save after each exchange if we have a conversation ID
      if (currentConversationId) {
        await ConversationManager.saveConversation(messages);
      }

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