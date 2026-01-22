/**
 * Firebase 配置示例
 *
 * 使用说明：
 * 1. 复制此文件为 firebase.ts
 * 2. 将下面的配置替换为你的 Firebase 项目配置
 * 3. 配置信息可以在 Firebase Console 的项目设置中找到
 */

import { initializeApp, FirebaseApp } from 'firebase/app'
import { getAuth, Auth } from 'firebase/auth'
import { getFirestore, Firestore } from 'firebase/firestore'

// Firebase 配置
export const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_PROJECT_ID.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_PROJECT_ID.firebasestorage.app',
  messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
  appId: 'YOUR_APP_ID',
  measurementId: 'YOUR_MEASUREMENT_ID',
}

// 初始化 Firebase
let app: FirebaseApp
let auth: Auth
let db: Firestore

try {
  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  db = getFirestore(app)

  console.log('[Firebase] Initialized successfully')
} catch (error) {
  console.error('[Firebase] Initialization error:', error)
  throw error
}

export { app, auth, db }
