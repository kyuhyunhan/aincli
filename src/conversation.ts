import fs from 'fs';
import path from 'path';
import os from 'os';
import chalk from 'chalk';

const CONVERSATIONS_DIR = path.join(os.homedir(), '.aincli', 'conversations');

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export class ConversationManager {
  private static ensureConversationsDir(): void {
    if (!fs.existsSync(CONVERSATIONS_DIR)) {
      fs.mkdirSync(CONVERSATIONS_DIR, { recursive: true, mode: 0o700 });
    }
  }

  static async saveConversation(messages: Message[], title?: string): Promise<string> {
    this.ensureConversationsDir();
    
    const conversation: Conversation = {
      id: Date.now().toString(),
      title: title || `Conversation ${new Date().toLocaleString()}`,
      messages,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const filePath = path.join(CONVERSATIONS_DIR, `${conversation.id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(conversation, null, 2));
    fs.chmodSync(filePath, 0o600);

    return conversation.id;
  }

  static async listConversations(): Promise<Conversation[]> {
    this.ensureConversationsDir();
    
    const files = fs.readdirSync(CONVERSATIONS_DIR);
    const conversations: Conversation[] = [];

    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(CONVERSATIONS_DIR, file);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        conversations.push({
          ...data,
          createdAt: new Date(data.createdAt),
          updatedAt: new Date(data.updatedAt)
        });
      }
    }

    return conversations.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  static async loadConversation(id: string): Promise<Conversation | null> {
    this.ensureConversationsDir();
    
    const filePath = path.join(CONVERSATIONS_DIR, `${id}.json`);
    if (!fs.existsSync(filePath)) {
      return null;
    }

    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    return {
      ...data,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt)
    };
  }

  static async deleteConversation(id: string): Promise<boolean> {
    this.ensureConversationsDir();
    
    const filePath = path.join(CONVERSATIONS_DIR, `${id}.json`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  }

  static async renameConversation(id: string, newTitle: string): Promise<boolean> {
    this.ensureConversationsDir();
    
    const filePath = path.join(CONVERSATIONS_DIR, `${id}.json`);
    if (!fs.existsSync(filePath)) {
      return false;
    }

    const conversation = await this.loadConversation(id);
    if (!conversation) return false;

    conversation.title = newTitle;
    conversation.updatedAt = new Date();
    
    fs.writeFileSync(filePath, JSON.stringify(conversation, null, 2));
    return true;
  }
} 