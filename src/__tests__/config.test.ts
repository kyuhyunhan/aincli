import fs from 'fs';
import path from 'path';
import os from 'os';
import { getApiKey } from '../config';

// Mock the fs module
jest.mock('fs');
// Mock inquirer
jest.mock('inquirer', () => ({
  prompt: jest.fn().mockResolvedValue({ apiKey: 'test-api-key' })
}));

describe('Config Module', () => {
  const mockConfigDir = path.join(os.homedir(), '.aincli');
  const mockConfigFile = path.join(mockConfigDir, 'config.json');

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('getApiKey', () => {
    it('should create config directory and file if they do not exist', async () => {
      // Mock fs.existsSync to return false (directory doesn't exist)
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      // Mock fs.readFileSync to return a valid config
      (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify({ apiKey: '' }));

      await getApiKey();

      // Verify that mkdirSync was called with correct path
      expect(fs.mkdirSync).toHaveBeenCalledWith(mockConfigDir, { mode: 0o700 });
      // Verify that writeFileSync was called with correct path and content
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        mockConfigFile,
        JSON.stringify({ apiKey: '' }, null, 2)
      );
    });

    it('should return existing API key if config file exists', async () => {
      const mockApiKey = 'test-api-key';
      
      // Mock fs.existsSync to return true (file exists)
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      // Mock fs.readFileSync to return a valid config
      (fs.readFileSync as jest.Mock).mockReturnValue(
        JSON.stringify({ apiKey: mockApiKey })
      );

      const apiKey = await getApiKey();
      expect(apiKey).toBe(mockApiKey);
    });

    it('should handle invalid JSON in config file', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue('invalid json');

      await expect(getApiKey()).rejects.toThrow('Invalid JSON in configuration file.');
    });
  });
}); 