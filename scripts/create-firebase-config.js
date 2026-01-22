/**
 * Create Firebase configuration file from environment variables
 * Used in CI/CD pipeline to generate firebase.ts from secrets
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
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

// Validate that all required config values are present
const missingVars = Object.entries(firebaseConfig)
  .filter(([key, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.error('[Firebase Config] Missing environment variables:', missingVars.join(', '));
  console.error('[Firebase Config] Please set the following secrets in GitHub:');
  missingVars.forEach(varName => {
    const envVarName = varName.replace(/([A-Z])/g, '_$1').toUpperCase().replace(/^_/, 'FIREBASE_');
    console.error(`  - ${envVarName}`);
  });
  process.exit(1);
}

// Generate the firebase.ts file content
const fileContent = `/**
 * Firebase 配置
 * 
 * This file is auto-generated in CI/CD from environment variables
 * For local development, copy firebase.example.ts to firebase.ts
 */

import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Firebase 配置
export const firebaseConfig = {
  apiKey: "${firebaseConfig.apiKey}",
  authDomain: "${firebaseConfig.authDomain}",
  projectId: "${firebaseConfig.projectId}",
  storageBucket: "${firebaseConfig.storageBucket}",
  messagingSenderId: "${firebaseConfig.messagingSenderId}",
  appId: "${firebaseConfig.appId}",
  measurementId: "${firebaseConfig.measurementId}"
};

// 初始化 Firebase
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  
  console.log('[Firebase] Initialized successfully');
} catch (error) {
  console.error('[Firebase] Initialization error:', error);
  throw error;
}

export { app, auth, db };
`;

// Write the file
fs.writeFileSync(configPath, fileContent, 'utf8');
console.log('[Firebase Config] Created firebase.ts successfully');
