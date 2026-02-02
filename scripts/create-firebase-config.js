/**
 * Create Firebase configuration file from environment variables
 * Used in CI/CD pipeline to generate firebase.ts from secrets
 * 
 * REST API 版本 - 符合 Manifest V3 规范
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const configPath = path.join(__dirname, '../src/shared/config/firebase.ts');

// Check if firebase.ts already exists (local development)
if (fs.existsSync(configPath)) {
  console.log('[Firebase Config] firebase.ts already exists, skipping creation');
  process.exit(0);
}

// Get Firebase config from environment variables
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  projectId: process.env.FIREBASE_PROJECT_ID,
};

// Validate that required config values are present
const missingVars = Object.entries(firebaseConfig)
  .filter(([key, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.error('[Firebase Config] Missing environment variables:', missingVars.join(', '));
  process.exit(1);
}

// Generate the firebase.ts file content (REST API version)
const fileContent = `/**
 * Firebase 配置
 * 
 * REST API 版本 - 符合 Manifest V3 规范
 * 不使用 Firebase SDK，避免远程代码加载问题
 */

// Firebase 配置
export const firebaseConfig = {
  apiKey: "${firebaseConfig.apiKey}",
  projectId: "${firebaseConfig.projectId}",
};

console.log('[Firebase] Configuration loaded (REST API mode)');
`;

// Ensure directory exists
const configDir = path.dirname(configPath);
if (!fs.existsSync(configDir)) {
  fs.mkdirSync(configDir, { recursive: true });
  console.log('[Firebase Config] Created config directory');
}

// Write the file
fs.writeFileSync(configPath, fileContent, 'utf8');
console.log('[Firebase Config] Created firebase.ts successfully (REST API version)');
