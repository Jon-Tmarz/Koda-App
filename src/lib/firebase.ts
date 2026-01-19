// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configuración de Firebase usando variables de entorno
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Verificar que todas las variables estén definidas
console.log("🔥 Firebase Config:", {
  apiKey: firebaseConfig.apiKey ? "✅ Definido" : "❌ Faltante",
  authDomain: firebaseConfig.authDomain ? "✅ Definido" : "❌ Faltante",
  projectId: firebaseConfig.projectId ? "✅ Definido" : "❌ Faltante",
  storageBucket: firebaseConfig.storageBucket ? "✅ Definido" : "❌ Faltante",
  messagingSenderId: firebaseConfig.messagingSenderId ? "✅ Definido" : "❌ Faltante",
  appId: firebaseConfig.appId ? "✅ Definido" : "❌ Faltante",
});

// Prevenir inicialización múltiple en desarrollo (Hot Reload)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Exportar servicios
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;