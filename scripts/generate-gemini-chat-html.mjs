import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { marked } from 'marked';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Import chat data
const dataFilePath = path.resolve(rootDir, 'src', 'data', 'geminiChatData.ts');
const rawTs = fs.readFileSync(dataFilePath, 'utf-8');

// Simple regex extraction or direct import using tsx/node
// Let's create an evaluation script or use the exported constant
// To be 100% robust and clean, let's load from node with tsx or compile
console.log('Generating gemini_chat/chat_history.html...');
